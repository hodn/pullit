import React, { Component } from 'react';
import './App.css';
import '../node_modules/react-vis/dist/style.css';
import {XYPlot, LineSeries} from 'react-vis';

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
      data:originalData,
    }
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.refresh(),
      50
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  refresh() {
    const currentData = this.state.data;
    currentData.push(addData(currentData[currentData.length - 1].x));
    
    this.setState({
      data:currentData, 
      
    });

  }

  render(){
    return(
    
      <div>
      <p>Ready for graph making!</p>
      <XYPlot height={300} width={800}>
          <LineSeries data={this.state.data} />
        </XYPlot>
    </div>
    
    );

    }
  }

class App extends Component {
  
  render() {
    
    return (
      <div className="App">
      <LineStream/>
      </div>
    );
  }
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;}

function addData(order){
  
  var obj = {
    x: order + 1,
    y: getRandomArbitrary(0,100)
    
  };
 
  return obj;
}


export default App;
