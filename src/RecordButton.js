const { ipcRenderer } = window.require('electron');
import React from 'react';
import { Button } from '@material-ui/core';

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
      
        <Button onClick={this.changeRecording} color="primary">Recording START</Button>
      
    )}
      
      else {
        return(
      
          <Button onClick={this.changeRecording} color="secondary">Recording STOP</Button>
        
      )}
    }
      
  }