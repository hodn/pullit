import React from 'react';

export class RealTimeBar extends React.Component{
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
          
         <p>Torque: {this.props.drillData.torque} Nm -- Force: {this.props.drillData.force} N -- Revs: {this.props.drillData.revs} RPM</p>
         <p>1 m: {this.props.tools.l1} -- 1,5 m: {this.props.tools.l2} -- 2 m: {this.props.tools.l3} -- 3 m: {this.props.tools.l4}</p>
         <p>Total: {this.props.tools.total} m -- Crown: {this.props.tools.c} mm</p>
       
        </div>
      
      );
    
    
  }
    
}

