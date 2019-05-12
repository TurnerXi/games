define(["CollisionBox", "Config"], function (CollisionBox, Config) {
  Trex.config = {
    DROP_VELOCITY: -5,
    GRAVITY: 0.6,
    HEIGHT: 47,
    HEIGHT_DUCK: 25,
    INIITAL_JUMP_VELOCITY: -10,
    INTRO_DURATION: 1500,
    MAX_JUMP_HEIGHT: 30,
    MIN_JUMP_HEIGHT: 30,
    SPEED_DROP_COEFFICIENT: 3,
    SPRITE_WIDTH: 262,
    START_X_POS: 50,
    WIDTH: 44,
    WIDTH_DUCK: 59
  };
  Trex.collisionBoxes = {
    DUCKING: [
      new CollisionBox(1, 18, 55, 25)
    ],
    RUNNING: [
      new CollisionBox(22, 0, 17, 16),
      new CollisionBox(1, 18, 30, 9),
      new CollisionBox(10, 35, 14, 8),
      new CollisionBox(1, 24, 29, 5),
      new CollisionBox(5, 30, 21, 4),
      new CollisionBox(9, 34, 15, 4)
    ]
  };
  Trex.status = {
    CRASHED: 'CRASHED',
    DUCKING: 'DUCKING',
    JUMPING: 'JUMPING',
    RUNNING: 'RUNNING',
    WAITING: 'WAITING'
  };
  Trex.animFrames = {
    WAITING: {
      frames: [44, 0],
      msPerFrame: 1000 / 3
    },
    RUNNING: {
      frames: [88, 132],
      msPerFrame: 1000 / 12
    },
    CRASHED: {
      frames: [220],
      msPerFrame: 1000 / 60
    },
    JUMPING: {
      frames: [0],
      msPerFrame: 1000 / 60
    },
    DUCKING: {
      frames: [264, 323],
      msPerFrame: 1000 / 8
    }
  };

  function Trex(canvas, imageSprite, spritePos, dimensions) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.imageSprite = imageSprite;
    this.spritePos = spritePos;
    this.dimensions = dimensions;
    this.config = Trex.config;
    this.timer = 0;
    this.status = Trex.status.RUNNING;
    this.currentFrame = 0;
    this.currentAnimFrames = Trex.animFrames[this.status].frames;
    this.msPerFrame = Trex.animFrames[this.status].msPerFrame;
    this.groundYPos = dimensions.HEIGHT - this.config.HEIGHT - Config.BOTTOM_PAD;
    this.source = { x: this.spritePos[0], y: this.spritePos[1], width: this.config.WIDTH, height: this.config.HEIGHT };
    this.position = { x: 0, y: this.groundYPos, width: this.config.WIDTH, height: this.config.HEIGHT };
    this.jumpVelocity = 0; // jump速度: 每帧移动像素(px/frame)
    this.speedDrop = false;
    this.reachedMinHeight = false;
    this.jumping = false;
    this.ducking = false;
    this.crashed = false;
    this.init();
  }
  Trex.prototype = {
    init() {
      this.minJumpHeight = this.groundYPos - this.config.MIN_JUMP_HEIGHT;
      this.draw(0);
      this.update(0, Trex.status.WAITING);
    },
    draw(x) {
      this.context.save();
      this.source.x = this.spritePos[0] + x;
      this.position.width = this.source.width = this.config.WIDTH;
      if (this.status == Trex.status.DUCKING) {
        this.position.width = this.source.width = this.config.WIDTH_DUCK;
      }
      this.context.drawImage(this.imageSprite, this.source.x, this.source.y, this.source.width, this.source.height, this.position.x, this.position.y, this.position.width, this.position.height);
      this.context.restore();
    },
    update(durTime, opt_status) {
      this.timer += durTime;
      if (opt_status) {
        this.status = opt_status;
        this.currentFrame = 0;
        this.msPerFrame = Trex.animFrames[this.status].msPerFrame;
        this.currentAnimFrames = Trex.animFrames[this.status].frames;
      }
      this.draw(this.currentAnimFrames[this.currentFrame]);
      if (this.timer > this.msPerFrame) {
        this.currentFrame = this.currentFrame == this.currentAnimFrames.length - 1 ? 0 : (this.currentFrame + 1);
        this.timer = 0;
      }
      if (this.speedDrop && this.position.y >= this.groundYPos) {
        this.speedDrop = false;
        this.setDuck(true);
      }
    },
    startJump(speed) {
      if (!this.jumping) {
        this.update(0, Trex.status.JUMPING);
        this.jumpVelocity = this.config.INIITAL_JUMP_VELOCITY - (speed / 10); // 起跳速度随速度增大
        this.jumping = true;
        this.reachedMinHeight = false;
        this.speedDrop = false;
      }
    },
    endJump() {
      if (this.reachedMinHeight && this.jumpVelocity < this.config.DROP_VELOCITY) {
        this.jumpVelocity = this.config.DROP_VELOCITY;
      }
    },
    updateJump(durTime) {
      // 计算移动帧(frame)=时间(ms)/每帧毫秒数(ms/frame)
      var framesElapsed = durTime / this.msPerFrame;
      // 判断是否加速下落
      // 计算移动距离=速度*移动帧
      if (this.speedDrop) {
        this.position.y += Math.round(this.jumpVelocity * this.config.SPEED_DROP_COEFFICIENT * framesElapsed);
      } else {
        this.position.y += Math.round(this.jumpVelocity * framesElapsed);
      }
      // 重力加速度， 速度为负上升，速度为正下降
      this.jumpVelocity += this.config.GRAVITY * framesElapsed;
      // 达到最小高度可以加速下降
      if (this.position.y < this.minJumpHeight || this.speedDrop) {
        this.reachedMinHeight = true;
      }
      // 达到最大高度立即减速
      if (this.position.y < this.config.MAX_JUMP_HEIGHT || this.speedDrop) {
        this.endJump();
      }
      // 到达地面重置参数
      if (this.position.y >= this.groundYPos) {
        this.reset();
      }
    },
    setSpeedDrop() {
      this.speedDrop = true;
      this.jumpVelocity = 1;
    },
    setDuck(docking) {
      if (docking && this.status != Trex.status.DUCKING) {
        this.update(0, Trex.status.DUCKING);
        this.ducking = true;
      } else if (this.status == Trex.status.DUCKING) {
        this.update(0, Trex.status.RUNNING);
        this.ducking = false;
      }
    },
    reset() {
      this.position.y = this.groundYPos;
      this.jumpVelocity = 0;
      this.jumping = false;
      this.ducking = false;
      this.update(0, Trex.status.RUNNING);
      this.speedDrop = false;
    }
  }
  return Trex;
})
