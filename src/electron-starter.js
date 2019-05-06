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
const port = new SerialPort('com6', {
  baudRate: 115200
})
const ipcMain = electron.ipcMain;

//Listener on React component mounting
ipcMain.on('graph-mounted', (event, arg) => {
    const parser = port.pipe(new Delimiter({ delimiter: [0x00] }))
  // Switches the port into "flowing mode"
        parser.on('data', function(data) {
            
            let parsedData = arrayParserEZ24(Uint8Array.from(data))
            console.log("MAMA")
            console.log(parsedData)
            switch(arg) {
                case "channel_1":
                    event.sender.send('ch1-parsed', [Date.now(), parsedData[0]])
                  break;
                case "channel_2":
                    event.sender.send('data-parsed', [Date.now(), parsedData[1]])
                  break;
                case "channel_3":
                    event.sender.send('data-parsed', [Date.now(), parsedData[2]])
                default:
                    event.sender.send('data-parsed', [Date.now(), parsedData[3]])
              }  
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
    
    return [channel_1, channel_2, channel_3, orderCheck]
}
