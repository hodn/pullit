import React from 'react';
import {StatCard} from './StatCard';
import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { ExposureZero } from '@material-ui/icons';
const { ipcRenderer } = window.require('electron');

export class RealTimeInfo extends React.Component{
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
  
}
  
// What the actual component renders
  render(){    

      return(
    
      <div>
        <Grid container spacing={1}>
          <Grid item xs={3}>
            <StatCard name="Torque" data={this.props.drillData.torque} unit="Nm"/>
          </Grid>
          
          <Grid item xs={1}>
          <div style={this.state.disabled ? {pointerEvents: "none", opacity: "0.4"} : {}}>
            <Button size="small" id="tare" variant="outlined" color="primary" onClick={(e) => this.tare(1)}>Tare<ExposureZero/></Button>
          </div>
          </Grid>
          
          <Grid item xs={3}>
            <StatCard name="Force" data={this.props.drillData.force} unit="N"/>
          </Grid>

          <Grid item xs={1}>
          <div style={this.state.disabled ? {pointerEvents: "none", opacity: "0.4"} : {}}>
            <Button size="small" id="tare" variant="outlined" color="primary" onClick={(e) => this.tare(2)}>Tare<ExposureZero/></Button>
          </div>
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

