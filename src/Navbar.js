import React, { Component } from 'react';
import '../node_modules/react-vis/dist/style.css';
import { RealTimeView } from './RealTimeView.js';
import { HistoryView } from './HistoryView';
import { SettingsView } from './SettingsView';
import {
  Route,
  Link,
  HashRouter
} from "react-router-dom";
import {Tab, Tabs, Paper} from '@material-ui/core';
import {ImportExport, History, Settings} from '@material-ui/icons'

  class Navbar extends Component {
    state = {
        value: 0
      };

    handleChange = (event, value) => {
        this.setState({ value });
      };
    
    
  render() {
    return (
        <HashRouter>
        <div>
          
          <Paper>
              <Tabs indicatorColor="secondary" centered value={this.state.value} onChange={this.handleChange}>
                <Tab label="Real time" icon={< ImportExport/>} component={Link} to="/" />
                <Tab label="History" icon={< History/>} component={Link} to="/history" />
                <Tab label="Settings" icon={< Settings/>} component={Link} to="/settings" />
              </Tabs>
          </Paper>

          <div className="content">
            <Route exact path="/" component={RealTimeView}/>
            <Route path="/history" component={HistoryView}/>
            <Route path="/settings" component={SettingsView}/>
          </div>
        
        </div>
      </HashRouter>
    );
  }
}


export default Navbar;
