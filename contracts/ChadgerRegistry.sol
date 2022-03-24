// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";

import "../interfaces/badger/IVault.sol";

contract ChadgerRegistry is Initializable {
    address public vaultImplementation;
    address public governer;

    function initialize(address _vaultImplementation, address _governer)
        public
        initializer
    {
        vaultImplementation = _vaultImplementation;
        governer = _governer;
    }
}
