define(['Horizon', 'Trex', 'Tools', "Config", "CollisionBox"], function (Horizon, Trex, Tools, Config, CollisionBox) {
  "use strict";

  function Runner(containerId) {
    if (Runner.instance_) {
      return Runner.instance_;
    }
    Runner.instance_ = this;
    this.outerContainerEl = document.getElementById(containerId) || document.body;
    this.containerEl = null;
    this.dimensions = Config.defaultDimensions;
    this.canvas = null;
    this.canvasCtx = null;
    this.tRex = null;
    this.distanceMeter = null;
    this.distanceRan = 0;
    this.highestScore = 0;
    this.time = 0;
    this.runningTime = 0;
    this.currentSpeed = Config.SPEED;
    this.loadImages();
  }
  Runner.prototype = {
    activated: true,
    loadImages() {
      Runner.imageSprite = document.getElementById('resource');
      this.spriteDef = Config.spriteDefinition;
      if (Runner.imageSprite.complete) {
        this.init();
      } else {
        Runner.imageSprite.addEventListener(Config.events.LOAD, this.init.bind(this));
      }
    },
    init() {
      document.body.classList.add(Config.classes.ARCADE_MODE);
      this.containerEl = document.createElement("div");
      this.containerEl.className = Config.classes.CONTAINER;
      this.adjustDimensions();
      this.containerEl.style.width = this.dimensions.WIDTH + 'px';
      this.containerEl.style.height = this.dimensions.HEIGHT + 'px';
      this.canvas = Tools.createCanvas(this.containerEl, this.dimensions.WIDTH, this.dimensions.HEIGHT, Config.classes.CANVAS);
      this.canvasCtx = this.canvas.getContext('2d');
      this.canvasCtx.fillStyle = '#F7F7F7';
      this.canvasCtx.fill();
      this.horizon = new Horizon(this.canvas, Runner.imageSprite, this.spriteDef, this.dimensions, Config.GAP_COEFFICIENT);
      this.tRex = new Trex(this.canvas, Runner.imageSprite, this.spriteDef.TREX, this.dimensions);
      this.outerContainerEl.appendChild(this.containerEl);
      this.startListening();
    },
    adjustDimensions() {
      var boxStyles = window.getComputedStyle(this.outerContainerEl);
      this.dimensions.WIDTH = this.outerContainerEl.offsetWidth - parseInt(boxStyles.paddingLeft) * 2;
      this.dimensions.WIDTH = Math.min(Config.DEFAULT_WIDTH, this.dimensions.WIDTH);
      this.adjustCanvasScale();
    },
    adjustCanvasScale() {
      var windowHeight = window.innerHeight;
      var scaleHeight = windowHeight / this.dimensions.HEIGHT;
      var scaleWidth = window.innerWidth / this.dimensions.WIDTH;
      var scale = Math.max(1, Math.min(scaleHeight, scaleWidth));
      var scaledCanvasHeight = this.dimensions.HEIGHT * scale;
      var translateY = Math.ceil(Math.max(0, (windowHeight - scaledCanvasHeight) / 10)) * window.devicePixelRatio;
      this.containerEl.style.transform = 'scale(' + scale + ') translateY(' + translateY + 'px)';
    },
    update(durTime) {
      this.canvasCtx.clearRect(0, 0, this.dimensions.WIDTH, this.dimensions.HEIGHT);
      if (this.tRex.status == Trex.status.JUMPING) {
        this.tRex.updateJump(durTime);
      }
      this.runningTime += durTime;
      var hasObstacles = this.runningTime > Config.CLEAR_TIME;
      this.horizon.update(durTime, this.currentSpeed, hasObstacles);
      var collision = hasObstacles && this.horizon.obstacles.length > 0 && checkForCollision(this.horizon.obstacles[0], this.tRex, this.canvasCtx);
      if (collision) {
        console.log('gameover');
      }
      this.tRex.update(durTime);
    },
    startListening() {
      document.addEventListener(Config.events.KEYDOWN, this);
      document.addEventListener(Config.events.KEYUP, this);
    },
    handleEvent(event) {
      switch (event.type) {
      case Config.events.KEYDOWN:
        this.onKeyDown(event);
        break;
      case Config.events.KEYUP:
        this.onKeyUp(event);
        break;
      }
    },
    onKeyDown(event) {
      if (Config.keycodes.JUMP[event.keyCode]) {
        if (!this.tRex.jumping && !this.tRex.ducking) {
          this.tRex.startJump(this.currentSpeed);
        }
      } else if (Config.keycodes.DUCK[event.keyCode]) {
        if (this.tRex.jumping) {
          this.tRex.setSpeedDrop();
        } else if (!this.tRex.ducking) {
          this.tRex.setDuck(true);
        }
      }
    },
    onKeyUp(event) {
      var isjump = Config.keycodes.JUMP[event.keyCode];
      if (this.tRex.jumping && isjump) {
        this.tRex.endJump();
      } else if (this.tRex.ducking) {
        this.tRex.setDuck(false);
      }
    }
  }

  function checkForCollision(obstacle, tRex, opt_canvasCtx) {
    var tRexBox = new CollisionBox(tRex.position.x, tRex.position.y, tRex.position.width, tRex.position.height);
    var obstacleBox = new CollisionBox(obstacle.position.x, obstacle.position.y, obstacle.position.width, obstacle.position.height);
    if (opt_canvasCtx) {
      // Tools.drawCollisionBox(opt_canvasCtx, tRexBox, obstacleBox);
    }
    if (compareBox(tRexBox, obstacleBox)) {
      var tRexCollisionBoxes = tRex.ducking ? Trex.collisionBoxes.DUCKING : Trex.collisionBoxes.RUNNING;
      var obstacleCollisionBoxes = obstacle.collisionBoxes;
      for (var i = 0; i < tRexCollisionBoxes.length; i++) {
        for (var j = 0; j < obstacleCollisionBoxes.length; j++) {
          var adjTrexBox = createAdjustedCollisionBox(tRexCollisionBoxes[i], tRexBox);
          var adjObstacleBox = createAdjustedCollisionBox(obstacleCollisionBoxes[j], obstacleBox);
          var crashed = compareBox(adjTrexBox, adjObstacleBox);
          if (opt_canvasCtx) {
            Tools.drawCollisionBox(opt_canvasCtx, adjTrexBox, adjObstacleBox);
          }
          if (crashed) {
            return [adjTrexBox, adjObstacleBox];
          }
        }
      }
    }
    return false;
  }

  function createAdjustedCollisionBox(box, adjustment) {
    return new CollisionBox(box.x + adjustment.x, box.y + adjustment.y, box.width, box.height);
  };

  function compareBox(box1, box2) {
    return box1.x < box2.x + box2.width && box1.x + box1.width > box2.x && box1.y < box2.y + box2.height && box1.y + box1.height > box2.y
  }
  return Runner;
})
// var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
// window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
// var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
