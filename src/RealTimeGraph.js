const { ipcRenderer } = window.require('electron');
import React from 'react';
import {XAxis, YAxis, LineSeries, FlexibleWidthXYPlot} from 'react-vis';

export class RealTimeGraph extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      data: []
    }

  }

  componentDidMount() {
    // Listener on parsed data from Electron
    ipcRenderer.on('data-parsed', (event, arg) => {
      console.log(arg)
      const newData = {x: arg[0], y: arg[1][this.props.channel-1]}
      
      this.setState((state, props) => ({
        data: [...state.data, newData]
      }));
     
      
    })

  }

  componentWillUnmount(){
    
}
  
// What the actual component renders
  render(){    
      return(
    
        <div>
          <FlexibleWidthXYPlot height={300} xType="time" yDomain={[-1000,1500]}>
         
          <LineSeries data={this.state.data} animation />
          <XAxis/>
          <YAxis/>
    
          </FlexibleWidthXYPlot>
          
       
        </div>
      
      );
    
    
  }
    
}

