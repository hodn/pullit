const { Parser } = require('json2csv');
const fs = require('fs');
// Module to include electron
const electron = require('electron');
// Module for file paths
const path = require('path');
// Module for hot reload 
require('electron-reload')(__dirname, { electron: require('${__dirname}/../../node_modules/electron') })
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow();
    mainWindow.maximize();
    // and load the index.html of the app.
    //mainWindow.loadURL(`file://${path.join(__dirname, '../build/index.html')}`);
    mainWindow.loadURL('http://localhost:3000');
    
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        
        // If the windows is closed while recording, save the CSV record and clear the array
        if(recordingON === true){
            saveRecord(csvRecord)
            csvRecord = []
        }
        app.quit()
        
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    electron.dialog.showErrorBox(error.message, error.message + ". Please, check if the settings are correct.")
  })
process.on('uncaughtException', error => {
    electron.dialog.showErrorBox(error.message, "App has encountered an error - " + error.message)
  })

//////////////////////////////////////// Parsing data from COM port ////////////////////////////////////////

// Delimiter init for data packets
const Delimiter = require('@serialport/parser-delimiter')
// Module for IPC with Renderer
const ipcMain = electron.ipcMain
// SerialPort init
const SerialPort = require('serialport')

// State of recording
let recordingON = false

// Data to be saved into the CSV
let csvRecord = []
// Path to read CSV file
let csvFilePath = "" 
// Data parsed from CSV file
let csvHistory = null

// Default settings - CSV saving directory and COM PORT
let defaultDir = ""
let defaultCOM = ""

// Loads user settings file if exists or creates new one with default values
if (fs.existsSync("user-settings.txt")){
    
    fs.readFile("user-settings.txt", {encoding: 'utf-8'}, function(err,data){
        if (!err) {
            const set = data.split(",")
            defaultDir = set[1]
            defaultCOM = set[0]
            saveSettings(defaultCOM, defaultDir)
        } else {
            electron.dialog.showErrorBox(err.message, "App has encountered an error - " + err.message)
        }
    })
    
}
else {
    defaultDir = app.getPath('documents')
    defaultCOM = "COM6"
    saveSettings(defaultCOM, defaultDir)
}

ipcMain.on('change-dir', (event, arg) => {
    
    electron.dialog.showOpenDialog({
        properties: ["openDirectory"],
    }, function (files) {
        if (files !== undefined) {
            defaultDir = files.toString()
            saveSettings(defaultCOM, defaultDir)
        }

    })

})

ipcMain.on('change-com', (event, arg) => {

    defaultCOM = arg
    saveSettings(defaultCOM, defaultDir)
})

// List available ports on event from Renderer
ipcMain.on('list-ports', (event, arg) => {
    SerialPort.list().then(
    ports => ports.forEach(function(port) {
    event.sender.send('ports-listed', port.comName)
  }),
    err => console.error(err),
)
})

// Change the state of recording boolean. If switched from true to false, save the data to CSV and clear the array
ipcMain.on('recording', (event, arg) => {
  recordingON = arg
  if (arg === false){
      saveRecord(csvRecord)
      csvRecord = []
  }
  })

// Get the history data from CSV file on event from Renderer
ipcMain.on('load-csv', (event, arg) => {
    
    const csv = require('csvtojson')
    
    electron.dialog.showOpenDialog({
        properties: ['openFile'],
        filters:[
            { name: 'CSV logs', extensions: ['csv'] }],
    }, function (files) {
        if (files !== undefined) {
            csvFilePath = files.toString()
            csv()
            .fromFile(csvFilePath)
            .then((jsonObj)=>{
            csvHistory = jsonObj
            const timeRange = {
                'start': jsonObj[0].Time,
                'end': jsonObj[jsonObj.length-1].Time 
        }
        event.sender.send('csv-loaded', timeRange)
    })
        }
    })  
     
})

// CSV file check and loading file details    
ipcMain.on('get-csv-data', (event, arg) => {
    
    if(arg.start === null && arg.end === null){
        
        electron.dialog.showErrorBox("No file selected",  "Please, load the CSV log file.")
    }
    else if(arg.start > arg.end) {
        
        electron.dialog.showErrorBox("Incorrect time window",  "Please, check the time selection.")
    }
    else{
        const packet = filterCSV(csvHistory, arg.start, arg.end)
        event.sender.send("csv-filtered", packet)
    }
})
    
// On clear to send - start parsing data
ipcMain.on('clear-to-send', (event, arg) => {

    // Port init from user settings
    let port = new SerialPort(defaultCOM, {
        baudRate: 115200
      })
   
    // Pipe init and delimiter settings  
    const parser = port.pipe(new Delimiter({ delimiter: [0x00] }))
    
    // Init of buffers
    const ch1Buffer = []
    const ch2Buffer = []
    const ch3Buffer = []
    const ch4Buffer = []
    
    // Buffer size
    const refreshRate = 25
    
    // Init drill tools
    let lenght_1 = 0
    let lenght_2 = 0
    let lenght_3 = 0
    let lenght_4 = 0
    let totalLenght = 0
    let crown = 0
    let toolChanged = 0

    ipcMain.on('tools-updated', (event, arg) => {
        lenght_1 = arg.l1
        lenght_2 = arg.l2
        lenght_3 = arg.l3
        lenght_4 = arg.l4
        totalLenght = arg.total
        crown = arg.c
        toolChanged = 1
    })

    // Switches the port into "flowing mode"
    parser.on('data', function(data) {
            
            // Raw packets are parsed into array after decoding from EZ24 format
            const channelData = arrayParserEZ24(Uint8Array.from(data))

            // Feeding buffer with parsed data
            ch1Buffer.push(channelData[0])
            ch2Buffer.push(channelData[1])
            ch3Buffer.push(channelData[2])
            ch4Buffer.push(channelData[3])

            // Aggregation from the buffer and buffer release
            if (ch4Buffer.length > refreshRate) {
                const ch1 = aggregator(ch1Buffer)
                const ch2 = aggregator(ch2Buffer)
                const ch3 = aggregator(ch3Buffer)
                
                // Aggregation data packet for Renderer
                const aggSet = {
                    'time': Date.now(),
                    'ch1': ch1, 
                    'ch2': ch2, 
                    'ch3': ch3,
                }

                ch1Buffer.splice(0, refreshRate)
                ch2Buffer.splice(0, refreshRate)
                ch3Buffer.splice(0, refreshRate)
                ch4Buffer.splice(0, refreshRate)
                
                //Sending aggregation data to Renderer
                event.sender.send('data-parsed', aggSet)
                
                //If recording is ON - append the data to CSV array
                if(recordingON === true){
                    const csvSet = {
                        'Time': new Date().toUTCString(), 
                        'ch1': ch1, 
                        'ch2': ch2, 
                        'ch3': ch3,
                        'l1': lenght_1, 
                        'l2': lenght_2, 
                        'l3': lenght_3,
                        'l4': lenght_4,
                        'total': totalLenght,
                        'c': crown,
                        'change': toolChanged
                    }
                    
                    csvRecord.push(csvSet)
                    toolChanged = 0
                }
        }
      
  });

  })

// Parsing 4 bytes from each EZ24 packet and converting to actual value
function parserEZ24([a, b, c, d]){
    
    let x = a>>1 | ((d & 2) << 6)
    let y = b>>1 | ((d & 4) << 5)
    let z = c>>1 | ((d & 8) << 4)

    return (z << 16) | (y << 8) | x;
}
// Dividing the original packet into EZ24 packets and converting AD to units
function arrayParserEZ24(dataArray){

    let channel_1 = parserEZ24(dataArray.slice(0,4));
    let channel_2 = parserEZ24(dataArray.slice(4,8));
    let channel_3 = parserEZ24(dataArray.slice(8,12));
    let orderCheck = dataArray[12];
  
    return [unitConverter(channel_1), unitConverter(channel_2), unitConverter(channel_3), orderCheck]
}
// Converting function for AD 
function unitConverter(number){

    const unit = 8388608 / 3 // AD value divided by V range (-3 to 3V)
    let result = (number/unit) - 3
    
    return result
}
// Calculation of average from buffer
function aggregator(bufferArray){
    let total = 0;
    for(var i = 0; i < bufferArray.length; i++) {
    total += bufferArray[i];
}
    let avg = total / bufferArray.length;
    return parseFloat(avg.toFixed(2))

}

// Filtering the CSV data according to time range
function filterCSV(file, start, end){
    const data_ch1 = []
    const data_ch2 = []
    const data_ch3 = []
    const events_ch1 = []
    const events_ch2 = []
    const events_ch3 = []
    
    for (var key in file) {
        if (file.hasOwnProperty(key)) {
          const timestamp = Date.parse(file[key].Time)
          if(timestamp >= start && timestamp <= end){
              data_ch1.push({x: timestamp, y: file[key].ch1})
              data_ch2.push({x: timestamp, y: file[key].ch2})
              data_ch3.push({x: timestamp, y: file[key].ch3})

              if(file[key].change === "1"){
                events_ch1.push({x: timestamp, y: file[key].ch1})
                events_ch2.push({x: timestamp, y: file[key].ch2})
                events_ch3.push({x: timestamp, y: file[key].ch3})
              }
          }
        }
    
    }
   return {ch1: data_ch1, ch2: data_ch2, ch3: data_ch3, e1: events_ch1, e2: events_ch2, e3: events_ch3}
}

// Saving the record
function saveRecord(record){
    
    const fileDate = new Date().toISOString()
    const filename = fileDate.split("T")[0] + "_" + new Date().getHours() + new Date().getMinutes() + new Date().getSeconds()
    let savePath = path.join(defaultDir, filename + ".csv")

    const fields = (Object.keys(record[0]))
        const json2csvParser = new Parser({ fields })
        const csvOut = json2csvParser.parse(record)
        
        fs.writeFile(savePath, csvOut, function (err) {
            
            if (err) throw err; 
        
        })
       

}

function saveSettings(com, dir){
    const settings = com.toString() + "," + dir.toString()
    fs.writeFile("user-settings.txt", settings, function (err) {
            
        if (err) throw err; 
    
    })
}