
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

var timeToNextFrame = 1000;
var lastFrameTime = Date.now();

var boardElements = [];

var particleElements = [];
var orientation = layout_flat;
var layout = new Layout(orientation, cellSize, new Point(width / 2, height / 2));

    class BoardElement
    {
        coord = Hex(0, 0, 0);
        elements = [];
    }

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
            this.id = this.s_id;
            this.s_id += 1;
        }
    }

    function getRandomInt(max) 
    {
        return Math.floor(Math.random() * max);
    }

    function getRandomSpeed()
    {
        let rn1 = getRandomInt(3);
        let rn2 = getRandomInt(2);
        let speedDirection = rn2 * 2 - 1;
        if(rn1 == 0)
        {
            letter = "q";
        }
        else if(rn1 == 1)
        {
            letter = "s";
        }
        else if(rn1 == 2)
        {
            letter = "r";
        }

        speed = Hex(0, 0, 0);
        speed[letter] = speedDirection;
        return speed;
    }

    function initElements()
    {
        let leftBoundary = particleMargin;
        let rightBoundary = width - particleMargin;
        let topBoundary = particleMargin;
        let bottomBoundary = height - particleMargin;

        for (let r = -boardSize; r <= boardSize; r++) 
        {
            for (let q = -boardSize; q <= boardSize; q++) 
            {
                let s = -r - q;
                let hex = new Hex(q, r, s);
                let point = hex_to_pixel(layout, hex);

                boardElement = new BoardElement();
                boardElement.coord = Hex(r, s, q);
                if (point.x >= leftBoundary && point.x <= rightBoundary && point.y >= topBoundary && point.y <= bottomBoundary) 
                {
                    let random = Math.random();
                    let type = Element.s_empty;
                    if(random < particleDensityFactor)
                    {
                        type = Element.s_particle;
                    }
                    let speed = getRandomSpeed();
                    boardElement.elements.push(new Element(type, hex, speed));
                }
                else
                {
                    let type = Element.s_wall;
                    let speed = Hex(0 ,0, 0);
                    boardElement.elements.push(new Element(type, hex, speed));
                }
                boardElements.push(boardElement);
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
        ctx.clearRect(0, 0, width, height);
        for (const boardField of boardElements) 
        {
            for (const element of boardField.elements) 
            {
                drawElement(element);
            }
        }
    }

    function draw() 
    {
        drawChessboard();
    }

    function setRandomDirection(elem, letter)
    {
        let rn = Math.random();
        if(rn > 0.5)
        {
            elem[letter] = 1
        }
        else
        {
            elem[letter] = -1;
        }
    }

    function checkWall(elements)
    {
        const found = elements.some(type => type == Element.s_wall);
        for (const element of particleElements) 
        {
            if(found == element)
                continue;
            element.speed.r = -element.speed.r;
            element.speed.q = -element.speed.q;
            element.speed.s = -element.speed.s;
        }
    }

    function animate(elemets)
    {
        checkWall(elements);
        return;

        if(elemets.length == 2)
        {
            elem1 = elemets[0];            
            elem2 = elemets[1];

            if(elem1.speed == -elem2.speed)
            {
                if(elem1.speed.r != 0)
                {
                    setRandomDirection(elem1, "s");
                    setRandomDirection(elem2, "q");
                }
                else if(elem1.speed.s != 0)
                {
                    setRandomDirection(elem1, "r");
                    setRandomDirection(elem2, "q");
                }
                else if(elem1.speed.q != 0)
                {
                    setRandomDirection(elem1, "r");
                    setRandomDirection(elem2, "s");
                }
            }
        }
    }

    function moveParticles()
    {
        let new_board = boardElements.map((x) => x);
        for (const element of boardElements) 
        {
            element.coord.r += element.speed.r;
            element.coord.q += element.speed.q;
            element.coord.s += element.speed.s;
            found = elements.some(coord => coord == element.coord);
            if(found)
            {
                new_board.push(element);
            }
        }
    }


    function animateChessboard() 
    {
        let currentTime = Date.now();
        if (currentTime - lastFrameTime > timeToNextFrame) 
        {
            moveParticles();
            lastFrameTime = currentTime;
        }

        draw();

        requestAnimationFrame(animateChessboard);
    }
    
    initBoard();
    animateChessboard();
});