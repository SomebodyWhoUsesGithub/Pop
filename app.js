const express = require('express')
const app = express()

const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io')
const io = new Server(server, { pingInterval: 2000, pingTimeout:5000 })

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const players = {

}

const speed = 5
io.on('connection', (socket) => {
  console.log('a user connected')
  players[socket.id] = {
    x: 1800 * Math.random(),
    y: 1000 * Math.random(),
    model: 10 * Math.random(),
    sequenceNumber: 0
  }
  io.emit('updatePlayers', players)
  console.log(players)

  socket.on('disconnect', (reason) => {
    console.log(reason)
    delete players[socket.id]
    io.emit('updatePlayers', players)
  })
  socket.on('death', () => {
    console.log('death')
    delete players[socket.id]
    io.emit('updatePlayers', players)
  })
  socket.on('keydown', ({keycode, sequenceNumber}) => {
    players[socket.id].sequenceNumber = sequenceNumber
    switch (keycode) {
      case 'keyW':
      console.log('a W connected')
        players[socket.id].y -= speed
        break;
      case 'keyA':
        players[socket.id].x -= speed
        break;
      case 'keyS':
        players[socket.id].y += speed
        break;
      case 'keyD':
        players[socket.id].x += speed
        break;
    }
  })
})
setInterval(() => {
  io.emit('updatePlayers', players)
  console.log(players)
}, 15)
server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
