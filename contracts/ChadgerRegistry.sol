// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";

import "../interfaces/badger/IVault.sol";

contract ChadgerRegistry is Initializable {
    // ===== Libraries  ====
    using EnumerableSet for EnumerableSet.AddressSet;

    /// ===== Storage Variables ====
    address public vaultImplementation; // vault implementation address that is using for oz clones
    address public governance; // address of the governance of the chadger - should be multisig

    EnumerableSet.AddressSet private vaults; // This is an enumerable set of vaults that exists, using to iterate over
    mapping(address => RegisteredVault) public registeries; // This is for

    /// ===== Chadger Data Structures ====

    /// @notice This is struct is for adding meta information to the added vault
    struct RegisteredVault {
        IVault vault;
        address strategist;
        VaultStatus status;
        string metaPointer;
    }

    /// @notice Each registered vault could be in these statuses, Staging, Production, Deprecated
    /// Each vault start as a staging vault but registry governance can change the vault status
    enum VaultStatus {
        Staging,
        Production,
        Deprecated
    }

    /// ===== Chadger Data Structures ====
    event VaultAdded(address indexed author, address indexed vault);
    // event VaultStatusChanged(address indexed author, address indexed vault);

    /// ===== Chadger Modifiers ====

    /// @dev it will check whether the vault implementation address exists or not
    modifier vaultImplementationExists() {
        require(
            vaultImplementation != address(0),
            "Vault implementation does not exists."
        );
        _;
    }

    /// @dev it will check whether the msg.sender is governance or not.
    modifier onlyGovernance() {
        require(msg.sender == governance, "You are not the Chadger governance");
        _;
    }

    /// @notice Initializes the Registry. Can only be called once, ideally when the contract is deployed.
    /// @param _vaultImplementation the implementation address that is using for cloning vault 1.5
    /// @param _governer Address authorized as governance.
    function initialize(address _vaultImplementation, address _governer)
        public
        initializer
    {
        vaultImplementation = _vaultImplementation;
        governance = _governer;
    }

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
            _metaPointer
        );
        emit VaultAdded(msg.sender, vault);
    }
}
