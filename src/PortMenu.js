const { ipcRenderer } = window.require('electron');
import React from 'react';

export class PortMenu extends React.Component{
    constructor(props){
      super(props);
      this.state = {
        portList: []
      }
      this.handleChange = this.handleChange.bind(this);
    }
  
    componentDidMount() {
     ipcRenderer.send("list-ports")
     ipcRenderer.on('ports-listed', (event, arg) => {
  
      const list = this.state.portList
      list.push(arg)
  
      this.setState({
        portList: list,
      })
      
     })
    }
  
    componentWillUnmount(){
      
  }
  
  handleChange(event) {
    ipcRenderer.send('clear-to-send', event.target.value) 
    }
    
  
  //What the actual component renders
    render(){    
  
      return(
        <select onChange={this.handleChange} value={this.state.selectedPort}>
         <option>COM PORT</option>
          {this.state.portList.map((item, index) => (
          <option key={index} value={item}>{item}</option>
        ))}
        </select>
      )
    
    }
      
  }