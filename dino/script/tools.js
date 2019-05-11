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
  return {
    getRandomNum,
    cloneArray,
    cloneObject
  }
})
