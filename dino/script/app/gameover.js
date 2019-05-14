define(["Config"],function (Config) {
  GameOverPanel.dimensions = {
    TEXT_X: 0,
    TEXT_Y: 13,
    TEXT_WIDTH: 191,
    TEXT_HEIGHT: 11,
    RESTART_WIDTH: 36,
    RESTART_HEIGHT: 32
  };

  function GameOverPanel(canvas, imageSprite, txtImgPos, restartImgPos, dimensions) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.imageSprite = imageSprite;
    this.txtImgPos = txtImgPos;
    this.restartImgPos = restartImgPos;
    this.dimensions = dimensions;
    this.txtSource = { x: txtImgPos[0], y: txtImgPos[1]+GameOverPanel.dimensions.TEXT_Y, width: GameOverPanel.dimensions.TEXT_WIDTH, height: GameOverPanel.dimensions.TEXT_HEIGHT };
    this.txtPosition = { x: (dimensions.WIDTH - GameOverPanel.dimensions.TEXT_WIDTH) / 2, y: 2, width: GameOverPanel.dimensions.TEXT_WIDTH, height: GameOverPanel.dimensions.TEXT_HEIGHT };
    this.restartSource = { x: restartImgPos[0], y: restartImgPos[1], width: GameOverPanel.dimensions.RESTART_WIDTH, height: GameOverPanel.dimensions.RESTART_HEIGHT };
    this.restartPosition = { x: (dimensions.WIDTH - GameOverPanel.dimensions.RESTART_WIDTH) / 2, y: (dimensions.HEIGHT - GameOverPanel.dimensions.RESTART_HEIGHT) / 2, width: GameOverPanel.dimensions.RESTART_WIDTH, height: GameOverPanel.dimensions.RESTART_HEIGHT };
    this.init();
  }

  GameOverPanel.prototype = {
    init() {
      this.draw();
    },
    draw() {
      this.context.save();
      this.context.drawImage(this.imageSprite,
        this.txtSource.x, this.txtSource.y,
        this.txtSource.width, this.txtSource.height,
        this.txtPosition.x, this.txtPosition.y,
        this.txtPosition.width, this.txtPosition.height);
      this.context.drawImage(this.imageSprite,
        this.restartSource.x, this.restartSource.y,
        this.restartSource.width, this.restartSource.height,
        this.restartPosition.x, this.restartPosition.y,
        this.restartPosition.width, this.restartPosition.height);
      this.context.restore();
    }
  }
  return GameOverPanel;
})
