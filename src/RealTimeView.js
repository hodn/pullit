const { ipcRenderer } = window.require('electron');
import React from 'react';
import { PortMenu } from './PortMenu.js';
import { RecordButton } from './RecordButton.js';
import { RealTimeGraph } from './RealTimeGraph.js';
import { RealTimeBar } from './RealTimeBar.js';
import { RealTimeControl } from './RealTimeControl.js';

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
    this.setState({
      toolsData: {l1: 0, l2: 0, l3: 0, l4: 0, total: 0, c: 0},
      barData: {torque: 0, force: 0, revs: 0}
  });
    
    // Listener on parsed data from Electron
    ipcRenderer.on('data-parsed', (event, arg) => { 
     
        const packet_ch1 = {x: arg.time, y: arg.ch1}
        const packet_ch2 = {x: arg.time, y: arg.ch2} 
        const packet_ch3 = {x: arg.time, y: arg.ch3} 
  
        const timeWindow = 300 //seconds

        if (this.state.data_ch1.length <= timeWindow){
        this.setState((state) => ({
            data_ch1: [...state.data_ch1, packet_ch1],
            data_ch2: [...state.data_ch2, packet_ch2],
            data_ch3: [...state.data_ch3, packet_ch3],
            barData: {torque: packet_ch1.y, force: packet_ch2.y, revs: packet_ch3.y}
        }))} 
        else {
          const d_ch1 = this.state.data_ch1
          const d_ch2 = this.state.data_ch2
          const d_ch3 = this.state.data_ch3
          const e_ch1 = this.state.events_ch1
          const e_ch2 = this.state.events_ch2

          d_ch1.splice(0,1)
          d_ch2.splice(0,1)
          d_ch3.splice(0,1)

          if(e_ch1.length !== 0 && e_ch1[0].x <= d_ch1[0].x){
            e_ch1.splice(0,1)
            e_ch2.splice(0,1)
          }

          this.setState({
            data_ch1: d_ch1,
            data_ch2: d_ch2,
            data_ch3: d_ch3,
            events_ch1: e_ch1,
            events_ch2: e_ch2,
            barData: {torque: packet_ch1.y, force: packet_ch2.y, revs: packet_ch3.y}
          });
        }
     
      
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
    }), () => {this.updateCSV('reset')})
  
}

  updateCSV(event){
    ipcRenderer.send("tools-updated", this.state.toolsData)
    
    if(this.state.data_ch1.length !== 0 && event !=='reset'){
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
        </div>
      
      );
    
    
  }
    
}

