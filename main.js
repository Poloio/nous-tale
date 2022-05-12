const { app, ipcMain, BrowserWindow } = require("electron");

let appWin;

createWindow = () => {
  appWin = new BrowserWindow({
    width: 1920,
    height: 1080,
    title: "Nous Tale",
    resizable: false,
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
})

ipcMain.on("message", (event) => event.reply("reply", "pong"));
