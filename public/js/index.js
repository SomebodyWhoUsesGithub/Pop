const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const socket = io()
const scoreT = document.querySelector('#scoreT')

const devicePixelRatio = window.devicePixelRatio || 1

canvas.width = 1920 * devicePixelRatio
canvas.height = 1080 * devicePixelRatio

c.scale(devicePixelRatio, devicePixelRatio)
if (window.matchMedia("(orientation: portrait)").matches) {
   // you're in PORTRAIT mode
   alert('Please use landscape mode or maximize your window')
}
if (window.matchMedia("(orientation: landscape)").matches) {
   // you're in LANDSCAPE mode
}
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
const imageSama = new Image()
imageSama.src = "./img/samaIco.png"
// const player = new Player(x, y, 10, 'gold')
const players = {}
const projectiles = []
const pProjectiles = {}
const enemies = []
const particles = []
const chainId = '0x144'
let blockchainAccount = ''
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
          radius: 25,
          model: 1,
          image: playerImage,
          color: listPlayer.color,
          blockchainAccount: listPlayer.blockchainAccount,
          username: listPlayer.username
        })
    }else{
      if (id === socket.id) {

        const lastPlayerListInput = playerInputs.findIndex(input => {
          return listPlayer.sequenceNumber === input.sequenceNumber
        })

        if (lastPlayerListInput > -1) {
          playerInputs.splice(0, lastPlayerListInput + 1)
          playerInputs.forEach(input => {
            players[id].target.x += input.vx
            players[id].target.y += input.vy
          });
        }
      }else if(id !== socket.id){
        // gsap.to(players[id],{
        //   x: listPlayer.x,
        //   y: listPlayer.y,
        //   duration: 0.0015,
        //   ease: 'linear'
        // })
      }
    }
    players[id].target = {
      x: listPlayer.x,
      y: listPlayer.y
    }
    for (const id in players) {
      if (!playersList[id]) {
        // document.querySelector(`div[data-id="${playersList[socket.id].blockchainAccount}"]`).remove()
        if (id === socket.id) {
          document.querySelector('#signupForm').style.display = 'block'
        }
        delete players[id]
        keys.w.pressed = false
        keys.a.pressed = false
        keys.s.pressed = false
        keys.d.pressed = false
      }
    }
  }
})

socket.on('updateLeaderboard', (leaderboard) => {
  for(const id in leaderboard){
    const leaderboardEntry = leaderboard[id]
    const entryCheck = document.querySelector(`div[data-id="${id}"]`)
    if (entryCheck) {
      document.querySelector(`div[data-id="${id}"]`).remove()
    }
    document.querySelector('#leaderboardPlayers').innerHTML += `<div data-id="${id}" data-score="${leaderboardEntry.score}">${leaderboardEntry.playername}: ${leaderboardEntry.score}</div>`
  }

  const parentDiv = document.querySelector('#leaderboardPlayers')
  const childDivs = Array.from(parentDiv.querySelectorAll('div'))

  childDivs.sort((a, b) => {
    const scoreA = Number(a.getAttribute('data-score'))
    const scoreB = Number(b.getAttribute('data-score'))
    return scoreB - scoreA
  })
  childDivs.forEach(div => {
     div.remove()
  })
  childDivs.forEach(div => {
     parentDiv.appendChild(div)
  })
})

function spawnEnemies() {
  setInterval(() => {
    // const radius = Math.random() * (30 - 4) + 4
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

      // enemies.push(new Enemy(x, y, radius, color, velocity, imageSama))
    }
  }, 2000)
}

let animationId
let score = 0
function animate() {
  animationId = requestAnimationFrame(animate)
  // c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  // c.fillRect(0, 0, canvas.width, canvas.height)
  c.clearRect(0, 0, canvas.width, canvas.height)

  for (const id in players) {
    const player = players[id]
    player.draw()

    if (player.target) {
      players[id].x += (players[id].target.x - players[id].x) * 0.5
      players[id].y += (players[id].target.y - players[id].y) * 0.5
    }
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

  // for (let index = enemies.length - 1; index >= 0; index--) {
  //   const enemy = enemies[index]
  //
  //   enemy.update()
  //
  //   // end game
  //   const dist = Math.hypot(players[socket.id].x - enemy.x, players[socket.id].y - enemy.y)
  //   console.log(dist, enemy.radius - players[socket.id].y)
  //   if (dist - enemy.radius - players[socket.id].y < 1) {
  //     // cancelAnimationFrame(animationId)
  //     socket.emit('death')
  //   }
  //
  //   for (
  //     let projectilesIndex = projectiles.length - 1;
  //     projectilesIndex >= 0;
  //     projectilesIndex--
  //   ) {
  //     const projectile = projectiles[projectilesIndex]
  //
  //     const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
  //
  //     // when projectiles touch enemy
  //     if (dist - enemy.radius - projectile.radius < 1) {
  //       // create explosions
  //       for (let i = 0; i < enemy.radius * 2; i++) {
  //         particles.push(
  //           new Particle(
  //             projectile.x,
  //             projectile.y,
  //             Math.random() * 2,
  //             enemy.color,
  //             {
  //               x: (Math.random() - 0.5) * (Math.random() * 6),
  //               y: (Math.random() - 0.5) * (Math.random() * 6)
  //             }
  //           )
  //         )
  //       }
  //       // this is where we shrink our enemy
  //       if (enemy.radius - 10 > 5) {
  //         score += 100
  //         scoreT.innerHTML = score
  //         gsap.to(enemy, {
  //           radius: enemy.radius - 10
  //         })
  //         projectiles.splice(projectilesIndex, 1)
  //       } else {
  //         // remove enemy if they are too small
  //         score += 150
  //         scoreT.innerHTML = score
  //
  //         enemies.splice(index, 1)
  //         projectiles.splice(projectilesIndex, 1)
  //       }
  //     }
  //   }
  // }
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
  const handleSendKont = async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== "undefined") {

        if (window.ethereum.request({method: 'net_version'}) !== chainId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: chainId }]
            });
          } catch (err) {
            console.log(err)
              // This error code indicates that the chain has not been added to MetaMask
            if (err.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainName: 'ZKSync and Fakesama Stink',
                    chainId: chainId,
                    nativeCurrency: { name: 'FakeSama', decimals: 18, symbol: 'FakeSama' },
                    rpcUrls: ['https://mainnet.era.zksync.io']
                  }
                ]
              });
            }
          }
        }

        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        // console.log(accounts)
        if (accounts[0]) {
          blockchainAccount = accounts[0]
        }
        socket.emit('initGame', {
          width: canvas.width,
          height: canvas.height,
          devicePixelRatio,
          username: document.querySelector('#usernameInput').value,
          blockchainAccount: blockchainAccount
        })
      } else {
        alert("MetaMask not installed!");
      }
    } catch (error) {
      console.error("Error sending kont:", error.message);
    } finally {
      document.querySelector('#payupForm').style.display = 'block'
      console.log('success')
    }
  };
  handleSendKont()
})
document.querySelector('#payupForm').addEventListener('submit', (e) =>{
  e.preventDefault()
  const handleSendKontTx = async () => {
    try {
      const value = Math.floor(Math.random() * 3000000000000).toString()
    // Await commitment
      const transfer = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [{ to: "0x179d56b83519ef6a76ee3e9d396b97609744dacd",
        from: blockchainAccount,
        value: value,
        gas: '80000' }]
      });
    } catch (e) {
      console.log(e)
    } finally {
      const transferReceipt = await transfer.wait();
      console.log(`Tx transfer hash for ETH: ${transferReceipt.blockHash}`);
      console.log('Kont.send')
      document.querySelector('#payupForm').style.display = 'none'
    }
    // var web3 = new Web3(window.ethereum);
    // console.log(web3)
    // const accounts = await web3.eth.getAccounts();

    // Replace 'yourContractAddress' and 'yourAbi' with the actual contract details
    // const contractAddress = "yourContractAddress";
    // const contractAbi = [...yourAbi];
    //
    // const contract = new web3.eth.Contract(contractAbi, contractAddress);

    // Replace 'yourFunction' and 'yourParameters' with the actual function and parameters
    // const transaction = await contract.methods
    //   .yourFunction(yourParameters)
    //   .send({
    //     from: accounts[0],
    //   });

    // console.log("Transaction Hash:", transaction.transactionHash);
  }
  handleSendKontTx()
})
