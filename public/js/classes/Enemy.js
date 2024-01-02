class Enemy {
  constructor(x, y, radius, color, velocity, image) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = 'rgba(0, 0, 0, 0)'
    this.velocity = velocity
    this.image = image
  }

  draw() {
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
        // c.width = this.width;
        // c.height = this.height;

        // default gCO is source-over
        // c.globalCompositeOperation='destination-in';
    // now we change the gCO
    c.beginPath()
    c.arc((this.x - this.image.width) / 10, (this.y - this.image.height) / 10, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.restore()
    // c.globalCompositeOperation='source-over';
  }



  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}
