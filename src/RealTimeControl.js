import React from 'react';

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
          <button id="l1" onClick={(e) => this.props.lenghtHandler(e.target.id)}>1 m</button> 
          <button id="l2" onClick={(e) => this.props.lenghtHandler(e.target.id)}>1.5 m</button> 
          <button id="l3" onClick={(e) => this.props.lenghtHandler(e.target.id)}>2 m</button> 
          <button id="l4" onClick={(e) => this.props.lenghtHandler(e.target.id)}>3 m</button>
          <button id="delete" onClick={(e) => this.props.lenghtReset(e.target.id)}>Delete</button> <br/>
          <button id="c1" onClick={(e) => this.props.crownHandler(e.target.id)}>173 mm</button>
          <button id="c2" onClick={(e) => this.props.crownHandler(e.target.id)}>185 mm</button>
          <button id="c3" onClick={(e) => this.props.crownHandler(e.target.id)}>220 mm</button>
       
        </div>
      
      );
    
    
  }
    
}

