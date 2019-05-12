define(function () {
  var Config = {
    FPS: 60,
    DEFAULT_WIDTH: 600,
    ACCELERATION: 0.001,
    BG_CLOUD_SPEED: 0.2,
    BOTTOM_PAD: 10,
    SPEED: 9,
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
    SPEED_DROP_COEFFICIENT: 3
  };
  Config.defaultDimensions = {
    WIDTH: Config.DEFAULT_WIDTH,
    HEIGHT: 150
  }
  Config.keycodes = {
    JUMP: { '38': 1, '32': 1 }, // Up, spacebar
    DUCK: { '40': 1 }, // Down
    RESTART: { '13': 1 } // Enter
  };
  Config.spriteDefinition = {
    HORIZON: [2, 54],
    CLOUD: [86, 2],
    MOON: [484, 2],
    TEXT_SPRITE: [655, 2],
    CACTUS_LARGE: [332, 2],
    CACTUS_SMALL: [228, 2],
    PTERODACTYL: [134, 2],
    RESTART: [2, 2],
    TREX: [848, 2],
    STAR: [645, 2]
  }
  Config.events = {
    LOAD: "load",
    KEYDOWN: "keydown",
    KEYUP: "keyup"
  }
  Config.classes = {
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
  return Config;
})
