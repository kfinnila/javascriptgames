import { Game, CONSTANTS } from './game.js';


var canvas = document.getElementById('canvas');
canvas.width = CONSTANTS.VIEWPORT_WIDTH;
canvas.height = CONSTANTS.VIEWPORT_HEIGHT;
var context = canvas.getContext('2d');

var game = new Game(canvas, context);
var button = document.getElementById("start").onclick = main;

function main() {
  game.start();
}
