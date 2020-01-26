// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require("electron");
const path = require("path");
const storage = require("electron-json-storage");
const iconPath = path.join(__dirname, './volume.png');
let min = 0,
  max = 100;
isSet = false;

const audio = require("win-audio").speaker;
// console.log("fenil");
  audio.polling(50);
  audio.events.on("change", volume => {
    if (isSet) {

    // console.log("old %d%% -> new %d%%", volume.old, volume.new, max);
    // max
    // if (volume.old <= volume.new) {
    // if ( audio.get() > 95){
    if (volume.new > max) {
      audio.set(max);

      setTimeout(() => {
        audio.set(max);
      }, 0);
      // console.log("setting to ", max);
    }
    // }
    // min
    if (volume.old >= volume.new) {
      if (volume.new < min) {
        audio.set(min);
      }
    }}
    mainWindow.webContents.send("current-volume", volume.new);
  });
audio.events.on("toggle", status => {
  // console.log("muted: %s -> %s", status.old, status.new);
});

//values of slider from html
ipcMain.on("values", function(e, item) {
  isSet=true
  // console.log("form main js", item);
  min = item[0];
  if (audio.get() < min) {
    audio.set(min);
  }
  //saving data to local storage
  storage.set("min", { value: min }, function(error) {
    if (error) throw error;
  });
  max = item[1];
  if (audio.get() > max) {
    audio.set(max);
  }
  storage.set("max", { value: max }, function(error) {
    if (error) throw error;
  });
});
// clear set volume limit
ipcMain.on("clear", function(e, item) {
  // console.log("clear")
  isSet=false
  mainWindow.webContents.send("start-values", [
    0,
    100
  ]);
  storage.clear()
});
// close button clicked
ipcMain.on("close", function(e, item) {
  mainWindow.hide();
});

ipcMain.on("retrieve-initial-info", function(e, item) {
    // console.log("!")
    //retrieving data form local storage

    storage.get("max", function(error, dataMax) {
      if (error) throw error;
      storage.get("min", function(error, dataMin) {
        if (error) throw error;
        if (dataMax.value && dataMin.value) {
          isSet=true
          // sending data to index.html
          mainWindow.webContents.send("start-values", [
            dataMin.value,
            dataMax.value
          ]);
          min = dataMin.value;
          max = dataMax.value;
          // console.log("sending data to indexHtml", min, max);
        }
      });
    });
  
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 500,
    height: 450,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
        devTools: false
      
    },
    frame: false,
    // transparent: true,
    resizable: false
    //  titleBarStyle: 'hidden' 
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  mainWindow.on("minimize", function(event) {
    event.preventDefault();
    mainWindow.hide();
  });
  mainWindow.on("close", function(event) {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    // mainWindow = null;
    event.preventDefault();
    mainWindow.hide();

  });
  // // Emitted when the window is closed.
  // mainWindow.on("closed", function(event) {
  //   // Dereference the window object, usually you would store windows
  //   // in an array if your app supports multi windows, this is the time
  //   // when you should delete the corresponding element.
  //   mainWindow = null;


  // });

  tray = new Tray(nativeImage.createFromPath(iconPath));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "exit",
      type: "normal",
      click: function() {
        if (process.platform !== "darwin") 
        mainWindow.removeAllListeners('close');
        app.quit();
        tray.destroy();
      }
    }
  ]);
  tray.on("double-click", function(e) {
    mainWindow.show();
  });
  tray.setToolTip("Audio Limiter");
  tray.setContextMenu(contextMenu);
}




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    console.log("all close")
    mainWindow.removeAllListeners('close');

    app.quit()
    tray.destroy();
  };
});

app.on("activate", function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
