// プレイヤーやボールなどのゲームオブジェクトとスコアを格納する変数の初期化
var player1, player2, ball;
var cursors, wasd;
var score1 = 0, score2 = 0;
var scoreText1, scoreText2;
// スマッシュキーが押された時間を保持
var smashTime1 = 0;
var smashTime2 = 0;

var startScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function StartScene() {
        Phaser.Scene.call(this, { key: 'startScene' });
    },

    preload: function() {
        // 必要なアセットをここで読み込む
        this.load.image('startButton', 'assets/startButton.png'); // あなたのスタートボタンの画像
    },

    create: function() {
        // タイトルの作成
        let title = this.add.text(400, 200, 'Game Title', { fontSize: '32px', fill: '#fff' });
        title.setOrigin(0.5);

        // スタートボタンの作成
        let startButton = this.add.image(400, 400, 'startButton').setInteractive();
        startButton.setOrigin(0.5);

        // スタートボタンがクリックされたらゲームシーンに遷移する
        startButton.on('pointerdown', () => this.scene.start('gameScene'));
    }
});



let gameScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:
    function GameScene() {
        Phaser.Scene.call(this, { key: 'gameScene' });
    },

    
    preload: function() {
        this.load.image('player', './assets/bar.png');// プレイヤー用の画像を読み込む
        this.load.image('ball', './assets/ball.png');// ボール用の画像を読み込む
    },

    create: function() {
        // プレイヤー1のスプライトを作成し、画面の左側中央に配置
        player1 = this.physics.add.sprite(50, this.sys.game.config.height / 2, 'player');
        
        // プレイヤー2のスプライトを作成し、画面の右側中央に配置
        player2 = this.physics.add.sprite(this.sys.game.config.width - 50, this.sys.game.config.height / 2, 'player');

        // プレイヤー1とプレイヤー2を不動体に設定（他の物理体に押し出されないようにする）
        player1.setImmovable(true);
        player2.setImmovable(true);

        // ボールのスプライトを作成し、画面の中央に配置
        ball = this.physics.add.sprite(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 'ball');

        // プレイヤー1、プレイヤー2、ボールがゲームエリアの境界線と衝突するように設定
        player1.setCollideWorldBounds(true);
        player2.setCollideWorldBounds(true);
        ball.setCollideWorldBounds(true);
        
        // ボールが境界線や他の物体に衝突したときに反射するように設定
        ball.setBounce(1, 1);

        // カーソルキーの入力を監視するためのオブジェクトを作成
        cursors = this.input.keyboard.createCursorKeys();
        
        // W（上）とS（下）キーの入力を監視するためのオブジェクトを作成
        wasd = this.input.keyboard.addKeys({ 'up': Phaser.Input.Keyboard.KeyCodes.W, 'down': Phaser.Input.Keyboard.KeyCodes.S });

        // スマッシュキーを定義
        smashKey1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        smashKey2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);


        // プレイヤー1とボール、プレイヤー2とボールが衝突したときに hitBall 関数が呼ばれるように設定
        this.physics.add.collider(player1, ball, this.hitBall, null, this);
        this.physics.add.collider(player2, ball, this.hitBall, null, this);

        // プレイヤー1とプレイヤー2のスコア表示を画面の左上と右上に作成
        scoreText1 = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#ffffff' });
        scoreText2 = this.add.text(this.sys.game.config.width - 170, 16, 'score: 0', { fontSize: '32px', fill: '#ffffff' });

        // ゲーム開始前のカウントダウン表示を作成
        this.countdownText = this.add.text(game.config.width / 2, game.config.height / 2 - 100, '', { fontSize: '64px', fill: '#ffffff' }).setOrigin(0.5);

        // ゲームオーバーフラグを初期化（false:ゲーム進行中, true:ゲーム終了）
        this.gameOverFlag = false;
        
        // ゲームオーバー時のテキストを作成
        this.gameOverText = this.add.text(game.config.width / 2, game.config.height / 2, '', { fontSize: '64px', fill: '#ffffff' }).setOrigin(0.5);

        // ゲーム開始時にボールを初期位置にリセット
        this.resetBall();
    },

    hitBall: function(player, ball) {
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

        // スマッシュが発生した場合にはボールの速度を増す
        let smashBoost = 1;
        if ((player === player1 && this.time.now - smashTime1 < 200) || 
            (player === player2 && this.time.now - smashTime2 < 200)) {
            smashBoost = 8;
        }

        // ここでボールの現在の方向に基づいて速度を手動で設定します
        if(ball.body.velocity.x > 0) {
            ball.setVelocityX(300 * smashBoost); // この値を調整することで速度を制御できます
        } else {
            ball.setVelocityX(-300 * smashBoost); // ここも同様です
        }
    },

    update: function() {
         // Wキーが押されたら、プレイヤー1を上に移動
        if (wasd.up.isDown) {
            player1.setVelocityY(-320);
        } 
        // Sキーが押されたら、プレイヤー1を下に移動
        else if (wasd.down.isDown) {
            player1.setVelocityY(320);
        } 
        // キーが押されていなければ、プレイヤー1の移動を停止
        else {
            player1.setVelocityY(0);
        }

        // 上カーソルキーが押されたら、プレイヤー2を上に移動
        if (cursors.up.isDown) {
            player2.setVelocityY(-320);
        } 
        // 下カーソルキーが押されたら、プレイヤー2を下に移動
        else if (cursors.down.isDown) {
            player2.setVelocityY(320);
        } 
        // キーが押されていなければ、プレイヤー2の移動を停止
        else {
            player2.setVelocityY(0);
        }

        // ボールがプレイヤー1の位置より左にある場合、プレイヤー2に得点を追加
        if (ball.x < player1.x) {
            score2++;
            scoreText2.setText('score: ' + score2);
            // プレイヤー2の得点が3点になったらゲーム終了
            if (score2 === 3) {
                this.scene.start('endScene', { winner: 'Player 2 Wins!' });
            }
            // それ以外はボールを初期位置にリセット
            else{
                this.resetBall();
            }
        } 
        // ボールがプレイヤー2の位置より右にある場合、プレイヤー1に得点を追加
        else if (ball.x > player2.x) {
            score1++;
            scoreText1.setText('score: ' + score1);
            // プレイヤー1の得点が3点になったらゲーム終了
            if (score1 === 3) {
                this.scene.start('endScene', { winner: 'Player 1 Wins!' });
            }
            // それ以外はボールを初期位置にリセット
            else{  
                this.resetBall();
            }
        }

        if (smashKey1.isDown) {
            smashTime1 = this.time.now;
        }

        if (smashKey2.isDown) {
            smashTime2 = this.time.now;
        }

        // スマッシュキーが押されたときに棒を前に動かす
        if (Phaser.Input.Keyboard.JustDown(smashKey1)) {
            player1.x += 20;
            this.time.delayedCall(100, function() {
                player1.x -= 20;
            }, [], this);
        }

        if (Phaser.Input.Keyboard.JustDown(smashKey2)) {
            player2.x -= 20;
            this.time.delayedCall(100, function() {
                player2.x += 20;
            }, [], this);
        }

        // ボールが静止している間は何もしない
        if (ball.body.velocity.x === 0 && ball.body.velocity.y === 0) {
            return;
        }
    },

    // カウントダウン後にボールを動き出すための関数
    resetBall: function() {
        ball.setPosition(this.game.config.width / 2, this.game.config.height / 2);
        ball.setVelocity(0, 0); // ボールの速度を0に設定
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
    },

    // カウントダウン後にボールを動き出すための関数
    startBall: function() {
        let directionX = Math.random() > 0.5 ? 1 : -1;
        let directionY = Math.random() > 0.5 ? 1 : -1;
        let speedY = Math.random() * 200; 
        ball.setVelocity(200 * directionX, speedY * directionY);
    },

    
});


// ゲームオーバーシーン
var endScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function EndScene() {
        Phaser.Scene.call(this, { key: 'endScene' });
    },

    preload: function() {
        // ボタン画像をロード
        this.load.image('startButton', 'assets/startButton.png');
    },

    create: function(data) {
        this.gameOverText = this.add.text(game.config.width / 2, game.config.height / 2, '', { fontSize: '64px', fill: '#ffffff' }).setOrigin(0.5);
        this.gameOverText.setText(data.winner + '\nCongratulations!');

        // リスタートボタンを追加
        this.restartButton = this.add.image(game.config.width / 2, game.config.height / 2 + 150, 'startButton').setInteractive();

        // ボタンクリックイベントを設定
        this.restartButton.on('pointerdown', () => this.scene.start('gameScene'));
    }
});


// ゲームの設定を記述するオブジェクト
var config = {
    type: Phaser.AUTO, // レンダリングコンテキストを自動的に選択
    width: 800, // ゲームの幅を800pxに設定
    height: 600, // ゲームの高さを600pxに設定
    physics: {
        default: 'arcade', // デフォルトの物理エンジンとしてアーケード物理エンジンを使用
        arcade: {
            gravity: { y: 0 }, // Y軸の重力を0に設定（上下の重力を適用しない）
            debug: false // デバッグモードを無効に設定
        }
    },    
    scene: [startScene, gameScene, endScene], // 使用するシーンをgameSceneに設定
};

// 上記の設定を用いて新しいゲームを作成
var game = new Phaser.Game(config);
