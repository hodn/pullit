import React, { Component } from 'react';
import './App.css';
import '../node_modules/react-vis/dist/style.css';
import {XYPlot, LineSeries, XAxis, YAxis} from 'react-vis';

//Communication with Electron
const { ipcRenderer } = window.require('electron');

//Real time graph component
class RTLineGraph extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      ch1_events: [],
      ch2_events: [],
      ch3_events: []
    }

  }

  componentDidMount() {
    //Message for Electron
    ipcRenderer.send('graph-mounted', this.props.dataType) 
    //Listener on parsed data from Electron
    ipcRenderer.on('ch1-parsed', (event, arg) => {
      
      const parsedEvent = {x: arg[0], y: arg[1]}
      
      const newEvents = this.state.ch1_events
      newEvents.push(parsedEvent)
      
      if(newEvents.length > 50){
        newEvents.splice(0, 1)
      }

      this.setState({ch1_events: newEvents})
    
    })

    ipcRenderer.on('ch2-parsed', (event, arg) => {
      
      const parsedEvent = {x: arg[0], y: arg[1]}
      
      const newEvents = this.state.ch2_events
      newEvents.push(parsedEvent)
      
      if(newEvents.length > 50){
        newEvents.splice(0, 1)
      }

      this.setState({ch2_events: newEvents})
     
    })

    ipcRenderer.on('ch3-parsed', (event, arg) => {
      
      const parsedEvent = {x: arg[0], y: arg[1]}
      
      const newEvents = this.state.ch3_events
      newEvents.push(parsedEvent)
      
      if(newEvents.length > 50){
        newEvents.splice(0, 1)
      }

      this.setState({ch3_events: newEvents})
     
    })
  }

  componentWillUnmount() {
    
  }

  //What the actual component renders
  render(){    
    switch(this.props.dataType) {
      case "ch1":
      return(
    
        <div>
          <p>{this.props.name}</p>
          <XYPlot height={300} width={800} xType="time">
            
            <XAxis/>
            <YAxis/>
            <LineSeries data={this.state.ch1_events} curve={'curveMonotoneX'} />
  
          </XYPlot>
  
        </div>
      
      );
      case "ch2":
      return(
    
        <div>
          <p>{this.props.name}</p>
          <XYPlot height={300} width={800} xType="time">
            
            <XAxis/>
            <YAxis/>
            <LineSeries data={this.state.ch2_events} curve={'curveMonotoneX'} />
  
          </XYPlot>
  
        </div>
      
      );
      case "ch3":
      return(
    
        <div>
          <p>{this.props.name}</p>
          <XYPlot height={300} width={800} xType="time">
            
            <XAxis/>
            <YAxis/>
            <LineSeries data={this.state.ch3_events} curve={'curveMonotoneX'} />
  
          </XYPlot>
  
        </div>
      
      );
      default:
          return console.log("err")
  }
    
    
  }
    
}
  


//The app frontend itself
  class App extends Component {
  
  render() {
    
    return (
      <div className="App">
      
      <RTLineGraph name="Channel 1" dataType="ch1"/>
      <RTLineGraph name="Channel 2" dataType="ch2"/>
      <RTLineGraph name="Channel 3" dataType="ch3"/>
      
      </div>
    );
  }
}


export default App;
