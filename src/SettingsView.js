const { ipcRenderer } = window.require('electron');
import Select from '@material-ui/core/Select';
import React from 'react';
import { Button, MenuItem, FormControl, InputLabel, FormHelperText } from '@material-ui/core';

export class SettingsView extends React.Component{
    constructor(props){
      super(props);
      
      this._isMounted = false
      
      this.state = {
        portList: [],
        selectedPort:"",
      }
      this.handleChange = this.handleChange.bind(this);
      this.handleClick = this.handleClick.bind(this);
    }
  
    componentDidMount() {
      this._isMounted = true
      ipcRenderer.send("list-ports")
      ipcRenderer.on('ports-listed', (event, arg) => {

      this._isMounted && this.setState((state, props) => ({
        portList: [...state.portList, arg]
      }));
      
     })
    }
  
    componentWillUnmount(){
    this._isMounted = false;
  }
  
  handleChange(event) {
    this.setState({ selectedPort: event.target.value});
    ipcRenderer.send('change-com', event.target.value)
    ipcRenderer.send('clear-to-send')  
  }

  handleClick() {
    
    ipcRenderer.send('change-dir') 
  }
    
  //What the actual component renders
    render(){    
  
      return(
        <div>
        <FormControl>
          <Select onChange={this.handleChange} value={this.state.selectedPort}>
          <InputLabel>COM</InputLabel>
              {this.state.portList.map((item, index) => (
                <MenuItem key={index} value={item}>{item}</MenuItem>
              ))}
          </Select>
          <FormHelperText>Select COM PORT</FormHelperText>
        </FormControl>
        
        
        <Button variant="contained" color="primary" onClick={this.handleClick}>Default directory</Button>
        </div>
      )
    
    }
      
  }