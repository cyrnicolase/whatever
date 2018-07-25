"use strict"

const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
// Module to create tray icon
const Tray = electron.Tray 
// Module to create context meny for tray icon
const Menu = electron.Menu 

const shell = electron.shell
const path = require('path')
const url = require('url')
const nconf = require('nconf')
const autoLaunch = require('auto-launch');


//require('app-module-path').addPath(__dirname);
//const config = require('./config/config.json')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, settingsWindow, configWindow, splashScreen, tray, contextMenu

//config
/*nconf.argv()
    .env()
    .file({file: path.join(__dirname, 'config/config.json')});

module.exports = nconf;

var backgroundMode = nconf.get('backgroundMode')
var autoStart = nconf.get('autoStart')
var colorTheme = nconf.get('colorTheme')*/

//launch on startup
/*if (autoStart) {
    var appLauncher = new autoLaunch({
        name: 'Whatever',
        path: '/usr/bin/whatever'
    })
    
    appLauncher.isEnabled().then(function (enabled) {
        if (enabled) return;
        return appLauncher.enable()
    })
}*/

function createSplashScreen () {
    splashScreen = new BrowserWindow({width: 640,
                                      height: 480, 
                                      frame: false,
                                      show: false
    })
    splashScreen.loadURL(url.format({
    pathname: path.join(__dirname, 'splash/splash.html'),
    protocol: 'file:',
    slashes: true
    }))
    
    splashScreen.webContents.on('did-finish-load', () => {
        splashScreen.show()
    })
}

function createTray () {
    //create tray icon
    tray = new Tray(path.join(__dirname, 'tray/18x18.png'))
        
    //Create context menu
    contextMenu = Menu.buildFromTemplate([
        {label: "Open Whatever", click() { 
            if ( mainWindow == null ) { createWindow() }
        }},
        //{label: "New note", click() { newNote() }},
        {label: "Account settings", click() { openSettings() }},
        {label: "App settings", click() { openConfig() }},
        {label: "Quit", click() { app.quit() }},
        {type: "separator"},
        {label: "GitHub", click() {
            shell.openExternal('https://github.com/CellarD0-0r/whatever')
        }}
    ])

    tray.setContextMenu(contextMenu)
}

function createWindow () {
  
  createSplashScreen() 
  
  // Create the browser window and disable node.js (it is needed to work with pre-compiled js of external url)
  mainWindow = new BrowserWindow({width: 900, 
                                  height: 600, 
                                  webPreferences: {nodeIntegration: false}, 
                                  show: false
                                 })

  //load the url
  // mainWindow.loadURL('https://www.evernote.com/Home.action')
  mainWindow.loadURL('https://app.yinxiang.com/Home.action')
  
  //hide the default menu
  mainWindow.setMenu(null)
  
  //prevent window title changing
  mainWindow.on('page-title-updated', event => {
      event.preventDefault()
  })
  
  //when contents are loaded, show main window and close splash (if background mode not activated)
 // if ( !backgroundMode ) {
    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
        if(splashScreen) {
            splashScreen.close()
        }
    })
  //}

  // Emitted when the window is closed.
  mainWindow.on('close', function () {
        if (mainWindow !== null ) { mainWindow = null }
  })
  
  mainWindow.webContents.on('new-window', (event, url) => {
  // stop Electron from opening another BrowserWindow
  
  event.preventDefault()
  // open the url in the default system browser
  var urlDest = url.split('=')[1]
  shell.openExternal(decodeURIComponent(urlDest))
})}

function openSettings () {
    settingsWindow = new BrowserWindow({width: 700, 
                                  height: 550, 
                                  webPreferences: {nodeIntegration: false}})
    // settingsWindow.loadURL('https://www.evernote.com/Settings.action')
    settingsWindow.loadURL('https://app.yinxiang.com/Settings.action')
    
    settingsWindow.on('page-title-updated', event => {
        event.preventDefault()
    })
    
    settingsWindow.setMenu(null)
}

function openConfig () {
    configWindow = new BrowserWindow({width: 600,
                                      height: 400,
                                      title: "Settings"
    })
    
    configWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'config/config.html'),
    protocol: 'file:',
    slashes: true
    }))
    
    configWindow.setMenu(null)
}

function launchApp () {
    createTray()
    createWindow()
    //if (!backgroundMode) { createWindow }
    //if (backgroundMode) { backgroundMode = false }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//app.on('ready', createWindow)
app.on('ready', launchApp)
/*app.on('ready', () => {
    if ( !config.backgroundMode ) { createWindow }
})*/
//app.on('ready', createTray)

// Quit when all windows are closed.
/*app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})*/

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    launchApp()
  }
})
