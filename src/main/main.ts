/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import express from 'express';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

// const expressApp = express();
// expressApp.get('/', (req, res) => res.send('Hello World!'));
// expressApp.listen(3000, () => console.log('Example app listening on port 3000!'));

let mainWindow: BrowserWindow | null = null;
let window2: BrowserWindow | null = null;

ipcMain.on('ipc-core', async (event, arg) => {
  const method = arg[0];
  switch (method) {
    case 'ipc-example': {
      const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
      console.log(msgTemplate(arg));
      event.reply('ipc-core', msgTemplate('pong'));
    }
    case 'titlebar-control': {
      const control = arg[1];
      switch (control) {
        case 'chang-window-size': {
          // mainWindow.webContents.loadURL();
          mainWindow.webContents.on('dom-ready', (event) => {
            mainWindow.setSize(1280, 800);
            mainWindow.center();
            mainWindow.show();
            mainWindow.setResizable(true);
          });
          setTimeout(() => {
            mainWindow!.setOpacity(1);
            mainWindow!.show();
            mainWindow!.focus();
          }, 4000);

          break;
        }
        case 'chang-login-size': {
          mainWindow!.setOpacity(0);
          mainWindow!.setSize(368, 324);
          mainWindow!.center();
          mainWindow!.setResizable(false);
          setTimeout(() => {
            mainWindow!.setOpacity(1);
            mainWindow!.show();
            mainWindow!.focus();
          }, 2000);
          break;
        }
        case 'minimize': {
          mainWindow!.minimize();
          event.returnValue = true;
          break;
        }
        case 'maximize': {
          mainWindow!.isMaximized()
            ? mainWindow!.unmaximize()
            : mainWindow!.maximize();
          event.returnValue = true;
          break;
        }
        case 'close': {
          mainWindow!.close();
          event.returnValue = true;
          break;
        }
        case 'isMaximized': {
          event.returnValue = mainWindow!.isMaximized();
          break;
        }
      }
      break;
    }
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('IconDark.png'),
    webPreferences: {
      preload: app.isPackaged
      ? path.join(__dirname, 'preload.js')
      : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  window2 = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('IconLight.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('window1/index.html','window1.html'));
  window2.loadURL(resolveHtmlPath('window2/index.html','window2.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });
  window2.on('ready-to-show', () => {
    if (!window2) {
      throw new Error('"window2" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      window2.minimize();
    } else {
      window2.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  window2.on('closed', () => {
    window2 = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
  // const menuBuilder2 = new MenuBuilder(window2);
  // menuBuilder2.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
