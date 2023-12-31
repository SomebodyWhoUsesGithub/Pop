const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io()
const scoreT = document.querySelector('#scoreT')

const devicePixelRatio = window.devicePixelRatio || 1

canvas.width = innerWidth * devicePixelRatio
canvas.height = innerHeight * devicePixelRatio

const x = canvas.width / 2
const y = canvas.height / 2
const playerImage = new Image()
playerImage.src = "./img/5bg.png"
const playerImageD = new Image()
playerImageD.src = "./img/d5bg.png"
const playerImageS = new Image()
playerImageS.src = "./img/s5bg.png"
const playerImageA = new Image()
playerImageA.src = "./img/a5bg.png"
const playerImageWD = new Image()
playerImageWD.src = "./img/wd5bg.png"
const playerImageWA = new Image()
playerImageWA.src = "./img/wa5bg.png"
const playerImageSD = new Image()
playerImageSD.src = "./img/sd5bg.png"
const playerImageSA = new Image()
playerImageSA.src = "./img/sa5bg.png"
// const player = new Player(x, y, 10, 'gold')
const players = {}
const projectiles = []
const pProjectiles = {}
const enemies = []
const particles = []

// socket.on("connect", () => {
// })

socket.on('updateProjectiles', (playerProjectiles) => {
    for (const id in playerProjectiles) {
      const playerProjectile = playerProjectiles[id]
      if (!pProjectiles[id]) {
        pProjectiles[id] = new Projectile({
            x: playerProjectile.x,
            y: playerProjectile.y,
            radius: 5,
            color: players[playerProjectile.playerId]?.color,
            velocity: playerProjectile.velocity
          })
      }else{
        pProjectiles[id].x += playerProjectiles[id].velocity.x
        pProjectiles[id].y += playerProjectiles[id].velocity.y
      }
    }
    for (const pProjectileId in pProjectiles) {
      if (!playerProjectiles[pProjectileId]) {
        delete pProjectiles[pProjectileId]
      }
    }
})
socket.on('updatePlayers', (playersList) => {
  for (const id in playersList) {
    const listPlayer = playersList[id]
    if (!players[id]){
        players[id] = new Player({
          x: listPlayer.x,
          y: listPlayer.y,
          radius: 10,
          model: 1,
          image: playerImage,
          color: listPlayer.color,
          // username: ''
        })
        document.querySelector('#leaderboardPlayers').innerHTML += `<div data-id="${id}" data-score="${listPlayer.score}">${listPlayer.username}: ${listPlayer.score}</div>`
    } else {
      document.querySelector(`div [data-id="${id}"]`).innerHTML = `${listPlayer.username}: ${listPlayer.score}`
      document.querySelector(`div [data-id="${id}"]`).setAttribute('data-score', listPlayer.score)
      const parentDiv = document.querySelector('#leaderboardPlayers')
      const childDivs = Array.from(parentDiv.querySelectorAll('div'))

      childDivs.sort((a, b) => {
        const scoreA = Number(a.getAttribute('data-score'))
        const scoreB = Number(a.getAttribute('data-score'))
        return scoreB - scoreA
      })
      childDivs.forEach(div => {
         div.remove()
      })
      childDivs.forEach(div => {
         parentDiv.appendChild(div)
      })

      if (id === socket.id) {
        players[id].x = listPlayer.x
        players[id].y = listPlayer.y

        const lastPlayerListInput = playerInputs.findIndex(input => {
          return listPlayer.sequenceNumber === input.sequenceNumber
        })
        if (lastPlayerListInput > -1) {
          playerInputs.splice(0, lastPlayerListInput + 1)
          playerInputs.forEach(input => {
            players[id].x += input.vx
            players[id].y += input.vy
          });
        }
      }else if(id !== socket.id){
        gsap.to(players[id],{
          x: listPlayer.x,
          y: listPlayer.y,
          duration: 0.015,
          ease: 'linear'
        })
      }
    }
  }

  for (const id in players) {
    if (!playersList[id]) {
      document.querySelector(`div[data-id="${id}"]`).remove()

      if (id === socket.id) {
        document.querySelector('#signupForm').style.display = 'block'
      }
      delete players[id]
    }
  }
})

function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * (30 - 4) + 4
    let x
    let y
    let multiplier = 1 + (score / 25000)
    for (var i = 0; i < Math.floor(multiplier); i++) {
      if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
        y = Math.random() * canvas.height
      } else {
        x = Math.random() * canvas.width
        y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
      }

      const color = `hsl(${Math.random() * 360}, 50%, 50%)`

      const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)

      const velocity = {
        x: (Math.cos(angle) * (1 + multiplier / 10)),
        y: (Math.sin(angle) * (1 + multiplier / 10))
      }

      enemies.push(new Enemy(x, y, radius, color, velocity))
      console.log(i,multiplier)
    }
  }, 2000)
}

let animationId
let score = 0
function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  for (const id in players) {
    const player = players[id]
    player.draw()
  }
  // player.draw(image)
  for (const id in pProjectiles) {
    // console.log(pProjectiles[id]);
    const pProjectile = pProjectiles[id]
    pProjectile.draw()
  }

  for (let index = particles.length - 1; index >= 0; index--) {
    const particle = particles[index]

    if (particle.alpha <= 0) {
      particles.splice(index, 1)
    } else {
      particle.update()
    }
  }

  for (let index = projectiles.length - 1; index >= 0; index--) {
    const projectile = projectiles[index]

    projectile.update()

    // remove from edges of screen
    if (
      projectile.x - projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      projectiles.splice(index, 1)
    }
  }

  for (let index = enemies.length - 1; index >= 0; index--) {
    const enemy = enemies[index]

    enemy.update()

    // end game
    // const dist = Math.hypot(players[socket.id].x - enemy.x, players[socket.id].y - enemy.y)
    // console.log(dist, enemy.radius - players[socket.id].y)
    // if (dist - enemy.radius - players[socket.id].y < 1) {
    //   // cancelAnimationFrame(animationId)
    //   socket.emit('death')
    // }

    for (
      let projectilesIndex = projectiles.length - 1;
      projectilesIndex >= 0;
      projectilesIndex--
    ) {
      const projectile = projectiles[projectilesIndex]

      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      // when projectiles touch enemy
      if (dist - enemy.radius - projectile.radius < 1) {
        // create explosions
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6)
              }
            )
          )
        }
        // this is where we shrink our enemy
        if (enemy.radius - 10 > 5) {
          score += 100
          scoreT.innerHTML = score
          gsap.to(enemy, {
            radius: enemy.radius - 10
          })
          projectiles.splice(projectilesIndex, 1)
        } else {
          // remove enemy if they are too small
          score += 150
          scoreT.innerHTML = score

          enemies.splice(index, 1)
          projectiles.splice(projectilesIndex, 1)
        }
      }
    }
  }
}

animate()
spawnEnemies()

//end game
// const dist = Math.hypot(players[socket.id].x - enemy.x, players[socket.id].y - enemy.y)
// if (dist - enemy.radius - players[socket.id].y < 1) {
//   cancelAnimationFrame(animationId)
// }

const keys={
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}
const speed = 5
const playerInputs = []
let sequenceNumber = 0
setInterval(() => {
  if (players[socket.id]) {
    if (keys.w.pressed) {
      sequenceNumber++
      playerInputs.push({sequenceNumber, vx: 0, vy: -speed})
      players[socket.id].y -= speed
      if (keys.d.pressed) {
        players[socket.id].image = playerImageWD
      }else if (keys.a.pressed) {
        players[socket.id].image = playerImageWA
      }else{
        players[socket.id].image = playerImage
      }
      socket.emit('keydown', { keycode: 'keyW', sequenceNumber})
    }else if (keys.s.pressed) {
      sequenceNumber++
      playerInputs.push({sequenceNumber, vx: 0, vy: +speed})
      players[socket.id].y += speed
      if (keys.d.pressed) {
        players[socket.id].image = playerImageSD
      }else if (keys.a.pressed) {
        players[socket.id].image = playerImageSA
      }else{
        players[socket.id].image = playerImageS
      }
      socket.emit('keydown', { keycode: 'keyS', sequenceNumber})
    }
    if(keys.a.pressed) {
      if (!keys.w.pressed && !keys.s.pressed) {
        players[socket.id].image = playerImageA
      }
      sequenceNumber++
      playerInputs.push({sequenceNumber, vx: -speed, vy: 0})
      players[socket.id].x -= speed
      socket.emit('keydown', { keycode: 'keyA', sequenceNumber})
    }

    if (keys.d.pressed) {
      if (!keys.w.pressed && !keys.s.pressed) {
        players[socket.id].image = playerImageD
      }
      sequenceNumber++
      playerInputs.push({sequenceNumber, vx: +speed, vy: 0})
      players[socket.id].x += speed
      socket.emit('keydown', { keycode: 'keyD', sequenceNumber})
    }
    // if (!keys.w.pressed && !keys.s.pressed && !keys.d.pressed && !keys.a.pressed) {
    //
    // }
  }
}, 15)

window.addEventListener('keydown', (event) => {
  // console.log(event.code)
  if (!players[socket.id]) return
  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = true
      break
    case 'KeyA':
      keys.a.pressed = true
      break
    case 'KeyS':
      keys.s.pressed = true
      break
    case 'KeyD':
      keys.d.pressed = true
      break;
  }
})

window.addEventListener('keyup', (event) => {
  if (!players[socket.id]) return
  switch (event.code) {
    case 'KeyW':
    keys.w.pressed = false
      break
    case 'KeyA':
      keys.a.pressed = false
      break
    case 'KeyS':
      keys.s.pressed = false
      break
    case 'KeyD':
      keys.d.pressed = false
      break;
  }
})

document.querySelector('#signupForm').addEventListener('submit', (e) =>{
  e.preventDefault()
  document.querySelector('#signupForm').style.display = 'none'
  socket.emit('initGame', {
    width: canvas.width,
    height: canvas.height,
    devicePixelRatio,
    username: document.querySelector('#usernameInput').value
  })
})
