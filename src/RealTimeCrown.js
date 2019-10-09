const { ipcRenderer } = window.require('electron');
import React from 'react';
import {Button, Paper, Typography} from '@material-ui/core';

export class RealTimeCrown extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      disabled: true
      
    }

  }

  componentDidMount() {

    ipcRenderer.on('data-parsed', (event, arg) => {

      this.setState({
        disabled: false
      });
    })

  }

  componentWillUnmount(){
    
}
  
// What the actual component renders
  render(){    
      
    
      return(
    
         <div style={this.state.disabled ? {pointerEvents: "none", opacity: "0.4"} : {}}>
            
          <Paper>
              <Typography variant="body1">
              Crown Control
              </Typography>
              
              <Button id="control" variant="contained" onClick={(e) => this.props.crownHandler("c1")}>173 mm</Button>
              <Button id="control" variant="contained" onClick={(e) => this.props.crownHandler("c2")}>185 mm</Button>
              <Button id="control" variant="contained" onClick={(e) => this.props.crownHandler("c3")}>220 mm</Button>
            
          </Paper>
          
        </div>
      
      );
    
    
  }
    
}

