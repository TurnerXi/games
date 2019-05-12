require(['./script/require.config.js'], function () {
  require(['Runner'], function (Runner) {
    var runner = new Runner();
    var time = Date.now();
    (function move() {
      var now = Date.now();
      runner.update(now - time);
      time = now;
      window.requestAnimationFrame(move);
    }())
  })
})
