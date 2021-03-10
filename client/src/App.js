import './App.css';
import React, { Component } from 'react';
import Web3 from 'web3';
import Navbar from './components/Navbar.js';
import Notification from './components/Notification.js';
import Loading from './components/Loading.js';
import ConnectionBanner from '@rimble/connection-banner';
import CompoundWallet from './abis/CompoundWallet.json';
import cETH from './abis/cETHRopstenABI.json';
import complogo from './src_images/compound-logo.png';
import smartcontract from './src_images/smart-contract.png';
import wallet from './src_images/wallet.png';
require('dotenv').config();

class App extends Component {

  async componentDidMount() {
    await this.loadBlockchainData()
  }

//Loads all the blockchain data
async loadBlockchainData() {
  let web3
  
  this.setState({loading: true})
  if(typeof window.ethereum !== 'undefined') {
    web3 = new Web3(window.ethereum)
    await this.setState({web3})
    await this.loadAccountData()
  } else {
    web3 = new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`))
    await this.setState({web3})
  }
  this.loadContractData()
  this.setState({loading: false})
}

//Loads user account data
async loadAccountData() {
  let web3 = new Web3(window.ethereum) 
  const accounts = await this.state.web3.eth.getAccounts()
  if(typeof accounts[0] !== 'undefined' && accounts[0] !== null) {
    let currentEthBalance = await this.state.web3.eth.getBalance(accounts[0])
    currentEthBalance = this.state.web3.utils.fromWei(currentEthBalance, 'Ether')
    await this.setState({account: accounts[0], currentEthBalance, isConnected: true})
  } else {
    await this.setState({account: null, isConnected: false})
  }

  const networkId = await web3.eth.net.getId()
  this.setState({network: networkId})
  console.log('network:', this.state.network)

  if(this.state.network !== 3) {
    this.setState({wrongNetwork: true})
    web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/785d9e20620649329504edaeaf60fb72'))
    await this.setState({web3})
  }
}

//Loads the data of the smart-contract
async loadContractData() {
  let WalletData = CompoundWallet.networks[3]
  if(WalletData) {
    //Load wallet contract and set state
    const abi = CompoundWallet.abi
    const address = WalletData.address
    const walletContract = new this.state.web3.eth.Contract(abi, address)
    await this.setState({ walletContract, walletContractAddress: address })
    console.log('Wallet contract: ', this.state.walletContract)
  }

  //Compound Ropsten address located here: https://compound.finance/docs#networks
  const compoundCETHContractAddress = '0x859e9d8a4edadfedb5a2ff311243af80f85a91b8'
  const cETHContract = new this.state.web3.eth.Contract(cETH, compoundCETHContractAddress)
  await this.setState({cETHContract, cETHAddress: compoundCETHContractAddress})

  //Check cETH Balances
  console.log('cEth contract:', this.state.cETHContract)
  let cETHBalance = await this.state.cETHContract.methods.balanceOf(WalletData.address).call()
  console.log('cETH Balance after calling: ', cETHBalance)
  try {
    let mycETHBalance = await this.state.cETHContract.methods.balanceOf(this.state.account).call()
    console.log('My cETH Balance: ', mycETHBalance)
    this.setState({mycETHBalance})
  } catch(e) {
    console.log(e)
  }
  let contractETHBal = await this.state.web3.eth.getBalance(WalletData.address)
  contractETHBal = this.state.web3.utils.fromWei(contractETHBal, 'Ether')
  console.log('Wallet Contract ETH Balance:', contractETHBal)
  console.log('Wallet Contract cETH Balance:', cETHBalance)
  console.log('Wallet Address:', WalletData.address)
  console.log('cETH Address:', this.state.cETHAddress)
  this.setState({cETHBalance, contractETHBal})
  
}

//Expected Compound Bal for .001 ETH deposit: 4738394


//Shows notification
showNotification = () => {
  this.notificationOne.current.updateShowNotify()
}

//Supply ETH to Compound
async contractSupplyETH(amount) {
  console.log('Amount Input:', amount)
  console.log('Supply ETH to Contract: ', this.state.cETHAddress)
  amount = this.state.web3.utils.toHex(this.state.web3.utils.toWei(amount, 'ether'))
  try {
    this.state.walletContract.methods.supplyEthToCompound(this.state.cETHAddress).send({ from: this.state.account, value: amount}).on('transactionHash', async (hash) => {
       this.setState({hash: hash, action: 'Supplied ETH with Contract', trxStatus: 'Pending'})
       this.showNotification()

       this.state.walletContract.events.MyLog({}, async (error, event) => {
        console.log('My Log: ', event)
      })

      }).on('receipt', async (receipt) => {
          await this.loadContractData()
          if(receipt.status === true){
            this.setState({trxStatus: 'Success'})
          }
          else if(receipt.status === false){
            this.setState({trxStatus: 'Failed'})
          }
      }).on('error', (error) => {
          window.alert('Error! Could not Supply ETH!')
      }).on('confirmation', (confirmNum) => {
          if(confirmNum > 10) {
            this.setState({confirmNum : '10+'})
          } else {
          this.setState({confirmNum})
          }
      })
    }
    catch(e) {
      window.alert(e)
    }
}

async contractRedeemETH(amount) {
  amount = this.state.web3.utils.toHex(this.state.web3.utils.toWei(amount, 'ether'))
  try {
    this.state.walletContract.methods.redeemcETHTokens(amount, this.state.cETHAddress).send({ from: this.state.account }).on('transactionHash', async (hash) => {
       this.setState({hash: hash, action: 'Redeemed ETH with Contract', trxStatus: 'Pending'})
       this.showNotification()

      }).on('receipt', async (receipt) => {
          await this.loadContractData()
          if(receipt.status === true){
            this.setState({trxStatus: 'Success'})
          }
          else if(receipt.status === false){
            this.setState({trxStatus: 'Failed'})
          }
      }).on('error', (error) => {
          window.alert('Error! Could not Redeem ETH!')
      }).on('confirmation', (confirmNum) => {
          if(confirmNum > 10) {
            this.setState({confirmNum : '10+'})
          } else {
          this.setState({confirmNum})
          }
      })
    }
    catch(e) {
      window.alert(e)
    }
}

async supplyETHFromContract(amount) {
  console.log('Supplying Amount:', amount)
  amount = this.state.web3.utils.toHex(this.state.web3.utils.toWei(amount, 'ether'))
  console.log('Supplying Address:', this.state.cETHAddress)
  try {
    this.state.walletContract.methods.supplyEthFromContract(this.state.cETHAddress, amount).send({ from: this.state.account }).on('transactionHash', async (hash) => {
       this.setState({hash: hash, action: 'Supplied ETH', trxStatus: 'Pending'})
       this.showNotification()

      }).on('receipt', async (receipt) => {
          await this.loadContractData()
          if(receipt.status === true){
            this.setState({trxStatus: 'Success'})
          }
          else if(receipt.status === false){
            this.setState({trxStatus: 'Failed'})
          }
      }).on('error', (error) => {
          window.alert('Error! Could not Redeem ETH!')
      }).on('confirmation', (confirmNum) => {
          if(confirmNum > 10) {
            this.setState({confirmNum : '10+'})
          } else {
          this.setState({confirmNum})
          }
      })
    }
    catch(e) {
      window.alert(e)
    }
}

async walletSupplyETH(amount) {
  console.log('Amount supplied from wallet: ', amount)
  amount = this.state.web3.utils.toHex(this.state.web3.utils.toWei(amount, 'ether'))
  console.log('Amount supplied from wallet: ', amount)
  try {
    this.state.cETHContract.methods.mint().send({ from: this.state.account, value: amount }).on('transactionHash', async (hash) => {
       this.setState({hash: hash, action: 'Supplied ETH from Wallet', trxStatus: 'Pending'})
       this.showNotification()

      }).on('receipt', async (receipt) => {
          await this.loadContractData()
          if(receipt.status === true){
            this.setState({trxStatus: 'Success'})
          }
          else if(receipt.status === false){
            this.setState({trxStatus: 'Failed'})
          }
      }).on('error', (error) => {
          window.alert('Error! Could not Redeem ETH!')
      }).on('confirmation', (confirmNum) => {
          if(confirmNum > 10) {
            this.setState({confirmNum : '10+'})
          } else {
          this.setState({confirmNum})
          }
      })
    }
    catch(e) {
      window.alert(e)
    }
}

async walletRedeemETH(amount) {
  console.log('Amount Redeemed from wallet: ', amount)
  amount = this.state.web3.utils.toHex(this.state.web3.utils.toWei(amount, 'ether'))
  console.log('Amount Redeemed from wallet: ', amount)
  try {
    this.state.cETHContract.methods.redeemUnderlying(amount).send({ from: this.state.account }).on('transactionHash', async (hash) => {
       this.setState({hash: hash, action: 'Redeemed ETH from Wallet', trxStatus: 'Pending'})
       this.showNotification()

      }).on('receipt', async (receipt) => {
          await this.loadContractData()
          if(receipt.status === true){
            this.setState({trxStatus: 'Success'})
          }
          else if(receipt.status === false){
            this.setState({trxStatus: 'Failed'})
          }
      }).on('error', (error) => {
          window.alert('Error! Could not Redeem ETH!')
      }).on('confirmation', (confirmNum) => {
          if(confirmNum > 10) {
            this.setState({confirmNum : '10+'})
          } else {
          this.setState({confirmNum})
          }
      })
    }
    catch(e) {
      window.alert(e)
    }
}

constructor(props) {
  super(props)
  this.notificationOne = React.createRef()
  this.state = {
    web3: null,
    account: null,
    admin:'0x0',
    network: null,
    wrongNetwork: false,
    loading: false,
    isConnected: null,
    walletContract: {},
    walletContractAddress: null,
    cETHContract: null,
    cETHBalance: null,
    cETHAddress: null,
    currentEthBalance: '0',
    hash: '0x0',
    action: null,
    trxStatus: null,
    confirmNum: 0
  }
}

  render() {

    if(window.ethereum != null) {

      window.ethereum.on('chainChanged', async (chainId) => {
        window.location.reload()
      })
  
      window.ethereum.on('accountsChanged', async (accounts) => {
        if(typeof accounts[0] !== 'undefined' & accounts[0] !== null) {
          await this.loadAccountData()
        } else {
          this.setState({account: null, currentEthBalance: 0, isConnected: false})
        }
      })
  
    }

    return (
      <div className="App">
        <Navbar 
          account={this.state.account}
          balance={this.state.currentEthBalance}
          network={this.state.network}
          isConnected={this.state.isConnected}
          trxStatus={this.state.trxStatus}
        />
        <div className='mt-5' />
        {window.ethereum === null ?
          <ConnectionBanner className='mt-5' currentNetwork={this.state.network} requiredNetwork={3} onWeb3Fallback={true} />
          :
          this.state.wrongNetwork ? <ConnectionBanner className='mt-5' currentNetwork={this.state.network} requiredNetwork={3} onWeb3Fallback={false} /> 
          :
          null
        }
          
         {this.state.loading ?
          <Loading /> 
          :
          <>
          <Notification 
            showNotification={this.state.showNotification}
            action={this.state.action}
            hash={this.state.hash}
            ref={this.notificationOne}
            trxStatus={this.state.trxStatus}
            confirmNum={this.state.confirmNum}
          />
          <div className='row justify-content-center'>
            <h1 className='mt-2' id='title'>Compound Finance</h1>
            <img src={complogo} height='50px' width = '50px' className='mt-2'/>
          </div>
          <div className='row justify-content-center'>
            <div className='col-auto'>
              <h3 className='mt-5'>Contract ETH Balance: {this.state.contractETHBal}</h3>
              <h3>Contract cETH Balance: {this.state.cETHBalance}</h3>
              <h3>My cETH Balance: {this.state.mycETHBalance}</h3>
            </div>
          </div>
          <div className='row justify-content-center mt-5 mb-4'>
            <h1>Use Contract to Interact Compound</h1>
            <img src={smartcontract} className='mt-2' height='35px' width='55px' />
          </div>
          
          <div className='row justify-content-center'>
            <div className='col-auto'>
              <h3>Supply ETH with Contract</h3>
              <form className='mt-4' onSubmit={(e) => {
                let amount
                e.preventDefault()
                amount = this.supplyAmount.value.toString()
                console.log('Amount in Form:', amount)
                this.supplyAmount.value = null
                this.contractSupplyETH(amount)
              }}>
                <input type='number' placeholder='1 ETH' step='.001' min='0' ref={(supplyAmount) => { this.supplyAmount = supplyAmount }} required/>
                <button className='btn btn-primary'>Supply</button>
              </form>
            </div>
            <div className='col-auto'>
            <h3>Redeem ETH with Contract</h3>
              <form className='mt-4' onSubmit={(e) => {
                e.preventDefault()
                let amount = this.inputAmount.value.toString()
                this.inputAmount.value = null
                this.contractRedeemETH(amount)
              }}>
                <input type='number' placeholder='1 ETH' step='.001' min='0' ref={(inputAmount) => { this.inputAmount = inputAmount }} required/>
                <button className='btn btn-primary'>Redeem</button>
              </form>
            </div>
            <div className='col-auto'>
            <h3>Supply ETH Contract (internal function)</h3>
              <form className='mt-4' onSubmit={(e) => {
                    e.preventDefault()
                    let amount = this.inputAmount.value.toString()
                    this.inputAmount.value =  null
                    this.supplyETHFromContract(amount)
                  }}>
                    <input type='number' placeholder='1 ETH' step='.001' min='0' ref={(inputAmount) => { this.inputAmount = inputAmount }} required/>
                    <button className='btn btn-primary'>Supply</button>
              </form>
            </div>
          </div>

          <div className='row justify-content-center mt-5 mb-2'>
            <h1>Use Wallet to Interact to Compound</h1>
            <img src={wallet} className='mt-2' height='35px' width='50px' />
          </div>
          <div className='row justify-content-center'>
            <div className='col-auto mt-3'>
            <h3>Supply ETH with Wallet</h3>
              <form className='mt-4' onSubmit={(e) => {
                    e.preventDefault()
                    let amount = this.supplyFromWalletAmount.value.toString()
                    this.supplyFromWalletAmount.value = null
                    this.walletSupplyETH(amount)
                  }}>
                    <input type='number' placeholder='1 ETH' step='.001' min='0' ref={(supplyFromWalletAmount) => { this.supplyFromWalletAmount = supplyFromWalletAmount }} required/>
                    <button className='btn btn-primary'>Supply</button>
              </form>
            </div>
            <div className='col-auto mt-3'>
            <h3>Redeem ETH with Wallet</h3>
              <form className='mt-4' onSubmit={(e) => {
                    e.preventDefault()
                    let amount = this.redeemFromWalletAmount.value.toString()
                    this.redeemFromWalletAmount.value = null
                    this.walletRedeemETH(amount)
                  }}>
                    <input type='number' placeholder='1 ETH' step='.001' min='0' ref={(redeemFromWalletAmount) => { this.redeemFromWalletAmount = redeemFromWalletAmount }} required/>
                    <button className='btn btn-primary'>Redeem</button>
              </form>
            </div>
          </div>

          <div className='row justify-content-center mt-4'>
            Contract on Etherscan: 
            <a className='ml-3' href={`https://ropsten.etherscan.io/address/${this.state.walletContractAddress}`} target='_blank'>Etherscan</a>
          </div>
          
          
        </>
        }
        
      </div>
    );
  }
}

export default App;
