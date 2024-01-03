
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
      c.fillStyle = this.color,
      c.fillText(this.username, this.x - 30, this.y - 30)
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
        this.x - this.image.width / 8,
        this.y - this.image.height / 8,
        this.image.width / 4,
        this.image.height / 4
      )
      c.restore()
    }
}
