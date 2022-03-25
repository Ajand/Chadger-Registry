// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

interface IVault {
    function rewards() external view returns (address);

    function reportHarvest(uint256 _harvestedAmount) external;

    function reportAdditionalToken(address _token) external;

    // Fees
    function performanceFeeGovernance() external view returns (uint256);

    function performanceFeeStrategist() external view returns (uint256);

    function withdrawalFee() external view returns (uint256);

    function managementFee() external view returns (uint256);

    // Actors
    function governance() external view returns (address);

    function keeper() external view returns (address);

    function guardian() external view returns (address);

    function strategist() external view returns (address);

    // External
    function deposit(uint256 _amount) external;

    // Additions to IVault for Chadger
    function initialize(
        address _token,
        address _governance,
        address _keeper,
        address _guardian,
        address _treasury,
        address _strategist,
        address _badgerTree,
        string memory _name,
        string memory _symbol,
        uint256[4] memory _feeConfig
    ) external;

    function token() external view returns (address);

    function balance() external view returns (uint256);

    function strategy() external view returns (address);

    function treasury() external view returns (address);

    function badgerTree() external view returns (address);

    // the name and symbol are come from the fact that each vault is also an ERC20Upgradeable
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);
}
