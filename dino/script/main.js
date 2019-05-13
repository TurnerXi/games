window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
require(['./script/require.config.js'], function () {
  require(['Runner'], function (Runner) {
    new Runner("interstitial-wrapper").update();
  })
})
