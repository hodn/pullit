const { ipcRenderer } = window.require('electron');
import React from 'react';
import { HistoryGraph } from './HistoryGraph.js';
import DateFnsUtils from "@date-io/date-fns";
import { Button } from '@material-ui/core';
import { MuiPickersUtilsProvider, DateTimePicker } from "@material-ui/pickers";

export class HistoryView extends React.Component{
    constructor(props){
      super(props);
      this.state = {
        range: [],
        start: null,
        end: null,
        data_ch1: [],
        data_ch2: [],
        data_ch3: [],
        events_ch1:[],
        events_ch2:[],
        events_ch3:[]

      }
      this.handleLoadClick = this.handleLoadClick.bind(this)
      this.handleDataClick = this.handleDataClick.bind(this)
      this.handleChangeStart = this.handleChangeStart.bind(this)
      this.handleChangeEnd = this.handleChangeEnd.bind(this)
    }
  
    componentDidMount() {
     
      ipcRenderer.on('csv-loaded', (event, arg) => {
        
        const start = Date.parse(arg.start)
        const end = Date.parse(arg.end)
        
        const startFormat = new Date(start)
        const endFormat = new Date(end)
        
        this.setState({
          range: [startFormat.toLocaleString(), endFormat.toLocaleString()],
          start: start,
          end: end
        })

      })

      ipcRenderer.on('csv-filtered', (event, arg) => {
        
        this.setState({
        data_ch1: arg.ch1,
        data_ch2: arg.ch2,
        data_ch3: arg.ch3,
        events_ch1: arg.e1,
        events_ch2: arg.e2,
        events_ch3: arg.e3
        });
          
      })
      
    }
  
    componentWillUnmount(){
      
  }
  
  handleChangeStart(date) {
    const time = Date.parse(date)
    this.setState({ start: time})
  
  }

  handleChangeEnd(date) {
    const time = Date.parse(date)
    this.setState({ end: time })
  }

  handleLoadClick() {
    ipcRenderer.send('load-csv') // Move this to History View later
  }

  handleDataClick() {
    ipcRenderer.send('get-csv-data', {start: this.state.start, end: this.state.end})
  }
    
  //What the actual component renders
    render(){    
  
      return(
        <div>
          <p>Start: {this.state.range[0]} </p>
          <p>End: {this.state.range[1]} </p>
          <Button onClick={this.handleLoadClick}>Load file</Button>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
      
            <DateTimePicker value={this.state.start} onChange={this.handleChangeStart} ampm={false} openTo="hours" emptyLabel="From"/>
            <DateTimePicker value={this.state.end} onChange={this.handleChangeEnd} ampm={false} openTo="hours" emptyLabel="To"/>
      
          </MuiPickersUtilsProvider>
          
          <Button onClick={this.handleDataClick}>Visualize</Button>
          <HistoryGraph channel="1" data={this.state.data_ch1} events={this.state.events_ch1}/>
          <HistoryGraph channel="2" data={this.state.data_ch2} events={this.state.events_ch2}/>
          <HistoryGraph channel="3" data={this.state.data_ch3} events={this.state.events_ch3}/>
        </div>
      )
    
    }
      
  }