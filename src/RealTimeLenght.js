import React from 'react';
import {Button, Paper, Typography} from '@material-ui/core';
const { ipcRenderer } = window.require('electron');

export class RealTimeLenght extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      disabled: true
      
    }

  }

  componentDidMount() {

    ipcRenderer.on('data-parsed', (event, arg) => {

      setTimeout(function () {
        this.setState({disabled: false});
      }.bind(this), 1000)
  
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
              Lenght Control
                </Typography>
                <Button id="control" variant="contained" onClick={(e) => this.props.lenghtHandler("l1")}>1 m</Button> 
                <Button id="control" variant="contained" onClick={(e) => this.props.lenghtHandler("l2")}>1.5 m</Button> 
                <Button id="control" variant="contained" onClick={(e) => this.props.lenghtHandler("l3")}>2 m</Button> 
                <Button id="control" variant="contained" onClick={(e) => this.props.lenghtHandler("l4")}>3 m</Button>
                <Button id="control" variant="contained" color="secondary" onClick={(e) => this.props.undo()}>Undo</Button>
                <Button id="control" variant="contained" color="secondary" onClick={(e) => this.props.lenghtReset()}>Delete</Button> 
            
          </Paper>
              
          
        </div>
      
      );
    
    
  }
    
}

