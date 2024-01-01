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
const radius = 20
const projectileRad = 5
let projectileId = 0

io.on('connection', (socket) => {
  console.log('a user connected')
  // players[socket.id] = {
  //   x: 700 * Math.random(),
  //   y: 700 * Math.random(),
  //   model: 10 * Math.random(),
  //   sequenceNumber: 0,
  //   color: `hsl(${360*Math.random()}, 100%, 50%)`,
  //   score: 0,
  //   username: ''
  // }
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
  socket.on('initGame', ({width, height, devicePixelRatio, username, blockchainAccount}) => {
    // handleSendKont()
    players[socket.id] = {
      x: 700 * Math.random(),
      y: 700 * Math.random(),
      model: 10 * Math.random(),
      sequenceNumber: 0,
      color: `hsl(${360*Math.random()}, 100%, 50%)`,
      score: 0,
      username,
      blockchainAccount
    }
    players[socket.id].canvas = {
      width,
      height,
      devicePixelRatio
    }
    players[socket.id].radius = radius
    if (devicePixelRatio > 1) {
      players[socket.id].radius = 2 * radius
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
    if (players[socket.id]) {
      players[socket.id].sequenceNumber = sequenceNumber
      switch (keycode) {
        case 'keyW':
          players[socket.id].y -= speed
          if (players[socket.id].y <= 0) {
            players[socket.id].y = 1080
          }
          break;
        case 'keyA':
          players[socket.id].x -= speed
          if (players[socket.id].x <= 0) {
            players[socket.id].x = 1920
          }
          break;
        case 'keyS':
          players[socket.id].y += speed
          //bounds
          if (players[socket.id].y >= 1080) {
            players[socket.id].y = 0
          }
          break;
        case 'keyD':
          players[socket.id].x += speed
          if (players[socket.id].x >= 1920) {
            players[socket.id].x = 0
          }
          break;
      }
    }
  })
})
setInterval(() => {
  for (const id in playerProjectiles) {
    playerProjectiles[id].x += playerProjectiles[id].velocity.x
    playerProjectiles[id].y += playerProjectiles[id].velocity.y
    const projectileRadius = 5
    // gc
    // console.log(players[playerProjectiles[id].playerId]?.canvas?.devicePixelRatio)
    if (
      playerProjectiles[id].x - projectileRadius >=
      // players[playerProjectiles[id].playerId]?.canvas?.width ||
      2560 ||
      playerProjectiles[id].x - projectileRadius <= 0 ||
      playerProjectiles[id].y - projectileRadius >=
      // players[playerProjectiles[id].playerId]?.canvas?.height ||
      1440 ||
      playerProjectiles[id].y - projectileRadius <= 0
    ) {
      delete playerProjectiles[id]
      continue
    }
    // Pop!
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
        if (players[playerProjectiles[id].playerId]) {
          players[playerProjectiles[id].playerId].score = players[playerProjectiles[id].playerId].score + 1000
        }
        // console.log(playerProjectiles[id])
        // console.log(playerProjectiles)
        // TODO: loop through projectiles and delete the removed players projectiles
        delete playerProjectiles[id]
        delete players[playerId]
        break
      }
    }
  }
  io.emit('updateProjectiles', playerProjectiles)
  io.emit('updatePlayers', players)
}, 15)
server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
