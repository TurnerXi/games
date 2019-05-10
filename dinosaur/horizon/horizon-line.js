HorizonLine.dimensions = {
  HEIGHT: 28,
  YPOS: 122
}

function HorizonLine(context, imageSprite, spriteDef, dimensions, gapCft) {
  this.dimensions = Object.assign(dimensions, HorizonLine.dimensions);
  this.imageSprite = imageSprite;
  this.spriteDef = spriteDef;
  this.ctx = context;
  this.init();
  this.draw();
}

HorizonLine.prototype = {
  init() {
    // 水平线雪碧图拆成2幅轮播
    this.firstX = this.spriteDef.HORIZON[0];
    this.secondX = this.imageSprite.width / 2 + this.spriteDef.HORIZON[0];
    this.sprites = { 0: this.firstX, 1: this.secondX, y: this.spriteDef.HORIZON[1], width: this.dimensions.WIDTH, height: this.dimensions.HEIGHT }
    this.pos = { 0: 0, 1: this.dimensions.WIDTH, y: this.dimensions.YPOS, width: this.dimensions.WIDTH*2, height: this.dimensions.HEIGHT*2 }
  },
  draw() {
    this.ctx.clearRect(0, 0, 600, 1500);
    this.drawImage(0);
    this.drawImage(1);
  },
  drawImage(idx) {
    this.ctx.drawImage(this.imageSprite,
      this.sprites[idx], this.sprites.y,
      this.sprites.width, this.sprites.height,
      this.pos[idx], this.pos.y,
      this.pos.width, this.pos.height);
  },
  move(increment) {
    this.pos[0] -= increment;
    this.pos[1] -= increment;
    if (this.pos[0] <= -this.dimensions.WIDTH) {
      this.pos[0] += this.dimensions.WIDTH * 2;
      this.sprites[0] = Math.random() > 0.5 ? this.firstX : this.secondX;
    } else if (this.pos[1] <= -this.dimensions.WIDTH) {
      this.pos[1] += this.dimensions.WIDTH * 2;
      this.sprites[1] = Math.random() > 0.5 ? this.firstX : this.secondX;
    }
    this.draw();
  }
}
