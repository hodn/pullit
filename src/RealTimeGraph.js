const { ipcRenderer } = window.require('electron');
import React from 'react';
import SmoothieComponent, { TimeSeries } from 'react-smoothie';

export class RealTimeGraph extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      events: new TimeSeries({}),
      value: 0
    }

  }

  componentDidMount() {
    //Listener on parsed data from Electron
    ipcRenderer.on('data-parsed', (event, arg) => {
      
      const time = arg[0][0]
      const measurement = arg[0][this.props.channel]
      const newEvents = this.state.events
      newEvents.append(time, measurement)

      const aggValue = arg[1][this.props.channel-1]

      this.setState({events: newEvents, value: aggValue})
      
    })

  }

  componentWillUnmount(){
    
}
  
//What the actual component renders
  render(){    
      return(
    
        <div>
          <h2>{this.props.name}</h2>
          <h1>{this.state.value} {this.props.unit}</h1>
          <SmoothieComponent
              responsive
              interpolation='linear'
              scaleSmoothing={0.424}
              millisPerPixel={16}
              grid={{fillStyle:'rgba(255,255,255,0.92)',strokeStyle:'rgba(0,0,0,0.16)',sharpLines:true,borderVisible:true}}
              labels={{fillStyle:'#000000',fontSize:13,precision:0}}
              streamDelay={100}
              series={[
                {
                  data: this.state.events,
                  lineWidth:3.9,
                  strokeStyle:'#000080'
                }
              ]}
      />
       
        </div>
      
      );
    
    
  }
    
}

