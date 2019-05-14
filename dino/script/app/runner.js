define(['Horizon', 'Trex', 'Tools', "Config", "CollisionBox", "DistanceMeter", "GameOverPanel"], function (Horizon, Trex, Tools, Config, CollisionBox, DistanceMeter, GameOverPanel) {
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
    this.highestScore = 0;
    this.time = 0;
    this.runningTime = 0;
    this.distanceRan = 0;
    this.distanceMeter = null;
    this.config = Config;
    this.msPerFrame = 1000 / Config.FPS;
    this.currentSpeed = Config.SPEED;
    this.crashed = false;
    this.playing = false;
    this.playingIntro = false;
    this.activated = false;
    this.playCount = 0;
    this.soundFx = {};
    this.loadImages();
  }
  Runner.prototype = {
    loadImages() {
      Runner.imageSprite = document.getElementById('resource');
      this.spriteDef = Config.spriteDefinition;
      if (Runner.imageSprite.complete) {
        this.init();
      } else {
        Runner.imageSprite.addEventListener(Config.events.LOAD, this.init.bind(this));
      }
    },
    loadSounds: function () {
      this.audioContext = new AudioContext();
      var resourceTemplate = document.getElementById(this.config.RESOURCE_TEMPLATE_ID).content;
      for (var sound in this.config.sounds) {
        var soundSrc = resourceTemplate.getElementById(this.config.sounds[sound]).src;
        soundSrc = soundSrc.substr(soundSrc.indexOf(',') + 1);
        var buffer = Tools.decodeBase64ToArrayBuffer(soundSrc);

        // Async, so no guarantee of order in array.
        this.audioContext.decodeAudioData(buffer, function (index, audioData) {
          this.soundFx[index] = audioData;
        }.bind(this, sound));
      }
    },
    init() {
      this.adjustDimensions();
      this.containerEl = document.createElement("div");
      this.containerEl.className = Config.classes.CONTAINER;
      this.canvas = Tools.createCanvas(this.containerEl, this.dimensions.WIDTH, this.dimensions.HEIGHT, Config.classes.CANVAS);
      this.canvasCtx = this.canvas.getContext('2d');
      this.canvasCtx.fillStyle = '#F7F7F7';
      this.canvasCtx.fill();
      this.horizon = new Horizon(this.canvas, Runner.imageSprite, this.spriteDef, this.dimensions, Config.GAP_COEFFICIENT);
      this.tRex = new Trex(this.canvas, Runner.imageSprite, this.spriteDef.TREX, this.dimensions);
      this.distanceMeter = new DistanceMeter(this.canvas, Runner.imageSprite, this.spriteDef.TEXT_SPRITE, this.dimensions);
      this.outerContainerEl.appendChild(this.containerEl);
      this.startListening();
    },
    adjustDimensions() {
      var boxStyles = window.getComputedStyle(this.outerContainerEl);
      this.dimensions.WIDTH = this.outerContainerEl.offsetWidth - parseInt(boxStyles.paddingLeft) * 2;
      this.dimensions.WIDTH = Math.min(Config.DEFAULT_WIDTH, this.dimensions.WIDTH);
      if (this.activated) {
        this.setArcadeModeContainerScale();
      }
    },
    playIntro() {
      if (!this.activated && !this.crashed) {
        this.playingIntro = true;
        this.tRex.playingIntro = true;
        var keyframes = '@-webkit-keyframes intro { ' +
          'from { width:' + Trex.config.WIDTH + 'px }' +
          'to { width: ' + this.dimensions.WIDTH + 'px }' +
          '}';
        document.styleSheets[0].insertRule(keyframes, 0);
        document.addEventListener(Config.events.ANIM_END, this.startGame.bind(this));
        this.containerEl.style.webkitAnimation = 'intro .4s ease-out 1 both';
        this.containerEl.style.width = this.dimensions.WIDTH + 'px';
        this.playing = true;
        this.activated = true;
      } else if (this.crashed) {
        this.restart();
      }
    },
    startGame() {
      this.setArcadeMode();
      this.playingIntro = false;
      this.runningTime = 0;
      this.tRex.playingIntro = false;
      this.containerEl.style.webkitAnimation = '';
      this.playCount++;
    },
    restart() {
      if (!this.raqId) {
        this.playCount++;
        this.runningTime = 0;
        this.playing = true;
        this.paused = false;
        this.crashed = false;
        this.distanceRan = 0;
        this.currentSpeed = this.config.SPEED;
        this.time = Date.now();
        this.containerEl.classList.remove(Config.classes.CRASHED);
        this.clearCanvas();
        this.distanceMeter.reset(this.highestScore);
        this.horizon.reset();
        this.tRex.reset();
        this.playSound(this.soundFx.BUTTON_PRESS);
        this.update();
      }
    },
    play() {
      if (!this.crashed) {
        this.playing = true;
        this.paused = false;
        this.tRex.update(0, Trex.status.RUNNING);
        this.time = Date.now();
        this.update();
      }
    },
    stop() {
      this.playing = false;
      this.paused = true;
      cancelAnimationFrame(this.raqId);
      this.raqId = 0;
    },
    setArcadeMode() {
      document.body.classList.add(Config.classes.ARCADE_MODE);
      this.setArcadeModeContainerScale();
    },
    setArcadeModeContainerScale() {
      var windowHeight = window.innerHeight;
      var scaleHeight = windowHeight / this.dimensions.HEIGHT;
      var scaleWidth = window.innerWidth / this.dimensions.WIDTH;
      var scale = Math.max(1, Math.min(scaleHeight, scaleWidth));
      var scaledCanvasHeight = this.dimensions.HEIGHT * scale;
      var translateY = Math.ceil(Math.max(0, (windowHeight - scaledCanvasHeight) / 10)) * window.devicePixelRatio;
      this.containerEl.style.transform = 'scale(' + scale + ') translateY(' + translateY + 'px)';
    },
    update() {
      this.updatePending = false;
      var now = Date.now();
      var durTime = now - (this.time || now); // 当前时间为0则durTime设为0
      this.time = now;
      if (this.playing) {
        this.clearCanvas();
        if (this.tRex.jumping) {
          this.tRex.updateJump(durTime);
        }
        if (this.tRex.jumpCount == 1 && !this.playingIntro) {
          this.playIntro();
        }
        this.runningTime += durTime;
        var hasObstacles = this.runningTime > Config.CLEAR_TIME;
        if (this.playingIntro) {
          this.horizon.update(0, this.currentSpeed, hasObstacles);
        } else {
          durTime = !this.activated ? 0 : durTime;
          this.horizon.update(durTime, this.currentSpeed, hasObstacles);
        }

        var collision = hasObstacles && this.horizon.obstacles.length > 0 && checkForCollision(this.horizon.obstacles[0], this.tRex);
        if (collision) {
          this.gameOver();
        } else {
          this.distanceRan += durTime * this.currentSpeed / this.msPerFrame;
          if (this.currentSpeed < Config.MAX_SPEED) {
            this.currentSpeed += Config.ACCELERATION * this.currentSpeed;
          }
        }
        var playAchievementSound = this.distanceMeter.update(durTime, Math.ceil(this.distanceRan));

        if (playAchievementSound) {
          this.playSound(this.soundFx.SCORE);
        }

      }
      if (this.playing || (!this.activated && this.tRex.blinkCount < Config.MAX_BLINK_COUNT)) {
        this.tRex.update(durTime);
        this.scheduleNextUpdate();
      }
    },
    gameOver() {
      this.playSound(this.soundFx.HIT);
      this.playing = false;
      this.stop();

      this.crashed = true;
      this.distanceMeter.achievement = false;
      this.tRex.update(100, Trex.status.CRASHED);

      if (!this.gameOverPanel) {
        this.gameOverPanel = new GameOverPanel(this.canvas, Runner.imageSprite,
          this.spriteDef.TEXT_SPRITE, this.spriteDef.RESTART,
          this.dimensions);
      } else {
        this.gameOverPanel.draw();
      }

      if (this.distanceRan > this.highestScore) {
        this.saveHighScore(this.distanceRan);
      }
      this.time = Date.now();
    },
    saveHighScore(distanceRan) {
      this.highestScore = Math.ceil(distanceRan);
      this.distanceMeter.setHighScore(this.highestScore);
    },
    scheduleNextUpdate() {
      if (!this.updatePending) {
        this.updatePending = true;
        this.raqId = window.requestAnimationFrame(this.update.bind(this));
      }
    },
    playSound: function (soundBuffer) {
      if (soundBuffer) {
        var sourceNode = this.audioContext.createBufferSource();
        sourceNode.buffer = soundBuffer;
        sourceNode.connect(this.audioContext.destination);
        sourceNode.start(0);
      }
    },
    clearCanvas() {
      this.canvasCtx.clearRect(0, 0, this.dimensions.WIDTH, this.dimensions.HEIGHT);
    },
    startListening() {
      document.addEventListener(Config.events.KEYDOWN, this);
      document.addEventListener(Config.events.KEYUP, this);
      this.containerEl.addEventListener(Config.events.TOUCHSTART, this);
      document.addEventListener(Config.events.POINTERDOWN, this);
      document.addEventListener(Config.events.POINTERUP, this);
    },
    handleEvent(event) {
      switch (event.type) {
      case Config.events.KEYDOWN:
      case Config.events.TOUCHSTART:
      case Config.events.POINTERDOWN:
        this.onKeyDown(event);
        break;
      case Config.events.KEYUP:
      case Config.events.TOUCHEND:
      case Config.events.POINTERUP:
        this.onKeyUp(event);
        break;
      }
    },
    onKeyDown(event) {
      if (!this.crashed) {
        if (Config.keycodes.JUMP[event.keyCode] || event.type == Config.events.TOUCHSTART || event.type == Config.events.POINTERDOWN) {
          if (!this.playing) {
            this.loadSounds();
            this.playing = true;
            this.update();
          }
          if (!this.tRex.jumping && !this.tRex.ducking) {
            this.playSound(this.soundFx.BUTTON_PRESS);
            this.tRex.startJump(this.currentSpeed);
          }
        } else if (Config.keycodes.DUCK[event.keyCode]) {
          if (this.tRex.jumping) {
            this.tRex.setSpeedDrop();
          } else if (!this.tRex.ducking) {
            this.tRex.setDuck(true);
          }
        }
      } else if (Config.keycodes.JUMP[event.keyCode] || event.type == Config.events.TOUCHSTART || event.type == Config.events.POINTERDOWN) {
        this.restart();
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
