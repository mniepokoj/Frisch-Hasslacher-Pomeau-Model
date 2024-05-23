
document.addEventListener('DOMContentLoaded', function () {

var canvas = document.getElementById('chessboardCanvas');
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var width = canvas.width;
var height = canvas.height;

var boardSize = 20;
var cellSize = new Point(width / (boardSize * 2), height / (boardSize * 2));

var hexBoard = [];
var orientation = layout_flat;
var layout = new Layout(orientation, cellSize, new Point(width / 2, height / 2));

function initBoard() {    
    let margin = 50;
    let leftBoundary = margin;
    let rightBoundary = width - margin;
    let topBoundary = margin;
    let bottomBoundary = height - margin;

    for (let r = -boardSize; r <= boardSize; r++) 
    {
        for (let q = -boardSize; q <= boardSize; q++) {
            let s = -r - q;

            let hex = new Hex(q, r, s);
            let point = hex_to_pixel(layout, hex);

            if (point.x >= leftBoundary && point.x <= rightBoundary && point.y >= topBoundary && point.y <= bottomBoundary) {
                hexBoard.push(hex);
            }
        }
    }
}

    function drawChessboard() 
    {
        for (const hexElement of hexBoard) {
            let point = hex_to_pixel(layout, hexElement);
            ctx.fillStyle = 'rgba(128, 128, 28, 255)';
            let pointSize = 20;
            ctx.fillRect(point.x - pointSize / 2, point.y - pointSize / 2, pointSize, pointSize);
        }
    }

    function draw() 
    {
        drawChessboard();
    }

    function animateChessboard() 
    {
        draw();

        requestAnimationFrame(animateChessboard);
    }
    
    initBoard();
    animateChessboard();
});