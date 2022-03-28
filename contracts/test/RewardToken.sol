// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract RewardToken is ERC20Upgradeable {
    function initialize() public initializer {
        __ERC20_init("Strategy Reward Token", "SRT");
        //_mint(msg.sender, 1_000_000_000_000);
    }

    /// @dev Open minting capabilities
    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

    /// @dev Open burning capabilities, from any account
    function burn(address account, uint256 amount) public {
        _burn(account, amount);
    }
}
