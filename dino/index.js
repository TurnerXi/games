require.config({
  paths: {
    "HorizonLine": './script/horizon/horizon-line'
  }
});
require(['HorizonLine'], function (HorizonLine) {
  (function () {
    "use strict";

    function Runner(containerId) {
      if (Runner.instance_) {
        return Runner.instance_;
      }
      Runner.instance_ = this;
      this.outerContainerEl = document.getElementById(containerId) || document.body;
      this.containerEl = null;
      this.config = Runner.config;
      this.dimensions = Runner.defaultDimensions;
      this.canvas = null;
      this.canvasCtx = null;
      this.tRex = null;
      this.distanceMeter = null;
      this.distanceRan = 0;
      this.highestScore = 0;
      this.time = 0;
      this.runningTime = 0;
      this.currentSpeed = this.config.SPEED;
      this.loadImages();
    }
    var FPS = 60;
    var DEFAULT_WIDTH = 600;
    Runner.config = {
      ACCELERATION: 0.001,
      BG_CLOUD_SPEED: 0.2,
      BOTTOM_PAD: 10,
      // Scroll Y threshold at which the game can be activated.
      CANVAS_IN_VIEW_OFFSET: -10,
      CLEAR_TIME: 3000,
      CLOUD_FREQUENCY: 0.5,
      GAMEOVER_CLEAR_TIME: 750,
      GAP_COEFFICIENT: 0.6,
      GRAVITY: 0.6,
      INITIAL_JUMP_VELOCITY: 12,
      INVERT_FADE_DURATION: 12000,
      INVERT_DISTANCE: 700,
      MAX_BLINK_COUNT: 3,
      MAX_CLOUDS: 6,
      MAX_OBSTACLE_LENGTH: 3,
      MAX_OBSTACLE_DUPLICATION: 2,
      MAX_SPEED: 13,
      MIN_JUMP_HEIGHT: 35,
      MOBILE_SPEED_COEFFICIENT: 1.2,
      RESOURCE_TEMPLATE_ID: 'audio-resources',
      SPEED: 6,
      SPEED_DROP_COEFFICIENT: 3,
      ARCADE_MODE_INITIAL_TOP_POSITION: 35,
      ARCADE_MODE_TOP_POSITION_PERCENT: 0.1
    };
    Runner.defaultDimensions = {
      WIDTH: DEFAULT_WIDTH,
      HEIGHT: 150
    }
    Runner.spriteDefinition = {
      HORIZON: [2, 104],
      CLOUD: [166, 2],
      MOON: [954, 2],
      TEXT_SPRITE: [1294, 2],
      CACTUS_LARGE: [652, 2],
      CACTUS_SMALL: [446, 2],
      PTERODACTYL: [260, 2],
      RESTART: [2, 2],
      TREX: [1678, 2],
      STAR: [1276, 2]
    }
    Runner.events = {
      LOAD: "load"
    }
    Runner.classes = {
      ARCADE_MODE: 'arcade-mode',
      CANVAS: 'runner-canvas',
      CONTAINER: 'runner-container',
      CRASHED: 'crashed',
      ICON: 'icon-offline',
      INVERTED: 'inverted',
      SNACKBAR: 'snackbar',
      SNACKBAR_SHOW: 'snackbar-show',
      TOUCH_CONTROLLER: 'controller'
    };
    Runner.sprites = {
      HORIZON: [2, 104],
      CLOUD: [166, 2],
      MOON: [954, 2],
      TEXT_SPRITE: [1294, 2],
      CACTUS_LARGE: [652, 2],
      CACTUS_SMALL: [446, 2],
      PTERODACTYL: [260, 2],
      RESTART: [2, 2],
      TREX: [1678, 2],
      STAR: [1276, 2]
    }
    Runner.prototype = {
      loadImages() {
        Runner.imageSprite = document.getElementById('resource');
        this.spriteDef = Runner.spriteDefinition;
        if (Runner.imageSprite.complete) {
          this.init();
        } else {
          Runner.imageSprite.addEventListener(Runner.events.LOAD, this.init.bind(this));
        }
      },
      init() {
        this.containerEl = document.createElement("div");
        this.containerEl.className = Runner.classes.CONTAINER;
        this.scale = document.documentElement.clientWidth / Runner.defaultDimensions.WIDTH;
        this.adjustDimensions();
        var translate = Runner.defaultDimensions.HEIGHT / 2;
        this.canvas = createCanvas(this.containerEl, this.dimensions.WIDTH, this.dimensions.HEIGHT, Runner.classes.CANVAS);
        this.canvasCtx = this.canvas.getContext('2d');
        this.canvasCtx.fillStyle = '#F7F7F7';
        this.canvasCtx.fill();
        this.containerEl.style.transform = `scale(${this.scale}) translateY(${translate}px)`;
        this.containerEl.style.width = DEFAULT_WIDTH + 'px';
        this.horizon = new HorizonLine(this.canvasCtx, Runner.imageSprite, this.spriteDef, this.dimensions, this.config.GAP_COEFFICIENT);
        this.outerContainerEl.appendChild(this.containerEl);
      },
      adjustDimensions() {
        var boxStyles = window.getComputedStyle(this.outerContainerEl);
        this.dimensions.WIDTH = this.outerContainerEl.offsetWidth - parseInt(boxStyles.paddingLeft) * 2;
      },
      run(durTime) {
        this.canvasCtx.clearRect(0, 0, this.dimensions.WIDTH * this.scale, 150 * this.scale);
        this.horizon.move(3 * (FPS / 1000) * durTime);
      }
    }
    var runner = new Runner();
    var time = Date.now();
    (function move() {
      var now = Date.now();
      runner.run(now - time);
      time = now;
      window.requestAnimationFrame(move);
    }())
  }())

  function createCanvas(container, width, height, clz) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.className = clz;
    container.appendChild(canvas);
    return canvas;
  }
})
// var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
// window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
// var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
