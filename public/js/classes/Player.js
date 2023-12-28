
class Player {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
  }

    draw(image) {
      // c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
      // c.fillStyle = this.color
      // c.fill()
      c.drawImage(
        image,
        0,
        0,
        image.width,
        image.height,
        this.x - image.width / 20,
        this.y - image.height / 20,
        image.width / 10,
        image.height / 10
      )
    }
}
