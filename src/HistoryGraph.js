import React from 'react';
import {XYPlot, XAxis, YAxis, LineSeries, HorizontalGridLines, VerticalGridLines ,MarkSeries} from 'react-vis';

export class HistoryGraph extends React.Component{
    constructor(props){
      super(props);
      this.state = {
      }
      
    }
  
    componentDidMount() {
     
      
    }
  
    componentWillUnmount(){
      
  }
  
    
  //What the actual component renders
    render(){    
        return(
      <div>
          <h1>Channel {this.props.channel} history</h1>
        
          <XYPlot height={300} width={800} xType="time" yDomain={[-2,2]}>
            <HorizontalGridLines />
            <VerticalGridLines/>
            <XAxis />
            <YAxis />
            <LineSeries data={this.props.data} animation />
            <MarkSeries data={this.props.events} animation/>
          </XYPlot>
  
      </div>
        );
      
      
    }
      
  }