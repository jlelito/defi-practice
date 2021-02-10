pragma solidity ^0.5.12;


interface cETH {
    function mint(uint256) external returns (uint256);

    function exchangeRateCurrent() external returns (uint256);

    function supplyRatePerBlock() external returns (uint256);

    function redeem(uint) external returns (uint);

    function redeemUnderlying(uint) external returns (uint);
}

contract CompoundWallet {

    event MyLog(string, uint256);

    function supplyETHToCompound(address _cETHContract, uint256 _numTokensToSupply) public returns (uint) {
        
        // Create a reference to the corresponding cToken contract, like cDAI
        cETH cToken = cETH(_cETHContract);

        // Amount of current exchange rate from cToken to underlying
        uint256 exchangeRateMantissa = cToken.exchangeRateCurrent();
        emit MyLog("Exchange Rate (scaled up): ", exchangeRateMantissa);

        // Amount added to you supply balance this block
        uint256 supplyRateMantissa = cToken.supplyRatePerBlock();
        emit MyLog("Supply Rate: (scaled up)", supplyRateMantissa);

        // Mint cTokens
        uint mintResult = cToken.mint(_numTokensToSupply);
        return mintResult;
    }

    function redeemcETHTokens(uint256 amount, address _cETHContract) public returns (bool) {
        // Create a reference to the corresponding cToken contract, like cDAI
        cETH cToken = cETH(_cETHContract);

        uint256 redeemResult;

        // Retrieve your asset based on a cToken amount
        redeemResult = cToken.redeem(amount);
    
        // Error codes are listed here:
        // https://compound.finance/developers/ctokens#ctoken-error-codes
        emit MyLog("If this is not 0, there was an error", redeemResult);
        require(redeemResult == 0, "redeemResult error");

        return true;
    }
}