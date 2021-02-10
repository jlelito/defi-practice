var CompoundWallet = artifacts.require("./CompoundWallet.sol");

module.exports = async function(deployer) {
    await deployer.deploy(CompoundWallet);
};
