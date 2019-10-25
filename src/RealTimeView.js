import React from 'react';
import { RealTimeGraph } from './RealTimeGraph.js';
import { RealTimeInfo} from './RealTimeInfo.js';
import { RealTimeLenght } from './RealTimeLenght';
import { RealTimeCrown } from './RealTimeCrown';
import { Grid } from '@material-ui/core';
const { ipcRenderer } = window.require('electron');

export class RealTimeView extends React.Component{
  constructor(props){
    super(props);
    
    this._isMounted = false;
    this.state = {
      data_ch1: [],
      data_ch2: [],
      data_ch3: [],
      events_ch1:[],
      events_ch2:[],
      barData:{},
      toolsData:{}, 
      prevToolsData:[]
    }

    this.lenghtHandler = this.lenghtHandler.bind(this)
    this.crownHandler = this.crownHandler.bind(this)
    this.lenghtReset = this.lenghtReset.bind(this)
    this.undo = this.undo.bind(this)
    this.countLenght = this.countLenght.bind(this)
    this.updateCSV = this.updateCSV.bind(this)
    this.tareScale = this.tareScale.bind(this)
  }

  componentDidMount() {

    this._isMounted = true

    //init of displayed data
    if(this._isMounted){
      this.setState({
        toolsData: {l1: 0, l2: 0, l3: 0, l4: 0, total: 0, c: 0},
        barData: {torque: 0, force: 0, revs: 0}
      });
    }

   // Listener on parsed data from Electron
    ipcRenderer.on('data-parsed', (event, arg) => { 
      
        // parsing packets from device
        const packet_ch1 = {x: arg.time, y: arg.ch1} // Torque
        const packet_ch2 = {x: arg.time, y: arg.ch2} // Force
        const packet_ch3 = {x: arg.time, y: arg.ch3} // RPM
  
        const timeWindow = 300 //seconds - data comes in every sec

        //adding data until timewindow is full
        if (this.state.data_ch1.length <= timeWindow){
        
          if(this._isMounted){
            this.setState((state) => ({
            data_ch1: [...state.data_ch1, packet_ch1],
            data_ch2: [...state.data_ch2, packet_ch2],
            data_ch3: [...state.data_ch3, packet_ch3],
            barData: {torque: packet_ch1.y.toFixed(2), force: packet_ch2.y.toFixed(2), revs: packet_ch3.y}
        }))}}
        else {
          const d_ch1 = this.state.data_ch1
          const d_ch2 = this.state.data_ch2
          const d_ch3 = this.state.data_ch3
          const e_ch1 = this.state.events_ch1
          const e_ch2 = this.state.events_ch2

          //popping data beyond timewindow

          d_ch1.splice(0,1)
          d_ch2.splice(0,1)
          d_ch3.splice(0,1)

          //popping events beyond timewindow

          if(e_ch1.length !== 0 && e_ch1[0].x <= d_ch1[0].x){
            e_ch1.splice(0,1)
            e_ch2.splice(0,1)
          }

          if(this._isMounted){
          this.setState({
            data_ch1: d_ch1,
            data_ch2: d_ch2,
            data_ch3: d_ch3,
            events_ch1: e_ch1,
            events_ch2: e_ch2,
            barData: {torque: packet_ch1.y.toFixed(2), force: packet_ch2.y.toFixed(2), revs: packet_ch3.y}
            });
          }
        }
     
      
    })

  }

  componentWillUnmount(){
    this._isMounted = false
}
  
  // Incrementing a tool number via its ID
  lenghtHandler(id){
    this.setState(state => ({
      prevToolsData: [...state.prevToolsData, state.toolsData],
      toolsData: {                   
          ...state.toolsData,    
          [id]: state.toolsData[id] + 1
      }
  }), () => {this.countLenght()})
}
  // Counting length from tool numbers
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
  // Reseting tools data and tool history
  lenghtReset(){
    this.setState((state) => ({
      prevToolsData: [...state.prevToolsData, state.toolsData],
      toolsData: {l1: 0, l2: 0, l3: 0, l4: 0, total: 0, c: state.toolsData.c},
    }), () => {this.updateCSV("reset")})
  
}
  // Reverting to a previous tools state
  undo(){
    
    if (this.state.prevToolsData.length > 0){
    
    this.setState((state) => ({
      toolsData: state.prevToolsData[this.state.prevToolsData.length-1],
    }), () => {
      this.updateCSV("undo")})
  }
}

  tareScale(){

    this.setState((state) => ({
      data_ch1: [],
      data_ch2: [],
      data_ch3: [],
      events_ch1: [],
      events_ch2: []
      })
    )

  }

  updateCSV(event){
    
    // Undo pressed
    if(event === "undo"){

        // Remove last item in tools history
        if (this.state.prevToolsData.length >= 1){
          
          ipcRenderer.send("tools-updated", {data: this.state.toolsData, change: -1})

          this.setState({
            prevToolsData: this.state.prevToolsData.filter((_, i) => i !== (this.state.prevToolsData.length-1)),
          });
        }
        
        // Remove last event 
        if (this.state.events_ch1.length > 0){
          this.setState({
            events_ch1: this.state.events_ch1.filter((_, i) => i !== (this.state.events_ch1.length-1)),
            events_ch2: this.state.events_ch2.filter((_, i) => i !== (this.state.events_ch2.length-1)),
          });
  
        }

    }// Saves every change as an event - including reset
    else if(this.state.data_ch1.length > 0){
    
    ipcRenderer.send("tools-updated", {data: this.state.toolsData, change: 1})
    
    const last_ch1 = this.state.data_ch1[this.state.data_ch1.length-1]
    const last_ch2 = this.state.data_ch2[this.state.data_ch2.length-1]
    this.setState(state => ({
      events_ch1: [...state.events_ch1, last_ch1],
      events_ch2: [...state.events_ch2, last_ch2],
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
      prevToolsData: [...state.prevToolsData, state.toolsData],
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
          
          <Grid container spacing={1}>
            
            <Grid item xs={12} md={12}>  
              <RealTimeGraph name="Torque" data={this.state.data_ch1} eventData={this.state.events_ch1}/>
            </Grid>
            
            <Grid item xs={12} md={12}>  
              <RealTimeGraph name="Force" data={this.state.data_ch2} eventData={this.state.events_ch2} />
            </Grid>

            <Grid item xs={12} md={12}>  
              <RealTimeInfo drillData={this.state.barData} tools={this.state.toolsData}/>
            </Grid>

            <Grid item xs={6}>  
              <RealTimeLenght lenghtHandler={this.lenghtHandler} lenghtReset={this.lenghtReset} undo={this.undo}/>
            </Grid>
            
            <Grid item xs={6}>  
              <RealTimeCrown crownHandler={this.crownHandler} tareScale={this.tareScale}/>
            </Grid>
            
          </Grid>
        </div>
      
      );
    
    
  }
    
}

