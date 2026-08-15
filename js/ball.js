/**
 * NEON PONG - Ball Entity Class
 */

class Ball {
    constructor(courtWidth, courtHeight, baseSpeed = 8.5) {
        this.courtWidth = courtWidth;
        this.courtHeight = courtHeight;
        this.radius = 9;

        this.baseSpeed = baseSpeed;
        this.speed = this.baseSpeed;
        this.maxSpeed = 26;

        this.x = courtWidth / 2;
        this.y = courtHeight / 2;
        this.vx = 1;
        this.vy = 0;

        this.lastHitter = 1; // 1 = Left, 2 = Right
        this.isHyper = false;
        this.hyperTimer = 0;

        this.trail = [];
        this.maxTrailLength = 12;

        this.color = '#ffffff';
        this.glowColor = '#00f0ff';
    }

    reset(direction = 1) {
        this.x = this.courtWidth / 2;
        this.y = this.courtHeight / 2;
        this.speed = this.baseSpeed;
        this.isHyper = false;
        this.hyperTimer = 0;
        this.trail = [];

        // Launch towards loser with slight initial vertical variation
        const angle = (Math.random() * 0.6 - 0.3); // -17 to +17 degrees
        this.vx = direction * Math.cos(angle);
        this.vy = Math.sin(angle);
        this.normalizeVelocity();
    }

    normalizeVelocity() {
        const mag = Math.hypot(this.vx, this.vy);
        if (mag > 0) {
            this.vx /= mag;
            this.vy /= mag;
        }
    }

    applyHyperSpeed(duration = 7) {
        this.isHyper = true;
        this.hyperTimer = duration;
        this.speed = Math.min(this.maxSpeed, this.speed * 1.35);
    }

    update(dt = 1) {
        // Record trail position
        this.trail.push({
            x: this.x,
            y: this.y,
            isHyper: this.isHyper,
            color: this.isHyper ? '#ffe600' : (this.lastHitter === 1 ? '#00f0ff' : '#ff0055')
        });

        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // Hyper speed timer
        if (this.hyperTimer > 0) {
            this.hyperTimer -= (1 / 60) * dt;
            if (this.hyperTimer <= 0) {
                this.isHyper = false;
                this.speed = Math.max(this.baseSpeed, this.speed / 1.2);
            }
        }

        // Move ball
        this.x += this.vx * this.speed * dt;
        this.y += this.vy * this.speed * dt;

        // Top & Bottom Wall Collisions
        if (this.y - this.radius <= 0) {
            this.y = this.radius;
            this.vy = Math.abs(this.vy);
            window.soundEngine.playWallHit();
            window.particleSystem.createSparks(this.x, this.y, '#ffffff', 8, Math.PI / 2, Math.PI * 0.8);
        } else if (this.y + this.radius >= this.courtHeight) {
            this.y = this.courtHeight - this.radius;
            this.vy = -Math.abs(this.vy);
            window.soundEngine.playWallHit();
            window.particleSystem.createSparks(this.x, this.y, '#ffffff', 8, -Math.PI / 2, Math.PI * 0.8);
        }
    }

    checkPaddleCollision(paddle, rallyCount = 0) {
        // Broad phase bounding box check
        const paddleLeft = paddle.x;
        const paddleRight = paddle.x + paddle.width;
        const paddleTop = paddle.y;
        const paddleBottom = paddle.y + paddle.height;

        // Find closest point on paddle rectangle to ball center
        const closestX = Math.max(paddleLeft, Math.min(this.x, paddleRight));
        const closestY = Math.max(paddleTop, Math.min(this.y, paddleBottom));

        const distanceX = this.x - closestX;
        const distanceY = this.y - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;

        // Circle intersects AABB paddle
        if (distanceSquared < (this.radius * this.radius)) {
            // Determine hit direction (must be moving toward the paddle side)
            if (paddle.isLeft && this.vx > 0) return false;
            if (!paddle.isLeft && this.vx < 0) return false;

            // Position snap outside paddle to prevent sticking/tunneling
            if (paddle.isLeft) {
                this.x = paddleRight + this.radius;
                this.lastHitter = 1;
            } else {
                this.x = paddleLeft - this.radius;
                this.lastHitter = 2;
            }

            // Calculate deflection angle based on contact offset from paddle center
            const paddleCenterY = paddle.y + paddle.height / 2;
            const normalizedOffset = (this.y - paddleCenterY) / (paddle.height / 2);
            const clampedOffset = Math.max(-1, Math.min(1, normalizedOffset));

            // Max bounce angle = 60 degrees (Math.PI / 3)
            const maxBounceAngle = Math.PI / 3;
            const bounceAngle = clampedOffset * maxBounceAngle;

            // Add spin velocity transferred from moving paddle
            const spinFactor = paddle.vy * 0.08;

            const dir = paddle.isLeft ? 1 : -1;
            this.vx = dir * Math.cos(bounceAngle);
            this.vy = Math.sin(bounceAngle) + spinFactor;
            this.normalizeVelocity();

            // Increment speed with each rally hit (4% speedup up to maxSpeed)
            this.speed = Math.min(this.maxSpeed, this.speed * 1.04);

            // Screen Shake for fast strikes
            if (this.speed > 14) {
                window.particleSystem.addTrauma(0.25);
            }

            // Audio blip
            window.soundEngine.playPaddleHit(rallyCount, this.isHyper);

            // Particle sparks matching paddle color
            const sparkAngle = paddle.isLeft ? 0 : Math.PI;
            window.particleSystem.createSparks(this.x, this.y, paddle.color, 16, sparkAngle, Math.PI * 0.9);

            return true;
        }

        return false;
    }

    draw(ctx) {
        ctx.save();

        // 1. Draw Glowing Motion Trails
        for (let i = 0; i < this.trail.length; i++) {
            const pt = this.trail[i];
            const ratio = (i + 1) / this.trail.length;
            const trailRadius = this.radius * ratio * 0.85;

            ctx.beginPath();
            ctx.arc(pt.x, pt.y, Math.max(1, trailRadius), 0, Math.PI * 2);
            ctx.fillStyle = pt.color;
            ctx.globalAlpha = ratio * 0.45;
            ctx.shadowColor = pt.color;
            ctx.shadowBlur = 10 * ratio;
            ctx.fill();
        }

        // 2. Draw Main Ball
        ctx.globalAlpha = 1;
        ctx.shadowColor = this.isHyper ? '#ffe600' : (this.lastHitter === 1 ? '#00f0ff' : '#ff0055');
        ctx.shadowBlur = this.isHyper ? 28 : 18;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.isHyper ? '#fffb96' : '#ffffff';
        ctx.fill();

        // Ball Core Sparkle
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 2, this.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.restore();
    }
}

window.Ball = Ball;
