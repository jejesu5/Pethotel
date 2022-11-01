const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const initialSetup = require('./src/libs/initialSetup')
const routes = require('./src/routes')
require('dotenv').config()
const app = express()
const { proxy, scriptUrl } = require('rtsp-relay')(app)
initialSetup()

const handler = proxy({
  url: 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4',
  // if your RTSP stream need credentials, include them in the URL as above
  verbose: false
})

const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors('*'))
app.use(morgan('dev'))
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ limit: '25mb', extended: true }))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ limit: '25mb', extended: true }))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*') // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
  next()
})

require('./src/database/db')
app.use('/api', routes)
// the endpoint our RTSP uses
app.ws('/api/stream', handler)

// this is an example html page to view the stream
app.get('/watch', (req, res) =>
  res.send(`
  <canvas id='canvas'></canvas>

  <script src='${scriptUrl}'></script>
  <script>
    loadPlayer({
      url: 'ws://' + location.host + '/api/stream',
      canvas: document.getElementById('canvas')
    });
  </script>
`)
)

app.listen(PORT, () => {
  console.log('server listening on Port 3001')
})
