import React from 'react';
import {FlexibleWidthXYPlot, XAxis, YAxis, LineSeries, HorizontalGridLines, VerticalGridLines ,MarkSeries} from 'react-vis';
import { Typography } from '@material-ui/core';

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
         <Typography variant="h5" component="h4">
            Channel {this.props.channel}
          </Typography>
        
          <FlexibleWidthXYPlot height={300} xType="time" yDomain={[-2,2]}>
            <HorizontalGridLines />
            <VerticalGridLines/>
            <XAxis />
            <YAxis/>
            <LineSeries data={this.props.data} animation />
            <MarkSeries data={this.props.events} animation/>
          </FlexibleWidthXYPlot>
  
      </div>
        );
      
      
    }
      
  }