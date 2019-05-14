/**
 * Horizon包含水平线/云朵/月亮/星星
 * @param  {[type]} HorizonLine [description]
 * @return {[type]}             [description]
 */
define(["HorizonLine", "Cloud", "Obstacle", "Tools", "Config"], function (HorizonLine, Cloud, Obstacle, Tools, Config) {
  Horizon.config = {
    BG_CLOUD_SPEED: 0.2,
    BUMPY_THRESHOLD: .3,
    CLOUD_FREQUENCY: .5,
    HORIZON_HEIGHT: 16,
    MAX_CLOUDS: 6,
    MAX_OBSTACLE_DUPLICATION: 2
  };

  function Horizon(canvas, imageSprite, spritePos, dimensions, gapCoefficient) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.config = Horizon.config;
    this.dimensions = dimensions;
    this.imageSprite = imageSprite;
    this.spritePos = spritePos;
    this.gapCoefficient = gapCoefficient;
    this.cloudSpeed = Horizon.config.BG_CLOUD_SPEED;
    this.horizonLine = null;
    this.clouds = [];
    this.obstacles = [];
    this.historyObstacles = [];
    this.runningTime = 0;
    this.init();
  }
  Horizon.prototype = {
    init() {
      this.addClouds();
      this.horizonLine = new HorizonLine(this.canvas, this.imageSprite, this.spritePos);
    },
    addClouds() {
      this.clouds.push(new Cloud(this.canvas, this.imageSprite, this.spritePos.CLOUD, this.dimensions.WIDTH));
    },
    update(durTime, currentSpeed, hasObstacles) {
      this.runningTime += durTime;
      this.horizonLine.update(durTime, currentSpeed);
      this.updateClouds(durTime, currentSpeed);
      if (hasObstacles) {
        this.updateObstacles(durTime, currentSpeed);
      }
    },
    updateClouds(durTime, currentSpeed) {
      var cloudSpeed = this.cloudSpeed * durTime * currentSpeed / 1000;
      var cloudNum = this.clouds.length;
      var lastCloud = this.clouds[cloudNum - 1];
      if (cloudNum < this.config.MAX_CLOUDS && this.dimensions.WIDTH - lastCloud.position.x >= lastCloud.cloudGap && this.config.CLOUD_FREQUENCY > Math.random()) {
        this.addClouds();
      }
      this.clouds.forEach((item) => {
        item.update(cloudSpeed);
      })
      this.clouds = this.clouds.filter((item) => !item.removed);
    },
    updateObstacles(durTime, currentSpeed) {
      var obNum = this.obstacles.length;
      if (obNum > 0) {
        for (var i = 0; i < obNum; i++) {
          var obstacle = this.obstacles[i];
          obstacle.update(durTime, currentSpeed);
          if (obstacle.removed) {
            this.obstacles.shift();
            i--;
            obNum--;
          }
        }
        var lastObstacle = this.obstacles[this.obstacles.length - 1];
        if (lastObstacle && !lastObstacle.followed && this.dimensions.WIDTH - lastObstacle.width - lastObstacle.position.x >= lastObstacle.gap) {
          this.addNewObstacle(currentSpeed);
          lastObstacle.followed = true;
        }
      } else {
        this.addNewObstacle(currentSpeed);
      }
    },
    addNewObstacle(currentSpeed) {
      var obstacleType = Obstacle.types[Tools.getRandomNum(0, Obstacle.types.length)];
      if (this.duplicateObstacleCheck(obstacleType.type) || currentSpeed < obstacleType.minSpeed) {
        this.addNewObstacle(currentSpeed);
      } else {
        var spritePos = this.spritePos[obstacleType.type];
        var obstacle = new Obstacle(this.canvas, this.imageSprite, obstacleType, spritePos, this.dimensions, this.gapCoefficient, currentSpeed, obstacleType.width);
        this.obstacles.push(obstacle);
        this.historyObstacles.unshift(obstacleType.type);
        if (this.historyObstacles.length > 1) {
          this.historyObstacles.splice(Horizon.config.MAX_OBSTACLE_DUPLICATION);
        }
      }
    },
    duplicateObstacleCheck(nextObstacleType) {
      var duplicateCount = 0;
      for (var i = 0; i < this.historyObstacles.length; i++) {
        duplicateCount += Number(this.historyObstacles[i] == nextObstacleType);
      }
      return duplicateCount >= Horizon.config.MAX_OBSTACLE_DUPLICATION;
    },
    reset() {
      this.runningTime = 0;
      this.obstacles = [];
      this.horizonLine.reset();
    }
  }
  return Horizon;
})
