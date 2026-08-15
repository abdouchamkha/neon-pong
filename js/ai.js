/**
 * NEON PONG - AI Opponent Controller
 */

class AIController {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.reactionDelayTimer = 0;
        this.predictedY = 0;
        this.targetOffset = 0;
        this.updatePredictionTimer = 0;
    }

    setDifficulty(diff) {
        this.difficulty = diff;
        this.targetOffset = 0;
    }

    update(dt = 1, paddle, balls, courtWidth, courtHeight, powerUpManager) {
        if (!paddle || balls.length === 0) return;

        // Pick the most threatening ball (closest ball moving towards AI on right side)
        let targetBall = null;
        let minTime = Infinity;

        for (const ball of balls) {
            if (ball.vx > 0) {
                const distToPaddle = (paddle.x - ball.x);
                const timeToReach = distToPaddle / (ball.vx * ball.speed);
                if (timeToReach > 0 && timeToReach < minTime) {
                    minTime = timeToReach;
                    targetBall = ball;
                }
            }
        }

        // Fallback to first ball or center of court if no ball is moving toward AI
        if (!targetBall) {
            paddle.moveTo(courtHeight / 2, dt * 0.5);
            return;
        }

        // Periodically refresh prediction
        this.updatePredictionTimer -= (1 / 60) * dt;
        if (this.updatePredictionTimer <= 0) {
            this.predictedY = this.calculateTargetY(targetBall, paddle, courtWidth, courtHeight);
            this.updatePredictionTimer = this.getPredictionInterval();
        }

        // Apply difficulty-based movement
        const targetDestination = this.predictedY + this.targetOffset;
        const speedScale = this.getSpeedScale();

        // Move paddle towards target Y
        const currentCenterY = paddle.y + paddle.height / 2;
        const diff = targetDestination - currentCenterY;

        if (Math.abs(diff) > 4) {
            if (diff < 0) {
                paddle.moveUp(dt * speedScale);
            } else {
                paddle.moveDown(dt * speedScale);
            }
        }
    }

    getPredictionInterval() {
        switch (this.difficulty) {
            case 'easy': return 0.35; // slower recalculation
            case 'medium': return 0.18;
            case 'hard': return 0.08;
            case 'impossible': return 0.01;
            default: return 0.15;
        }
    }

    getSpeedScale() {
        switch (this.difficulty) {
            case 'easy': return 0.65;
            case 'medium': return 0.88;
            case 'hard': return 1.08;
            case 'impossible': return 1.35;
            default: return 0.88;
        }
    }

    calculateTargetY(ball, paddle, courtWidth, courtHeight) {
        if (this.difficulty === 'easy') {
            // Easy AI: Only tracks directly when ball is past center, with large random wobble
            if (ball.x < courtWidth * 0.35) {
                return courtHeight / 2;
            }
            this.targetOffset = (Math.random() - 0.5) * 60;
            return ball.y;
        }

        if (this.difficulty === 'medium') {
            // Medium AI: Predicts 1 wall bounce roughly
            this.targetOffset = (Math.random() - 0.5) * 20;
            return this.projectBallTrajectory(ball, paddle.x, courtHeight, 1);
        }

        if (this.difficulty === 'hard') {
            // Hard AI: Accurate multi-bounce projection + tactical edge hitting for smash angles
            const landingY = this.projectBallTrajectory(ball, paddle.x, courtHeight, 3);
            // Intentionally hit near the top or bottom of paddle to create sharp angles
            const tacticalEdgeOffset = (Math.random() > 0.5 ? 1 : -1) * (paddle.height * 0.32);
            this.targetOffset = tacticalEdgeOffset;
            return landingY;
        }

        if (this.difficulty === 'impossible') {
            // Impossible AI: Perfect projection with zero error
            this.targetOffset = 0;
            return this.projectBallTrajectory(ball, paddle.x, courtHeight, 5);
        }

        return ball.y;
    }

    projectBallTrajectory(ball, targetX, courtHeight, maxBounces = 3) {
        let simX = ball.x;
        let simY = ball.y;
        let simVx = ball.vx;
        let simVy = ball.vy;
        const radius = ball.radius;

        if (simVx <= 0) return courtHeight / 2;

        let bounces = 0;
        const step = 8; // step size for raycasting

        while (simX < targetX && bounces <= maxBounces) {
            simX += simVx * step;
            simY += simVy * step;

            if (simY - radius <= 0) {
                simY = radius;
                simVy = Math.abs(simVy);
                bounces++;
            } else if (simY + radius >= courtHeight) {
                simY = courtHeight - radius;
                simVy = -Math.abs(simVy);
                bounces++;
            }
        }

        return Math.max(paddleHeightRadius(courtHeight), Math.min(courtHeight - paddleHeightRadius(courtHeight), simY));
    }
}

function paddleHeightRadius(courtHeight) {
    return 40;
}

window.AIController = AIController;
