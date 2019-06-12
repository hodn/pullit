const { ipcRenderer } = window.require('electron');
import React from 'react';

export class PortMenu extends React.Component{
    constructor(props){
      super(props);
      this.state = {
        portList: [],
        selectedPort: null
      }
      this.handleChange = this.handleChange.bind(this);
      this.handleClick = this.handleClick.bind(this);
    }
  
    componentDidMount() {
     ipcRenderer.send("list-ports")
     ipcRenderer.on('ports-listed', (event, arg) => {

      this.setState((state, props) => ({
        portList: [...state.portList, arg]
      }));
      
     })
    }
  
    componentWillUnmount(){
      
  }
  
  handleChange(event) {
    
    this.setState({selectedPort: event.target.value})
  }

  handleClick() {
    
    ipcRenderer.send('clear-to-send', this.state.selectedPort) 
  }
    
  //What the actual component renders
    render(){    
  
      return(
        <div>
        <select onChange={this.handleChange}>
         <option>COM PORT</option>
          {this.state.portList.map((item, index) => (
          <option key={index} value={item}>{item}</option>
        ))}
        </select>
        <button onClick={this.handleClick}>Connect</button>
        </div>
      )
    
    }
      
  }