/**
 * NEON PONG - Main Application & Input Controller
 */

window.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Game Instance
    const game = new Game('gameCanvas');
    window.gameInstance = game;

    // 2. Input Tracking State
    const inputState = {
        p1Up: false,
        p1Down: false,
        p2Up: false,
        p2Down: false,
        mouseActive: false,
        mouseY: 360
    };

    let selectedDifficulty = 'medium';

    // 3. User Gesture Handler for Audio Context
    const triggerAudioUnlock = () => {
        window.soundEngine.init();
        window.soundEngine.resume();
    };

    window.addEventListener('click', triggerAudioUnlock, { once: true });
    window.addEventListener('keydown', triggerAudioUnlock, { once: true });
    window.addEventListener('touchstart', triggerAudioUnlock, { once: true });

    // 4. Keyboard Controls
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();

        // Prevent scrolling for game control keys
        if (['arrowup', 'arrowdown', ' ', 'w', 's'].includes(key)) {
            e.preventDefault();
        }

        // Player 1 Keys (W/S or A/Z)
        if (key === 'w' || key === 'a') inputState.p1Up = true;
        if (key === 's' || key === 'z') inputState.p1Down = true;

        // Player 2 Keys (Arrow Up / Down)
        if (e.key === 'ArrowUp') inputState.p2Up = true;
        if (e.key === 'ArrowDown') inputState.p2Down = true;

        // Spacebar for Serve / Pause
        if (e.key === ' ') {
            if (game.state === GameState.COUNTDOWN) {
                game.countdownTimer = 0; // quick serve
            }
        }

        // Pause Toggle (Esc or P)
        if (key === 'p' || e.key === 'Escape') {
            if (game.state === GameState.PLAYING) {
                game.pauseGame();
            } else if (game.state === GameState.PAUSED) {
                game.resumeGame();
            }
        }

        // Quick Mute Toggle (M)
        if (key === 'm') {
            const isMuted = window.soundEngine.toggleMute();
            window.uiManager.updateSoundIcons(isMuted);
        }
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'w' || key === 'a') inputState.p1Up = false;
        if (key === 's' || key === 'z') inputState.p1Down = false;
        if (e.key === 'ArrowUp') inputState.p2Up = false;
        if (e.key === 'ArrowDown') inputState.p2Down = false;
    });

    // 5. Mouse / Cursor Controls for Player 1
    const canvas = document.getElementById('gameCanvas');

    canvas.addEventListener('mousemove', (e) => {
        if (!window.uiManager.dom.mouseControlToggle.checked) {
            inputState.mouseActive = false;
            return;
        }

        inputState.mouseActive = true;
        const rect = canvas.getBoundingClientRect();
        const scaleY = game.height / rect.height;
        inputState.mouseY = (e.clientY - rect.top) * scaleY;
    });

    canvas.addEventListener('mouseleave', () => {
        inputState.mouseActive = false;
    });

    // 6. Touch Controls for Mobile / Tablets
    const p1TouchUp = document.getElementById('p1TouchUp');
    const p1TouchDown = document.getElementById('p1TouchDown');
    const p2TouchUp = document.getElementById('p2TouchUp');
    const p2TouchDown = document.getElementById('p2TouchDown');

    const bindTouchButton = (btn, onDown, onUp) => {
        if (!btn) return;
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); onDown(); });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); onUp(); });
        btn.addEventListener('mousedown', (e) => { e.preventDefault(); onDown(); });
        btn.addEventListener('mouseup', (e) => { e.preventDefault(); onUp(); });
        btn.addEventListener('mouseleave', (e) => { e.preventDefault(); onUp(); });
    };

    bindTouchButton(p1TouchUp, () => { inputState.p1Up = true; }, () => { inputState.p1Up = false; });
    bindTouchButton(p1TouchDown, () => { inputState.p1Down = true; }, () => { inputState.p1Down = false; });
    bindTouchButton(p2TouchUp, () => { inputState.p2Up = true; }, () => { inputState.p2Up = false; });
    bindTouchButton(p2TouchDown, () => { inputState.p2Down = true; }, () => { inputState.p2Down = false; });

    // Enable touch UI if touch supported
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.getElementById('touchControls').classList.remove('hidden');
    }

    // 7. UI Button Listeners & Modals

    // Main Menu Buttons
    document.getElementById('btnVsAI').addEventListener('click', () => {
        triggerAudioUnlock();
        window.uiManager.showModal(window.uiManager.dom.difficultyModal);
    });

    document.getElementById('btn2P').addEventListener('click', () => {
        triggerAudioUnlock();
        game.startMatch(GameMode.LOCAL_2P);
    });

    document.getElementById('btnRally').addEventListener('click', () => {
        triggerAudioUnlock();
        game.startMatch(GameMode.RALLY);
    });

    document.getElementById('btnSettings').addEventListener('click', () => {
        window.uiManager.showModal(window.uiManager.dom.settingsModal);
    });

    document.getElementById('btnHelp').addEventListener('click', () => {
        window.uiManager.showModal(window.uiManager.dom.helpModal);
    });

    // Difficulty Selection
    const diffCards = document.querySelectorAll('.diff-card');
    diffCards.forEach(card => {
        card.addEventListener('click', () => {
            diffCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedDifficulty = card.dataset.diff;
        });
    });

    document.getElementById('btnBackFromDiff').addEventListener('click', () => {
        window.uiManager.showModal(window.uiManager.dom.mainMenu);
    });

    document.getElementById('btnStartAIGame').addEventListener('click', () => {
        triggerAudioUnlock();
        game.startMatch(GameMode.VS_AI, selectedDifficulty);
    });

    // Pause Menu Actions
    document.getElementById('pauseToggleBtn').addEventListener('click', () => {
        if (game.state === GameState.PLAYING) {
            game.pauseGame();
        } else if (game.state === GameState.PAUSED) {
            game.resumeGame();
        }
    });

    document.getElementById('btnResume').addEventListener('click', () => {
        game.resumeGame();
    });

    document.getElementById('btnRestart').addEventListener('click', () => {
        triggerAudioUnlock();
        game.startMatch(game.mode, game.aiDifficulty);
    });

    document.getElementById('btnPauseSettings').addEventListener('click', () => {
        window.uiManager.showModal(window.uiManager.dom.settingsModal);
    });

    document.getElementById('btnQuitToMenu').addEventListener('click', () => {
        game.state = GameState.MENU;
        window.uiManager.showModal(window.uiManager.dom.mainMenu);
    });

    // Game Over Actions
    document.getElementById('btnPlayAgain').addEventListener('click', () => {
        triggerAudioUnlock();
        game.startMatch(game.mode, game.aiDifficulty);
    });

    document.getElementById('btnGameOverMenu').addEventListener('click', () => {
        game.state = GameState.MENU;
        window.uiManager.showModal(window.uiManager.dom.mainMenu);
    });

    // Settings Modal
    document.getElementById('btnCloseSettings').addEventListener('click', () => {
        window.uiManager.saveSettings();
        if (game.state === GameState.PAUSED) {
            window.uiManager.showModal(window.uiManager.dom.pauseModal);
        } else {
            window.uiManager.showModal(window.uiManager.dom.mainMenu);
        }
    });

    document.getElementById('btnCloseHelp').addEventListener('click', () => {
        window.uiManager.showModal(window.uiManager.dom.mainMenu);
    });

    // Theme Picker
    const themeButtons = document.querySelectorAll('.theme-option');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            window.uiManager.setTheme(btn.dataset.theme);
        });
    });

    // Volume Slider & Mute
    const volSlider = document.getElementById('soundVolumeSlider');
    volSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        document.getElementById('volValueText').textContent = `${val}%`;
        window.soundEngine.setVolume(parseInt(val, 10) / 100);
    });

    document.getElementById('audioToggleBtn').addEventListener('click', () => {
        triggerAudioUnlock();
        const isMuted = window.soundEngine.toggleMute();
        window.uiManager.updateSoundIcons(isMuted);
    });

    document.getElementById('soundEffectsToggle').addEventListener('change', (e) => {
        if (window.soundEngine.isMuted !== !e.target.checked) {
            const isMuted = window.soundEngine.toggleMute();
            window.uiManager.updateSoundIcons(isMuted);
        }
    });

    // 8. Main requestAnimationFrame Game Loop
    let lastTime = performance.now();

    function gameLoop(now) {
        const deltaMs = now - lastTime;
        lastTime = now;

        // Normalize delta to 60fps base, clamped to avoid huge leaps on tab defocus
        const dt = Math.min(1.8, deltaMs / 16.666);

        // Update & Render
        game.update(dt, inputState);
        game.draw();

        requestAnimationFrame(gameLoop);
    }

    // Initial render and launch loop
    game.draw();
    requestAnimationFrame(gameLoop);
});
