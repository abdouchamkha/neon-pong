/**
 * NEON PONG - Particle & Screen FX Engine
 * High-performance visual effects: Sparks, Trailing glows, Goal shockwaves, and Screen Shake.
 */

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.shockwaves = [];
        this.confetti = [];
        this.trauma = 0; // Screen shake trauma (0 to 1)
        this.shakeOffset = { x: 0, y: 0 };
    }

    reset() {
        this.particles = [];
        this.shockwaves = [];
        this.confetti = [];
        this.trauma = 0;
        this.shakeOffset = { x: 0, y: 0 };
    }

    addTrauma(amount) {
        this.trauma = Math.min(1.0, this.trauma + amount);
    }

    // Spark burst on paddle / wall impact
    createSparks(x, y, color, count = 15, baseAngle = null, spread = Math.PI) {
        for (let i = 0; i < count; i++) {
            let angle;
            if (baseAngle !== null) {
                angle = baseAngle + (Math.random() - 0.5) * spread;
            } else {
                angle = Math.random() * Math.PI * 2;
            }

            const speed = 2 + Math.random() * 6;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 1.5 + Math.random() * 3,
                color: color,
                alpha: 1,
                decay: 0.02 + Math.random() * 0.03,
                gravity: 0.05
            });
        }
    }

    // Expanding shockwave ring on goal score
    createShockwave(x, y, color) {
        this.shockwaves.push({
            x,
            y,
            radius: 5,
            maxRadius: 160,
            color: color,
            alpha: 1,
            lineWidth: 6,
            growth: 7
        });
    }

    // Victory confetti explosion
    createConfetti(x, y, colors = ['#00f0ff', '#ff0055', '#ffe600', '#00ff66', '#ff71ce'], count = 60) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 8;
            this.confetti.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: 4 + Math.random() * 6,
                rotation: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.2,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: 0.008 + Math.random() * 0.012,
                gravity: 0.12
            });
        }
    }

    update(dt = 1) {
        // 1. Update Screen Shake
        if (this.trauma > 0) {
            const shake = Math.pow(this.trauma, 2);
            const maxOffset = 14;
            this.shakeOffset.x = (Math.random() * 2 - 1) * maxOffset * shake;
            this.shakeOffset.y = (Math.random() * 2 - 1) * maxOffset * shake;
            this.trauma = Math.max(0, this.trauma - 0.04 * dt);
        } else {
            this.shakeOffset.x = 0;
            this.shakeOffset.y = 0;
        }

        // 2. Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += p.gravity * dt;
            p.vx *= 0.98;
            p.alpha -= p.decay * dt;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // 3. Update Shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.radius += sw.growth * dt;
            sw.alpha = 1 - (sw.radius / sw.maxRadius);
            sw.lineWidth = Math.max(1, 6 * (1 - sw.radius / sw.maxRadius));

            if (sw.radius >= sw.maxRadius || sw.alpha <= 0) {
                this.shockwaves.splice(i, 1);
            }
        }

        // 4. Update Confetti
        for (let i = this.confetti.length - 1; i >= 0; i--) {
            const c = this.confetti[i];
            c.x += c.vx * dt;
            c.y += c.vy * dt;
            c.vy += c.gravity * dt;
            c.vx *= 0.99;
            c.rotation += c.vRot * dt;
            c.alpha -= c.decay * dt;

            if (c.alpha <= 0) {
                this.confetti.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Draw Shockwaves
        for (const sw of this.shockwaves) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.strokeStyle = sw.color;
            ctx.lineWidth = sw.lineWidth;
            ctx.globalAlpha = Math.max(0, sw.alpha);
            ctx.shadowColor = sw.color;
            ctx.shadowBlur = 15;
            ctx.stroke();
            ctx.restore();
        }

        // Draw Particles
        for (const p of this.particles) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.restore();
        }

        // Draw Confetti
        for (const c of this.confetti) {
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.rotation);
            ctx.fillStyle = c.color;
            ctx.globalAlpha = Math.max(0, c.alpha);
            ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
            ctx.restore();
        }

        ctx.restore();
    }
}

window.particleSystem = new ParticleSystem();
