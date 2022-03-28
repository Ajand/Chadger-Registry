// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "../interfaces/badger/IVault.sol";
import "../interfaces/badger/IStrategy.sol";
import "../interfaces/badger/IPriceFinder.sol";

contract ChadgerRegistry is Initializable {
    // ===== Libraries  ====
    using EnumerableSet for EnumerableSet.AddressSet;

    /// ===== Constants ====
    uint256 public constant PERCENT_DENOMITATOR = 10_000;
    uint256 public constant ONE_ETH = 1e18;
    uint256 public constant ONE_YEAR = 365 days + 6 hours;

    /// ===== Storage Variables ====
    address public vaultImplementation; // vault implementation address that is using for oz clones
    address public governance; // address of the governance of the chadger - should be multisig
    address public priceFinder; // address of the price finder of the chadger - this will be used to get usd prices on chain

    EnumerableSet.AddressSet private vaults; // This is an enumerable set of vaults that exists, using to iterate over
    mapping(address => RegisteredVault) public registeries; // This is for

    /// ===== Chadger Data Structures ====
    /// @dev this struct is going to be used when you want to return a vault details
    // for returning an array of vaults you should use VaultData instead
    struct VaultDataDetails {
        address strategist;
        VaultStatus status;
        string metaPointer;
        uint256 tvl;
        address vaultAddress;
        address token;
        address keeper;
        address guardian;
        address treasury;
        address badgerTree;
        string name;
        string symbol;
        uint256 performanceFeeGovernance;
        uint256 performanceFeeStrategist;
        uint256 withdrawalFee;
        uint256 managementFee;
        address strategy;
    }

    /// @dev This is struct is for adding meta information to the added vault
    struct RegisteredVault {
        IVault vault;
        address strategist;
        VaultStatus status;
        string metaPointer;
        uint256 registredAt;
    }

    /// @dev this struct is for reporting a token reports, it shows the token address, amount, and usd price
    struct TokenReport {
        address token;
        uint256 amount;
        uint256 usd;
    }

    /// @dev this struct is for reporting a token reports, it shows the token address, amount, and usd price
    struct TokenRewardAprReport {
        address token;
        uint256 amount;
        uint256 usd;
        uint256 apr;
    }

    /// @dev Return value for harvest, tend and balanceOfRewards, use this for interacting with strategy
    struct TokenAmount {
        address token;
        uint256 amount;
    }

    /// @dev this struct is for reporting a token apr, it shows the token address, amount, and usd price
    struct TokenApr {
        address token;
        uint256 apr;
    }

    /// @notice Each registered vault could be in these statuses, Staging, Production, Deprecated
    /// Each vault start as a staging vault but registry governance can change the vault status
    enum VaultStatus {
        Staging,
        Production,
        Deprecated
    }

    /// ===== Chadger Data Structures ====
    event VaultImplementationChanged(address vaultImplementation);
    event PriceFinderChanged(address priceFinder);
    event GovernanceChanged(address governance);

    event VaultAdded(address indexed author, address indexed vault);
    event VaultStatusChanged(
        address indexed vaultAddress,
        VaultStatus indexed status
    );
    // event VaultStatusChanged(address indexed author, address indexed vault);

    /// ===== Chadger Modifiers ====

    /// @dev only will pass if the vault implementation address exists or not
    modifier vaultImplementationExists() {
        require(vaultImplementation != address(0), "no implementation");
        _;
    }

    /// @dev only will pass if the priceFinder exists.
    modifier onlyPriceFinderExists() {
        require(priceFinder != address(0), "no priceFinder");
        _;
    }

    /// @dev only will pass if the msg.sender is governance or not.
    modifier onlyGovernance() {
        require(msg.sender == governance, "only governance");
        _;
    }

    /// @dev only will pass if the needed vault exists.
    modifier onlyIfVaultExists(address _vaultAddress) {
        require(vaults.contains(_vaultAddress), "no vault exists");
        _;
    }

    /// @notice Initializes the Registry. Can only be called once, ideally when the contract is deployed.
    /// @param _vaultImplementation the implementation address that is using for cloning vault 1.5
    /// @param _governance Address authorized as governance.
    /// @param _priceFinder is a helper smart contract to get usd price of tokens. It should be connected to an oracle
    function initialize(
        address _vaultImplementation,
        address _governance,
        address _priceFinder
    ) public initializer {
        vaultImplementation = _vaultImplementation;
        governance = _governance;
        priceFinder = _priceFinder;
    }

    /// @notice this will change the vault implementation
    /// only the governance can do it
    function changeVaultImplementation(address _vaultImplementation)
        public
        onlyGovernance
    {
        vaultImplementation = _vaultImplementation;
        emit VaultImplementationChanged(_vaultImplementation);
    }

    /// @notice this will change the price finder
    /// only the governance can do it
    function changePriceFinder(address _priceFinder) public onlyGovernance {
        priceFinder = _priceFinder;
        emit PriceFinderChanged(_priceFinder);
    }

    /// @notice this will change the governance
    /// only the governance can do it
    function changeGovernance(address _governance) public onlyGovernance {
        governance = _governance;
        emit GovernanceChanged(_governance);
    }

    // TODO should add the change of state variables

    /// @notice add vaults using OZ Clone
    /// @param _token Address of the token that can be deposited into the sett.
    /// @param _keeper Address authorized as keeper.
    /// @param _guardian Address authorized as guardian.
    /// @param _treasury Address to distribute governance fees/rewards to.
    /// @param _badgerTree Address of badgerTree used for emissions.
    /// @param _name Specify a custom sett name. Leave empty for default value.
    /// @param _symbol Specify a custom sett symbol. Leave empty for default value.
    /// @param _feeConfig Values for the 4 different types of fees charges by the sett
    ///         [performanceFeeGovernance, performanceFeeStrategist, withdrawToVault, managementFee]
    ///         Each fee should be less than the constant hard-caps defined above.
    /// @param _metaPointer It should contain an IPFS Url that contains the vault metadata.
    function addVault(
        address _token,
        address _keeper,
        address _guardian,
        address _treasury,
        address _badgerTree,
        string memory _name,
        string memory _symbol,
        uint256[4] memory _feeConfig,
        string memory _metaPointer
    ) public vaultImplementationExists {
        address vault = Clones.clone(vaultImplementation);
        IVault(vault).initialize(
            _token,
            msg.sender,
            _keeper,
            _guardian,
            _treasury,
            msg.sender,
            _badgerTree,
            _name,
            _symbol,
            _feeConfig
        );
        vaults.add(vault);
        registeries[vault] = RegisteredVault(
            IVault(vault),
            msg.sender,
            VaultStatus.Staging,
            _metaPointer,
            block.timestamp
        );
        emit VaultAdded(msg.sender, vault);
    }

    /// @notice this will change a vault status
    /// only the governance can do it
    function changeVaultStatus(address _vaultAddress, VaultStatus _vaultStatus)
        public
        onlyGovernance
        onlyIfVaultExists(_vaultAddress)
    {
        RegisteredVault storage registeredVault = registeries[_vaultAddress];
        registeredVault.status = _vaultStatus;
        emit VaultStatusChanged(_vaultAddress, _vaultStatus);
    }

    /// @notice using to get a single vault details
    function getVaultDetails(address _vaultAddress)
        public
        view
        onlyIfVaultExists(_vaultAddress)
        returns (VaultDataDetails memory vaultDetails)
    {
        IVault vault = IVault(_vaultAddress);
        vaultDetails.status = registeries[_vaultAddress].status;
        vaultDetails.metaPointer = registeries[_vaultAddress].metaPointer;
        vaultDetails.strategy = vault.strategy();

        /// @dev if strategy is setted on the vault it will shows the balance
        /// otherwise it will return 0
        /// if we didn't handle it this way it would caused an error
        vaultDetails.tvl = vaultDetails.strategy != address(0)
            ? vault.balance()
            : 0;

        vaultDetails.strategist = vault.strategist();
        vaultDetails.keeper = vault.keeper();
        vaultDetails.guardian = vault.guardian();
        vaultDetails.treasury = vault.treasury();
        vaultDetails.badgerTree = vault.badgerTree();

        vaultDetails.vaultAddress = _vaultAddress;
        vaultDetails.token = vault.token();

        vaultDetails.name = vault.name();
        vaultDetails.symbol = vault.symbol();
        vaultDetails.performanceFeeGovernance = vault
            .performanceFeeGovernance();
        vaultDetails.performanceFeeStrategist = vault
            .performanceFeeStrategist();
        vaultDetails.withdrawalFee = vault.withdrawalFee();
        vaultDetails.managementFee = vault.managementFee();

        // Balance of rewards
        // USD
        // tokenName
    }

    /// @notice getting the address of all vaults
    function getVaultsAddresses() public view returns (address[] memory) {
        address[] memory list = new address[](vaults.length());
        for (uint256 i = 0; i < vaults.length(); i++) {
            list[i] = vaults.at(i);
        }
        return list;
    }

    /// @notice getting the balance of a user for specific vault
    function getUserVaultBalance(address _vaultAddress, address _userAddrress)
        public
        view
        onlyIfVaultExists(_vaultAddress)
        onlyPriceFinderExists
        returns (TokenReport memory report)
    {
        IVault vault = IVault(_vaultAddress);
        uint256 userShares = vault.balanceOf(_userAddrress);
        uint256 pricePerShare = vault.getPricePerFullShare();
        uint256 userBalance = (pricePerShare * userShares) / ONE_ETH;
        report = TokenReport(
            vault.token(),
            userBalance,
            IPriceFinder(priceFinder).getUSDPrice(vault.token(), userBalance)
        );
    }

    /// @notice getting the balance of a user for all vaults
    /// it will also return another entry which is the sum of all vault data
    function getUserBalance(address _userAddrress)
        public
        view
        onlyPriceFinderExists
        returns (TokenReport[] memory)
    {
        TokenReport[] memory reports = new TokenReport[](vaults.length());

        for (uint256 i = 0; i < vaults.length(); i++) {
            reports[i] = getUserVaultBalance(vaults.at(i), _userAddrress);
        }

        return reports;
    }

    /// @notice this is a utility function to calculate apr
    /// @dev it's not dependent on the token you are putting but _reward and _tvl must be
    /// in the same currency, so it makes sense to put dollar value for both of them
    /// @param _addon This is the reward balance of a token in a vault, usually in USD
    /// @param _startFrom This should be the lastHarvestedAt of a vault, if it does not exists it should be the registered at
    /// @param _total This should be the balance of vault usually in USD
    function calculateAPR(
        uint256 _addon,
        uint256 _total,
        uint256 _startFrom
    ) public view returns (uint256) {
        if (_total <= 0) return 0; // This does not make sense to have less than min TVL
        if (block.timestamp <= _startFrom) return 0; // This does not make to start from a future time
        return
            (_addon *
                PERCENT_DENOMITATOR *
                (ONE_YEAR / (block.timestamp - _startFrom))) / _total;
    }

    /// @notice this is a utility function to calculate apr
    function getVaultAPR(address _vaultAddress)
        public
        view
        onlyIfVaultExists(_vaultAddress)
        onlyPriceFinderExists
        returns (TokenRewardAprReport[] memory)
    {
        IVault vault = IVault(_vaultAddress);
        IStrategy strategy = IStrategy(vault.strategy());
        IStrategy.TokenAmount[] memory rewardsBalance = strategy
            .balanceOfRewards();

        TokenRewardAprReport[] memory aprReports = new TokenRewardAprReport[](
            rewardsBalance.length
        );

        for (uint256 i = 0; i < rewardsBalance.length; i++) {
            uint256 amountInUSD = IPriceFinder(priceFinder).getUSDPrice(
                rewardsBalance[i].token,
                rewardsBalance[i].amount
            );
            aprReports[i] = TokenRewardAprReport(
                rewardsBalance[i].token,
                rewardsBalance[i].amount,
                amountInUSD,
                calculateAPR(
                    amountInUSD,
                    vault.balance(),
                    vault.lastHarvestedAt() > 0
                        ? vault.lastHarvestedAt()
                        : registeries[_vaultAddress].registredAt
                )
            );
        }

        return aprReports;

        // loop over rewards balance
    }
}
