const { Parser } = require('json2csv');
const fs = require('fs');
// Module to include electron
const electron = require('electron');
// Module for file paths
require('path');
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
    mainWindow = new BrowserWindow({width: 800, height: 600});

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

let recordingON = false

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
    electron.dialog.showErrorBox(error.message, "App has encountered an error - " + error.message)
  })
process.on('uncaughtException', error => {
    electron.dialog.showErrorBox(error.message, "App has encountered an error - " + error.message)
    mainWindow.close()
  })

//////////////////////////////////////// Parsing data from COM port ////////////////////////////////////////

const Delimiter = require('@serialport/parser-delimiter')
// Module for IPC with Renderer
const ipcMain = electron.ipcMain

// Establishing connection with COM PORT
const SerialPort = require('serialport')

// List available ports on event from Renderer
ipcMain.on('list-ports', (event, arg) => {
    SerialPort.list().then(
    ports => ports.forEach(function(port) {
    event.sender.send('ports-listed', port.comName)
  }),
    err => console.error(err),
)
})
   
// Data to be saved into the CSV
let csvRecord = []
let csvFields = []

// Change the state of recording boolean. If switched from true to false, save the data to CSV and clear the array
ipcMain.on('recording', (event, arg) => {
  recordingON = arg
  if (arg === false){
      saveRecord(csvRecord)
      csvRecord = []
  }
  })

// Get the history data from CSV file on event from Renderer
ipcMain.on('get-history', (event, arg) => {

    const csvFilePath='record.csv'
    const csv = require('csvtojson')
    csv()
    .fromFile(csvFilePath)
    .then((jsonObj)=>{
     //event.sender.send('history-loaded', jsonObj)
     console.log(jsonObj[0].Time + jsonObj[jsonObj.length-1].Time)
    })
     
    })
    
// On clear to send - start parsing data
ipcMain.on('clear-to-send', (event, arg) => {

    // Port init (user selection in arg) and settings
    let port = new SerialPort(arg, {
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
                        'Time': new Date(), 
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
                    csvFields = Object.keys(csvSet)
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
// Saving the record
function saveRecord(record){
    const fields = csvFields
        const json2csvParser = new Parser({ fields })
        const csvOut = json2csvParser.parse(record)
    
        fs.writeFile("record.csv", csvOut, function (err) {
        if (err) throw err;
});
}