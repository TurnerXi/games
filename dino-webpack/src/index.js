import * as sprite from 'static/img/sprite.png'
// document.body.innerHTML = `<img src="${sprite}"/>`;
document.addEventListener("DOMContentLoaded", function () {
  var c = document.getElementById("canvas");
  var ctx = c.getContext("2d");
  var imgEle = new Image();
  imgEle.src = sprite;
  imgEle.addEventListener("load",function () {
    Promise.all([
      // Cut out two sprites from the sprite sheet
      createImageBitmap(imgEle, 0, 0, 32, 32),
      createImageBitmap(imgEle, 32, 0, 32, 32)
    ]).then(function (sprites) {
      // Draw each sprite onto the canvas
      ctx.drawImage(sprites[0], 0, 0);
      ctx.drawImage(sprites[1], 32, 32);
    }).catch((err) => {
      console.log(err)
    });
  })

})
