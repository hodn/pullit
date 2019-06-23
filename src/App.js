import React, { Component } from 'react';
import '../node_modules/react-vis/dist/style.css';
import { RealTimeView } from './RealTimeView.js';
import { HistoryView } from './HistoryView';


  class App extends Component {
  
  render() {
    
    return (
      <div>
          <RealTimeView/>
          <HistoryView/>
      </div>
    );
  }
}


export default App;
