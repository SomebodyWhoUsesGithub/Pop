var lastMove = 0;
document.addEventListener('mousemove', function() {
    // do nothing if last move was less than 40 ms ago
});

addEventListener('click', (event) => {
const canvas = document.querySelector('canvas')
const { top, left } = canvas.getBoundingClientRect()

  if(Date.now() - lastMove > 50) {
      lastMove = Date.now();
      if (players[socket.id]) {
        const playerPosition = {
          x: players[socket.id].x,
          y: players[socket.id].y
        }
        const angle = Math.atan2(
          event.clientY - top - playerPosition.y,
          event.clientX - left - playerPosition.x
        )
        // const velocity = {
        //   x: Math.cos(angle) * 5,
        //   y: Math.sin(angle) * 5
        // }
        socket.emit('shoot', {
          x: playerPosition.x,
          y: playerPosition.y,
          angle
        })
        // projectiles.push(
        //   new Projectile({
        //     x: playerPosition.x,
        //     y: playerPosition.y,
        //     radius: 5,
        //     color: 'gold',
        //     velocity: velocity
        //   })
        // )
      }
  }

})
