define(function () {

  /**
   * @enum {number}
   */
  DistanceMeter.dimensions = {
    WIDTH: 10,
    HEIGHT: 13,
    DEST_WIDTH: 11
  };

  /**
   * Y positioning of the digits in the sprite sheet.
   * X position is always 0.
   * @type {Array<number>}
   */
  DistanceMeter.yPos = [0, 13, 27, 40, 53, 67, 80, 93, 107, 120];

  /**
   * Distance meter config.
   * @enum {number}
   */
  DistanceMeter.config = {
    // Number of digits.
    MAX_DISTANCE_UNITS: 5,

    // Distance that causes achievement animation.
    ACHIEVEMENT_DISTANCE: 100,

    // Used for conversion from pixel distance to a scaled unit.
    COEFFICIENT: 0.025,

    // Flash duration in milliseconds.
    FLASH_DURATION: 1000 / 4,

    // Flash iterations for achievement animation.
    FLASH_ITERATIONS: 3,

    // Padding around the high score hit area.
    HIGH_SCORE_HIT_AREA_PADDING: 4
  };

  function DistanceMeter(canvas, imageSprite, spritePos, dimensions) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.imageSprite = imageSprite;
    this.spritePos = spritePos;
    this.archivement = false;
    this.maxScoreUnits = DistanceMeter.config.MAX_DISTANCE_UNITS;
    this.digits = [];
    this.maxScore = 0;
    this.highScore = [];
    this.defaultString = '';
    this.flashTimer = 0;
    this.flashIterations = 0;
    this.source = { x: spritePos[0], y: spritePos[1], width: DistanceMeter.dimensions.WIDTH, height: DistanceMeter.dimensions.HEIGHT };
    var posX = dimensions.WIDTH - DistanceMeter.dimensions.DEST_WIDTH * (this.maxScoreUnits + 1);
    this.position = { x: posX, y: DistanceMeter.config.HIGH_SCORE_HIT_AREA_PADDING, width: DistanceMeter.dimensions.WIDTH, height: DistanceMeter.dimensions.HEIGHT };
    this.init();
  }

  DistanceMeter.prototype = {
    init() {
      //  初始面板；
      var maxScore = '';
      for (var i = 0; i < this.maxScoreUnits; i++) {
        this.draw(i, 0);
        this.defaultString += '0';
        maxScore += '9';
      }
      this.maxScore = parseInt(maxScore);
      this.setHighScore(0);
    },
    draw(idx, value, opt_highScore) {
      var sourceOffsetX = DistanceMeter.dimensions.WIDTH * value;
      var distOffsetX = DistanceMeter.dimensions.DEST_WIDTH * idx;
      this.context.save();
      if (opt_highScore) {
        this.context.translate(-DistanceMeter.dimensions.DEST_WIDTH * (this.maxScoreUnits * 2), 0);
      }
      this.context.drawImage(this.imageSprite,
        this.source.x + sourceOffsetX, this.source.y,
        this.source.width, this.source.height,
        this.position.x + distOffsetX, this.position.y,
        this.position.width, this.position.height
      )
      this.context.restore();
    },
    drawHighScore() {
      this.context.save();
      this.context.globalAlpha = .8;
      for (var i = this.highScore.length - 1; i >= 0; i--) {
        this.draw(i, this.highScore[i], true);
      }
      this.context.restore();
    },
    setHighScore: function (distance) {
      distance = this.getActualDistance(distance || 0);
      var highScoreStr = (this.defaultString + distance).substr(-this.maxScoreUnits);
      this.highScore = ['10', '11', '12'].concat(highScoreStr.split(''));
    },
    update(durTime, distance) {
      var playSound = false;
      var paint = true;
      if (!this.archivement) { // 增加
        distance = this.getActualDistance(distance);
        if (distance > 0) {
          if (distance % DistanceMeter.config.ACHIEVEMENT_DISTANCE == 0) {
            this.flashTimer = 0;
            this.flashIterations = 0;
            this.archivement = true;
            playSound = true;
          }
          this.digits = (this.defaultString + distance).substr(-this.maxScoreUnits).split('');
        } else {
          this.digits = this.defaultString.split('');
        }
      } else {
        if (this.flashIterations <= DistanceMeter.config.FLASH_ITERATIONS) {
          this.flashTimer += durTime;
          if (this.flashTimer < DistanceMeter.config.FLASH_DURATION) {
            paint = false;
          } else if (this.flashTimer > DistanceMeter.config.FLASH_DURATION * 2) {
            this.flashTimer = 0;
            this.flashIterations++;
          }
        } else {
          this.flashTimer = 0;
          this.flashIterations = 0;
          this.archivement = false;
        }
      }
      if (paint) {
        for (var i = this.maxScoreUnits; i >= 0; i--) {
          this.draw(i, this.digits[i]);
        }
      }
      this.drawHighScore();
      return playSound;
    },
    getActualDistance(distance) {
      return distance && parseInt(distance * DistanceMeter.config.COEFFICIENT);
    },
    reset() {
      this.update(0);
      this.achievement = false;
    }
  }

  return DistanceMeter;
})
