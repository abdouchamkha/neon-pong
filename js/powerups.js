/**
 * NEON PONG - Power-up System
 */

const PowerUpType = {
    SPEED: { id: 'SPEED', name: 'HYPER SPEED', icon: '⚡', color: '#ffe600', glow: 'rgba(255, 230, 0, 0.8)' },
    MEGA: { id: 'MEGA', name: 'MEGA PADDLE', icon: '🏓', color: '#00ff66', glow: 'rgba(0, 255, 102, 0.8)' },
    MULTI: { id: 'MULTI', name: 'MULTI-BALL', icon: '💫', color: '#ff71ce', glow: 'rgba(255, 113, 206, 0.8)' },
    FREEZE: { id: 'FREEZE', name: 'FREEZE BLAST', icon: '❄️', color: '#00ffff', glow: 'rgba(0, 255, 255, 0.8)' }
};

class PowerUpItem {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.radius = 18;
        this.lifeTime = 14; // stays on screen for 14 seconds
        this.age = 0;
        this.pulse = 0;
    }

    update(dt = 1) {
        this.age += (1 / 60) * dt;
        this.pulse += 0.06 * dt;
        return this.age < this.lifeTime;
    }

    draw(ctx) {
        ctx.save();

        const floatY = this.y + Math.sin(this.pulse) * 5;
        const scale = 1 + Math.sin(this.pulse * 2) * 0.08;

        // Outer Glow Ring
        ctx.shadowColor = this.type.glow;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = this.type.color;
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(this.x, floatY, this.radius * scale, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Backdrop
        ctx.fillStyle = 'rgba(10, 14, 28, 0.85)';
        ctx.fill();

        // Power-up Icon
        ctx.font = `${Math.floor(18 * scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText(this.type.icon, this.x, floatY + 1);

        ctx.restore();
    }
}

class PowerUpManager {
    constructor(courtWidth, courtHeight) {
        this.courtWidth = courtWidth;
        this.courtHeight = courtHeight;
        this.items = [];
        this.spawnTimer = 6; // first spawn after 6s of rally
        this.enabled = true;
    }

    reset() {
        this.items = [];
        this.spawnTimer = 8;
    }

    spawnRandom() {
        if (!this.enabled || this.items.length >= 2) return;

        const types = [PowerUpType.SPEED, PowerUpType.MEGA, PowerUpType.MULTI, PowerUpType.FREEZE];
        const randomType = types[Math.floor(Math.random() * types.length)];

        // Spawn in the central safe area of the court
        const minX = this.courtWidth * 0.32;
        const maxX = this.courtWidth * 0.68;
        const minY = this.courtHeight * 0.2;
        const maxY = this.courtHeight * 0.8;

        const x = minX + Math.random() * (maxX - minX);
        const y = minY + Math.random() * (maxY - minY);

        const item = new PowerUpItem(randomType, x, y);
        this.items.push(item);

        window.soundEngine.playPowerupSpawn();
        window.particleSystem.createSparks(x, y, randomType.color, 12);
    }

    update(dt = 1, balls, p1, p2, onMultiBallSpawn) {
        if (!this.enabled) {
            this.items = [];
            return;
        }

        // Spawn countdown
        this.spawnTimer -= (1 / 60) * dt;
        if (this.spawnTimer <= 0) {
            this.spawnRandom();
            this.spawnTimer = 12 + Math.random() * 10;
        }

        // Update items & check ball collisions
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            const isAlive = item.update(dt);

            if (!isAlive) {
                this.items.splice(i, 1);
                continue;
            }

            // Check collision with all active balls
            for (const ball of balls) {
                const dist = Math.hypot(ball.x - item.x, ball.y - (item.y + Math.sin(item.pulse) * 5));
                if (dist <= (ball.radius + item.radius)) {
                    // Trigger Power-up
                    this.applyEffect(item.type, ball.lastHitter, p1, p2, ball, onMultiBallSpawn);
                    
                    window.soundEngine.playPowerupCollect();
                    window.particleSystem.createSparks(item.x, item.y, item.type.color, 24);
                    
                    this.items.splice(i, 1);
                    break;
                }
            }
        }
    }

    applyEffect(type, hitterId, p1, p2, ball, onMultiBallSpawn) {
        const hittingPaddle = hitterId === 1 ? p1 : p2;
        const opponentPaddle = hitterId === 1 ? p2 : p1;

        switch (type.id) {
            case 'SPEED':
                ball.applyHyperSpeed(8);
                break;
            case 'MEGA':
                hittingPaddle.applyMega(10);
                window.uiManager.showPowerupBadge(hitterId, type.icon, 10);
                break;
            case 'FREEZE':
                opponentPaddle.applyFreeze(6);
                window.uiManager.showPowerupBadge(hitterId === 1 ? 2 : 1, type.icon, 6);
                break;
            case 'MULTI':
                if (onMultiBallSpawn) {
                    onMultiBallSpawn(ball);
                }
                break;
        }
    }

    draw(ctx) {
        for (const item of this.items) {
            item.draw(ctx);
        }
    }
}

window.PowerUpManager = PowerUpManager;
window.PowerUpType = PowerUpType;
