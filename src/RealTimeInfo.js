import React from 'react';
import {StatCard} from './StatCard';
import { Grid } from '@material-ui/core';
const { ipcRenderer } = window.require('electron');

export class RealTimeInfo extends React.Component{
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
    
      <div id="infobar">
        <Grid container spacing={1}>
          <Grid item xs={4} >
            <StatCard name="Torque" data={this.props.drillData.torque} unit="Nm"/>
          </Grid>
          
          <Grid item xs={4}>
            <StatCard name="Force" data={this.props.drillData.force} unit="N"/>
          </Grid>
          
          <Grid item xs={4}>
            <StatCard name="Revolutions" data={this.props.drillData.revs} unit="RPM"/>
          </Grid>   
          
          <Grid item xs={2}>
            <StatCard name="1 m" data={this.props.tools.l1}/>
          </Grid> 

          <Grid item xs={2}>
            <StatCard name="1.5 m" data={this.props.tools.l2}/>
          </Grid> 

          <Grid item xs={2}>
            <StatCard name="2 m" data={this.props.tools.l3}/> 
          </Grid> 
          
          <Grid item xs={2}>
            <StatCard name="3 m" data={this.props.tools.l4}/>
          </Grid> 

          <Grid item xs={2}>
            <StatCard name="Total lenght" data={this.props.tools.total} unit="m"/>
          </Grid> 
          
          <Grid item xs={2}>
            <StatCard name="Crown" data={this.props.tools.c} unit="mm"/>
          </Grid> 
   
        </Grid>
      </div>
      
      );
    
    
  }
    
}

