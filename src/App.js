import React, { Component } from 'react';
import '../node_modules/react-vis/dist/style.css';
import { RealTimeView } from './RealTimeView.js';
import { HistoryGraph } from './HistoryGraph.js'

  class App extends Component {
  
  render() {
    
    return (
      <div>
      {<RealTimeView/>}
      <HistoryGraph channel="1"/>
      <HistoryGraph channel="2"/>
      </div>
    );
  }
}


export default App;
