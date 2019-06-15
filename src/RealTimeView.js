const { ipcRenderer } = window.require('electron');
import React from 'react';
import { PortMenu } from './PortMenu.js';
import { RecordButton } from './RecordButton.js';
import { RealTimeGraph } from './RealTimeGraph.js';
import { RealTimeBar } from './RealTimeBar.js';
import { RealTimeControl } from './RealTimeControl.js';
import { HistoryGraph } from './HistoryGraph.js';

export class RealTimeView extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      data_ch1: [],
      data_ch2: [],
      data_ch3: [],
      events_ch1:[],
      events_ch2:[],
      barData:{},
      toolsData:{}
    }

    this.lenghtHandler = this.lenghtHandler.bind(this)
    this.crownHandler = this.crownHandler.bind(this)
    this.lenghtReset = this.lenghtReset.bind(this)
    this.countLenght = this.countLenght.bind(this)
    this.updateCSV = this.updateCSV.bind(this)
  }

  componentDidMount() {
    ipcRenderer.send('get-history') // Move this to History View later
    this.setState({
      toolsData: {l1: 0, l2: 0, l3: 0, l4: 0, total: 0, c: 0},
      barData: {torque: 0, force: 0, revs: 0}
  });
    
    // Listener on parsed data from Electron
    ipcRenderer.on('data-parsed', (event, arg) => { 
     
        const data1 = {x: arg.time, y: arg.ch1}
        const data2 = {x: arg.time, y: arg.ch2} 
        const data3 = {x: arg.time, y: arg.ch3} 
        
        this.setState((state) => ({
            data_ch1: [...state.data_ch1, data1],
            data_ch2: [...state.data_ch2, data2],
            data_ch3: [...state.data_ch3, data3],
            barData: {torque: data1.y, force: data2.y, revs: data3.y}
        }));
     
      
    })

  }

  componentWillUnmount(){
    
}
  
  lenghtHandler(id){
    this.setState(state => ({
      toolsData: {                   
          ...state.toolsData,    
          [id]: state.toolsData[id] + 1
      }
  }), () => {this.countLenght()})
}

  countLenght(){
  const l1 = 1
  const l2 = 1.5
  const l3 = 2
  const l4 = 3
  const lenght = this.state.toolsData.l1 * l1 + this.state.toolsData.l2 * l2 + this.state.toolsData.l3 * l3 + this.state.toolsData.l4 * l4

  this.setState(state => ({
    toolsData: {                   
        ...state.toolsData,    
        total: lenght
    }
}), () => {this.updateCSV()})
}

  lenghtReset(){
    this.setState((state) => ({
      toolsData: {l1: 0, l2: 0, l3: 0, l4: 0, total: 0, c: state.toolsData.c},
    }), () => {this.updateCSV()})
  
}

  updateCSV(){
    ipcRenderer.send("tools-updated", this.state.toolsData)
    if(this.state.data_ch1 === [] && this.state.data_ch2 === []){
    const last_ch1 = this.state.data_ch1[this.state.data_ch1.length-1]
    const last_ch2 = this.state.data_ch2[this.state.data_ch2.length-1]
    this.setState(state => ({
      events_ch1: [...state.events_ch1, last_ch1],
      events_ch2: [...state.events_ch2, last_ch2]
    }))
  }
}
  crownHandler(id){
    const c1 = 173
    const c2 = 185
    const c3 = 220
    let crownSize = 0
    
    switch(id) {
      case "c1":
        crownSize = c1
        break;
      case "c2":
        crownSize = c2
        break;
      case "c3":
        crownSize = c3
        break;
      default:
        return
    }
    
    this.setState(state => ({
      toolsData: {                   
          ...state.toolsData,    
          c: crownSize
      }
  }), () => {this.updateCSV()})
}
  
// What the actual component renders
  render(){    

      return(
    
        <div>
            <RecordButton/> 
            <PortMenu/>
            <RealTimeControl lenghtHandler={this.lenghtHandler} lenghtReset={this.lenghtReset} crownHandler={this.crownHandler} />
            <RealTimeGraph data={this.state.data_ch1} eventData={this.state.events_ch1}/>
            <RealTimeGraph data={this.state.data_ch2} eventData={this.state.events_ch2} />
            <RealTimeBar drillData={this.state.barData} tools={this.state.toolsData}/>
            <HistoryGraph channel="1"/>
            <HistoryGraph channel="2"/>
        </div>
      
      );
    
    
  }
    
}

