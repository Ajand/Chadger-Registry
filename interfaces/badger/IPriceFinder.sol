// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IPriceFinder {
    function getUSDPrice(address _tokenAddress, uint256 _amount)
        external
        view
        returns (uint256);
}
