document.addEventListener('DOMContentLoaded', function () {
  init(20, 20, 50);
})

function init(row, col, bomb) {
  var opened = 0;
  var main = document.getElementById('main');
  main.innerHTML = "";
  main.style.width = (col * 40 + 2) + 'px';
  main.style.height = (row * 40 + 2) + 'px';
  var cells = initCells();
  fillBombs();
  render();
  initEvent();

  function initCells() {
    var cells = new Array(col);
    for (var i = 0; i < col; i++) {
      cells[i] = new Array(row);
      for (var j = 0; j < row; j++) {
        cells[i][j] = { val: 0, status: 0 }; // 0: 关闭 1:打开 2:标记
      }
    }
    return cells;
  }

  function fillBombs() {
    var b = bomb;
    while (b > 0) {
      var x = Math.floor(Math.random() * col);
      var y = Math.floor(Math.random() * row);
      if (cells[x][y].val != -1) {
        cells[x][y].val = -1;
        iteratorSibs(x, y, cell => { cell.val != -1 && cell.val++; });
        b--;
      }
    }
  }

  function render() {
    for (var y = 0; y < cells.length; y++) {
      var div = document.createElement('div');
      for (var x = 0; x < cells[y].length; x++) {
        var span = document.createElement('span');
        span.setAttribute('x', x);
        span.setAttribute('y', y);
        div.appendChild(span);
      }
      main.appendChild(div);
    }
  }

  function open(x, y) {
    var cell = cells[x][y];
    if (cell.status != 0) { return; }
    select(x, y);
    cell.status = 1;
    opened++;
    if (cell.val == 0) {
      iteratorSibs(x, y, (cell, i, j) => { open(i, j) });
    } else if (cell.val == -1) {
      for (var i = 0; i < col; i++) {
        for (var j = 0; j < row; j++) {
          if (cells[i][j].val == -1 && cells[i][j].status != 2) {
            select(i, j);
          }
        }
      }
      gameover('lose');
    }
    if (cell.val != -1 && iswin()) {
      gameover('win');
    }
  }

  function gameover(result) {
    var mask = document.createElement("div");
    mask.className = result;
    main.appendChild(mask);
    if (result == 'lose') {
      popResult(mask, ['GAME', 'OVER']);
    } else {
      popResult(mask, ['K.', 'O.']);
    }
    mask.onclick = function () {
      //init(row, col, bomb);
      //mask.remove();
	  window.location.reload()
    }
  }

  function popResult(mask, strs) {
    var tag = document.createElement('p');
    mask.appendChild(tag);
    setTimeout(() => {
      tag.innerHTML = `${strs[0]} <span class='hide'>${strs[1]}</span>`;
    }, 200);
    setTimeout(() => {
      tag.innerHTML = `${strs[0]} ${strs[1]}`;
    }, 1000);
  }

  function iswin() {
    return opened == row * col - bomb;
  }

  function select(x, y) {
    var span = main.children[y].children[x];
    var cell = cells[x][y];
    if (cell.val == -1) {
      span.className = 'bomb';
    } else {
      span.className = 'open';
      span.innerHTML = cell.val || '';
      span.style.color = ["", "#0433FF", "#019F02", "#FF2600", "#971D94", "#FF7F28", "#FE3FFF"][cell.val];
    }
  }

  function toggleTag(x, y) {
    var span = main.children[y].children[x];
    var cell = cells[x][y];
    span.className = cell.status == 2 ? 'flag' : '';
  }

  function calcSiblings(x, y) {
    var left = Math.max(0, x - 1);
    var right = Math.min(col - 1, x + 1);
    var top = Math.max(0, y - 1);
    var bottom = Math.min(row - 1, y + 1);
    return { left, right, top, bottom };
  }

  function iteratorSibs(x, y, callback) {
    var siblings = calcSiblings(x, y);
    for (var i = siblings.left; i <= siblings.right; i++) {
      for (var j = siblings.top; j <= siblings.bottom; j++) {
        callback(cells[i][j], i, j);
      }
    }
  }

  function initEvent() {
    main.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    }, false);
	const mousedown = function (e) {
      var span = e.target;
      if (span instanceof HTMLElement && main.contains(span) && span != main) {
        var x = Number(span.getAttribute('x'));
        var y = Number(span.getAttribute('y'));
        var cell = cells[x][y];
        if (e.button == 0) {
          if (cell.status == 0) {
            open(x, y);
          } else if (cell.status == 1) { // 已打开双击展开
            if (Date.now() - lastclick <= 200) {
              var tags = cell.val;
              iteratorSibs(x, y, (cell, i, j) => {
                cell.status == 2 && tags--;
              });
              if (tags <= 0) {
                iteratorSibs(x, y, (cell, i, j) => { open(i, j) });
              }
            }
            lastclick = Date.now();
          }
        } else if (e.button == 2 && cell.status != 1) {
          cell.status = Math.abs(cell.status - 2);
          toggleTag(x, y);
        }
      }
    }
    var lastclick = Date.now();
	main.removeEventListener('mousedown', mousedown, false);
    main.addEventListener('mousedown', mousedown, false);
  }
}
