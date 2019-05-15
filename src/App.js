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
    //Listener on parsed data from Electron
    ipcRenderer.on('data-parsed', (event, arg) => {
      
      const time = arg[0][0]
      const measurement = arg[0][this.props.channel]
      const newEvents = this.state.events
      newEvents.append(time, measurement)

      const aggValue = arg[1][this.props.channel-1]

      this.setState({events: newEvents, value: aggValue})
      
    })

  }

  componentWillUnmount(){
    
}
  
//What the actual component renders
  render(){    
      return(
    
        <div>
          <h2>{this.props.name}</h2>
          <h1>{this.state.value} {this.props.unit}</h1>
          <SmoothieComponent
              responsive
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

class RecordButton extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      recordingON: false
    }
    this.changeRecording = this.changeRecording.bind(this)
  }

  componentDidMount() {

  }

  componentWillUnmount(){
    
}
  changeRecording() {
    this.setState(state => ({
      recordingON: !state.recordingON
    }));

    ipcRenderer.send('recording', !this.state.recordingON)
  }

//What the actual component renders
  render(){    
    
    if (this.state.recordingON === false){ 
      return(
    
      <button onClick={this.changeRecording} >Recording START</button>
    
  )}
    
    else {
      return(
    
        <button onClick={this.changeRecording} style={{color:'red'}}>Recording STOP</button>
      
    )}
  }
    
}

class PortConnect extends React.Component{
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
  console.log(event.target.value)
  ipcRenderer.send('clear-to-send', event.target.value) 
  }
  

//What the actual component renders
  render(){    

    return(
      <select onChange={this.handleChange} value={this.state.selectedPort}>
      <option value="select">Select PORT</option>
        {this.state.portList.map((item, index) => (
        <option key={index} value={item}>{item}</option>
      ))}
      </select>
    )
  
  }
    
}

//The app frontend itself
  class App extends Component {
  
  render() {
    
    return (
      <div className="App">
      <RecordButton/>
      <PortConnect/>
      <RTLineGraph name="Channel 1" channel={1} unit="mV"/>
      <RTLineGraph name="Channel 2" channel={2} unit="mV"/>
      <RTLineGraph name="Channel 3" channel={3} unit="mV"/>
      <RTLineGraph name="Channel 4" channel={4}/>
      </div>
    );
  }
}


export default App;
