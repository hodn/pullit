import React from 'react';
import {Button, Paper, Typography} from '@material-ui/core';

export class RealTimeLenght extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      
    }

  }

  componentDidMount() {
  

  }

  componentWillUnmount(){
    
}
  
// What the actual component renders
  render(){    
      
    
      return(
    
        <div>
          <Paper>
                <Typography variant="body1">
              Lenght Control
                </Typography>
                <Button variant="contained" onClick={(e) => this.props.lenghtHandler("l1")}>1 m</Button> 
                <Button variant="contained" onClick={(e) => this.props.lenghtHandler("l2")}>1.5 m</Button> 
                <Button variant="contained" onClick={(e) => this.props.lenghtHandler("l3")}>2 m</Button> 
                <Button variant="contained" onClick={(e) => this.props.lenghtHandler("l4")}>3 m</Button>
                <Button variant="contained" color="secondary" onClick={(e) => this.props.lenghtReset("delete")}>Delete</Button> 
            
          </Paper>
              
          
        </div>
      
      );
    
    
  }
    
}

