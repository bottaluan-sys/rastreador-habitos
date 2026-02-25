const { app, BrowserWindow } = require('electron')
const path = require('path')
const http = require('http')
const fs = require('fs')
const url = require('url')

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
}

function createStaticServer(distPath) {
  return http.createServer((req, res) => {
    let pathname = url.parse(req.url).pathname
    if (pathname === '/' || pathname === '') pathname = '/index.html'
    const filePath = path.join(distPath, pathname)
    const ext = path.extname(filePath)
    const mime = MIME_TYPES[ext] || 'application/octet-stream'

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404)
        res.end()
        return
      }
      res.writeHead(200, { 'Content-Type': mime })
      res.end(data)
    })
  })
}

function createWindow() {
  const iconPath = path.join(__dirname, 'build', 'icon.png')
  const mainWindow = new BrowserWindow({
    width: 420,
    height: 800,
    minWidth: 360,
    minHeight: 600,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    const distPath = app.isPackaged
      ? path.join(process.resourcesPath, 'dist')
      : path.join(__dirname, 'dist')

    const server = createStaticServer(distPath)
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port
      mainWindow.loadURL(`http://127.0.0.1:${port}/`)
      mainWindow.on('closed', () => server.close())
    })
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
