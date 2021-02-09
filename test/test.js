const { assert } = require('chai')

const Count = artifacts.require("./Count.sol");

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract("Count", accounts => {
  let CountInstance
  
  before(async () => {
     CountInstance = await Count.deployed();
  
  })

  it("Should deploy the contract", async () => {
    address = CountInstance.address
    assert.equal(address, CountInstance.address)
  });

  //Test minting Count tokens
  it("IncrementsCount", async () => {
    let countBefore, countAfter
    countBefore = await CountInstance.count()
    console.log('Count before: ', countBefore.toNumber())
    await CountInstance.increment()
    countAfter = await CountInstance.count()
    console.log('Count after: ', countAfter.toNumber())
  });

});
