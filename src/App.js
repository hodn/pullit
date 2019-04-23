import React, { Component } from 'react';
import './App.css';
import '../node_modules/react-vis/dist/style.css';
import {XYPlot, LineSeries, XAxis, YAxis} from 'react-vis';

//Tunnel to Electron
const { ipcRenderer } = window.require('electron');



//Real time graph component
class RTLineGraph extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      data: [{x: 0, y:0},],
      xMin: 0,
      name: this.props.name
    }

  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.refreshData(),
    500
    );

    ipcRenderer.on('refreshData-sent', (event, arg) => {
      const currentData = this.state.data;
      currentData.push(arg);
      console.log(currentData[currentData.length-1]);
  
      this.setState({
        data: currentData
      });
      
    });
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  refreshData() {
    ipcRenderer.send('refreshData');
  }

  
  render(){
    return(
    
      <div>
        <p>{this.state.name}</p>
        <XYPlot height={300} width={800} xType="time" >
          
          <XAxis/>
          <YAxis/>
          <LineSeries data={this.state.data} animation />

        </XYPlot>
      </div>
    
    );

    }
  }

class App extends Component {
  
  render() {
    
    return (
      <div className="App">
      <RTLineGraph name="Real Time Data"/>
      </div>
    );
  }
}


export default App;
