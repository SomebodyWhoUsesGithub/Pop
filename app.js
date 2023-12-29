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

const players = {}
const playerProjectiles = {}

const speed = 6
const radius = 10
const projectileRad = 5
let projectileId = 0

io.on('connection', (socket) => {
  console.log('a user connected')
  players[socket.id] = {
    x: 1600 * Math.random(),
    y: 900 * Math.random(),
    model: 10 * Math.random(),
    sequenceNumber: 0,
    color: `hsl(${360*Math.random()}, 100%, 50%)`,
    score: 0
  }
  socket.on('initCanvas', ({width, height, devicePixelRatio}) => {
    players[socket.id].canvas = {
      width,
      height
    }
    players[socket.id].radius = radius
    if (devicePixelRatio > 1) {
      players[socket.id].radius = 2 * radius
    }
  })
  io.emit('updatePlayers', players)
  // console.log(players)
  socket.on('shoot', ({x, y , angle}) => {
    ++projectileId;
    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5
    }

    playerProjectiles[projectileId] = {
      x,
      y,
      velocity,
      playerId: socket.id
    }
  })

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
  for (const id in playerProjectiles) {
    playerProjectiles[id].x += playerProjectiles[id].velocity.x
    playerProjectiles[id].y += playerProjectiles[id].velocity.y
    const projectileRadius = 5
    if (
      playerProjectiles[id].x - projectileRadius >=
      // players[playerProjectiles[id].playerId]?.canvas?.width ||
      3000 ||
      playerProjectiles[id].x - projectileRadius <= 0 ||
      playerProjectiles[id].y - projectileRadius >=
      // players[playerProjectiles[id].playerId]?.canvas?.height ||
      2000 ||
      playerProjectiles[id].y - projectileRadius <= 0
    ) {
      delete playerProjectiles[id]
      continue
    }
    // console.log(playerProjectiles);
    for(const playerId in players){
      const player = players[playerId]
      const dist = Math.hypot(
        playerProjectiles[id].x - player.x,
        playerProjectiles[id].y - player.y
      )
      if (
        dist < projectileRad + player.radius &&
        playerProjectiles[id].playerId !== playerId
      ) {
        players[playerProjectiles[id].playerId].score = players[playerProjectiles[id].playerId].score + 1000
        delete playerProjectiles[id]
        delete players[playerId]
        break
      }
    }
  }
  io.emit('updateProjectiles', playerProjectiles)
  io.emit('updatePlayers', players)
  // console.log(players)
}, 15)
server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
