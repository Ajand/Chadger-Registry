// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/token/ERC20/SafeERC20Upgradeable.sol";
import "./RewardToken.sol";

import {BaseStrategy} from "../lib/BaseStrategy.sol";

contract TestStrategy is BaseStrategy {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    // address public want; // Inherited from BaseStrategy
    // address public lpComponent; // Token that represents ownership in a pool, not always used
    address public reward; // Token we farm

    uint256 public lossBps;

    /// @notice set using setAutoCompoundRatio()
    // uint256 public autoCompoundRatio = 10_000; // Inherited from BaseStrategy - percentage of rewards converted to want

    /// @dev Initialize the Strategy with security settings as well as tokens
    /// @notice Proxies will set any non constant variable you declare as default value
    /// @dev add any extra changeable variable at end of initializer as shown
    /// @notice Dev must implement
    function initialize(address _vault, address[1] memory _wantConfig)
        public
        initializer
    {
        __BaseStrategy_init(_vault);
        /// @dev Add config here
        want = _wantConfig[0];

        autoCompoundRatio = 10_000; // Percentage of reward we reinvest into want

        RewardToken rewardToken = new RewardToken();
        rewardToken.initialize();

        reward = address(rewardToken);
    }

    function getName() external pure override returns (string memory) {
        return "TestStrategy";
    }

    function getProtectedTokens()
        public
        view
        virtual
        override
        returns (address[] memory)
    {
        address[] memory protectedTokens = new address[](2);
        protectedTokens[0] = want;
        protectedTokens[1] = reward;
        return protectedTokens;
    }

    function _isTendable() internal pure override returns (bool) {
        return true;
    }

    function setLossBps(uint256 _lossBps) public {
        _onlyGovernance();

        lossBps = _lossBps;
    }

    function deposit(uint256 _amount) public {
        _deposit(_amount);
    }

    function _deposit(uint256 _amount) internal override {
        // No-op as we don't do anything
        RewardToken(reward).mint(address(this), _amount * 2);
    }

    function _withdrawAll() internal override {
        // No-op as we don't deposit
    }

    function _withdrawSome(uint256 _amount)
        internal
        override
        returns (uint256)
    {
        if (lossBps > 0) {
            IERC20Upgradeable(want).transfer(
                want,
                _amount.mul(lossBps).div(MAX_BPS)
            );
        }
        return _amount;
    }

    function _harvest()
        internal
        override
        returns (TokenAmount[] memory harvested)
    {
        //  _onlyAuthorizedActors();

        // Amount of want autocompounded after harvest in terms of want
        // keep this to get paid!
        _reportToVault(0);

        harvested = new TokenAmount[](2);
        harvested[0] = TokenAmount(want, 0);
        harvested[1] = TokenAmount(reward, 0); // Nothing harvested for Badger
        return harvested;
    }

    function test_empty_harvest()
        external
        whenNotPaused
        returns (TokenAmount[] memory harvested)
    {
        _onlyAuthorizedActors();

        // Amount of want autocompounded after harvest in terms of want
        // keep this to get paid!
        _reportToVault(0);

        harvested = new TokenAmount[](2);
        harvested[0] = TokenAmount(want, 0);
        harvested[1] = TokenAmount(reward, 0); // Nothing harvested for Badger
        return harvested;
    }

    function test_harvest_only_emit(address token, uint256 amount)
        external
        whenNotPaused
        returns (TokenAmount[] memory harvested)
    {
        _onlyAuthorizedActors();

        // Note: This breaks if you don't send amount to the strat
        _processExtraToken(token, amount);

        harvested = new TokenAmount[](2);
        harvested[0] = TokenAmount(
            want,
            IERC20Upgradeable(want).balanceOf(address(this))
        );
        harvested[1] = TokenAmount(
            reward,
            RewardToken(amount).balanceOf(address(this))
        );
        return harvested;
    }

    // Example tend is a no-op which returns the values, could also just revert
    function _tend() internal override returns (TokenAmount[] memory tended) {
        // Nothing tended
        tended = new TokenAmount[](2);
        tended[0] = TokenAmount(want, 0);
        tended[1] = TokenAmount(reward, 0);
        return tended;
    }

    function balanceOfPool() public view override returns (uint256) {
        return 0;
    }

    function balanceOfRewards()
        external
        view
        override
        returns (TokenAmount[] memory rewards)
    {
        // Rewards are 0
        rewards = new TokenAmount[](2);
        rewards[0] = TokenAmount(
            want,
            IERC20Upgradeable(want).balanceOf(address(this))
        );
        rewards[1] = TokenAmount(
            reward,
            RewardToken(reward).balanceOf(address(this))
        );
        return rewards;
    }
}
