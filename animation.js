
document.addEventListener('DOMContentLoaded', function () {

var canvas = document.getElementById('chessboardCanvas');
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var width = canvas.width;
var height = canvas.height;

var boardSize = 50;
var cellSize = new Point(width / (boardSize * 2), height / (boardSize * 2));
var particleMargin = 100;
var particleDensityFactor = 0.2;

var particleElements = [];
var wallElements = [];
var orientation = layout_flat;
var layout = new Layout(orientation, cellSize, new Point(width / 2, height / 2));


    class Element
    {
        static s_empty = "empty";
        static s_particle = "particle";
        static s_wall = "wall";
        static s_id = 0;

        type = "particle";

        coord = Hex(0, 0, 0);
        speed = Hex(0, 0, 0);
        id = 0;

        constructor(type, coord, speed) 
        {
            this.type = type;
            this.coord = coord;
            this.speed = speed;
            id = s_id;
            s_id += 1;
        }
    }

    function initElements()
    {
        let leftBoundary = particleMargin;
        let rightBoundary = width - particleMargin;
        let topBoundary = particleMargin;
        let bottomBoundary = height - particleMargin;

        for (let r = -boardSize; r <= boardSize; r++) 
        {
            for (let q = -boardSize; q <= boardSize; q++) {
                let s = -r - q;

                let hex = new Hex(q, r, s);
                let point = hex_to_pixel(layout, hex);

                if (point.x >= leftBoundary && point.x <= rightBoundary && point.y >= topBoundary && point.y <= bottomBoundary) 
                {
                    let random = Math.random();
                    let type = Element.s_empty;
                    if(random < particleDensityFactor)
                    {
                        type = Element.s_particle;
                    }
                    let speed = Hex(0 ,0, 0);
                    particleElements.push(new Element(type, hex, speed));
                }
                else
                {
                    let type = Element.s_wall;
                    let speed = Hex(0 ,0, 0);
                    particleElements.push(new Element(type, hex, speed));
                }
            }
        }
    }

    function initBoard() 
    {    
        initElements();
    }

    function getColor(element)
    {
        let color = 'rgba(128, 128, 28, 255)';
        switch(element.type)
        {
            case Element.s_empty:
                color = 'rgba(0, 0, 0, 0)';
                break;
            case Element.s_particle:
                color = 'rgba(255, 0, 0, 255)';
                break;
            case Element.s_wall:
                color = 'rgba(0, 0, 0, 255)';
                break;   
        }
        return color;
    }

    function drawElement(element)
    {
        let point = hex_to_pixel(layout, element.coord);
        ctx.fillStyle = getColor(element);
        let pointSize = 10;
        ctx.fillRect(point.x - pointSize / 2, point.y - pointSize / 2, pointSize, pointSize);
    }

    function drawChessboard() 
    {
        for (const element of particleElements) 
        {
            drawElement(element);
        }

        for (const element of wallElements) 
        {
            drawElement(element);
        }
    }

    function draw() 
    {
        drawChessboard();
    }



    function animate(elemets)
    {
        if(elemets.length == 2)
        {
            elem1 = elemets[0];
            elem2 = elemets[1];
            if(elemets[])
        }
    }


    function animateChessboard() 
    {
        draw();

        requestAnimationFrame(animateChessboard);
    }
    
    initBoard();
    animateChessboard();
});