import React, { Component } from 'react';
import '../node_modules/react-vis/dist/style.css';
import {RealTimeGraph} from './RealTimeGraph.js';
import {HistoryGraph} from './HistoryGraph.js';
import {PortMenu} from './PortMenu.js';
import {RecordButton} from './RecordButton.js';

  class App extends Component {
  
  render() {
    
    return (
      <div>
      <RecordButton/>
      <PortMenu/>
      <RealTimeGraph name="Channel 1" channel={1} unit="mV"/>
      <RealTimeGraph name="Channel 2" channel={2} unit="mV"/>
      <HistoryGraph name="Channel 1" channel={1}/>
      <HistoryGraph name="Channel 2" channel={2}/>
      </div>
    );
  }
}


export default App;
