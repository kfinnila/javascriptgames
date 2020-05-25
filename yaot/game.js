
const IMAGE_SIZE = 400;
const TILE_SIZE = 100;

areaWidth = 10;
areaHeigth = 20;


function main() {
  let gameArea = document.getElementById('gamearea');
  for(y = 0; y < areaHeigth; y++) {
    for(x = 0; x < areaWidth; x++) {
      let element = document.createElement('div');
      element.classList.add('item');
      element.innerHTML = "O";
      gameArea.append(element);
    }
  }
}

main();
