const { app, ipcMain, BrowserWindow } = require("electron");

let appWin;

createWindow = () => {
  appWin = new BrowserWindow({
    width: 1366,
    height: 768,
    title: "Nous Tale",
    resizable: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  appWin.loadFile('dist/index.html');
  appWin.setMenu(null);
  appWin.webContents.openDevTools();

  appWin.on("closed", () => {
    appWin = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {// If platform isn't MacOS
    app.quit();
  }
});

ipcMain.on('errorWindow', (event, data) => {
  console.error(data);
});
