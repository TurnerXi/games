define(["Tools"], function (Tools) {
  Cloud.config = {
    HEIGHT: 14,
    MAX_CLOUD_GAP: 400,
    MAX_SKY_LEVEL: 30,
    MIN_CLOUD_GAP: 100,
    MIN_SKY_LEVEL: 71,
    WIDTH: 46
  };

  function Cloud(canvas, imageSprite, cloudPos, dimensionWith) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.imageSprite = imageSprite;
    this.removed = false;
    this.cloudGap = Tools.getRandomNum(Cloud.config.MIN_CLOUD_GAP, Cloud.config.MAX_CLOUD_GAP);
    this.sourceDimensions = { WIDTH: Cloud.config.WIDTH, HEIGHT: Cloud.config.HEIGHT };
    this.source = { x: cloudPos[0], y: cloudPos[1], width: this.sourceDimensions.WIDTH, height: this.sourceDimensions.HEIGHT }
    this.position = { x: dimensionWith, y: 0, width: Cloud.config.WIDTH, height: Cloud.config.HEIGHT }
    this.init();
  }

  Cloud.prototype = {
    init() {
      this.position.y = Tools.getRandomNum(Cloud.config.MIN_SKY_LEVEL, Cloud.config.MAX_SKY_LEVEL);
      this.draw();
    },
    isVisible() {
      return this.position.x >= -Cloud.config.WIDTH;
    },
    draw() {
      this.context.save();
      this.context.drawImage(this.imageSprite,
        this.source.x, this.source.y,
        this.source.width, this.source.height,
        this.position.x, this.position.y,
        this.position.width, this.position.height);
      this.context.restore();
    },
    update(increment) {
      if (!this.removed) {
        this.position.x -= Math.ceil(increment);
        this.draw();
        if (!this.isVisible()) {
          this.removed = true;
        }
      }
    }
  }
  return Cloud;
})
