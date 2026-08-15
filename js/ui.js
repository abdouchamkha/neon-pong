/**
 * NEON PONG - UI & State Interaction Manager
 */

class UIManager {
    constructor() {
        this.dom = {
            appContainer: document.getElementById('appContainer'),
            header: document.getElementById('gameHeader'),
            p1Name: document.getElementById('p1Name'),
            p2Name: document.getElementById('p2Name'),
            p1Score: document.getElementById('p1Score'),
            p2Score: document.getElementById('p2Score'),
            rallyCount: document.getElementById('rallyCount'),
            targetScoreDisplay: document.getElementById('targetScoreDisplay'),
            speedBar: document.getElementById('speedBar'),
            p1PowerupBadge: document.getElementById('p1PowerupBadge'),
            p2PowerupBadge: document.getElementById('p2PowerupBadge'),
            p1BadgeProgress: document.getElementById('p1BadgeProgress'),
            p2BadgeProgress: document.getElementById('p2BadgeProgress'),
            audioToggleBtn: document.getElementById('audioToggleBtn'),
            soundOnIcon: document.getElementById('soundOnIcon'),
            soundOffIcon: document.getElementById('soundOffIcon'),
            pauseToggleBtn: document.getElementById('pauseToggleBtn'),
            courtAnnouncement: document.getElementById('courtAnnouncement'),
            announcementText: document.getElementById('announcementText'),
            announcementSubtext: document.getElementById('announcementSubtext'),
            bestRallyScore: document.getElementById('bestRallyScore'),
            p2ControlHint: document.getElementById('p2ControlHint'),
            touchControls: document.getElementById('touchControls'),
            p2TouchZone: document.getElementById('p2TouchZone'),

            // Modals
            mainMenu: document.getElementById('mainMenu'),
            difficultyModal: document.getElementById('difficultyModal'),
            pauseModal: document.getElementById('pauseModal'),
            gameOverModal: document.getElementById('gameOverModal'),
            settingsModal: document.getElementById('settingsModal'),
            helpModal: document.getElementById('helpModal'),

            // Form inputs
            themePicker: document.getElementById('themePicker'),
            scoreLimitSelect: document.getElementById('scoreLimitSelect'),
            ballSpeedSelect: document.getElementById('ballSpeedSelect'),
            powerupsToggle: document.getElementById('powerupsToggle'),
            mouseControlToggle: document.getElementById('mouseControlToggle'),
            soundEffectsToggle: document.getElementById('soundEffectsToggle'),
            soundVolumeSlider: document.getElementById('soundVolumeSlider'),
            volValueText: document.getElementById('volValueText'),

            // Game over elements
            winnerTitle: document.getElementById('winnerTitle'),
            winnerSubtitle: document.getElementById('winnerSubtitle'),
            winnerTrophy: document.getElementById('winnerTrophy'),
            statFinalScore: document.getElementById('statFinalScore'),
            statMaxRally: document.getElementById('statMaxRally'),
            statMaxSpeed: document.getElementById('statMaxSpeed'),
            statMatchTime: document.getElementById('statMatchTime')
        };

        this.powerupTimers = { 1: { current: 0, total: 0 }, 2: { current: 0, total: 0 } };
        this.loadSettings();
    }

    loadSettings() {
        try {
            const savedTheme = localStorage.getItem('pong_theme') || 'theme-cyan-magenta';
            this.setTheme(savedTheme);

            const savedLimit = localStorage.getItem('pong_score_limit') || '11';
            this.dom.scoreLimitSelect.value = savedLimit;

            const savedSpeed = localStorage.getItem('pong_ball_speed') || 'normal';
            this.dom.ballSpeedSelect.value = savedSpeed;

            const savedPowerups = localStorage.getItem('pong_powerups') !== 'false';
            this.dom.powerupsToggle.checked = savedPowerups;

            const savedMouse = localStorage.getItem('pong_mouse_control') === 'true';
            this.dom.mouseControlToggle.checked = savedMouse;

            const savedSound = localStorage.getItem('pong_sound') !== 'false';
            this.dom.soundEffectsToggle.checked = savedSound;
            if (!savedSound) {
                window.soundEngine.toggleMute();
                this.updateSoundIcons(true);
            }

            const savedVol = localStorage.getItem('pong_vol') || '75';
            this.dom.soundVolumeSlider.value = savedVol;
            this.dom.volValueText.textContent = `${savedVol}%`;
            window.soundEngine.setVolume(parseInt(savedVol, 10) / 100);

            const bestRally = localStorage.getItem('pong_best_rally') || '0';
            this.dom.bestRallyScore.textContent = bestRally;
        } catch (e) {
            console.warn('LocalStorage error:', e);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('pong_score_limit', this.dom.scoreLimitSelect.value);
            localStorage.setItem('pong_ball_speed', this.dom.ballSpeedSelect.value);
            localStorage.setItem('pong_powerups', this.dom.powerupsToggle.checked);
            localStorage.setItem('pong_mouse_control', this.dom.mouseControlToggle.checked);
            localStorage.setItem('pong_sound', this.dom.soundEffectsToggle.checked);
            localStorage.setItem('pong_vol', this.dom.soundVolumeSlider.value);
        } catch (e) {
            console.warn('LocalStorage save error:', e);
        }
    }

    setTheme(themeName) {
        document.body.className = themeName;
        try {
            localStorage.setItem('pong_theme', themeName);
        } catch (e) {}

        const themeBtns = this.dom.themePicker.querySelectorAll('.theme-option');
        themeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeName);
        });

        // Update paddle colors in game if running
        if (window.gameInstance) {
            window.gameInstance.updateThemeColors();
        }
    }

    updateSoundIcons(isMuted) {
        this.dom.soundOnIcon.classList.toggle('hidden', isMuted);
        this.dom.soundOffIcon.classList.toggle('hidden', !isMuted);
    }

    showModal(modalElement) {
        // Hide all screens
        [
            this.dom.mainMenu,
            this.dom.difficultyModal,
            this.dom.pauseModal,
            this.dom.gameOverModal,
            this.dom.settingsModal,
            this.dom.helpModal
        ].forEach(m => m.classList.remove('active', 'hidden'));

        modalElement.classList.add('active');
    }

    hideAllModals() {
        [
            this.dom.mainMenu,
            this.dom.difficultyModal,
            this.dom.pauseModal,
            this.dom.gameOverModal,
            this.dom.settingsModal,
            this.dom.helpModal
        ].forEach(m => {
            m.classList.remove('active');
            m.classList.add('hidden');
        });
    }

    showAnnouncement(text, subtext = '', duration = 0) {
        this.dom.announcementText.textContent = text;
        this.dom.announcementSubtext.textContent = subtext;
        this.dom.courtAnnouncement.classList.remove('hidden');

        if (duration > 0) {
            setTimeout(() => {
                this.hideAnnouncement();
            }, duration * 1000);
        }
    }

    hideAnnouncement() {
        this.dom.courtAnnouncement.classList.add('hidden');
    }

    updateHUD(score1, score2, rally, targetScore, currentSpeed, baseSpeed) {
        this.dom.p1Score.textContent = score1;
        this.dom.p2Score.textContent = score2;
        this.dom.rallyCount.textContent = rally;
        this.dom.targetScoreDisplay.textContent = targetScore >= 999 ? 'ENDLESS' : `TARGET: ${targetScore}`;

        // Speed meter percentage (baseSpeed to 24px)
        const speedPct = Math.min(100, Math.max(10, ((currentSpeed - baseSpeed) / 16) * 100 + 15));
        this.dom.speedBar.style.width = `${speedPct}%`;
    }

    showPowerupBadge(playerId, icon, duration) {
        const badge = playerId === 1 ? this.dom.p1PowerupBadge : this.dom.p2PowerupBadge;
        const iconEl = badge.querySelector('.badge-icon');
        iconEl.textContent = icon;

        this.powerupTimers[playerId] = { current: duration, total: duration };
        badge.classList.add('active');
    }

    updatePowerupBadges(dt = 1) {
        [1, 2].forEach(pId => {
            if (this.powerupTimers[pId].current > 0) {
                this.powerupTimers[pId].current -= (1 / 60) * dt;
                const progressEl = pId === 1 ? this.dom.p1BadgeProgress : this.dom.p2BadgeProgress;
                const pct = Math.max(0, (this.powerupTimers[pId].current / this.powerupTimers[pId].total) * 100);
                progressEl.style.width = `${pct}%`;

                if (this.powerupTimers[pId].current <= 0) {
                    const badge = pId === 1 ? this.dom.p1PowerupBadge : this.dom.p2PowerupBadge;
                    badge.classList.remove('active');
                }
            }
        });
    }

    showGameOver(winner, p1Score, p2Score, maxRally, topSpeed, matchDurationSec, isRallyMode = false) {
        if (isRallyMode) {
            this.dom.winnerTrophy.textContent = '🔥';
            this.dom.winnerTitle.textContent = 'RALLY COMPLETE';
            this.dom.winnerSubtitle.textContent = `FINAL RALLY STREAK: ${maxRally}`;
            this.dom.statFinalScore.textContent = `${maxRally} Hits`;
        } else {
            this.dom.winnerTrophy.textContent = '🏆';
            this.dom.winnerTitle.textContent = `${winner} WINS!`;
            this.dom.winnerSubtitle.textContent = 'MATCH CHAMPION';
            this.dom.statFinalScore.textContent = `${p1Score} - ${p2Score}`;
        }

        this.dom.statMaxRally.textContent = maxRally;
        this.dom.statMaxSpeed.textContent = `${topSpeed.toFixed(1)} px/f`;

        const mins = Math.floor(matchDurationSec / 60).toString().padStart(2, '0');
        const secs = Math.floor(matchDurationSec % 60).toString().padStart(2, '0');
        this.dom.statMatchTime.textContent = `${mins}:${secs}`;

        // Check & save best rally record
        try {
            const currentBest = parseInt(localStorage.getItem('pong_best_rally') || '0', 10);
            if (maxRally > currentBest) {
                localStorage.setItem('pong_best_rally', maxRally.toString());
                this.dom.bestRallyScore.textContent = maxRally;
            }
        } catch (e) {}

        this.showModal(this.dom.gameOverModal);
    }
}

window.uiManager = new UIManager();
