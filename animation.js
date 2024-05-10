
document.addEventListener('DOMContentLoaded', function () {

    var canvas = document.getElementById('chessboardCanvas');
    var ctx = canvas.getContext('2d');
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    
    var rows = 70;
    var columns = 120;

    var r_size = 5;
    var q_size = 5;
    var w_size = 5;

    var cellSize = {
        x: canvas.width / (columns+4),
        y: canvas.height / rows
    };

    hexBoard = [];
    layout = Orientation(3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0), 2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0, 0.0);

    function initBoard()
    {    
        for( r = 0; r < r_size; r++)
        {
            for(q = 0; q < q_size; q++ )
            {
                for(w = 0; w < w_size; w++)
                {
                    if(r+q+w == 0)
                    hexBoard.push(Hex(q, w, r));
                }
            }
        }
    }

    function drawChessboard() 
    {
        for (const hexElement of hexBoard)
        {
            const point = hex_to_pixel((layout, hexElement), cellSize.x, cellSize.y);
            ctx.fillStyle = 'rgba(255, 255, 255, 255)';
            ctx.fillRect(point.x - 10, point.y - 10, point.x + 10, point.y + 10);
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