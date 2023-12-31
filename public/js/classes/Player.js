
class Player {
  constructor({ x, y, radius, model, image, color = 'gold'}) {
    this.x = x
    this.y = y
    this.radius = radius
    this.model = model
    this.image = image
    this.color = color
  }

    draw() {
      //Sprite
      // c.drawImage(
      //   this.image,
      //   0,
      //   0,
      //   this.image.width,
      //   this.image.height,
      //   this.x - this.image.width / 20,
      //   this.y - this.image.height / 20,
      //   this.image.width / 10,
      //   this.image.height / 10
      // )
      c.beginPath()
      c.arc(this.x, this.y, this.radius * window.devicePixelRatio, 0, Math.PI * 2, false)
      c.fillStyle = this.color
      c.fill()

    }
    // update() {
    //   this.draw()
    //   this.x = this.x + this.velocity.x
    //   this.y = this.y + this.velocity.y
    // }
}
