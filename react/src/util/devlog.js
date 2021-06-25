const devlog = (msg) => {
  const mainWindow = window.require('@electron/remote').getGlobal('app');

  if (mainWindow.appConfig.general.main.dev ||
      mainWindow.argv.indexOf('devmode') > -1) {
    console.warn(msg);
  }
}

export default devlog;