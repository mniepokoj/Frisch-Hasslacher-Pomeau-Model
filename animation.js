
document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('chessboardCanvas');
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var width = canvas.width;
    var height = canvas.height;

    var particleMargin = height * 0.1;
    var boardSize = 80;
    var cellSize = new Point((width - particleMargin) / (boardSize), (height - particleMargin) / (boardSize));
    var paricleBoundaryPosition = (width - particleMargin * 2) * 0.7 + particleMargin - cellSize.x;
    var particleDensityFactor = 0.2;
    let obstacleSize = 0.7;

    var timeToNextFrame = 1000;
    var lastFrameTime = Date.now() - timeToNextFrame;

    var boardTiles = [];

    var orientation = layout_flat;
    var layout = new Layout(orientation, cellSize, new Point(0, 0));
    var isPause = true;

    class Element {
        static s_empty = "empty";
        static s_particle = "particle";
        static s_wall = "wall";
        static s_id = 0;

        type = "particle";

        coord = Hex(0, 0, 0);
        speed = Hex(0, 0, 0);
        id = 0;
        sort_order = 0;

        constructor(type, coord, speed) {
            this.type = type;
            this.coord = coord;
            this.speed = speed;
            this.id = Element.s_id;
            Element.s_id += 1;

            switch (type) {
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

    function getRandomSpeed() {
        let rn1 = getRandomInt(3);
        let rn2 = getRandomInt(2);
        let speedDirection = rn2 * 2 - 1;
        let letter1, letter2;
        if (rn1 == 0) {
            letter1 = "q";
            letter2 = "s";
        }
        else if (rn1 == 1) {
            letter1 = "q";
            letter2 = "r";
        }
        else if (rn1 == 2) {
            letter1 = "s";
            letter2 = "r";
        }

        speed = Hex(0, 0, 0);
        speed[letter1] = speedDirection;
        speed[letter2] = -speedDirection;
        return speed;
    }


    function getEmptyBoardTiles() {
        let arr = [];
        size = boardSize * 4 + 1;
        arr = Array(size);
        for (let r = 0; r < size; r++) 
        {
            arr[r] = Array(size);
            for (let q = 0; q < size; q++) {
                arr[r][q] = [];
            }
        }
        return arr;
    }

    function getBoardTile(board, r, q) 
    {
        return board[r + boardSize * 2][q + boardSize * 2];
    }

    function isInAllowedArea(h) {
        const left = particleMargin + cellSize.x;
        const right = paricleBoundaryPosition;

        const top = particleMargin;
        const bottom = height - particleMargin - cellSize.y;

        pos = hex_to_pixel(layout, h);
        return pos.x > left && pos.x < right && pos.y > top && pos.y < bottom;
    }

    function isInDrawableArea(h) 
    {
        let pos = hex_to_pixel(layout, h);
        const left = particleMargin;
        const right = width - particleMargin;

        const top = particleMargin;
        const bottom = height - particleMargin;

        return pos.x > left && pos.x < right && pos.y > top && pos.y < bottom;
    }

    function initParticle() {
        for (let r = -boardSize; r <= boardSize; r++) 
        {
            for (let q = -boardSize; q <= boardSize; q++) 
            {
                let s = -r - q;
                let hex = new Hex(q, r, s);

                if (Math.random() < particleDensityFactor && isInAllowedArea(hex)) 
                    {
                    let type = Element.s_particle;
                    let speed = getRandomSpeed();
                    if (getBoardTile(boardTiles, r, q).length == 0)
                        getBoardTile(boardTiles, r, q).push(new Element(type, hex, speed));
                }
            }
        }
    }

    function initBoundary() {
        let bottomLeftCorner = pixel_to_hex(layout, Point(particleMargin, particleMargin));
        let bottomRightCorner = pixel_to_hex(layout, Point(width - particleMargin, particleMargin));
        let topLeftCorner = pixel_to_hex(layout, Point(particleMargin, height - particleMargin));
        let topRightCorner = pixel_to_hex(layout, Point(width - particleMargin, height - particleMargin));

        let bottomLine = hex_linedraw(bottomLeftCorner, bottomRightCorner);
        let topLine = hex_linedraw(topLeftCorner, topRightCorner);
        let leftLine = hex_linedraw(bottomLeftCorner, topLeftCorner);
        let rightLine = hex_linedraw(bottomRightCorner, topRightCorner);

        let lowerBoundarySize = 0.3;

        let topGapLowerCorner = pixel_to_hex(layout, Point(paricleBoundaryPosition+cellSize.x, particleMargin));
        let temp = particleMargin+(height-2*particleMargin)*lowerBoundarySize*obstacleSize;
        let topGapHigherCorner = pixel_to_hex(layout, Point(paricleBoundaryPosition+cellSize.x, temp));
        let topGapLine = hex_linedraw(topGapLowerCorner, topGapHigherCorner);

        let bottomGapLowerCorner = pixel_to_hex(layout, Point(paricleBoundaryPosition+cellSize.x, height - particleMargin ));
        temp = height - particleMargin - (height-particleMargin*2)*obstacleSize*(1-lowerBoundarySize); 
        let bottomGapHigherCorner = pixel_to_hex(layout, Point(paricleBoundaryPosition+cellSize.x, temp));
        let bottomGapLine = hex_linedraw(bottomGapLowerCorner, bottomGapHigherCorner);


        const hexLines = [...bottomLine, ...topLine, ...leftLine, ...rightLine, ...topGapLine, ...bottomGapLine];

        for (const hex of hexLines)
        {
            if(getBoardTile(boardTiles, hex.r, hex.q).length != 0)
            {
                continue;
            }
            getBoardTile(boardTiles, hex.r, hex.q).push(new Element(Element.s_wall, hex, Hex(0, 0, 0)));
        }
    }

    function initElements() {
        boardTiles = getEmptyBoardTiles();
        initBoundary();
        initParticle();
    }

    function initBoard() 
    {
        resetChart();
        initElements();
    }

    function getColor(element) {
        let color = 'rgba(128, 128, 28, 255)';
        switch (element.type) {
            case Element.s_empty:
                color = 'rgba(196, 196, 196, 255)';
                break;
            case Element.s_particle:
                color = 'rgba(200, 50, 50, 255)';
                break;
            case Element.s_wall:
                color = 'rgba(0, 0, 0, 255)';
                break;
        }
        return color;
    }

    function drawElement(element) {
        let point = hex_to_pixel(layout, element.coord);
        ctx.fillStyle = getColor(element);
        let radius = Math.min(cellSize.x, cellSize.y) * 0.8;

        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
        ctx.fill();
    }

    function drawChessboard() 
    {
        for (let r = -boardSize; r <= boardSize; r++) 
        {
            for (let q = -boardSize; q <= boardSize; q++) 
            {
                let s = -r - q;
                let hex = new Hex(q, r, s);

                if (isInDrawableArea(hex) && getBoardTile(boardTiles, r, q).length == 0) 
                {
                    drawElement(new Element(Element.s_empty, hex, Hex(0,0,0)));
                }
            }
        }

        for (const row of boardTiles) 
        {
            for (const tile of row) 
            {
                if (tile.length == 0) 
                {
                    continue;
                }

                tile.sort((a, b) => b.sortOrder - a.sortOrder );

                drawElement(tile[0]);
            }
        }
    }

    function draw() 
    {
        ctx.clearRect(0, 0, width, height);
        drawChessboard();
    }

    function checkWall(elements) {
        const foundWall = elements.some(e => e.type == Element.s_wall);
        const foundParticle = elements.some(e => e.type == Element.s_particle);
        if (!(foundWall && foundParticle)) {
            return false;
        }
        for (const element of elements) {
            if (element.type != Element.s_particle)
                continue;
            element.speed.r = -element.speed.r;
            element.speed.q = -element.speed.q;
            element.speed.s = -element.speed.s;
        }
        return true;
    }

    function checkOneDirectionCollisions(elements) {
        if (!(elements.length == 2 && elements.every(e => e.type === Element.s_particle)))
            return false;

        if (!hex_length_zero(elements[0].speed, elements[1].speed))
            return false;

        if (getRandomInt(2) % 2) {
            elements[0].speed = hex_rotate_left(elements[0].speed);
            elements[1].speed = hex_rotate_left(elements[1].speed);
        }
        else {
            elements[0].speed = hex_rotate_right(elements[0].speed);
            elements[1].speed = hex_rotate_right(elements[1].speed);
        }
        return true;
    }

    function checkThreeParticleInCollisions(elements) {

        if (!(elements.length == 3 && elements.every(e => e.type === Element.s_particle)))
            return false;

        if (hex_length_zero(hex_add(elements[0].speed, elements[1].speed), elements[2].speed)) {
            elements[0].speed = hex_scale(elements[0].speed, -1);
            elements[1].speed = hex_scale(elements[1].speed, -1);
            elements[2].speed = hex_scale(elements[2].speed, -1);
            return true;
        }
        return false;
    }

    function checkThreeParticleNonSymetricCollisions(elements) {

        if (!(elements.length == 3 && elements.every(e => e.type === Element.s_particle)))
            return false;

        if (hex_length_zero(hex_add(elements[0].speed, elements[1].speed), elements[2].speed))
            return false;

        let symetricElem1, symetricElem2;
        let nonSymetricElem;

        if (hex_length_zero(elements[0].speed, elements[1].speed)) {
            symetricElem1 = structuredClone(elements[0]);
            symetricElem2 = structuredClone(elements[1]);
            nonSymetricElem = structuredClone(elements[2]);
        }
        else if (hex_length_zero(elements[0].speed, elements[2].speed)) {
            symetricElem1 = structuredClone(elements[0]);
            symetricElem2 = structuredClone(elements[2]);
            nonSymetricElem = structuredClone(elements[1]);
        }
        else {
            symetricElem1 = structuredClone(elements[1]);
            symetricElem2 = structuredClone(elements[2]);
            nonSymetricElem = structuredClone(elements[0]);
        }


        if (hex_length_zero(symetricElem1.speed, hex_rotate_left(nonSymetricElem.speed)) ||
            hex_length_zero(symetricElem2.speed, hex_rotate_left(nonSymetricElem.speed))) {
            symetricElem1.speed = hex_rotate_left(symetricElem1.speed);
            symetricElem2.speed = hex_rotate_left(symetricElem2.speed);
        }
        else {
            symetricElem1.speed = hex_rotate_right(symetricElem1.speed);
            symetricElem2.speed = hex_rotate_right(symetricElem2.speed);
        }

        elements[0].speed = symetricElem1.speed;
        elements[1].speed = symetricElem2.speed;
        elements[2].speed = nonSymetricElem.speed;

        return true;
    }

    function calculateCollisions() {
        for (let tile of boardTiles.flat(1)) 
        {   
            if (checkWall(tile))
                continue;
            if (checkOneDirectionCollisions(tile))
                continue;
            if (checkThreeParticleInCollisions(tile))
                continue;
            if (checkThreeParticleNonSymetricCollisions(tile))
                continue;
        }
    }

    function onLeftSide()
    {
        let particleCount = 0.;
        let particleOnLeft = 0.;
        for(let element of boardTiles.flat(2))
        {
            if(element.type == Element.s_particle)
            {
                particleCount += 1.;
                if(hex_to_pixel(layout, element.coord).x <= paricleBoundaryPosition)
                {
                    particleOnLeft+= 1.;
                }
            }
        }
        if(particleOnLeft < 1 && particleCount < 1)
        {
            return 0.5;
        }
        console.log(particleCount);
        return particleOnLeft/particleCount; 
    }

    function updateSliders() {
        const leftValue = (onLeftSide() * 100).toFixed(1);
        const rightValue = ((1 - onLeftSide()) * 100).toFixed(1);
        ileNaLewejValue.textContent = leftValue;
        ileNaPrawejValue.textContent = rightValue;
        updateChart(parseFloat(rightValue));
    }

    function moveParticles() {
        let newBoardTiles = getEmptyBoardTiles();
        for (const element of boardTiles.flat(2)) {
            element.coord.r += element.speed.r;
            element.coord.q += element.speed.q;
            element.coord.s += element.speed.s;
            getBoardTile(newBoardTiles, element.coord.r, element.coord.q).push(element);
        }
        boardTiles = newBoardTiles;
        updateSliders();
    }

    function animateChessboard() 
    {
        let currentTime = Date.now();
        if (currentTime - lastFrameTime > timeToNextFrame && !isPause) 
            {
            console.log("Move");
            moveParticles();
            calculateCollisions();
            draw();
            lastFrameTime = currentTime;
        }


        requestAnimationFrame(animateChessboard);
    }

    function linearToLog(value, minLinear, maxLinear, minLog, maxLog) {
        const logMin = Math.log(minLog);
        const logMax = Math.log(maxLog);
        const scale = (logMax - logMin) / (maxLinear - minLinear);
        return Math.exp(logMin + scale * (value - minLinear));
    }

    function handleStartClick() {
        isPause = false;
        updateButtons();
    }

    function handlePauseClick() {
        isPause = true;
        updateButtons();
    }

    function handleSingleMoveClick() {
        moveParticles();
        calculateCollisions();
        draw();
    }

    function handleRestartClick() {
        initBoard();
        draw();
        updateSliders();
    }

    function handleTimerSliderChange(event) {
        const slider = event.target;
        const value = parseFloat(slider.value);
        const logValue = linearToLog(value, 0.01, 1, 0.01, 1);
        timeToNextFrame = logValue * 1000;
        updateSliderValue(slider, timerValue);
    }

    function handlePrzegrodaSliderChange(event) {
        const przegrodaMin = 0.1;
        const przegrodaMax = 0.9;

        const slider = event.target;
        const value = slider.value;
        const factor = (przegrodaMax - przegrodaMin) * value + przegrodaMin;

        paricleBoundaryPosition = (width - particleMargin * 2) * factor + particleMargin - cellSize.x;
        initBoard();
        draw();
        updateSliderValue(slider, przegrodaValue);
    }

    function handleWielkoscSliderChange(event) {
        const slider = event.target;
        const value = slider.value;
        obstacleSize = value * 1.01;
        initBoard();
        draw();
        updateSliders();
        updateSliderValue(slider, wielkoscValue);
    }

    function handleDensitySliderChange(event) {
        const slider = event.target;
        const value = slider.value;
        particleDensityFactor = value;
        initBoard();
        draw();
        updateSliderValue(slider, densityValue);
    }

    function updateSliderValue(slider, valueElement) {
        valueElement.textContent = parseFloat(slider.value).toFixed(3);
    }

    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const restartButton = document.getElementById('restartButton');
    const singleMoveButton = document.getElementById('singleMoveButton');
    const timerSlider = document.getElementById('timerSlider');
    const przegrodaSlider = document.getElementById('przegrodaSlider');
    const wielkoscSlider = document.getElementById('wielkoscSlider');
    const densitySlider = document.getElementById('densitySlider');
    const timerValue = document.getElementById('timerValue');
    const przegrodaValue = document.getElementById('przegrodaValue');
    const wielkoscValue = document.getElementById('wielkoscValue');
    const densityValue = document.getElementById('densityValue');

    startButton.addEventListener('click', handleStartClick);
    pauseButton.addEventListener('click', handlePauseClick);
    restartButton.addEventListener('click', handleRestartClick);
    singleMoveButton.addEventListener('click', handleSingleMoveClick);
    timerSlider.addEventListener('input', handleTimerSliderChange);
    przegrodaSlider.addEventListener('input', handlePrzegrodaSliderChange);
    wielkoscSlider.addEventListener('input', handleWielkoscSliderChange);
    densitySlider.addEventListener('input', handleDensitySliderChange);

    updateSliderValue(timerSlider, timerValue);
    updateSliderValue(przegrodaSlider, przegrodaValue);
    updateSliderValue(wielkoscSlider, wielkoscValue);
    updateSliderValue(densitySlider, densityValue);   

    function updateButtons()
    {
        pauseButton.disabled = isPause;;
        startButton.disabled = !isPause;
        singleMoveButton.disabled = !isPause;
    }

    updateButtons();
    initBoard();
    draw();
    updateSliders();
    animateChessboard();
});