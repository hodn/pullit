import React from 'react';
import {XAxis, YAxis, LineSeries, FlexibleWidthXYPlot, MarkSeries} from 'react-vis';
import Typography from '@material-ui/core/Typography';

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
    
        <div id="graph">
          <Typography> {this.props.name} </Typography>
          <FlexibleWidthXYPlot height={200} xType="time" margin={{left: 70}}>
          <LineSeries data={this.props.data} animation/>
          <MarkSeries data={this.props.eventData} animation/>
          <XAxis/>
          <YAxis/>
        
          </FlexibleWidthXYPlot>
          
       
        </div>
      
      );
    
    
  }
    
}

