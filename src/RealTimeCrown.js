import React from 'react';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
const { ipcRenderer } = window.require('electron');

export class RealTimeCrown extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      disabled: true
      
    }

    this.tare = this.tare.bind(this);

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

  tare(id){
    ipcRenderer.send('tare', id);
    this.props.tareScale();
    
  }  
  
// What the actual component renders
  render(){    
      
    
      return(
    
         <div style={this.state.disabled ? {pointerEvents: "none", opacity: "0.4"} : {}}>
            
          <Paper>
              <Typography variant="body1">
              {"Crown & Tare Control"}
              </Typography>
              
              <Button id="control" variant="contained" onClick={(e) => this.props.crownHandler("c1")}>173 mm</Button>
              <Button id="control" variant="contained" onClick={(e) => this.props.crownHandler("c2")}>185 mm</Button>
              <Button id="control" variant="contained" onClick={(e) => this.props.crownHandler("c3")}>220 mm</Button>

              <Button id="tare" variant="contained" color="primary" onClick={(e) => this.tare(1)}>Tare torque</Button>
              <Button id="tare" variant="contained" color="primary" onClick={(e) => this.tare(2)}>Tare force</Button>
            
          </Paper>
          
        </div>
      
      );
    
    
  }
    
}

