var score = 0;

var player = {
    x: 300,
    y: 500,
    w: 28,
    h: 28,
    speed: 10
}

var enemies = [
    {
        x: 50,
        y: 50,
        level: 1,
        w: 28,
        h: 28,
        value: 10
    },
    {
        x: 250,
        y: 50,
        level: 1,
        w: 28,
        h: 28,
        value: 10
    },
    {
        x: 450,
        y: 50,
        level: 2,
        w: 24,
        h: 12,
        value: 15
    }
];

var bullets = [];

var mapDiv = document.getElementById("map");
var playerDiv = document.getElementById("player");

const delay = 100;
let now = Date.now();

function displayPlayer() {
    playerDiv.style.top = player.y + "px";
    playerDiv.style.left = player.x + "px";
}

function displayEnemies() {
    var output = "";
    if (enemies.length > 0) {
        for (var i = 0; i < enemies.length; i++) {
            output += `<div class="enemy${enemies[i].level}"
            style="top: ${enemies[i].y}px; left: ${enemies[i].x}px;"></div>`;
        }
    }
    //console.log(output);

    document.getElementById("enemies").innerHTML = output;
}

function moveEnemies() {
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].y += 5;
        if (enemies[i].y > mapDiv.clientHeight) {
            // enemies[i].y = -30;
            // enemies[i].x = Math.floor(Math.random() * mapDiv.clientWidth);
            // enemies[i].level = Math.floor(Math.random() * 2) + 1;
            enemies.splice(i, 1);
        }
    }
}

function displayBullets() {
    var output = "";
    if (bullets.length > 0) {
        for (var i = 0; i < bullets.length; i++) {
            output += `<div class="bullet"
            style="top: ${bullets[i].y}px; left: ${bullets[i].x}px;"></div>`;
        }
    }
    //console.log(output);

    document.getElementById("bullets").innerHTML = output;
}

function moveBullets() {
    for (var i = 0; i < bullets.length; i++) {
        bullets[i].y -= 15;
        if (bullets[i].y < -5) {
            bullets.splice(i, 1);
        }
    }
}

function generateBullet() {
    var bullet = {};
    bullet.x = player.x + 6;
    bullet.y = player.y - 5;
    bullets.push(bullet);
}

function displayScore() {
    document.getElementById("score").innerText = "Score: " + score;
}

function generateEnemy() {
    var enemy = {};

    enemy.x = Math.floor(Math.random() * mapDiv.clientWidth);
    enemy.y = 0;
    enemy.level = Math.floor(Math.random() * 2) + 1;
    switch (enemy.level) {
        case 1:
            enemy.w = 28;
            enemy.h = 28;
            enemy.value = 10;
            break;
        case 2:
            enemy.w = 24;
            enemy.h = 12;
            enemy.value = 15;
            break;
    }

    enemies.push(enemy);
    displayEnemies();
}


function playExplodeSound() {
    var audio = document.createElement("audio");
    document.body.append(audio);
    audio.src = "./assets/explosion.wav";
    audio.play();
    setTimeout(function() {
        audio.remove();
    }, 5000);
}

function gameLoop() {
    displayPlayer();
    moveEnemies();
    displayEnemies();

    moveBullets();
    displayBullets();

    detectCollision();
    displayScore();

    if (score > 500) {
        player.speed = 15;
    }
    else {
        player.speed = 10;
    }
}

function explodeEnemy(enemy) {
    var phase = 0;
    var explosionDiv = document.createElement("div");
    document.body.append(explosionDiv);
    explosionDiv.style.display = "block";
    explosionDiv.classList.add("explosion-0");
    explosionDiv.style.position = "absolute";
    explosionDiv.style.top = enemy.y + "px";
    explosionDiv.style.left = enemy.x + "px";

    var intervalId = setInterval(function() {
        //console.log(explosionDiv);
        if (phase == 5) {
            clearInterval(intervalId);
            intervalId = 0;
            explosionDiv.remove();
        }

        explosionDiv.classList.remove("explosion-" + phase);
        if (phase + 1 != 5)
            explosionDiv.classList.add("explosion-" + (phase + 1));

        //console.log("Phase: " + phase);

        phase++;
    }, 100);
}

function detectCollision() {
    //console.log("Bullets: " + bullets.length + " Enemies: " + enemies.length);
    for (var i = 0; i < bullets.length; i++) {
        for (var j = 0; j < enemies.length; j++) {
            if (bullets.length == 0)
                break;

            if (bullets[i].x < enemies[j].x + enemies[j].w &&
                    bullets[i].x + 18 > enemies[j].x &&
                    bullets[i].y < enemies[j].y + enemies[j].h &&
                    bullets[i].y + 18 > enemies[j].y) {
                // console.log("Bullet " + i + " hit enemy " + j);
                score += enemies[j].value;
                explodeEnemy(enemies[j]);
                playExplodeSound();
                bullets.splice(i, 1);
                enemies.splice(j, 1);
            }
        }
    }

    for (var i = 0; i < enemies.length; i++) {
        if (enemies[i].x < player.x + player.w &&
            enemies[i].x + enemies[i].w > player.x &&
            enemies[i].y < player.y + player.h &&
            enemies[i].y + enemies[i].h > player.y) {
                score -= 500;
                explodeEnemy(enemies[i]);
                playExplodeSound();
                enemies.splice(i, 1);
            }
    }
}


document.onkeydown = function (e) {
    if (e.keyCode == 37 && player.x > 0) {
        player.x -= player.speed;
    }
    else if (e.keyCode == 38 && player.y > mapDiv.clientHeight * 2 / 3) {
        player.y -= player.speed;
    }
    else if (e.keyCode == 39 && player.x < mapDiv.clientWidth) {
        player.x += player.speed;
    }
    else if (e.keyCode == 40 && player.y < mapDiv.clientHeight - 28) {
        player.y += player.speed;
    }
    else if (e.keyCode == 32 && Date.now() > now + delay) {
        generateBullet();
        now = Date.now();
    }

    displayPlayer();
}

displayPlayer();
displayEnemies();

setInterval(gameLoop, 50);
setInterval(generateEnemy, 1000);