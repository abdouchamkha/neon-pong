/**
 * NEON PONG - Main Game Engine
 */

const GameState = {
    MENU: 'MENU',
    COUNTDOWN: 'COUNTDOWN',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    POINT_SCORED: 'POINT_SCORED',
    GAME_OVER: 'GAME_OVER'
};

const GameMode = {
    VS_AI: 'VS_AI',
    LOCAL_2P: 'LOCAL_2P',
    RALLY: 'RALLY'
};

class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // Virtual internal resolution
        this.width = 1280;
        this.height = 720;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.state = GameState.MENU;
        this.mode = GameMode.VS_AI;
        this.aiDifficulty = 'medium';

        // Entities
        this.p1 = new Paddle(true, this.width, this.height);
        this.p2 = new Paddle(false, this.width, this.height);
        this.balls = [];
        this.ai = new AIController(this.aiDifficulty);
        this.powerUpManager = new PowerUpManager(this.width, this.height);

        // Match Config & Stats
        this.targetScore = 11;
        this.baseBallSpeed = 8.5;
        this.currentRally = 0;
        this.maxRally = 0;
        this.topSpeedReached = this.baseBallSpeed;
        this.matchStartTime = 0;
        this.matchDuration = 0;
        this.servingPlayer = 1; // 1 or 2
        this.countdownTimer = 0;

        // Colors
        this.themeColors = {
            p1: '#00f0ff',
            p2: '#ff0055',
            p1Glow: 'rgba(0, 240, 255, 0.8)',
            p2Glow: 'rgba(255, 0, 85, 0.8)',
            courtCenter: 'rgba(0, 240, 255, 0.25)'
        };

        this.updateThemeColors();
    }

    updateThemeColors() {
        const computed = getComputedStyle(document.body);
        this.themeColors.p1 = computed.getPropertyValue('--p1-color').trim() || '#00f0ff';
        this.themeColors.p2 = computed.getPropertyValue('--p2-color').trim() || '#ff0055';
        this.themeColors.p1Glow = computed.getPropertyValue('--p1-glow').trim() || 'rgba(0, 240, 255, 0.8)';
        this.themeColors.p2Glow = computed.getPropertyValue('--p2-glow').trim() || 'rgba(255, 0, 85, 0.8)';
        this.themeColors.courtCenter = computed.getPropertyValue('--court-center').trim() || 'rgba(0, 240, 255, 0.25)';

        if (this.p1) {
            this.p1.color = this.themeColors.p1;
            this.p1.glowColor = this.themeColors.p1Glow;
        }
        if (this.p2) {
            this.p2.color = this.themeColors.p2;
            this.p2.glowColor = this.themeColors.p2Glow;
        }
    }

    startMatch(mode, aiDifficulty = 'medium') {
        this.mode = mode;
        this.aiDifficulty = aiDifficulty;
        this.ai.setDifficulty(aiDifficulty);

        // Load settings values
        this.targetScore = parseInt(window.uiManager.dom.scoreLimitSelect.value, 10) || 11;
        
        const speedSetting = window.uiManager.dom.ballSpeedSelect.value;
        this.baseBallSpeed = speedSetting === 'slow' ? 6.5 : (speedSetting === 'fast' ? 11.0 : 8.5);

        this.powerUpManager.enabled = window.uiManager.dom.powerupsToggle.checked;
        this.powerUpManager.reset();

        // Reset entities
        this.p1.score = 0;
        this.p2.score = 0;
        this.p1.resetPosition();
        this.p2.resetPosition();

        this.currentRally = 0;
        this.maxRally = 0;
        this.topSpeedReached = this.baseBallSpeed;
        this.matchStartTime = Date.now();
        this.matchDuration = 0;
        this.servingPlayer = 1;

        // Update player labels in UI
        if (mode === GameMode.VS_AI) {
            window.uiManager.dom.p1Name.textContent = 'PLAYER 1';
            window.uiManager.dom.p2Name.textContent = `AI (${aiDifficulty.toUpperCase()})`;
            window.uiManager.dom.p2ControlHint.classList.add('hidden');
            window.uiManager.dom.p2TouchZone.classList.add('hidden');
        } else if (mode === GameMode.LOCAL_2P) {
            window.uiManager.dom.p1Name.textContent = 'PLAYER 1';
            window.uiManager.dom.p2Name.textContent = 'PLAYER 2';
            window.uiManager.dom.p2ControlHint.classList.remove('hidden');
            window.uiManager.dom.p2TouchZone.classList.remove('hidden');
        } else if (mode === GameMode.RALLY) {
            window.uiManager.dom.p1Name.textContent = 'SOLO PLAYER';
            window.uiManager.dom.p2Name.textContent = 'REFLECTOR';
            window.uiManager.dom.p2ControlHint.classList.add('hidden');
            window.uiManager.dom.p2TouchZone.classList.add('hidden');
        }

        window.particleSystem.reset();
        window.uiManager.hideAllModals();

        this.prepareServe(1);
    }

    prepareServe(server = 1) {
        this.servingPlayer = server;
        this.state = GameState.COUNTDOWN;
        this.countdownTimer = 1.6; // 1.6s countdown

        this.balls = [new Ball(this.width, this.height, this.baseBallSpeed)];
        const ball = this.balls[0];
        ball.reset(server === 1 ? 1 : -1);

        window.uiManager.showAnnouncement('GET READY', 'MATCH STARTING', 1.5);
        window.soundEngine.playCountdown(false);
    }

    spawnMultiBall(sourceBall) {
        if (this.balls.length >= 4) return;

        const b1 = new Ball(this.width, this.height, sourceBall.speed);
        b1.x = sourceBall.x;
        b1.y = sourceBall.y;
        b1.vx = sourceBall.vx;
        b1.vy = sourceBall.vy + 0.4;
        b1.normalizeVelocity();
        b1.lastHitter = sourceBall.lastHitter;

        const b2 = new Ball(this.width, this.height, sourceBall.speed);
        b2.x = sourceBall.x;
        b2.y = sourceBall.y;
        b2.vx = sourceBall.vx;
        b2.vy = sourceBall.vy - 0.4;
        b2.normalizeVelocity();
        b2.lastHitter = sourceBall.lastHitter;

        this.balls.push(b1, b2);
    }

    pauseGame() {
        if (this.state === GameState.PLAYING || this.state === GameState.COUNTDOWN) {
            this.state = GameState.PAUSED;
            window.uiManager.showModal(window.uiManager.dom.pauseModal);
        }
    }

    resumeGame() {
        if (this.state === GameState.PAUSED) {
            this.state = GameState.PLAYING;
            window.uiManager.hideAllModals();
        }
    }

    update(dt = 1, inputState) {
        if (this.state === GameState.PAUSED || this.state === GameState.MENU || this.state === GameState.GAME_OVER) {
            return;
        }

        // 1. Handle Countdown
        if (this.state === GameState.COUNTDOWN) {
            this.countdownTimer -= (1 / 60) * dt;
            if (this.countdownTimer <= 0) {
                this.state = GameState.PLAYING;
                window.uiManager.hideAnnouncement();
                window.soundEngine.playCountdown(true);
            }
            return;
        }

        // 2. Player 1 Movement
        if (inputState.mouseActive) {
            this.p1.moveTo(inputState.mouseY, dt);
        } else {
            if (inputState.p1Up) this.p1.moveUp(dt);
            if (inputState.p1Down) this.p1.moveDown(dt);
        }
        this.p1.update(dt);

        // 3. Player 2 / AI Movement
        if (this.mode === GameMode.LOCAL_2P) {
            if (inputState.p2Up) this.p2.moveUp(dt);
            if (inputState.p2Down) this.p2.moveDown(dt);
        } else if (this.mode === GameMode.VS_AI) {
            this.ai.update(dt, this.p2, this.balls, this.width, this.height, this.powerUpManager);
        } else if (this.mode === GameMode.RALLY) {
            // Rally mode auto-reflector moves perfectly to track the ball
            if (this.balls.length > 0) {
                this.p2.moveTo(this.balls[0].y, dt * 1.5);
            }
        }
        this.p2.update(dt);

        // 4. Power-ups
        this.powerUpManager.update(dt, this.balls, this.p1, this.p2, (b) => this.spawnMultiBall(b));
        window.uiManager.updatePowerupBadges(dt);

        // 5. Balls Physics & Collision
        let maxBallSpeed = this.baseBallSpeed;

        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            ball.update(dt);

            if (ball.speed > maxBallSpeed) maxBallSpeed = ball.speed;
            if (ball.speed > this.topSpeedReached) this.topSpeedReached = ball.speed;

            // Check paddle collisions
            const hitP1 = ball.checkPaddleCollision(this.p1, this.currentRally);
            const hitP2 = ball.checkPaddleCollision(this.p2, this.currentRally);

            if (hitP1 || hitP2) {
                this.currentRally++;
                if (this.currentRally > this.maxRally) {
                    this.maxRally = this.currentRally;
                }
            }

            // Check Goal / Out of bounds
            if (ball.x - ball.radius < 0) {
                // Point for Player 2
                this.handlePointScored(2, ball, i);
            } else if (ball.x + ball.radius > this.width) {
                // Point for Player 1
                this.handlePointScored(1, ball, i);
            }
        }

        // 6. Visual Particles & Screen Shake
        window.particleSystem.update(dt);

        // 7. Update HUD
        window.uiManager.updateHUD(
            this.p1.score,
            this.p2.score,
            this.currentRally,
            this.targetScore,
            maxBallSpeed,
            this.baseBallSpeed
        );

        this.matchDuration = (Date.now() - this.matchStartTime) / 1000;
    }

    handlePointScored(scoringPlayer, ball, ballIndex) {
        // If in multi-ball mode and multiple balls remain, just eliminate this ball
        if (this.balls.length > 1) {
            window.particleSystem.createSparks(ball.x, ball.y, '#ffffff', 20);
            this.balls.splice(ballIndex, 1);
            return;
        }

        // Point celebration
        const goalX = scoringPlayer === 1 ? this.width : 0;
        const color = scoringPlayer === 1 ? this.themeColors.p1 : this.themeColors.p2;

        window.particleSystem.createShockwave(goalX, ball.y, color);
        window.particleSystem.createSparks(goalX, ball.y, color, 45);
        window.particleSystem.addTrauma(0.5);
        window.soundEngine.playScore(scoringPlayer === 1);

        if (scoringPlayer === 1) {
            this.p1.score++;
        } else {
            this.p2.score++;
        }

        this.currentRally = 0;

        // Check Match Victory
        if (this.mode !== GameMode.RALLY && (this.p1.score >= this.targetScore || this.p2.score >= this.targetScore)) {
            this.handleMatchWin(this.p1.score >= this.targetScore ? 1 : 2);
            return;
        }

        // Next point countdown
        this.prepareServe(scoringPlayer === 1 ? 2 : 1);
    }

    handleMatchWin(winnerId) {
        this.state = GameState.GAME_OVER;
        const winnerName = winnerId === 1 ? 'PLAYER 1' : (this.mode === GameMode.VS_AI ? 'AI BOT' : 'PLAYER 2');

        window.particleSystem.createConfetti(this.width / 2, this.height / 2);

        if (winnerId === 1 || this.mode === GameMode.LOCAL_2P) {
            window.soundEngine.playWin();
        } else {
            window.soundEngine.playDefeat();
        }

        setTimeout(() => {
            window.uiManager.showGameOver(
                winnerName,
                this.p1.score,
                this.p2.score,
                this.maxRally,
                this.topSpeedReached,
                this.matchDuration,
                this.mode === GameMode.RALLY
            );
        }, 1200);
    }

    draw() {
        const ctx = this.ctx;

        ctx.save();
        // Apply Screen Shake Offset
        ctx.translate(window.particleSystem.shakeOffset.x, window.particleSystem.shakeOffset.y);

        // Clear Court Canvas
        ctx.fillStyle = '#05070e';
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw Court Grid & Markings
        this.drawCourt(ctx);

        // Draw Power-ups
        this.powerUpManager.draw(ctx);

        // Draw Paddles
        this.p1.draw(ctx);
        this.p2.draw(ctx);

        // Draw Balls
        for (const ball of this.balls) {
            ball.draw(ctx);
        }

        // Draw Particle Effects on top
        window.particleSystem.draw(ctx);

        ctx.restore();
    }

    drawCourt(ctx) {
        ctx.save();

        // 1. Center Court Line (Dashed Neon)
        ctx.strokeStyle = this.themeColors.courtCenter;
        ctx.lineWidth = 4;
        ctx.setLineDash([16, 16]);
        ctx.shadowColor = this.themeColors.p1;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(this.width / 2, this.height);
        ctx.stroke();

        // 2. Center Ring
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, 80, 0, Math.PI * 2);
        ctx.stroke();

        ctx.setLineDash([]); // reset dash

        // 3. Top & Bottom Border Glow Lines
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(0, 1);
        ctx.lineTo(this.width, 1);
        ctx.moveTo(0, this.height - 1);
        ctx.lineTo(this.width, this.height - 1);
        ctx.stroke();

        ctx.restore();
    }
}

window.Game = Game;
