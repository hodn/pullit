import React, { Component } from 'react';
import '../node_modules/react-vis/dist/style.css';
import { RealTimeView } from './RealTimeView.js';

  class App extends Component {
  
  render() {
    
    return (
      <div>
      <RealTimeView/>
      </div>
    );
  }
}


export default App;
