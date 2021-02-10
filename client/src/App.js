import './App.css';
import React, { Component } from 'react';
import Web3 from 'web3';
import Navbar from './components/Navbar.js';
import Notification from './components/Notification.js';
import Loading from './components/Loading.js';
import ConnectionBanner from '@rimble/connection-banner';
import CompoundWallet from './abis/CompoundWallet.json';
import cETH from './abis/cETHRopstenABI.json';

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
    web3 = new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`))
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

  if(this.state.network !== 3) {
    this.setState({wrongNetwork: true})
  }
}

//Loads the data of the smart-contract
async loadContractData() {
  let WalletData = CompoundWallet.networks[3]
  if(WalletData) {
    
    const abi = CompoundWallet.abi
    const address = WalletData.address
    //Load contract and set state
    const walletContract = new this.state.web3.eth.Contract(abi, address)
    await this.setState({ walletContract })
    console.log('Wallet contract: ', this.state.walletContract)
  }

  //Compound Ropsten address located here: https://compound.finance/docs#networks
  const compoundCETHContractAddress = '0xbe839b6d93e3ea47effcca1f27841c917a8794f3'
  const cETHContract = new this.state.web3.eth.Contract(cETH, compoundCETHContractAddress)
  await this.setState({cETHContract})
  console.log('cEth contract:', this.state.cETHContract)


}

//Shows notification
showNotification = () => {
  this.notificationOne.current.updateShowNotify()
}

//Supply ETH to Compound
async supplyETH(amount) {
  try {
    this.state.contract.methods.supplyETHToCompound(this.state.cETHContract, amount).send({ from: this.state.account }).on('transactionHash', async (hash) => {
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
          window.alert('Error! Could not increment!')
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

async redeemETH(amount) {
  try {
    this.state.contract.methods.redeemcETHTokens(this.state.cETHContract, amount).send({ from: this.state.account }).on('transactionHash', async (hash) => {
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
          window.alert('Error! Could not increment!')
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
    cETHContract: null,
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
          <div className='row mt-1'></div>
          <h1 className='mt-2' id='title'>Counter</h1>
          <h1>Compound Wallet! {this.state.admin}</h1>
        </>
        }
      </div>
    );
  }
}

export default App;
