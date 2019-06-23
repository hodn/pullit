import React from 'react';
import {XAxis, YAxis, LineSeries, FlexibleWidthXYPlot, MarkSeries} from 'react-vis';

export class RealTimeGraph extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      
    }

  }

  componentDidMount() {
  

  }

  componentWillUnmount(){
    
}
  
// What the actual component renders
  render(){    
      return(
    
        <div>
          <FlexibleWidthXYPlot height={200} xType="time" yDomain={[-2,2]}>
          <LineSeries data={this.props.data} animation />
          <MarkSeries data={this.props.eventData}/>
          <XAxis/>
          <YAxis/>
        
          </FlexibleWidthXYPlot>
          
       
        </div>
      
      );
    
    
  }
    
}

