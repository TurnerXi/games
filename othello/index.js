// 1: white 2: black
const ROW = 8;
const DIRECTIONS = [
  [1, 0],
  [-1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1]
]
class OthelloPattern {
  constructor() {
    this.board = [
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 1, 2, 0, 0, 0,
      0, 0, 0, 2, 1, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0
    ];
    this.canMove = false;
    this.replaces = [];
    this.count = {
      1: 2,
      2: 2
    }
  }
  move(idx, color, isCheckOnly) {
    if (this.board[idx] === 0) {
      // let current = isWhite ? 1 : 2;
      this.canMove = false;
      for (let i = 0; i < DIRECTIONS.length; i++) {
        let dirX = DIRECTIONS[i][0];
        let dirY = DIRECTIONS[i][1];
        let nextPos = idx + dirX + dirY * ROW;
        let hasOppsite = this.board[nextPos] == 3 - color;
        let isReplace = this.replaceChesses(color, idx, dirX, dirY, isCheckOnly);
        if (hasOppsite && isReplace) {
          this.canMove = true;
        }
      }
      if (this.canMove && !isCheckOnly) {
        this.board[idx] = color;
        this.count[color]++;
      }
      return this.canMove;
    }
  }
  /**
   * 吃子
   * @return {[type]} [description]
   */
  replaceChesses(color, idx, dirX, dirY, isCheckOnly) {
    let x = idx % ROW + dirX;
    let y = ((idx - idx % ROW) / ROW) + dirY;
    // 移动到末尾没有匹配到相同棋子时返回false
    if (x >= ROW || x < 0 || y < 0 || y >= ROW) {
      return false;
    }
    idx = y * ROW + x;
    if (this.board[idx] == 0) {
      return false;
    }
    // 匹配到相同棋子时返回true
    if (this.board[idx] === color) {
      return true;
    }
    // 继续匹配
    let isMatch = this.replaceChesses(color, idx, dirX, dirY, isCheckOnly);
    // 如果匹配到相同棋子则替换
    if (isMatch && !isCheckOnly) {
      this.count[3 - color]--;
      this.count[color]++;
      this.board[idx] = color;
      this.replaces.push(idx);
    }
    return isMatch;
  }
}
class OthelloGame {
  constructor(pattern) {
    this.pattern = pattern;
    this.isGameOver = false;
    this.color = 2;
    this.round = 0;
  }
  move(x, y) {
    let idx = y * ROW + x;
    if (!this.isGameOver) {
      this.pattern.move(idx, this.color);
      if (this.pattern.canMove) {
        this.round += 0.5;
        if (this.pattern.count[3 - this.color] == 0 || this.round === Math.pow(ROW, 2)) {
          this.isGameOver = true;
        }
      }
      if (this.checkPass()) {
        this.color = 3 - this.color;
      }
    }
    return this.pattern.canMove;
  }
  checkPass() {
    for (let i = 0; i < this.pattern.board.length; i++) {
      if (this.pattern.move(i, this.color, true)) {
        return true;
      }
    }
    return false;
  }
}

function print(board) {
  let str = '';
  board.forEach((item, idx) => {
    if (idx % ROW === 0) {
      str += '\n';
    }
    str += item + ' ';
  })
  console.log(str);
}
let game = new OthelloGame(new OthelloPattern());
print(game.pattern.board);
game.move(5, 4);
game.move(5, 4);
print(game.pattern.board);
