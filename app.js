const express = require('express')
const app = express()
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io')
const io = new Server(server, { pingInterval: 2500, pingTimeout:5000 })
const port = 3000
const gameCanvasY = 1080
const gameCanvasX = 1920
const zksync = require('zksync-ethers')
const ethers = require('ethers')



app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const players = {}
const playerProjectiles = {}
const leaderboard = {}

const speed = 4
const radius = 25
const projectileRad = 5
let projectileId = 0
io.on('connection', (socket) => {
  socket.on('threePls', () => {
    console.log()
    io.emit('threeRec', )
  })
  console.log('a user connected')
  // io.emit('updatePlayers', players)
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
  socket.on('initGame', ({width, height, username, blockchainAccount}) => {
    players[socket.id] = {
      x: (gameCanvasX - 24) * Math.random(),
      y: (gameCanvasY - 12) * Math.random(),
      model: 10 * Math.random(),
      sequenceNumber: 0,
      color: `hsl(${360*Math.random()}, 100%, 50%)`,
      score: 0,
      username,
      blockchainAccount
    }
    if (!leaderboard[blockchainAccount]) {
      leaderboard[blockchainAccount] = {
        score: 0,
        playername: players[socket.id].username
      }
    }
    players[socket.id].canvas = {
      width,
      height
    }
    players[socket.id].radius = radius
    // if (devicePixelRatio > 1) {
    //   players[socket.id].radius = 2 * radius
    // }
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
          if (players[socket.id].y <= players[socket.id].radius) {
            players[socket.id].y = players[socket.id].radius
          }
          break;
        case 'keyA':
          players[socket.id].x -= speed
          if (players[socket.id].x <= players[socket.id].radius) {
            players[socket.id].x = players[socket.id].radius
          }
          break;
        case 'keyS':
          players[socket.id].y += speed
          //bounds
          if (players[socket.id].y >= gameCanvasY - players[socket.id].radius) {
            players[socket.id].y = gameCanvasY - players[socket.id].radius
          }
          break;
        case 'keyD':
          players[socket.id].x += speed
          if (players[socket.id].x >= gameCanvasX - players[socket.id].radius) {
            players[socket.id].x = gameCanvasX - players[socket.id].radius
          }
          break;
      }
    }
  })
  let letMake = false;
  socket.on('letMake', () => {
    console.log(letMake)
    letMake = true;
    //if new points > 100:
    //req sign for tx 
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
      gameCanvasX ||
      playerProjectiles[id].x - projectileRadius <= 0 ||
      playerProjectiles[id].y - projectileRadius >=
      // players[playerProjectiles[id].playerId]?.canvas?.height ||
      gameCanvasY ||
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
          if (player.blockchainAccount !== players[playerProjectiles[id].playerId].blockchainAccount) {
            leaderboard[players[playerProjectiles[id].playerId].blockchainAccount].score = leaderboard[players[playerProjectiles[id].playerId].blockchainAccount].score + 1000
          }
        }
        // TODO: loop through projectiles and delete the removed players projectiles
        delete playerProjectiles[id]
        delete players[playerId]
        break
      }
    }
  }
  io.emit('updateProjectiles', playerProjectiles)
  io.emit('updatePlayers', players)
  io.emit('updateLeaderboard', leaderboard)
}, 10)
server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
