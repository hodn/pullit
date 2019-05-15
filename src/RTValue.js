import React from 'react';
const { ipcRenderer } = window.require('electron');

export class RTValue extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      value: 20
    }
  }

  componentDidMount() {
    ipcRenderer.on('data-parsed', (event, arg) => {
      
      const aggValue = arg[1][this.props.channel-1]

      this.setState({value: aggValue})
      
    })

  }

  componentWillUnmount(){
    
}
  

//What the actual component renders
  render(){    
    
    
      return(
    
      <p>{this.state.value}</p>
    
      )
        
  }
}

