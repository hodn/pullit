import React, { Component } from 'react';
import './App.css';
import '../node_modules/react-vis/dist/style.css';
import SmoothieComponent, { TimeSeries } from 'react-smoothie';

//Communication with Electron
const { ipcRenderer } = window.require('electron');

//Real time graph component
class RTLineGraph extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      events: new TimeSeries({}),
      value: 0
    }

  }

  componentDidMount() {
    //Message for Electron
    ipcRenderer.send('clear-to-send') 
    //Listener on parsed data from Electron
    ipcRenderer.on('data-parsed', (event, arg) => {
      
      const time = arg[0][0]
      const measurement = arg[0][this.props.channel]
      const newEvents = this.state.events
      newEvents.append(time, measurement)

      const aggValue = arg[1][this.props.channel-1]

      this.setState({events: newEvents, value: aggValue.toFixed(2)})
      
    })

  }

  componentWillUnmount(){
    
}
  
//What the actual component renders
  render(){    
      return(
    
        <div>
          <h2>{this.props.name}</h2>
          <p>{this.state.value} {this.props.unit}</p>
          <SmoothieComponent
              width="553" 
              height="195"
              interpolation='linear'
              scaleSmoothing={0.424}
              millisPerPixel={16}
              grid={{fillStyle:'rgba(255,255,255,0.92)',strokeStyle:'rgba(0,0,0,0.16)',sharpLines:true,borderVisible:true}}
              labels={{fillStyle:'#000000',fontSize:13,precision:0}}
              streamDelay={100}
              series={[
                {
                  data: this.state.events,
                  lineWidth:3.9,
                  strokeStyle:'#000080'
                }
              ]}
      />
       
        </div>
      
      );
    
    
  }
    
}

class StateBar extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      streaming: false
    }

  }

  componentDidMount() {
    ipcRenderer.on('data-parsed', (event, arg) => {
      this.setState({streaming: true})
    })
  }

  componentWillUnmount(){
    
}
  
//What the actual component renders
  render(){    
      
   if(this.state.streaming === true) {

      return(
    
        <p></p>
      )
    
    
    }else{

      return(
    
        <p>NO</p>
      )
    }
  }
    
}

//The app frontend itself
  class App extends Component {
  
  render() {
    
    return (
      <div className="App">
       <StateBar/>
      <RTLineGraph name="Channel 1" channel={1} unit="mV"/>
      <RTLineGraph name="Channel 2" channel={2} unit="mV"/>
      <RTLineGraph name="Channel 3" channel={3} unit="mV"/>
      <RTLineGraph name="Channel 4" channel={4}/>
      
      </div>
    );
  }
}


export default App;
