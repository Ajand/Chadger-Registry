// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;


contract PriceFinder {
    /// @dev this should be connected to an oracle to get the token price based on USD
    function getUSDPrice(address _tokenAddress, uint256 _amount)
        public
        view
        returns (uint256)
    {
        uint256 tokenPriceInUsd = 2;
        return _amount * tokenPriceInUsd;
    }
}
