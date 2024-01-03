
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
      c.font = '16px sans-serif',
      c.fillStyle = this.color,
      c.fillText(this.username, this.x - 26, this.y - 35)
      // Sprite
      c.save()
      c.shadowColor = this.color,
      c.shadowBlur = 20,
      c.drawImage(
        this.image,
        0,
        0,
        this.image.width,
        this.image.height,
        this.x - this.image.width / 6,
        this.y - this.image.height / 6,
        this.image.width / 3,
        this.image.height / 3
      )
      c.restore()
    }
}
