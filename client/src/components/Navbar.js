import React, { Component } from 'react';
import Identicon from 'identicon';
import ethlogo from '../src_images/ETH.png';
import coloreth from '../src_images/eth-diamond-rainbow.png';
import 'react-bootstrap';
import  { Pill }  from '../../node_modules/rimble-ui';
import AccountModal from './AccountModal.js';


class Navbar extends Component {

  connectWallet() {
    window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  render() {
    return (
      
      <nav className='navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow'>
        <div
          className='navbar-brand col-sm-3 col-md-2 mr-0'
          target='_blank'
          rel='noopener noreferrer'
        >
          <img src={coloreth} width='20' height='30' className='d-inline-block align-top mr-2' alt='rainbow eth logo' />
          Yearn Wallet
        </div>
        <ul className='navbar-nav px-3'>
          <li className='nav-item text-nowrap d-none d-sm-none d-sm-block'>
            <div className='text-secondary row'>
            
            {this.props.network === 1 ? <Pill className='mr-2 my-2' >Mainnet</Pill>
            : this.props.network === 3 ? <Pill color="green" className='mr-2 my-2'>Ropsten</Pill>
            : this.props.network === 4 ? <Pill className='mr-2 my-2'>Rinkeby</Pill>
            : this.props.network === 5 ? <Pill className='mr-2 my-2'>Goerli</Pill>
            : this.props.network === 42 ? <Pill className='mr-2 my-2'>Kovan</Pill>
            : <Pill className='mr-2 my-2'>Unknown Network</Pill>
            }
            
            <>
            {!this.props.isConnected ? 
              <>
              <button className="bg-dark">
                <Pill className='mr-2 my-2' color="red" onClick={() => this.connectWallet()}>Connect to a Wallet</Pill>
              </button>
              </>
              :
              this.props.account !== null ?
              <>
                <Pill className='mr-2 my-2' color="green">Connected</Pill>
                <div id='balance' className='text-white mt-2'>{Number(this.props.balance).toFixed(3)} ETH</div>
                <img className='my-2' src={ethlogo} width='25' height='25' alt='ethlogo'/>
                <div id='account' className='text-white float-right my-2'>
                  <AccountModal account={this.props.account}/> 
                </div>
                {/* <img
                  className='mr-2 float-right rounded my-2'
                  width='30'
                  height='30'
                  src={`data:image/png;base64,${new Identicon(this.props.account, 30).toString()}`}
                  alt='identicon'
                /> */}
                <div className='text-white mx-2 my-2'>Ropsten Faucet: <a href='https://faucet.ropsten.be/' target='_blank' rel='noopener noreferrer'>Faucet</a></div>
              </> 
              : 
              <span></span>
            }
            </>
              
            </div>

          </li>
        </ul>
      </nav>
    );
  }
}

export default Navbar;