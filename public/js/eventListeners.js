var lastMove = 0;
document.addEventListener('mousemove', function() {
    // do nothing if last move was less than 40 ms ago

});
addEventListener('click', (event) => {
  if(Date.now() - lastMove > 50) {
      // Do stuff
      lastMove = Date.now();
      if (players[socket.id]) {
        const playerPosition = {
          x: players[socket.id].x,
          y: players[socket.id].y
        }
        const angle = Math.atan2(
          event.clientY * window.devicePixelRatio - playerPosition.y,
          event.clientX * window.devicePixelRatio - playerPosition.x
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
