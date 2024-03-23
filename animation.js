document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('chessboardCanvas');
    var ctx = canvas.getContext('2d');

    var neighbourValues = 2;
    // Rozmiary szachownicy
    var rows = 40;
    var columns = 80;

    var gridLineWidth = 1;
    var gridLineColor = 'rgba(20, 20, 20, 255)';

    var timeToNextFrame = 250;

    var cellSize = {
        x: canvas.width / (columns+4),
        y: canvas.height / rows
    };

    var lastFrameTime = Date.now();

    var board;
    var boardCurrentIndex;
    var regulesMap;

    var canStart = false;

    function getTileColor(value)
    {
        var deadColor = 'rgba(255, 255, 255, 255)';
        var lifeColor = 'rgba(64, 64, 255, 255)';
        var defaultColor = 'rgba(196, 196, 196, 255)';

        switch(value) 
        {
            case 0:
                return deadColor;
            case 1:
                return lifeColor;
            default:
              return defaultColor;
        }
    }

    function initBoard()
    {
        board = []
        for (var i = 0; i < rows; i++) 
        {
            board[i] = [];
            for (var j = 0; j < columns; j++) 
            {
                board[i][j] = 999;
            }
        }

        boardCurrentIndex = 0;
        for(var i = 0; i < columns; i++)
        {
            board[boardCurrentIndex][i] = Math.round(Math.random());
        } 
    }

    function int32ToBinaryArray(number) 
    {
        var binaryArray = [];
        for (var i = 31; i >= 0; i--) {
            var bit = (number >> i) & 1;
            binaryArray.push(bit);
        }
        return binaryArray;
    }

    function initRegulesMap(number)
    {
        binary = int32ToBinaryArray(number)
        regulesMap = []
        for(i0 = 0; i0 < 2; i0++)
        {
            regulesMap[i0] = [];
            for(i1 = 0; i1 < 2; i1++)
            {
                regulesMap[i0][i1] = [];
                for(i2 = 0; i2 < 2; i2++)
                {
                    regulesMap[i0][i1][i2] = [];
                    for(i3 = 0; i3 < 2; i3++)
                    {
                        regulesMap[i0][i1][i2][i3] = [];
                        for(i4 = 0; i4 < 2; i4++)
                        {
                            binary_index = i0 * 16 + i1 * 8 + i2 * 4 + i3 * 2 + i4;
                            regulesMap[i0][i1][i2][i3][i4] = binary[binary_index];
                        }
                    }
                }   
            }
        }
    }

    function getOutput(input)
    {
        let reguleValue = regulesMap;
        for(i = 0; i < input.length; i++)
        {
            reguleValue = reguleValue[input[i]];
        }
        return reguleValue;
    }

    function getElementPeriodically(index)
    {
        while(index < 0 && index < columns)
        {
            index += columns;
        }
        while(index >= columns)
        {
            index -= columns;
        }
        return index;
    }

    function updateBoard()
    {
        boardCurrentIndex += 1;
        if(boardCurrentIndex === rows)
        {
            boardCurrentIndex -= 1;
            for(var i = 1; i < rows; i++)
            {
                for(var j = 0; j < columns; j++)
                {
                    board[i-1][j] = board[i][j];
                }
            }
        }

        for(var i = 0; i < columns; i++)
        {
            akInput = [];
            for(j = 0; j <= neighbourValues * 2; j++)
            {
                akInput[j] = board[boardCurrentIndex-1][getElementPeriodically(i+j-neighbourValues)];
            }
            board[boardCurrentIndex][i] = getOutput(akInput);
        }
    }

    function drawChessboard() 
    {
        //draw cell state
        for (var i = 0; i < rows; i++) 
        {
            for (var j = 0; j < columns; j++) 
            {
                ctx.fillStyle = getTileColor(board[i][j]);
                ctx.fillRect(j * cellSize.x, i * cellSize.y, cellSize.x, cellSize.y);
            }

            var aliveCount = 0;
            for (var j = 0; j < columns; j++) 
            {
                if (board[i][j] === 1) 
                {
                    aliveCount++;
                }
            }
    
            ctx.fillStyle = '#000'; // Kolor tekstu
            ctx.font = '18px "Times New Roman", Times, serif';
            ctx.textBaseline = 'middle'; // Wyrównanie tekstu do środka
            ctx.fontSmooth = 'never'; // Wyłączenie antyaliasingu dla tekstu
            ctx.fillText(aliveCount, (columns+1) * cellSize.x, (i + 1) * cellSize.y - 7);
        }
    }

    function drawGridLines() 
    {
        ctx.strokeStyle = gridLineColor;
        ctx.lineWidth = gridLineWidth;

        for (var i = 0; i <= columns; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize.x, 0);
            ctx.lineTo(i * cellSize.x, cellSize.y * rows);
            ctx.stroke();
        }

        // Rysuj linie poziome
        for (var j = 0; j <= rows; j++) {
            ctx.beginPath();
            ctx.moveTo(0, j * cellSize.y);
            ctx.lineTo(cellSize.x * columns, j * cellSize.y);
            ctx.stroke();
        }
    }

    function draw() 
    {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawChessboard();
        drawGridLines();
    }

    function animateChessboard() 
    {
        let currentTime = Date.now();
        if (currentTime - lastFrameTime > timeToNextFrame) 
        {
            if(canStart)
            {
                updateBoard();
            }
            lastFrameTime = currentTime;
        }

        draw();

        requestAnimationFrame(animateChessboard);
    }

    function isValidNumber(input) {
        if (input === "") {
            return false;
        }
    
        // Sprawdź, czy wartość jest liczbą całkowitą
        if (!Number.isInteger(Number(input))) {
            return false;
        }
    
        // Sprawdź, czy liczba mieści się w zakresie 32-bitowym
        const max = Math.pow(2, 32) - 1;
        const min = 0
        const value = Number(input);
        return value >= min && value <= max;
    }
    

    function handleStart() 
    {
        const number = document.getElementById('automatonNumber').value;
        console.log(number);
        if(!isValidNumber(number))
        {
            console.log("Nope" + number);
            return;
        }

        initBoard();
        initRegulesMap(number);
        canStart = true;
    }
    
    function handleStop() 
    {
        canStart = false;
    }

    function handleResume()
    {
        if(regulesMap === null)
        {
            return;
        }
        canStart = true;
    }

    function generateRandomNumber32() 
    {
        const MAX_32_BIT_VALUE = Math.pow(2, 32) - 1;
        const randomFraction = Math.random();
        const randomNumber = Math.floor(randomFraction * (MAX_32_BIT_VALUE + 1));
    
        return randomNumber;
    }

    function handleStartRandom()
    {
        document.getElementById('automatonNumber').value = generateRandomNumber32();
        handleStart();
    }

    document.getElementById('startButton').addEventListener('click', handleStart);
    document.getElementById('stopButton').addEventListener('click', handleStop);
    document.getElementById('resumeButton').addEventListener('click', handleResume);
    document.getElementById('startRandomButton').addEventListener('click', handleStartRandom);

    initBoard();
    animateChessboard();
});
