const { ipcRenderer } = window.require('electron');
import React from 'react';

export class RecordButton extends React.Component{
    constructor(props){
      super(props);
      this.state = {
        recordingON: false
      }
      this.changeRecording = this.changeRecording.bind(this)
    }
  
    componentDidMount() {
      
    }
  
    componentWillUnmount(){
      
  }
    changeRecording() {
      this.setState(state => ({
        recordingON: !state.recordingON
      }));
  
      ipcRenderer.send('recording', !this.state.recordingON)
    }
  
  //What the actual component renders
    render(){    
      
      if (this.state.recordingON === false){ 
        return(
      
        <button onClick={this.changeRecording} >Recording START</button>
      
    )}
      
      else {
        return(
      
          <button onClick={this.changeRecording} style={{color:'red'}}>Recording STOP</button>
        
      )}
    }
      
  }