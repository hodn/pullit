import React from 'react';
import {Button, Grid} from '@material-ui/core';

export class RealTimeControl extends React.Component{
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
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Button variant="contained" onClick={(e) => this.props.lenghtHandler("l1")}>1 m</Button> 
              <Button variant="contained" onClick={(e) => this.props.lenghtHandler("l2")}>1.5 m</Button> 
              <Button variant="contained" onClick={(e) => this.props.lenghtHandler("l3")}>2 m</Button> 
              <Button variant="contained" onClick={(e) => this.props.lenghtHandler("l4")}>3 m</Button>
              <Button variant="contained" color="secondary" onClick={(e) => this.props.lenghtReset("delete")}>Delete</Button>
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={(e) => this.props.crownHandler("c1")}>173 mm</Button>
              <Button variant="contained" onClick={(e) => this.props.crownHandler("c2")}>185 mm</Button>
              <Button variant="contained" onClick={(e) => this.props.crownHandler("c3")}>220 mm</Button>
            </Grid>  
          </Grid>
        </div>
      
      );
    
    
  }
    
}

