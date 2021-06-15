import { dialog } from 'electron';
const { autoUpdater } = require("electron-updater");

let updater;

autoUpdater.autoDownload = false;

autoUpdater.on('error',error => {
    dialog.showErrorBox('ERROR: ',error === null ? "unknown" : (error.stack || error).toString());
})

autoUpdater.on("update-available",() => {
    dialog.showMessageBox({
    type: 'info',
    title: '更新提示',
    message: '小助手有新版本啦~',
    buttons: ['立即更新', '以后提醒']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
      autoUpdater.downloadUpdate();
    }else {
      updater.enabled = true;
      updater = null;
    }
  })
})

autoUpdater.on('update-not-available', () => {
  dialog.showMessageBox({
    title: '提示',
    message: '当前没有可用的更新'
  })
  updater.enabled = true
  updater = null
})

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: '安装提示',
    message: '已下载更新,将退出应用应用程序进行更新'
  }, () => {
    setImmediate(() => autoUpdater.quitAndInstall())
  })
})

function checkForUpdates (menuItem, focusedWindow, event) {
  updater = menuItem;
  updater.enabled = false;
  autoUpdater.checkForUpdates()
}

module.exports.checkForUpdates = checkForUpdates;