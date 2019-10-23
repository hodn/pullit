import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CardActions from '@material-ui/core/CardActions';
import React from 'react';


import { Folder, SettingsInputHdmi} from '@material-ui/icons';
const { ipcRenderer } = window.require('electron');

export class SettingsView extends React.Component{
    constructor(props){
      super(props);
      
      this._isMounted = false
      
      this.state = {
        portList: [],
        selectedPort:"",
        dir:"",
        com:""
      }
      this.handleChange = this.handleChange.bind(this);
      this.handleClick = this.handleClick.bind(this);
    }
  
    componentDidMount() {
      this._isMounted = true
      ipcRenderer.send("list-ports")
      ipcRenderer.on('ports-listed', (event, arg) => {

      this._isMounted && this.setState((state, props) => ({
        portList: [...state.portList, arg]
      }))
      
     })

     ipcRenderer.send("settings-info")

      ipcRenderer.on('dir-changed', (event, arg) => {

        this._isMounted && this.setState((state, props) => ({
          dir: arg
        }))
      })

      ipcRenderer.on('settings-loaded', (event, arg) => {

        this._isMounted && this.setState((state, props) => ({
          dir: arg.dir,
          com: arg.com
        }))
        
       })

     
    }
  
    componentWillUnmount(){
    this._isMounted = false;
  }
  
  handleChange(event) {
    this.setState({ selectedPort: event.target.value})
    ipcRenderer.send('change-com', event.target.value)
    ipcRenderer.send("settings-info")
    ipcRenderer.send('clear-to-send') 
  }

  handleClick() {
    
    ipcRenderer.send('change-dir')
  }
  //What the actual component renders
    render(){    
  
      return(
        <div>
        <Card>
                <CardContent>
                    <Typography variant="h5" component="h4">
                      COM PORT
                    </Typography>
                    <Typography color="textSecondary">
                      Current: {this.state.com}
                    </Typography>
  
                </CardContent>
                <CardActions>
                  <SettingsInputHdmi/>
                    <FormControl id="select" variant="outlined" >
                      <InputLabel>PORT   </InputLabel>
                            <Select onChange={this.handleChange} value={this.state.selectedPort} autoWidth> 
                                {this.state.portList.map((item, index) => (
                                  <MenuItem key={index} value={item}>{item}</MenuItem>
                                ))}
                            </Select>
                    </FormControl>
                </CardActions>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h5" component="h4">
                      CSV RECORD DIRECTORY
                    </Typography>
                    <Typography color="textSecondary">
                      Current: {this.state.dir}
                    </Typography>
          
                </CardContent>
                <CardActions>
                  <Button variant="outlined" color="primary" onClick={this.handleClick}><Folder/> Select directory</Button>
                </CardActions>
            </Card>
          
          
            <Typography variant="body1" color="textSecondary">
              *the settings are stored and reloaded on next app start
            </Typography>
            
        </div>
      )
    
    }
      
  }