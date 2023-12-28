addEventListener('click', (event) => {
  const playerPosition = {
    x: players[socket.id].x,
    y: players[socket.id].y
  }
  const angle = Math.atan2(
    event.clientY * window.devicePixelRatio - playerPosition.y,
    event.clientX * window.devicePixelRatio - playerPosition.x
  )
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5
  }
  projectiles.push(
    new Projectile({
      x: playerPosition.x,
      y: playerPosition.y,
      radius: 5,
      color: 'gold',
      velocity: velocity
    })
  )
})
