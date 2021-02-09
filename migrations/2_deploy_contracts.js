var Count = artifacts.require("./Count.sol");

module.exports = async function(deployer) {
    await deployer.deploy(Count);
};
