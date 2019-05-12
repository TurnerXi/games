define(function () {
  function getRandomNum(begin, end) {
    return Math.floor(Math.random() * (end - begin) + begin);
  }

  function cloneArray(arr, isdeep) {
    var target = [];
    for (var i = 0; i < arr.length; i++) {
      target[i] = cloneObject(arr[i], isdeep);
    }
    return target;
  }

  function cloneObject(obj, isdeep) {
    if (obj && typeof obj == 'object') {
      if (obj instanceof Array) {
        return cloneArray(obj, isdeep);
      } else {
        var copy = {};
        for (var key in obj) {
          copy[key] = isdeep ? cloneObject(obj[key]) : obj[key];
        }
        return copy;
      }
    }
    return obj;
  }

  function createCanvas(container, width, height, clz) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.className = clz;
    container.appendChild(canvas);
    return canvas;
  }

  function drawCollisionBox(context, ...boxes) {
    context.save();
    boxes.forEach((item, idx) => {
      context.strokeStyle = idx % 2 == 0 ? '#f00' : "0f0";
      context.strokeRect(item.x, item.y, item.width, item.height);
    });
    context.restore();
  }
  return {
    getRandomNum,
    createCanvas,
    cloneArray,
    cloneObject,
    drawCollisionBox
  }
})
