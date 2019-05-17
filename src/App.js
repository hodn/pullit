import React, { Component } from 'react';
import './App.css';
import '../node_modules/react-vis/dist/style.css';
import SmoothieComponent, { TimeSeries } from 'react-smoothie';
import {XYPlot, XAxis, YAxis, LineSeries, HorizontalGridLines} from 'react-vis';

//Communication with Electron
const { ipcRenderer } = window.require('electron');

//Real time graph component
class RTGraph extends React.Component{
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

class HistoryGraph extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      completeData:[],
      selectedData:[],
      start: 0,
      end: 0
    }
    this.changeGraph = this.changeGraph.bind(this)
    this.changeStart = this.changeStart.bind(this)
    this.changeEnd = this.changeEnd.bind(this)
  }

  componentDidMount() {
    //Listener on parsed data from Electron
    ipcRenderer.on('history-loaded', (event, arg) => {
      for (var key in arg) {
        if (arg.hasOwnProperty(key)) {
          const timestamp = Date.parse(arg[key].Time)/1000
          const value = parseFloat(arg[key]["ch" + this.props.channel])
          const parsedData = {x: timestamp, y: value}
          const currentData = this.state.completeData
          currentData.push(parsedData)
          this.setState({completeData: currentData})
        }
     }

    })
  }

  componentWillUnmount(){
    
}

changeGraph(){
  let currentGraph = this.state.completeData
  let newGraph = []
  for (var i = 0; i < currentGraph.length; i++) {
      if(currentGraph[i].x >= this.state.start && currentGraph[i].x <= this.state.end){
        newGraph.push({x: currentGraph[i].x, y: currentGraph[i].y})
      }
  }
  this.setState({selectedData: newGraph})
}

changeStart(e){
 
  this.setState({start: e.target.value})
}

changeEnd(e){
  
  this.setState({end: e.target.value})
}

  
//What the actual component renders
  render(){    
      return(
    <div>
      <h1>{this.props.name} history</h1>
      <select onChange={this.changeStart} value={this.state.start}>
      <option>Start time</option>
        {this.state.completeData.map((obj, key) => (
        <option key={key} value={obj.x}>{new Date(obj.x*1000).toLocaleString()}</option>
      ))}
      </select>

      <select onChange={this.changeEnd} value={this.state.end}>
      <option>End time</option>
        {this.state.completeData.map((obj, key) => (
        <option key={key} value={obj.x}>{new Date(obj.x*1000).toLocaleString()}</option>
      ))}
      </select>
      <button onClick={this.changeGraph}>Generate graph</button>
        <XYPlot height={300} width={800} xType="time-utc" >
        <HorizontalGridLines />
        <XAxis/>
        <YAxis/>
        <LineSeries data={this.state.selectedData} animation />

      </XYPlot>

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
    ipcRenderer.send('get-history') 
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


//The app frontend itself
  class App extends Component {
  
  render() {
    
    return (
      <div className="App">
      <RecordButton/>
      <PortConnect/>
      <RTGraph name="Channel 1" channel={1} unit="mV"/>
      <RTGraph name="Channel 2" channel={2} unit="mV"/>
      <RTGraph name="Channel 3" channel={3} unit="mV"/>
      <RTGraph name="Channel 4" channel={4}/>
      <HistoryGraph name="Channel 1" channel={1}/>
      <HistoryGraph name="Channel 2" channel={2}/>
      <HistoryGraph name="Channel 3" channel={3}/>
      </div>
    );
  }
}


export default App;
