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
      events: []
    }

  }

  componentDidMount() {
    //Message for Electron
    ipcRenderer.send('graph-mounted', this.props.dataType) 
    //Listener on parsed data from Electron
    ipcRenderer.on('ch1-parsed', (event, arg) => {
      
      const parsedEvent = {x: arg[0], y: arg[1]}
      
      const newEvents = this.state.events
      newEvents.push(parsedEvent)
      
      if(newEvents.length > 100){
        newEvents.splice(0, 1)
      }

      this.setState({events: newEvents})
    })

  }

  componentWillUnmount() {
    
  }

  //What the actual component renders
  render(){    
    
    return(
    
      <div>
        <p>{this.props.name}</p>
        <XYPlot height={300} width={800} xType="time">
          
          <XAxis/>
          <YAxis/>
          <LineSeries data={this.state.events}  curve={'curveMonotoneX'} />

        </XYPlot>

      </div>
    
    );

    }
  }


//The app frontend itself
  class App extends Component {
  
  render() {
    
    return (
      <div className="App">
      
      <RTLineGraph name="Channel 1" dataType="channel_1"/>
      
      </div>
    );
  }
}


export default App;
