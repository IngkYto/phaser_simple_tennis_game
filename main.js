var gameScene = new Phaser.Scene('Game');

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },    
    scene: gameScene,
};

var game = new Phaser.Game(config);


var player1, player2, ball;
var cursors, wasd;
var score1 = 0, score2 = 0;
var scoreText1, scoreText2;


function hitBall(player, ball) {
    let diff = 0;

    if (ball.y < player.y) {
        // ボールがプレイヤーの上半分にある場合、ボールを上向きに跳ね返らせる
        diff = player.y - ball.y;
        ball.setVelocityY(-10 * diff);
    } else if (ball.y > player.y) {
        // ボールがプレイヤーの下半分にある場合、ボールを下向きに跳ね返らせる
        diff = ball.y - player.y;
        ball.setVelocityY(10 * diff);
    } else {
        // ボールが完全に中央にある場合
        // 直上に跳ね返るのを防ぐために少しランダムなXを加える
        ball.setVelocityY(2 + Math.random() * 8);
    }

    // ここでボールの現在の方向に基づいて速度を手動で設定します
    if(ball.body.velocity.x > 0) {
        ball.setVelocityX(300); // この値を調整することで速度を制御できます
    } else {
        ball.setVelocityX(-300); // ここも同様です
    }
}




gameScene.preload = function() {
    this.load.image('player', './assets/bar.png');
    this.load.image('ball', './assets/ball.png');
}

gameScene.create = function() {
    player1 = this.physics.add.sprite(50, this.sys.game.config.height / 2, 'player');
    player2 = this.physics.add.sprite(this.sys.game.config.width - 50, this.sys.game.config.height / 2, 'player');

    // Set players as immovable
    player1.setImmovable(true);
    player2.setImmovable(true);

    ball = this.physics.add.sprite(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 'ball');

    player1.setCollideWorldBounds(true);
    player2.setCollideWorldBounds(true);
    ball.setCollideWorldBounds(true);
    ball.setBounce(1, 1);

    cursors = this.input.keyboard.createCursorKeys();
    wasd = this.input.keyboard.addKeys({ 'up': Phaser.Input.Keyboard.KeyCodes.W, 'down': Phaser.Input.Keyboard.KeyCodes.S });

    this.physics.add.collider(player1, ball, hitBall, null, this);
    this.physics.add.collider(player2, ball, hitBall, null, this);

    scoreText1 = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#ffffff' }); // 文字色を青に設定
    scoreText2 = this.add.text(this.sys.game.config.width - 170, 16, 'score: 0', { fontSize: '32px', fill: '#ffffff' }); // 文字色を青に設定

    this.countdownText = this.add.text(game.config.width / 2, game.config.height / 2 - 100, '', { fontSize: '64px', fill: '#ffffff' }).setOrigin(0.5);

    this.gameOverFlag = false;
    this.gameOverText = this.add.text(game.config.width / 2, game.config.height / 2, '', { fontSize: '64px', fill: '#ffffff' }).setOrigin(0.5);

    this.resetBall();
}

gameScene.update = function() {
    

    if (wasd.up.isDown) {
        player1.setVelocityY(-320);
    } else if (wasd.down.isDown) {
        player1.setVelocityY(320);
    } else {
        player1.setVelocityY(0);
    }

    if (cursors.up.isDown) {
        player2.setVelocityY(-320);
    } else if (cursors.down.isDown) {
        player2.setVelocityY(320);
    } else {
        player2.setVelocityY(0);
    }

    if (ball.x < player1.x) {
        score2++;
        scoreText2.setText('score: ' + score2);
        if (score2 === 3) {
            this.gameOver('Player 2 Wins!');
        }else{
            this.resetBall();
        }
        
    } else if (ball.x > player2.x) {
        score1++;
        scoreText1.setText('score: ' + score1);
        if (score1 === 3) {
            this.gameOver('Player 1 Wins!');
        }else{  
            this.resetBall();
        }
    }

    // ボールが動き出すまで何もしない
    if (ball.body.velocity.x === 0 && ball.body.velocity.y === 0) {
        return;
    }
}

gameScene.resetBall = function() {
    ball.setPosition(this.game.config.width / 2, this.game.config.height / 2);
    ball.setVelocity(0, 0); // ボールの速度を0に設定
    //this.time.delayedCall(3000, this.startBall, [], this);

    let countdown = 3;
    this.countdownText.setText(countdown);

    // カウントダウンのためのタイマーを設定
    if (!this.gameOverFlag) {
        this.time.addEvent({
            delay: 1000,                // 1秒ごとに
            callback: () => {
                countdown--;
                if (countdown == 0) {
                    this.startBall();
                    this.countdownText.setText('');
                } else {
                    this.countdownText.setText(countdown);
                }
            },
            repeat: 2                   // 3回（0を含む）繰り返す
        });
    }   

}

gameScene.startBall = function() {
    let directionX = Math.random() > 0.5 ? 1 : -1;
    let directionY = Math.random() > 0.5 ? 1 : -1;
    let speedY = Math.random() * 200; 
    ball.setVelocity(200 * directionX, speedY * directionY);
}

// ゲームオーバー時の処理を以下のように定義します
gameScene.gameOver = function(winner) {
    ball.setVelocity(0, 0);
    this.gameOverText.setText(winner + '\nCongratulations!');
    this.gameOverFlag = true;
}