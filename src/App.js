import React, { Component } from 'react';
import './App.css';
import '../node_modules/react-vis/dist/style.css';
import {XYPlot, LineSeries, XAxis, YAxis, LineMarkSeries} from 'react-vis';

const originalData = [
  {x: 0, y: 8},
  {x: 1, y: 5},
  {x: 2, y: 4},
  {x: 3, y: 9},
  {x: 4, y: 1},
  {x: 5, y: 7},
  {x: 6, y: 6},
  {x: 7, y: 3},
  {x: 8, y: 2},
  {x: 9, y: 0}
];

class LineStream extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      data: this.props.data,
      ticks: 0,
      xMin: 0
    }
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.refresh(),
    500
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  refresh() {
    const currentData = this.state.data;
    currentData.push(addData(currentData[currentData.length - 1].x));
    const currentTicks = this.state.ticks;

    this.setState({
      data: currentData, 
      ticks: currentTicks + 1,
      xMin: currentTicks
    });

  }

  render(){
    return(
    
      <div>
        <p>Ready for graph making!</p>
        <XYPlot height={300} width={800} xDomain={[this.state.xMin, this.state.data.length]}>
          
          <XAxis/>
          <YAxis/>
          <LineSeries data={this.state.data} getNull={(d) => d.x !== this.state.xMin - 1} animation />

        </XYPlot>
      </div>
    
    );

    }
  }

class App extends Component {
  
  render() {
    
    return (
      <div className="App">
      <LineStream data = {originalData}/>
      </div>
    );
  }
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;}

function addData(order){
  
  var obj = {
    x: order + 1,
    y: getRandomArbitrary(0,10)
    
  };
 
  return obj;
}


export default App;
