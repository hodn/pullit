import React from 'react';
import {StatCard} from './StatCard'

export class RealTimeInfo extends React.Component{
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
         
          <StatCard name="Torque" data={this.props.drillData.torque} unit="Nm" /> 
          <StatCard name="Force" data={this.props.drillData.force} unit="N"/>
          <StatCard name="Revolutions" data={this.props.drillData.revs} unit="RPM"/>
          <StatCard name="1 m" data={this.props.tools.l1}/>
          <StatCard name="1.5 m" data={this.props.tools.l2}/>
          <StatCard name="2 m" data={this.props.tools.l3}/> 
          <StatCard name="3 m" data={this.props.tools.l4}/>
          <StatCard name="Total lenght" data={this.props.tools.total} unit="m"/>
          <StatCard name="Crown" data={this.props.tools.c} unit="mm"/>
      
      </div>
      
      );
    
    
  }
    
}

