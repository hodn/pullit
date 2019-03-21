import React, { Component } from 'react';
import logo, { ReactComponent } from './logo.svg';
import './App.css';
import ReactChartkick, { LineChart, PieChart } from 'react-chartkick'
import Chart from 'chart.js'

ReactChartkick.addAdapter(Chart)

class GraphRenderer extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      data:{},
      refreshCount:0,
      max:100,
      min:0,
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
    const refCnt = this.state.refreshCount + 1;
    currentData[Object.keys(currentData).length + 1] = getRandomArbitrary(0,10);

    if(refCnt>50){
      this.setState({
        max: refCnt,
        min: refCnt-50,
      });
    }
    
    this.setState({
      data:currentData, 
      refreshCount: refCnt
    });
  }

  render(){
    return(
    
      <div>
      <p>Ready for graph making!</p>
      <LineChart data={this.state.data} curve={false} xmin={this.state.min} xmax={this.state.max}/>
    </div>
    
    );

    }
  }



class App extends Component {
  
  render() {
    
    return (
      <div className="App">
      <GraphRenderer/>
      </div>
    );
  }
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;}

export default App;
