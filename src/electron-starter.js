// Module for file paths
const path = require('path');
// JSON to CSV lib
const { Parser } = require('json2csv');
// file systemy
const fs = require('fs');
// Module to include electron
const electron = require('electron');
// Module for hot reload 
//require('electron-reload')(__dirname, { electron: require('${__dirname}/../../node_modules/electron') })
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
// Peak detection lib
const smoothed_z_score = require("./zscore.js");

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
    //mainWindow.webContents.openDevTools();
    
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
    console.log(error);
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

ipcMain.on('settings-info', (event, arg) => {
    event.sender.send('settings-loaded', {dir: defaultDir, com: defaultCOM})
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
            csv({delimiter: ";"})
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
        
        electron.dialog.showErrorBox("No file selected",  "Please, load the CSV record file.")
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
            const ch1Buffer = [] // Torque
            const ch2Buffer = [] // Force
            const ch3Buffer = [] // Revolutions
            const ch4Buffer = [] // Step checker
            
            // Variables for RPM calculations
            let rpm = 0
            const rpmBuffer = []

            // Taring constants 
            let tareTorque = 0;
            let tareForce = 0;
            let rawTorque = 0;
            let rawForce = 0;
            
            // Taring the variable chosen by user
            ipcMain.on('tare', (event, arg) => {
                
                switch(arg) {
                    
                    case 1:
                        tareTorque += rawTorque;
                        toolChanged = "T"
                    break;
                    
                    case 2:
                        tareForce += rawForce;
                        toolChanged = "T"
                    break;
                    default:
                    return
                }})
            
            // Buffer size - hardware refresh rate 25Hz 
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
                lenght_1 = arg.data.l1
                lenght_2 = arg.data.l2
                lenght_3 = arg.data.l3
                lenght_4 = arg.data.l4
                totalLenght = arg.data.total
                crown = arg.data.c
                toolChanged = arg.change
            })

            // Switches the port into "flowing mode"
            parser.on('data', function(data) {
                    
                    // Raw packets are parsed into array after decoding from EZ24 format
                    const channelData = arrayParserEZ24(Uint8Array.from(data))

                    // Feeding buffer with parsed data
                    ch1Buffer.push(channelData[0])
                    ch2Buffer.push(channelData[1])
                    ch3Buffer.push(Math.abs(channelData[2]))
                    ch4Buffer.push(channelData[3])

                    // 10 values for peak detection -> every 400ms
                    if(ch3Buffer.length >= 10){
                        const signals = smoothed_z_score(ch3Buffer, {lag: 3, threshold: 5.2})  
                        
                        // Push detected rotation to buffer - timestamp
                        if (rotationDetector(signals)) {
                            rpmBuffer.push(Date.now())
                            console.log(Date.now() + " Rotation");
                        }                                                  
                        //Empty buffer
                        ch3Buffer.splice(0, 10)
                    }

                    // RPM reset after 15 sec inactivity
                    if(Date.now() - rpmBuffer[rpmBuffer.length-1] > 15000){
                        rpm = 0
                        rpmBuffer.splice(0, rpmBuffer.length)
                    }

                    // Calculation of RPM from timespan between 7 rotations
                    if (rpmBuffer.length >= 7){

                        const elapsedTime = rpmBuffer[rpmBuffer.length-1] - rpmBuffer[0]
                        const rpmRaw = ((60000 / elapsedTime) * 7)
                        rpm = localeFormat(rpmRaw, 1) //Converted to locale (,)
                        
                        //Partly clearing buffer - avoiding false peak, faster refresh
                        rpmBuffer.splice(0, 3)
                        
                    }
                   
                    // Aggregation from the buffer and buffer release
                    if (ch4Buffer.length >= refreshRate) {
                        
                        // Aggregated data in uV
                        const ch1 = aggregator(ch1Buffer) 
                        const ch2 = aggregator(ch2Buffer) 
                        
                        // Conversion constants from uV to actual unit
                        const uVtoNm = 1.261312238 // Torque
                        const uVtoN = 90.3255523 // Force

                        rawTorque = ch1 - tareTorque
                        rawForce = ch2 - tareForce

                        const torque = localeFormat(rawTorque*uVtoNm, 2)
                        const force = localeFormat(rawForce*uVtoN, 2)
                        
                        // Aggregation data packet for Renderer
                        const aggSet = {
                            'time': Date.now(),
                            'ch1': rawTorque*uVtoNm, 
                            'ch2': rawForce*uVtoN, 
                            'ch3': rpm,
                        }
                        
                        ch1Buffer.splice(0, refreshRate)
                        ch2Buffer.splice(0, refreshRate)
                        ch4Buffer.splice(0, refreshRate)
                        
                        //Sending aggregation data to Renderer
                        event.sender.send('data-parsed', aggSet)
                        
                        //If recording is ON - append the data to CSV array
                        if(recordingON === true){
                            const csvSet = {
                                'Time': new Date(),
                                'Nm': torque, 
                                'N': force, 
                                'RPM': rpm,
                                'l1': lenght_1, 
                                'l2': lenght_2, 
                                'l3': lenght_3,
                                'l4': lenght_4,
                                'total': localeFormat(totalLenght, 1),
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
    let convertedValue = ((number/unit) - 3) * 1000000 // Converted to voltage (uV)
    
    return convertedValue
}
// Detects a rotation - returns 1 or 0
function rotationDetector(signals){
    let peakCount = 0
                        
    signals.forEach(s => {
        
        if(s !== 0){
            peakCount++
        }
    });
    
    if(peakCount > 3) {
        return true
    }else{
        return false
    }

}
// Calculation of average from buffer
function aggregator(bufferArray){
    let total = 0;
    for(var i = 0; i < bufferArray.length; i++) {
    total += bufferArray[i];
}
    let avg = total / bufferArray.length;
    return avg

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
              data_ch1.push({x: timestamp, y: converterToPointDecimals(file[key].Nm)})
              data_ch2.push({x: timestamp, y: converterToPointDecimals(file[key].N)})
              data_ch3.push({x: timestamp, y: converterToPointDecimals(file[key].RPM)})

              if(file[key].change === "1"){
                events_ch1.push({x: timestamp, y: converterToPointDecimals(file[key].Nm)})
                events_ch2.push({x: timestamp, y: converterToPointDecimals(file[key].N)})
                events_ch3.push({x: timestamp, y: converterToPointDecimals(file[key].RPM)})
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
    const delimiter = ";"
        const json2csvParser = new Parser({ fields, delimiter })
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

function localeFormat(number, decimals){
    const locale = parseFloat(number.toFixed(decimals)).toLocaleString()
    const noSpaceLocale = locale.replace(/\s+/, "") 
    
    return noSpaceLocale
}

function converterToPointDecimals(numberString){
    const converted = numberString.replace(",", ".");
    
    return parseFloat(converted)
}