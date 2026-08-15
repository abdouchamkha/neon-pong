/**
 * NEON PONG - Paddle Entity Class
 */

class Paddle {
    constructor(isLeft, courtWidth, courtHeight) {
        this.isLeft = isLeft;
        this.courtWidth = courtWidth;
        this.courtHeight = courtHeight;

        this.width = 16;
        this.baseHeight = 110;
        this.height = this.baseHeight;

        this.margin = 35;
        this.x = isLeft ? this.margin : courtWidth - this.margin - this.width;
        this.y = (courtHeight - this.height) / 2;
        this.prevY = this.y;
        this.vy = 0; // vertical velocity

        this.baseSpeed = 10;
        this.speed = this.baseSpeed;

        this.color = isLeft ? '#00f0ff' : '#ff0055';
        this.glowColor = isLeft ? 'rgba(0, 240, 255, 0.8)' : 'rgba(255, 0, 85, 0.8)';

        // Power-up States
        this.megaTimer = 0;
        this.frozenTimer = 0;

        this.score = 0;
    }

    resetPosition() {
        this.height = this.baseHeight;
        this.speed = this.baseSpeed;
        this.y = (this.courtHeight - this.height) / 2;
        this.prevY = this.y;
        this.vy = 0;
        this.megaTimer = 0;
        this.frozenTimer = 0;
    }

    applyMega(duration = 10) {
        this.megaTimer = duration;
        this.height = this.baseHeight * 1.5;
        // Adjust Y if overflow bottom
        if (this.y + this.height > this.courtHeight) {
            this.y = this.courtHeight - this.height;
        }
    }

    applyFreeze(duration = 6) {
        this.frozenTimer = duration;
        this.speed = this.baseSpeed * 0.45;
    }

    update(dt = 1) {
        // Track velocity from movement delta
        this.vy = (this.y - this.prevY) / dt;
        this.prevY = this.y;

        // Update Mega Power-up Timer
        if (this.megaTimer > 0) {
            this.megaTimer -= (1 / 60) * dt;
            if (this.megaTimer <= 0) {
                this.megaTimer = 0;
                this.height = this.baseHeight;
            }
        }

        // Update Frozen Power-up Timer
        if (this.frozenTimer > 0) {
            this.frozenTimer -= (1 / 60) * dt;
            if (this.frozenTimer <= 0) {
                this.frozenTimer = 0;
                this.speed = this.baseSpeed;
            }
        }

        // Constrain strictly to bounds
        this.clampBounds();
    }

    moveUp(dt = 1) {
        this.y -= this.speed * dt;
        this.clampBounds();
    }

    moveDown(dt = 1) {
        this.y += this.speed * dt;
        this.clampBounds();
    }

    moveTo(targetY, dt = 1, lerpFactor = 0.25) {
        // Center the paddle on targetY
        const destination = targetY - this.height / 2;
        const diff = destination - this.y;
        const maxStep = this.speed * dt * 1.5;

        if (Math.abs(diff) <= maxStep) {
            this.y = destination;
        } else {
            this.y += Math.sign(diff) * maxStep;
        }
        this.clampBounds();
    }

    clampBounds() {
        if (this.y < 8) this.y = 8;
        if (this.y + this.height > this.courtHeight - 8) {
            this.y = this.courtHeight - 8 - this.height;
        }
    }

    draw(ctx) {
        ctx.save();

        const radius = this.width / 2;

        // Frozen Effect Glow
        if (this.frozenTimer > 0) {
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 25;
            ctx.strokeStyle = 'rgba(150, 240, 255, 0.9)';
            ctx.lineWidth = 3;
            this.drawRoundedRect(ctx, this.x - 2, this.y - 2, this.width + 4, this.height + 4, radius + 2);
            ctx.stroke();
        } 
        // Mega Paddle Glow
        else if (this.megaTimer > 0) {
            ctx.shadowColor = '#ffe600';
            ctx.shadowBlur = 30;
            ctx.strokeStyle = 'rgba(255, 230, 0, 0.8)';
            ctx.lineWidth = 2;
            this.drawRoundedRect(ctx, this.x - 1, this.y - 1, this.width + 2, this.height + 2, radius + 1);
            ctx.stroke();
        }

        // Main Paddle Body & Glow
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 20;
        ctx.fillStyle = this.color;
        this.drawRoundedRect(ctx, this.x, this.y, this.width, this.height, radius);
        ctx.fill();

        // Inner Core Highlight (Glossy neon bar in the center)
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        this.drawRoundedRect(ctx, this.x + 3, this.y + 6, this.width - 6, this.height - 12, (this.width - 6) / 2);
        ctx.fill();

        ctx.restore();
    }

    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}

window.Paddle = Paddle;
