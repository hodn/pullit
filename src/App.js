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
      data:{}
    }
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.refresh(),
      200
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  refresh() {
    const currentData = this.state.data;
    currentData[Object.keys(currentData).length + 1] = getRandomArbitrary(0,10);
    
    this.setState({
      data:currentData 
    });
  }

  render(){
    return(
    
      <div>
      <p>Ready for graph making!</p>
      <LineChart data={this.state.data} curve={false} pointRadius={0}/>
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
