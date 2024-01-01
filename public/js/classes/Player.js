
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
      // Sprite
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
    }
}
