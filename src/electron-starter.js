const electron = require('electron');
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
  

//////////////////////////////////////// Parsing data from COM port ////////////////////////////////////////

const path = require('path');
const url = require('url');
const Delimiter = require('@serialport/parser-delimiter');


//Establishing connection with COM PORT
const SerialPort = require('serialport')
SerialPort.list().then(
    ports => ports.forEach(console.log),
    err => console.error(err)
  )
const port = new SerialPort('com6', {
  baudRate: 115200
})
const ipcMain = electron.ipcMain

//Listener on React component mounting
ipcMain.on('clear-to-send', (event, arg) => {
    const parser = port.pipe(new Delimiter({ delimiter: [0x00] }))

    const ch1Buffer = []
    const ch2Buffer = []
    const ch3Buffer = []
    const ch4Buffer = []
    let aggSet = []
    let dataSet = []
    
    // Switches the port into "flowing mode"
        parser.on('data', function(data) {
            
            const channelData = arrayParserEZ24(Uint8Array.from(data))

            ch1Buffer.push(channelData[0])
            ch2Buffer.push(channelData[1])
            ch3Buffer.push(channelData[2])
            ch4Buffer.push(channelData[3])

            if (ch4Buffer.length > 10) {
                
                aggSet = [aggregator(ch1Buffer), aggregator(ch2Buffer), aggregator(ch3Buffer)]
                ch1Buffer.splice(0, 10)
                ch2Buffer.splice(0, 10)
                ch3Buffer.splice(0, 10)
                ch4Buffer.splice(0, 10)
            }
            
            dataSet = [Date.now(), channelData[0], channelData[1], channelData[2], channelData[3]]
            event.sender.send('data-parsed', [dataSet, aggSet])
            
  });
  })

 
function parserEZ24([a, b, c, d]){
    
    let x = a>>1 | ((d & 2) << 6)
    let y = b>>1 | ((d & 4) << 5)
    let z = c>>1 | ((d & 8) << 4)

    return (z << 16) | (y << 8) | x;
}

function arrayParserEZ24(dataArray){

    let channel_1 = parserEZ24(dataArray.slice(0,4));
    let channel_2 = parserEZ24(dataArray.slice(4,8));
    let channel_3 = parserEZ24(dataArray.slice(8,12));
    let orderCheck = dataArray[12];
  
    return [unitConverter(channel_1), unitConverter(channel_2), unitConverter(channel_3), orderCheck]
}

function unitConverter(number){

    const unit = 8388608/3000
    let result = (number/unit) - 3000
    
    return result
}

function aggregator(bufferArray){
    let total = 0;
    for(var i = 0; i < bufferArray.length; i++) {
    total += bufferArray[i];
}
    let avg = total / 10;
    return avg

}