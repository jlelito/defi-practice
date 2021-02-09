import React, { Component } from 'react';
import { Toast } from 'react-bootstrap';
import Loader from 'react-loader-spinner'
import checkmark from '../src_images/checkmark.png';
import xmark from '../src_images/xmark.png';




class Notification extends Component {

    updateShowNotify = () => this.setState({showA: true});
    updateCloseNotify = () => this.setState({showA: false})

    constructor(props) {
        super(props)
        this.state= {
            showA: false
        }
    }

    render() {
        return (
        <div className='row fixed-top mt-5'>
            <Toast className='mt-4 ml-4' show={this.state.showA} onClose={this.updateCloseNotify}>
                <Toast.Header>
                    <strong className='mr-auto'>Transaction Sent</strong>
                    <small>1 second ago</small>
                </Toast.Header>
                
                <Toast.Body>
                <div className='row justify-content-center'>
                    <div className='col-12'>
                        <div><b>{this.props.action}</b></div>
                        <div className='row justify-content-center'>
                            Status of Transaction:
                            {this.props.trxStatus === 'Pending' ? 
                                <>
                                <div className='text-muted ml-2'>Pending</div>
                                <Loader 
                                    className='ml-2'
                                    type='Oval'
                                    color='#00BFFF'
                                    height={15}
                                    width={15}
                                /> 
                                </>
                                :   
                                <>
                                {this.props.trxStatus === 'Success' ? <><b className='text-success ml-2'>Success</b> <img src={checkmark} className='float-left ml-2' height='15' width='15' alt='checkmark'/> </> : 
                                    <>{this.props.trxStatus === 'Failed' ? <> <b className='text-danger ml-2'>Failed</b> <img src={xmark} className='float-left ml-2' height='15' width='15' alt='xmark'/> </> : null}</>
                                }
                                </>
                            }
                        </div>
                        Transaction:
                        <a className='ml-2' href={`https://ropsten.etherscan.io/tx/${this.props.hash}`} target='_blank' rel='noopener noreferrer'>
                            Etherscan.io
                        </a>
                        <div>Confirmations: {this.props.confirmNum}</div>
                        
                    </div>
                </div>
                </Toast.Body>
            </Toast>  
        </div>
        );
    }
  }

  export default Notification;