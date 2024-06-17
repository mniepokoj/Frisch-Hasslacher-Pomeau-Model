
document.addEventListener('DOMContentLoaded', function () {

var canvas = document.getElementById('chessboardCanvas');
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var width = canvas.width;
var height = canvas.height;

var boardSize = 50;
var cellSize = new Point(width / (boardSize * 2), height / (boardSize * 2));
var particleMargin = 200;
var particleDensityFactor = 0.;

var timeToNextFrame = 2000;
var lastFrameTime = Date.now() - timeToNextFrame;

var boardTiles = [];

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
        sort_order = 0;

        constructor(type, coord, speed) 
        {
            this.type = type;
            this.coord = coord;
            this.speed = speed;
            this.id = Element.s_id;
            Element.s_id += 1;

            switch (type) 
            {
                case Element.s_wall:
                    this.sortOrder = 3;
                    break;
                case Element.s_particle:
                    this.sortOrder = 2;
                    break;
                case Element.s_empty:
                    this.sortOrder = 1;
                    break;
                default:
                    this.sortOrder = 0;
                    break;
            }
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
        let letter1, letter2;
        if(rn1 == 0)
        {
            letter1 = "q";
            letter2 = "s";
        }
        else if(rn1 == 1)
        {
            letter1 = "q";
            letter2 = "r";
        }
        else if(rn1 == 2)
        {
            letter1 = "s";
            letter2 = "r";
        }

        speed = Hex(0, 0, 0);
        speed[letter1] = speedDirection;
        speed[letter2] = -speedDirection;
        return speed;
    }


    function getEmptyBoardTiles()
    {
        let arr = [];
        size = boardSize * 2 + 1;
        arr = Array(size);
        for(let r = 0; r < size; r++)
        {
            arr[r] = Array(size);
            for(let q = 0; q < size; q++)
            {
                arr[r][q] = [];
            }
        }
        return arr;
    }

    function getBoardTile(board, r, q)
    {
        return board[r+boardSize][q+boardSize];
    }

    function initElements()
    {
        let leftBoundary = particleMargin;
        let rightBoundary = width - particleMargin;
        let topBoundary = particleMargin;
        let bottomBoundary = height - particleMargin;

        boardTiles = getEmptyBoardTiles();
        
        for (let r = -boardSize; r <= boardSize; r++) 
        {
            for (let q = -boardSize; q <= boardSize; q++) 
            {
                let s = -r - q;
                let hex = new Hex(q, r, s);
                let point = hex_to_pixel(layout, hex);
                if (point.x >= leftBoundary && point.x <= rightBoundary && point.y >= topBoundary && point.y <= bottomBoundary) 
                {
                    let random = Math.random();
                    let type = Element.s_particle;
                    let speed = getRandomSpeed();
                    if(random < particleDensityFactor)
                    {
                        getBoardTile(boardTiles, r, q).push(new Element(type, hex, speed));
                    }
                }
                else
                {
                    let type = Element.s_wall;
                    let speed = Hex(0 ,0, 0);
                    getBoardTile(boardTiles, r, q).push(new Element(type, hex, speed));
                }
            }
        }
        getBoardTile(boardTiles, 2, 0).push(new Element(Element.s_particle, Hex(3,0 ,-3), Hex(-1,0, 1)));
        getBoardTile(boardTiles, 0, 0).push(new Element(Element.s_particle, Hex(-3,0, 3), Hex(1,0, -1)));
        getBoardTile(boardTiles, 0, 3).push(new Element(Element.s_particle, Hex(0,3, -3), Hex(0,-1, 1)));
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
                color = 'rgba(255, 0, 0, 0)';
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
        let radius = 15; // Polowa wartości pointSize dla zachowania rozmiaru
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
        ctx.fill();
    }

    function drawChessboard() 
    {
        for (const tile of boardTiles.flat(1)) 
        {
            if(tile.length < 1)
            {
                continue;
            }

            tile.sort((a, b) => a.sortOrder - b.sortOrder);
            
            drawElement(tile[0]);
        }
    }

    function draw() 
    {
        ctx.clearRect(0, 0, width, height);
        drawChessboard();
    }

    function checkWall(elements)
    {
        const foundWall = elements.some(e => e.type == Element.s_wall);
        const foundParticle = elements.some(e => e.type == Element.s_particle);
        if( !(foundWall && foundParticle) )
        {
            return false;
        }
        for (const element of elements) 
        {
            if(element.type != Element.s_particle)
                continue;
            element.speed.r = -element.speed.r;
            element.speed.q = -element.speed.q;
            element.speed.s = -element.speed.s;
        }
        return true;
    }

    function checkOneDirectionCollisions(elements)
    {
        if( !(elements.length == 2 && elements.every(e => e.type === Element.s_particle)))
            return false;
        
        if(!hex_length_zero(elements[0].speed, elements[1].speed))
            return false;

        if(getRandomInt(2) % 2)
        {
            elements[0].speed = hex_rotate_left(elements[0].speed);
            elements[1].speed = hex_rotate_left(elements[1].speed);
        }
        else
        {
            elements[0].speed = hex_rotate_right(elements[0].speed);
            elements[1].speed = hex_rotate_right(elements[1].speed);
        }
        return true;
    }

    function checkThreeParticleInCollisions(elements)
    {

        if( !(elements.length == 3 && elements.every(e => e.type === Element.s_particle)))
            return false;

        if( hex_length_zero(hex_add(elements[0].speed, elements[1].speed), elements[2].speed) )
        {
            elements[0].speed = hex_scale(elements[0].speed, -1);
            elements[1].speed = hex_scale(elements[1].speed, -1);
            elements[2].speed = hex_scale(elements[2].speed, -1);
            return true;
        }
        return false;
    }

    function checkThreeParticleNonSymetricCollisions(elements)
    {

        if( !(elements.length == 3 && elements.every(e => e.type === Element.s_particle)))
            return false;

        if( hex_length_zero(hex_add(elements[0].speed, elements[1].speed), elements[2].speed) )
            return false;

        let symetricElem1, symetricElem2;
        let nonSymetricElem;

        if(hex_length_zero(elements[0].speed, elements[1].speed))
        {
            symetricElem1 = structuredClone(elements[0]);
            symetricElem2 = structuredClone(elements[1]);    
            nonSymetricElem = structuredClone(elements[2]);    
        }
        else if(hex_length_zero(elements[0].speed, elements[2].speed))
        {
            symetricElem1 = structuredClone(elements[0]);
            symetricElem2 = structuredClone(elements[2]);    
            nonSymetricElem = structuredClone(elements[1]);    
        }
        else
        {
            symetricElem1 = structuredClone(elements[1]);
            symetricElem2 = structuredClone(elements[2]);    
            nonSymetricElem = structuredClone(elements[0]);    
        }

        
        if(hex_length_zero(symetricElem1.speed, hex_rotate_left(nonSymetricElem.speed)) || 
            hex_length_zero(symetricElem2.speed, hex_rotate_left(nonSymetricElem.speed) ))
        {
            symetricElem1.speed = hex_rotate_left(symetricElem1.speed);
            symetricElem2.speed = hex_rotate_left(symetricElem2.speed);
        }
        else
        {
            symetricElem1.speed = hex_rotate_right(symetricElem1.speed);
            symetricElem2.speed = hex_rotate_right(symetricElem2.speed);
        }

        elements[0].speed = symetricElem1.speed;
        elements[1].speed = symetricElem2.speed;
        elements[2].speed = nonSymetricElem.speed;

        return true;
    }

    function calculateCollisions()
    {
        for(let tile of boardTiles.flat(1))
        {
            if(checkWall(tile))
                continue;
            if(checkOneDirectionCollisions(tile))
                continue;
            if(checkThreeParticleInCollisions(tile))
                continue;
            if(checkThreeParticleNonSymetricCollisions(tile))
                continue;
        }
    }

    function moveParticles()
    {
        let newBoardTiles = getEmptyBoardTiles();
        for (const element of boardTiles.flat(2)) 
        {
            element.coord.r += element.speed.r;
            element.coord.q += element.speed.q;
            element.coord.s += element.speed.s;
            getBoardTile(newBoardTiles, element.coord.r, element.coord.q).push(element);
        }
        boardTiles = newBoardTiles;
    }


    function animateChessboard() 
    {
        let currentTime = Date.now();
        if (currentTime - lastFrameTime > timeToNextFrame) 
        {
            console.log("Move");
            moveParticles();
            calculateCollisions();
            draw();
            lastFrameTime = currentTime;
        }
        

        requestAnimationFrame(animateChessboard);
    }
    
    initBoard();
    animateChessboard();
});