pragma solidity ^0.5.12;

interface cETH {
    function mint() external payable;

    function exchangeRateCurrent() external returns (uint256);

    function supplyRatePerBlock() external returns (uint256);

    function redeem(uint) external returns (uint);

    function redeemUnderlying(uint) external returns (uint);
}

contract CompoundWallet {

    address admin;

    constructor() public {
        admin = msg.sender;
    }

    event MyLog(string, uint256);

    function supplyEthToCompound(address payable _cEtherContract) public payable returns (bool) {
        // Create a reference to the corresponding cToken contract
        cETH cToken = cETH(_cEtherContract);

        // Amount of current exchange rate from cToken to underlying
        uint256 exchangeRateMantissa = cToken.exchangeRateCurrent();
        emit MyLog("Exchange Rate (scaled up by 1e18): ", exchangeRateMantissa);

        // Amount added to you supply balance this block
        uint256 supplyRateMantissa = cToken.supplyRatePerBlock();
        emit MyLog("Supply Rate: (scaled up by 1e18)", supplyRateMantissa);

        cToken.mint.value(msg.value).gas(25000000)();
        return true;
    }

    function redeemcETHTokens(uint256 amount, bool redeemType, address _cETHContract) public returns (bool) {
        // Create a reference to the corresponding cToken contract, like cDAI
        cETH cToken = cETH(_cETHContract);

        uint256 redeemResult;

        if (redeemType == true) {
            // Retrieve your asset based on a cToken amount
            redeemResult = cToken.redeem(amount);
        } else {
            // Retrieve your asset based on an amount of the asset
            redeemResult = cToken.redeemUnderlying(amount);
        }
        
        // Error codes are listed here:
        // https://compound.finance/developers/ctokens#ctoken-error-codes
        emit MyLog("If this is not 0, there was an error", redeemResult);

        return true;
    }

    function withdrawETH(uint amount) public onlyAdmin() {
        address(msg.sender).transfer(amount);
    }


    // This is needed to receive ETH when calling `redeemCEth`
    function() external payable {}

    modifier onlyAdmin() {
        require(msg.sender == admin, 'Must be admin!');
        _;
    }
}