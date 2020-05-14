
const IMAGE_SIZE = 400;
const TILE_SIZE = 100;

let imagefile = 'image1.png';

let gameStarted = false;
let shuffling = false;
let tiles = [];
let puzzle = document.getElementById('puzzle');
console.log(puzzle);

reset();
createPuzzle();

function reset() {
  tiles = [...Array(16).keys()];
  tiles.reverse().pop();
  tiles.reverse().push(0);
  moveCounter = 0;
  gameStarted = false;
  shuffling = false;
  document.getElementById('move-counter').innerHTML = '';
  document.getElementById('message').innerHTML = '';
}

function createPuzzle() {
  puzzle.innerHTML = '';
  tiles.forEach((item, index) => {
    let node = document.createElement("DIV");
    node.id = 'tile0' + index;      
    let textnode = document.createTextNode(item === 0 ? '' : item);
    node.appendChild(textnode);
 
    node.innerHTML = '';
    let img = document.createElement('IMG');
    img.src = imagefile;
    let row = Math.floor((item-1) / 4);
    let col = (item-1) % 4;
    let top = row * TILE_SIZE;
    let left = col * TILE_SIZE;
    let right = (IMAGE_SIZE - TILE_SIZE) - left;
    let bottom = (IMAGE_SIZE - TILE_SIZE) - top;
    let ty = -TILE_SIZE * row;
    let tx = -TILE_SIZE * col;
    img.setAttribute('style', `clip-path: inset(${top}px ${right}px ${bottom}px ${left}px);transform: translateX(${tx}px) translateY(${ty}px);`);
    node.classList.add('item-' + item);
    node.appendChild(img);

    if (item === 0) {
      node.innerHTML = '';
      /*
      let img = document.createElement('IMG');
      img.src = 'image1.png';
      img.setAttribute('style', "clip-path: inset(100px 300px 200px 0px);transform: translateY(-100px);");
      //img.setAttribute('style', "clip-path: inset(101px 302px 201px 0px);transform: translateY(-101px);");
      node.appendChild(img); // = '<img src="image1.png" style="clip-path: inset(100px 300px 200px 0px);transform: translateY(-75px);"></img>'
      console.log(node);*/
    }
    let className = (item === 0 ? 'empty' : 'tile');
    node.classList.add(className);
    puzzle.appendChild(node);
    node.onclick = function() {
      move(node.id);
    }
  });
}

function move(id) {
  //console.log('gameStarted:', gameStarted);
  if (!gameStarted) return;
  let tile = +id.slice(-2);
  //console.log('t:', tile);
  let free = tiles.indexOf(0);
  //console.log('f:', free);
  let tileRow = Math.floor(tile / 4);
  let freeRow = Math.floor(free / 4);
  let tileCol = tile % 4;
  let freeCol = free % 4;
  //console.log('row:', freeRow, tileRow);
  //console.log('col:', freeCol, tileCol);
  if ((tileRow === freeRow || tileCol === freeCol) && !(tileRow === freeRow && tileCol === freeCol)) {
    if (tileRow === freeRow) {
      if (tileCol <= freeCol) {
        for (let index = freeCol - 1; index >= tileCol; index--) {
          swap(freeRow * 4 + index, tiles.indexOf(0)); 
        }
      } else {
        for (let index = freeCol + 1; index <= tileCol; index++) {
          swap(freeRow * 4 + index, tiles.indexOf(0)); 
        }
      }
    } else {
      if (tileRow <= freeRow) {
        for (let index = freeRow - 1; index >= tileRow; index--) {
          swap(index * 4 + freeCol, tiles.indexOf(0));
        }
      } else {
        for (let index = freeRow + 1; index <= tileRow; index++) {
          swap(index * 4 + freeCol, tiles.indexOf(0));
        }
      }
    }
  }
  

  if (!shuffling) {
    createPuzzle();
    moveCounter++;
    let finished = true;
    if (tiles[tiles.length - 1] != 0) {
      finished = false;
      //console.log('false0');
    } else {
      tiles.forEach((x, index) => {
        if (x !== tiles.indexOf(x) + 1 && index !== tiles.length - 1) {
          finished = false;
          //console.log('falsebullshit', x, index);
        }
      })
    }
    document.getElementById('move-counter').innerHTML = 'MOVES: ' + moveCounter;
    if (finished) {
      document.getElementById('message').innerHTML = 'WELL DONE!';
      gameStarted = false;
    }
  }
}

function shuffle() {
  gameStarted = true;
  shuffling = true;
  let counter = 0;
  let useRow = true;
  do {
    let free = tiles.indexOf(0);
    let row = Math.floor(free / 4);
    let col = free % 4;
    let tile = 0;
    if (useRow) {
      tile = row * 4 + Math.floor(Math.random() * 4);
      //console.log('useRow, row, tile, free', row, tile, free);
    } else {
      tile = Math.floor(Math.random() * 4) * 4 + col;
      //console.log('useCol, col, tile, free', col, tile, free);
    }
    move('tile0' + tile); //Math.floor(Math.random() * 15));
    //console.log('tiles', [...tiles]);
    useRow = !useRow;
    counter++;
  } while (counter < 500);
  createPuzzle();
  shuffling = false;
  document.getElementById('message').innerHTML = '';
  moveCounter = 0;
}

function swap(tile, free) {
  let temp = tiles[tile];
  tiles[tile] = tiles[free];
  tiles[free] = temp;
}

function chooseImage(image) {
  imagefile = image;
  reset();
  createPuzzle();
}
