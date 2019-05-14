define(['Config'], function (Config) {
  HorizonLine.dimensions = {
    WIDTH: 600,
    HEIGHT: 12,
    YPOS: 127
  };

  function HorizonLine(canvas, imageSprite, spritePos) {
    this.ctx = canvas.getContext('2d');
    this.dimensions = HorizonLine.dimensions;
    // 两倍的图像画在一倍的画布上实现高分辨率显示
    this.sourceDimensions = { WIDTH: this.dimensions.WIDTH, HEIGHT: this.dimensions.HEIGHT };
    this.imageSprite = imageSprite;
    this.spritePos = spritePos;
    this.init();
    this.draw();
  }
  HorizonLine.prototype = {
    init() {
      // 水平线雪碧图拆成2幅轮播
      this.firstX = this.spritePos.HORIZON[0];
      this.secondX = this.dimensions.WIDTH + this.firstX;
      this.source = { 0: this.firstX, 1: this.secondX, y: this.spritePos.HORIZON[1], width: this.sourceDimensions.WIDTH, height: this.sourceDimensions.HEIGHT, length: 2 }
      this.postion = { 0: 0, 1: this.dimensions.WIDTH, y: this.dimensions.YPOS, width: this.dimensions.WIDTH, height: this.dimensions.HEIGHT, length: 2 }
    },
    draw() {
      this.drawImage(0);
      this.drawImage(1);
    },
    drawImage(idx) {
      this.ctx.drawImage(this.imageSprite, this.source[idx], this.source.y, this.source.width, this.source.height, this.postion[idx], this.postion.y, this.postion.width, this.postion.height);
    },
    update(durTime, currentSpeed) {
      this.postion[0] -= currentSpeed * (Config.FPS / 1000) * durTime;
      this.postion[1] = this.postion[0] + this.dimensions.WIDTH;
      if (this.postion[0] <= -this.dimensions.WIDTH) {
        Array.prototype.push.call(this.postion, Array.prototype.shift.call(this.postion) + 2 * this.dimensions.WIDTH);
        Array.prototype.shift.call(this.source);
        Array.prototype.push.call(this.source, Math.random() > 0.5 ? this.firstX : this.secondX);
      }
      this.draw();
    },
    reset() {
      this.postion[0] = 0;
      this.postion[1] = this.dimensions.WIDTH;
    }
  }
  return HorizonLine;
})
