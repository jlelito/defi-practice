import React, { Component } from 'react';
import Loader from 'react-loader-spinner';

class Loading extends Component {

render() {
    return(
        <>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <div className='row mt-5'></div>
            
            <h2 className='row justify-content-center mt-4'>
            Loading Dapp.... 
            </h2>
            <div className='row justify-content-center mt-4'>
                <Loader 
                    
                    type='Oval'
                    color='#00BFFF'
                    height={150}
                    width={150}>
                </Loader>
            </div>
          </>
    )
}


}

export default Loading 