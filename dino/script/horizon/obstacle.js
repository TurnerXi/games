define(['CollisionBox', 'tools'], function (CollisionBox, Tools) {
  Obstacle.types = [{
      type: 'CACTUS_SMALL',
      width: 17,
      height: 35,
      yPos: 105,
      multipleSpeed: 4,
      minGap: 120,
      minSpeed: 0,
      collisionBoxes: [
        new CollisionBox(0, 7, 5, 27),
        new CollisionBox(4, 0, 6, 34),
        new CollisionBox(10, 4, 7, 14)
      ]
    },
    {
      type: 'CACTUS_LARGE',
      width: 25,
      height: 50,
      yPos: 90,
      multipleSpeed: 7,
      minGap: 120,
      minSpeed: 0,
      collisionBoxes: [
        new CollisionBox(0, 12, 7, 38),
        new CollisionBox(8, 0, 7, 49),
        new CollisionBox(13, 10, 10, 38)
      ]
    },
    {
      type: 'PTERODACTYL',
      width: 46,
      height: 40,
      yPos: [100, 75, 50], // Variable height.
      yPosMobile: [100, 50], // Variable height mobile.
      multipleSpeed: 999,
      minSpeed: 8.5,
      minGap: 150,
      collisionBoxes: [
        new CollisionBox(15, 15, 16, 5),
        new CollisionBox(18, 21, 24, 6),
        new CollisionBox(2, 14, 4, 3),
        new CollisionBox(6, 10, 4, 7),
        new CollisionBox(10, 8, 6, 9)
      ],
      numFrames: 2,
      frameRate: 1000 / 6,
      speedOffset: .8
    }
  ];
  Obstacle.MAX_OBSTACLE_LENGTH = 3;
  Obstacle.MAX_GAP_COEFFICIENT = 1.5;

  function Obstacle(canvas, imageSprite, obType, spritePos, dimensions, gapCoefficient, speed, opt_xOffset) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.imageSprite = imageSprite;
    this.spritePos = spritePos;
    this.typeConfig = obType;
    this.size = Tools.getRandomNum(1, Obstacle.MAX_OBSTACLE_LENGTH+1);
    this.dimensions = dimensions;
    this.gapCoefficient = gapCoefficient;
    this.removed = false;
    this.sourceDimensions = { WIDTH: obType.width, HEIGHT: obType.height };
    this.offsetX = opt_xOffset;
    this.currentFrame = 0;
    this.init(speed);
  }

  Obstacle.prototype = {
    init(speed) {
      this.collisionBoxes = Tools.cloneArray(this.typeConfig.collisionBoxes, true);
      var sourceWidth = this.typeConfig.width;
      var sourceHeight = this.typeConfig.height;
      // if (this.size > 1 && this.typeConfig.multipleSpeed > speed) {
      //   this.size = 1;
      // }
      this.width = sourceWidth * this.size;
      var posNum = this.size * (this.size - 1) / 2;
      var xPos = sourceWidth * posNum + this.spritePos[0];
      var yPos = this.typeConfig.yPos;
      /************* PTERODACTYL ********************/
      if (this.currentFrame > 0) {
        xPos += sourceWidth * this.currentFrame;
      }
      if (Array.isArray(yPos)) {
        this.position.y = yPos[Tools.getRandomNum(1, yPos.length)];
      }
      /************* PTERODACTYL END ********************/
      this.source = { x: xPos, y: this.spritePos[1], width: this.width, height: sourceHeight }
      this.position = { x: this.dimensions.WIDTH + (this.offsetX || 0), y: yPos, width: this.width, height: sourceHeight }
      this.draw();
      if (this.size > 1) {
        this.collisionBoxes[1].width = this.width - this.collisionBoxes[0].width - this.collisionBoxes[2].width;
        this.collisionBoxes[2].x = this.width - this.collisionBoxes[2].width;
      }
      this.gap = this.getGap(speed);
    },
    draw() {
      this.context.save();
      this.context.drawImage(this.imageSprite,
        this.source.x, this.source.y,
        this.source.width, this.source.height,
        this.position.x, this.position.y,
        this.position.width, this.position.height);
      /************* debugCollisionBox ********************/
      // this.context.strokeStyle = "blue";
      // this.collisionBoxes.forEach(item => {
      //   this.context.strokeRect(this.position.x + item.x, this.position.y + item.y, item.width, item.height);
      // });
      /************* debugCollisionBox END********************/
      this.context.restore();
    },
    update(increment) {
      if (!this.removed) {
        this.position.x -= increment;
        var frames = this.typeConfig.numFrames;
        if (frames > 1) {
          this.currentFrame = (frames - this.currentFrame) ? (this.currentFrame + 1) : 0;
        }
        this.draw();
        if (!this.isVisible()) {
          this.removed = true;
        }
      }
    },
    getGap(speed) {
      var minGap = Math.round(this.width * speed + this.typeConfig.minGap * this.gapCoefficient);
      var maxGap = Math.round(minGap * Obstacle.MAX_GAP_COEFFICIENT);
      return Tools.getRandomNum(minGap, maxGap);
    },
    isVisible() {
      return this.position.x + this.width >= 0;
    }
  }
  return Obstacle;
})
