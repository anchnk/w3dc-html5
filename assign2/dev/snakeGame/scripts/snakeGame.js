require([
    'classes/point',
    'classes/linkedlist',
    'utility/raf', 
    'libs/domReady!'
    ], function(Point, LinkedList, raf, doc) {
    
    var canvas, 
        ctx, 
        width,
        height,
        snake,
        sqsize,
        dx,
        dy,
        food, 
        score,
        scoreOffset,
        now, 
        delta,
        delayInMS,
        totalTimeSinceLastRedraw;


    function init() {

        canvas = document.getElementById('snake');
        ctx = canvas.getContext('2d');
        canvas.style.border = '4px solid #000';
        width = canvas.width;
        height = canvas.height;
        ctx.font = 'normal bold 12px consolas';

        scoreOffset = 10;
        sqsize = 10;
        dx = 1;
        dy = 0;
        
        snake = new LinkedList();

        document.onkeydown = checkArrowKeysDown;
        initGame();
    }

    function initGame() {
        setFrameRateInFramesPerSecond(60);
        snake.clear();
        snake.addFirst(new Point(20, 20));
        growSnake(5);

        food = new Point(parseInt(Math.random() * width/sqsize, 10), 
                         parseInt((Math.random() * height/sqsize), 10));
        if (food.y < 2) {
            food.y = 2;
        }
        score = 0;
        then = performance.now(); 
        totalTimeSinceLastRedraw=0
        draw();
    }

    function draw() {
        now = performance.now();
        delta = now - then; 

        if(totalTimeSinceLastRedraw > delayInMs) {

            ctx.clearRect(0, 0, width, height);
            moveSnake(dx, dy);

            if (snake.getFirst().equals(food)) {
                moveFood();
                growSnake(3);
                score += 10;
            }

            if (snake.getFirst().x < 0 || 
                snake.getFirst().x >= width/sqsize ||
                snake.getFirst().y < 0 ||
                snake.getFirst().y >= height/sqsize) {
                    initGame();
                    return;
            }

            for (var i = 1; i < snake.size(); i++) {
                if (snake.getFirst().equals(snake.get(i))) {
                    initGame();
                    return;
                }
            }

            drawScore();
            drawFood();
            drawSnake();

            totalTimeSinceLastRedraw = 0;
        } else {
        // sum the total time since last redraw
            totalTimeSinceLastRedraw += delta;
        }
        then = now;
        raf(draw);
    }

    function drawSnake() {
        // Draw Head
        ctx.fillStyle = 'black';
        var p;
        p = snake.get(0);
        ctx.beginPath();

        ctx.arc(p.x * sqsize + sqsize/2, p.y * sqsize + sqsize/2, sqsize/2 + 2, 0, Math.PI*2);
        ctx.fill();
        for (var i = 1; i < snake.size(); i++) {
            p = snake.get(i);
            ctx.fillRect(p.x * sqsize, p.y * sqsize, sqsize, sqsize);
        }
    }

    function moveSnake(dx, dy) {
        for (var i = snake.size() - 1; i >= 1; i--) {
            snake.get(i).setLocation(snake.get(i-1));
        }
        snake.getFirst().x += dx; 
        snake.getFirst().y += dy;
    }

    function growSnake(n) {
        while(n > 0) {
            snake.add(new Point(snake.getLast()));
            n --;
        }
    }

    function moveFood() {
        food.x = parseInt(((Math.random() * width/sqsize)), 10);
        food.y = parseInt(((Math.random() * height/sqsize)), 10);
        // avoid to put food on score text
        if(food.y < 2) {
            food.y = 2;
        }
    }

    function drawFood() {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.fillRect(food.x * sqsize, food.y * sqsize, sqsize, sqsize);
    }

    function drawScore() {
        var text = "SCORE: " + score;
        ctx.fillText(text, width - ctx.measureText(text).width - 10, 15);
    }

    function setFrameRateInFramesPerSecond(framerate) {
        delayInMs = 1000 / framerate;
    }
  
    function checkArrowKeysDown(e){
        var arrs= [], key= window.event? event.keyCode: e.keyCode;
        arrs[37]= 'left';
        arrs[38]= 'up';
        arrs[39]= 'right';
        arrs[40]= 'down';

        if(arrs[key] == 'left') {
            if (dy) {
                dx = -1;
                dy = 0;
            }
        } 
        if(arrs[key] == 'right') {
            if(dy) {
                dx = 1;
                dy = 0;
            }
        }
        if(arrs[key] == 'up') {
            if(dx) {
                dx = 0;
                dy = -1;
            } 
        }
        if(arrs[key] == 'down') {
            if(dx) {
                dx = 0;
                dy = 1;
            }
        }
    }

    // Check if it really works
    //domReady(function () {
        init();
    //});
});

