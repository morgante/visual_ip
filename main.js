"use strict";

const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const ipcMain = require('electron').ipcMain;

var _ = require("lodash");
var Firebase = require("firebase");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

var dataMessage = [];
var lastEvent = null;
var lastCard;

const mySource = 2;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    // fullscreen: true
  });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  var serialport = require('serialport');
  var SerialPort = serialport.SerialPort;
  console.log("loading ports");
  serialport.list(function (err, ports) {
    ports.forEach(function(port) {
      console.log(port.comName);
      console.log(port.pnpId);
      console.log(port.manufacturer);
    });

    var port = new SerialPort(ports[3].comName, {
      baudrate: 115200,
      parser: serialport.parsers.readline('\n')
    });

    port.on('open', function () {
      console.log('opened serial port');
    });

    const clearCard = _.debounce(() => {
      console.log("clear card");
      lastCard = null;
    }, 5000);

    port.on('data', function (data) {
      if (data === lastCard) {
        return;
      } else {
        lastCard = data;
        clearCard();
      }
      const id = parseInt(data, 10);
      if (_.isNaN(id)) {
        console.log('data is not a card', data);
      } else {
        console.log('load the card', id);
        var dataRef = new Firebase(`https://vipneteverything.firebaseio.com/data/packets/${id}`);
        if (!lastEvent) {
          return;
        }
        dataRef.child("message").once("value", function(snapshot) {
          console.log('snapshot', snapshot.val());
          if (snapshot.val() !== null && snapshot.val().text) {
            console.log('some other data');
            lastEvent.sender.send('receive_data', snapshot.val());
            dataRef.set(null);
          } else {
            if (dataMessage.length < 1) {
              if (lastEvent) {
                lastEvent.sender.send('alert', 'Please type a message before attempting to send it!');
              }
              return;
            } else {
              dataRef.set({
                message: {
                  source: mySource,
                  text: dataMessage
                }
              });
              lastEvent.sender.send('sent_input', 'Sent');
            }
          }
        });
      }
    });

    ipcMain.on('set_input', function(event, arg) {
      dataMessage = arg;
      lastEvent = event;
    });
  });
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
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.