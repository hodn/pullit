const { ipcRenderer } = window.require('electron');
import React from 'react';
import {XYPlot, XAxis, YAxis, LineSeries, HorizontalGridLines} from 'react-vis';


export class HistoryGraph extends React.Component{
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
            this.setState(state => {
              const completeData = [...state.completeData, parsedData]        
              return {
                completeData
              };
            })
          }
       }
  
      })
    }
  
    componentWillUnmount(){
      
  }
  
  changeGraph(){
    let newGraph = []
  
    this.setState(state => {
      for (var i = 0; i < state.completeData.length; i++) {
        if(state.completeData[i].x >= state.start && state.completeData[i].x <= state.end){
          newGraph.push({x: state.completeData[i].x, y: state.completeData[i].y})
        }
    }
      const selectedData = newGraph;

      return {
        selectedData
      };
    })
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