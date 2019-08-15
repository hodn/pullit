import React from 'react';
import {Button, Paper, Typography} from '@material-ui/core';

export class RealTimeCrown extends React.Component{
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
              Crown Control
              </Typography>
              
              <Button variant="contained" onClick={(e) => this.props.crownHandler("c1")}>173 mm</Button>
              <Button variant="contained" onClick={(e) => this.props.crownHandler("c2")}>185 mm</Button>
              <Button variant="contained" onClick={(e) => this.props.crownHandler("c3")}>220 mm</Button>
            
          </Paper>
          
        </div>
      
      );
    
    
  }
    
}

