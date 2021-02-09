const { assert } = require('chai')

const Wallet = artifacts.require("./Wallet.sol");

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract("Wallet", accounts => {
  let WalletInstance
  
  before(async () => {
     WalletInstance = await Wallet.deployed();
  
  })

  it("Should deploy the contract", async () => {
    address = WalletInstance.address
    assert.equal(address, WalletInstance.address)
  });

  //Test minting Wallet tokens
  it("Mints Wallet Tokens", async () => {


  });

  it("Transfers Wallet Tokens", async () => {

  });

  it("Changes Price of Wallet", async () => {

  });

  it("Buy a Wallet Token", async () => {

  });
});
