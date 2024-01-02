
class Player {
  constructor({ x, y, radius, model, image, color = 'gold', username}) {
    this.x = x
    this.y = y
    this.radius = radius
    this.model = model
    this.image = image
    this.color = color
    this.username = username
  }

    draw() {
      c.font = '18px sans-serif',
      c.fillStyle = 'rgb(196, 0, 255)',
      c.fillText(this.username, this.x - 30, this.y - 50)
      // Sprite
      c.save()
      c.shadowColor = this.color,
      c.shadowBlur = 25,
      c.drawImage(
        this.image,
        0,
        0,
        this.image.width,
        this.image.height,
        this.x - this.image.width / 10,
        this.y - this.image.height / 10,
        this.image.width / 5,
        this.image.height / 5
      )
      c.restore()
    }
}
