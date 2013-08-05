/*global document: false, require: false, window: false, event: false, performance: false */

require([
    'classes/point',
    'classes/linkedlist',
    'utility/raf',
    'libs/domReady'
], function(Point, LinkedList, raf, domReady) {

    var canvas,
        ctx,
        width,
        height,
        snake,
        sqsize,
        dx,
        dy,
        theta,
        food,
        score,
        now,
        delta,
        delayInMs,
        then,
        totalTimeSinceLastRedraw;


    function checkArrowKeysDown(e) {

        var arrs = [],
            key = window.event ? event.keyCode : e.keyCode;

        arrs[37] = 'left';
        arrs[38] = 'up';
        arrs[39] = 'right';
        arrs[40] = 'down';

        if (arrs[key] === 'left') {
            if (dy) {
                dx = -1;
                dy = 0;
                theta = Math.PI;
            }
        }
        if (arrs[key] === 'right') {
            if (dy) {
                dx = 1;
                dy = 0;
                theta = 0;
            }
        }
        if (arrs[key] === 'up') {
            if (dx) {
                dx = 0;
                dy = -1;
                theta = (3 * Math.PI) / 2;
            }
        }
        if (arrs[key] === 'down') {
            if (dx) {
                dx = 0;
                dy = 1;
                theta = Math.PI / 2;
            }
        }
    }

    function setFrameRateInFramesPerSecond(framerate) {
        delayInMs = 1000 / framerate;
    }

    function growSnake(n) {
        while (n > 0) {
            snake.add(new Point(snake.getLast()));
            n -= 1;
        }
    }

    function drawSnakeHead() {
        var offset, p, p0, p1, p2, p3, p4, p5, p6, cp1, cp2, cp3, cp4, eye1, eye2;

        offset = 2;

        p = snake.get(0);
        p0 = new Point((p.x * sqsize) + (sqsize / 2), (p.y * sqsize) + (sqsize / 2));

        p1 = new Point(-sqsize / 3, -sqsize / 2);
        p2 = new Point((3 * sqsize / 2) / 4, -sqsize / 2);
        p3 = new Point(sqsize, -sqsize / 6);
        p4 = new Point(sqsize, sqsize / 6);
        p5 = new Point((3 * sqsize / 2) / 4, sqsize / 2);
        p6 = new Point(-sqsize / 3, sqsize / 2);

        cp1 = new Point(0, -(2 + sqsize / 2));
        cp2 = new Point(sqsize + offset, 0);
        cp3 = new Point(0, 2 + sqsize / 2);
        cp4 = new Point(-3 * sqsize / 4, 0);

        eye1 = new Point(sqsize / 2, -sqsize / 4);
        eye2 = new Point(sqsize / 2, sqsize / 4);

        ctx.save();
        ctx.translate(p0.x, p0.y);
        ctx.scale(2, 2);
        ctx.rotate(theta);

        // HEAD
        ctx.fillStyle = 'black';
        ctx.moveTo(p1.x, p2.y);
        ctx.quadraticCurveTo(cp1.x, cp1.y, p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.quadraticCurveTo(cp2.x, cp2.y, p4.x, p4.y);
        ctx.lineTo(p5.x, p5.y);
        ctx.quadraticCurveTo(cp3.x, cp3.y, p6.x, p6.y);
        ctx.quadraticCurveTo(cp4.x, cp4.y, p1.x, p1.y);
        ctx.closePath();
        ctx.fill();

        // EYES
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(eye1.x, eye1.y, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eye2.x, eye2.y, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawSnake() {

        var p, i;

        drawSnakeHead();

        ctx.fillStyle = 'black';
        for (i = 1; i < snake.size(); i += 1) {
            p = snake.get(i);
            //ctx.fillRect(p.x * sqsize, p.y * sqsize, sqsize, sqsize);
            ctx.beginPath();
            ctx.arc(p.x * sqsize + sqsize / 2, p.y * sqsize + sqsize / 2, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function moveSnake(dx, dy) {

        var  i;

        for (i = snake.size() - 1; i >= 1; i -= 1) {
            snake.get(i).setLocation(snake.get(i - 1));
        }
        snake.getFirst().x += dx;
        snake.getFirst().y += dy;
    }

    function moveFood() {

        var i;

        food.x = parseInt((Math.random() * width / sqsize), 10);
        food.y = parseInt((Math.random() * height / sqsize), 10);

        // Avoid drawing food on text
        if (food.y < 2) {
            food.y = 2;
        }

        // Avoid to draw new food on snake body
        for (i = 1; i < snake.size(); i += 1) {
            if (snake.get(i).equals(food)) {
                moveFood();
            }
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
    function draw() {

        var i;

        now = performance.now();
        delta = now - then;


        if (totalTimeSinceLastRedraw > delayInMs) {

            ctx.clearRect(0, 0, width, height);
            moveSnake(dx, dy);
            if (snake.getFirst().equals(food)) {
                moveFood();
                growSnake(3);
                score += 10;
            }

            if (snake.getFirst().x < 0 ||
                snake.getFirst().x >= (width / sqsize) ||
                snake.getFirst().y < 0 ||
                snake.getFirst().y >= (height / sqsize)) {
                    initGame();
                    return;
            }

            for (i = 1; i < snake.size(); i += 1) {

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

    function initGame() {
        setFrameRateInFramesPerSecond(60);
        snake.clear();
        snake.addFirst(new Point(20, 20));
        growSnake(5);

        food = new Point(parseInt((Math.random() * width) / sqsize, 10),
                         parseInt((Math.random() * height) / sqsize, 10));

        // Avoid drawing food on text
        if (food.y < 2) {
            food.y = 2;
        }

        score = 0;
        then = performance.now();
        totalTimeSinceLastRedraw = 0;
        draw();
    }

    function init() {

        canvas = document.getElementById('snake');
        ctx = canvas.getContext('2d');
        canvas.style.border = '4px solid #000';
        width = canvas.width;
        height = canvas.height;
        ctx.font = 'normal bold 12px consolas';

        sqsize = 10;
        dx = 1;
        dy = 0;
        theta = 0;
        snake = new LinkedList();

        document.onkeydown = checkArrowKeysDown;
        initGame();
    }

    domReady(function () {
        init();
    });
});

