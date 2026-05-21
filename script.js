// ===== GLOBAL VARIABLES =====
let musicPlaying = false;
const bgMusic = document.getElementById('bgMusic');

// ===== AUDIO OVERLAY (untuk bypass autoplay policy) =====
const audioOverlay = document.getElementById('audioOverlay');
const enterBtn = document.getElementById('enterBtn');
const mainContainer = document.getElementById('mainContainer');
const musicControl = document.getElementById('musicControl');

enterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    enterSite();
});

audioOverlay.addEventListener('click', () => {
    enterSite();
});

function enterSite() {
    audioOverlay.classList.add('hidden');
    mainContainer.style.display = 'block';
    musicControl.style.display = 'block';

    // Play music
    bgMusic.volume = 0.5;
    bgMusic.play().then(() => {
        musicPlaying = true;
    }).catch(() => {
        // Fallback: generate music with Web Audio API
        startWebAudioMusic();
    });

    initParticles();
    initAllGames();
    loadMessages();
}

// ===== MUSIC TOGGLE =====
document.getElementById('musicToggle').addEventListener('click', () => {
    if (musicPlaying) {
        bgMusic.pause();
        musicPlaying = false;
        document.getElementById('musicToggle').textContent = '🔇';
    } else {
        bgMusic.play().then(() => {
            musicPlaying = true;
            document.getElementById('musicToggle').textContent = '🔊';
        }).catch(() => {
            startWebAudioMusic();
        });
    }
});

// ===== WEB AUDIO API MUSIC (Fallback) =====
let audioCtx = null;
let musicInterval = null;

function startWebAudioMusic() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    musicPlaying = true;
    playChillLoop();
}

function playChillLoop() {
    if (!audioCtx || !musicPlaying) return;

    const notes = [
        261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88,
        523.25, 493.88, 440.00, 392.00, 349.23, 329.63, 293.66
    ];

    let noteIndex = 0;

    function playNote() {
        if (!audioCtx || !musicPlaying) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.value = notes[noteIndex % notes.length];

        filter.type = 'lowpass';
        filter.frequency.value = 800;

        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.8);

        // Bass
        const bass = audioCtx.createOscillator();
        const bassGain = audioCtx.createGain();
        bass.type = 'sine';
        bass.frequency.value = notes[noteIndex % notes.length] / 2;
        bassGain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        bassGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
        bass.connect(bassGain);
        bassGain.connect(audioCtx.destination);
        bass.start(audioCtx.currentTime);
        bass.stop(audioCtx.currentTime + 0.6);

        noteIndex++;
    }

    playNote();
    musicInterval = setInterval(playNote, 500);
}

// ===== PARTICLES =====
function initParticles() {
    const canvas = document.getElementById('particlesCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = ['#6C63FF', '#00D2FF', '#FF6584', '#00E676', '#FFD600'][Math.floor(Math.random() * 5)];
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    for (let i = 0; i < 80; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(108, 99, 255, ${0.1 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }
    animate();
}

// ==========================================
// ⏰ KONFIGURASI WAKTU SELESAI MAINTENANCE
// ==========================================
// Format: 'YYYY-MM-DDTHH:mm:ss±HH:mm'
// Ganti sesuai kebutuhan. Contoh: 27 Mei 2026, 15:30 WIB
const MAINTENANCE_END_TIME = '2026-05-27T15:30:00+07:00'; 

// ==========================================
// 🔄 FUNGSI COUNTDOWN (TANPA LOCALSTORAGE)
// ==========================================
function updateCountdown() {
    const now = new Date().getTime();
    const targetTime = new Date(MAINTENANCE_END_TIME).getTime();
    const diff = targetTime - now;

    // Jika waktu sudah habis
    if (diff <= 0) {
        document.getElementById('cdHours').textContent = '00';
        document.getElementById('cdMinutes').textContent = '00';
        document.getElementById('cdSeconds').textContent = '00';
        
        // Opsional: Tampilkan pesan atau redirect otomatis
        document.querySelector('.countdown-label').textContent = '✅ Maintenance Selesai!';
        // window.location.href = 'https://website-aslimu.com'; // Uncomment jika ingin redirect
        return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('cdHours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cdMinutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('cdSeconds').textContent = String(seconds).padStart(2, '0');
}

// Jalankan countdown
setInterval(updateCountdown, 1000);
updateCountdown();

// ===== GAME TABS =====
document.querySelectorAll('.game-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.game-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.game-panel').forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const gameName = tab.dataset.game;
        document.getElementById('game' + gameName.charAt(0).toUpperCase() + gameName.slice(1)).classList.add('active');
    });
});

// ===== INIT ALL GAMES =====
function initAllGames() {
    initSnake();
    initMemory();
    initClicker();
    initWhack();
    initEntertainment();
}

// ===== SNAKE GAME =====
function initSnake() {
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    let snake = [{ x: 10, y: 10 }];
    let food = { x: 15, y: 15 };
    let dx = 0, dy = 0;
    let score = 0;
    let gameRunning = false;
    let gameLoop = null;

    function drawGame() {
        // Background
        ctx.fillStyle = '#0a0a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid lines
        ctx.strokeStyle = 'rgba(108, 99, 255, 0.05)';
        for (let i = 0; i < tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }

        // Snake
        snake.forEach((segment, index) => {
            const gradient = ctx.createRadialGradient(
                segment.x * gridSize + gridSize / 2,
                segment.y * gridSize + gridSize / 2,
                0,
                segment.x * gridSize + gridSize / 2,
                segment.y * gridSize + gridSize / 2,
                gridSize / 2
            );
            gradient.addColorStop(0, index === 0 ? '#00D2FF' : '#6C63FF');
            gradient.addColorStop(1, index === 0 ? '#0088aa' : '#4a42cc');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2, 4);
            ctx.fill();
        });

        // Food
        ctx.fillStyle = '#FF6584';
        ctx.beginPath();
        ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.shadowColor = '#FF6584';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    function updateGame() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // Wall collision
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            resetGame();
            return;
        }

        // Self collision
        for (let i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                resetGame();
                return;
            }
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score += 10;
            document.getElementById('snakeScore').textContent = score;
            placeFood();
        } else {
            snake.pop();
        }

        drawGame();
    }

    function placeFood() {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
        for (let segment of snake) {
            if (food.x === segment.x && food.y === segment.y) {
                placeFood();
                return;
            }
        }
    }

    function resetGame() {
        snake = [{ x: 10, y: 10 }];
        dx = 0;
        dy = 0;
        score = 0;
        document.getElementById('snakeScore').textContent = score;
        placeFood();
        drawGame();
        gameRunning = false;
        clearInterval(gameLoop);
        document.getElementById('snakeStartBtn').textContent = '▶️ Mulai';
    }

    document.getElementById('snakeStartBtn').addEventListener('click', () => {
        if (gameRunning) {
            resetGame();
        } else {
            resetGame();
            dx = 1;
            dy = 0;
            gameRunning = true;
            document.getElementById('snakeStartBtn').textContent = '🔄 Reset';
            gameLoop = setInterval(updateGame, 120);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        switch (e.key) {
            case 'ArrowUp': case 'w': case 'W':
                if (dy !== 1) { dx = 0; dy = -1; } break;
            case 'ArrowDown': case 's': case 'S':
                if (dy !== -1) { dx = 0; dy = 1; } break;
            case 'ArrowLeft': case 'a': case 'A':
                if (dx !== 1) { dx = -1; dy = 0; } break;
            case 'ArrowRight': case 'd': case 'D':
                if (dx !== -1) { dx = 1; dy = 0; } break;
        }
    });

    drawGame();
}

// ===== MEMORY GAME =====
function initMemory() {
    const emojis = ['🎮', '🎯', '🎪', '🎨', '🎭', '🎵', '🎲', '🎸'];
    let cards = [];
    let flipped = [];
    let matched = 0;
    let moves = 0;
    let canFlip = true;

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function createBoard() {
        const grid = document.getElementById('memoryGrid');
        grid.innerHTML = '';
        cards = shuffle([...emojis, ...emojis]);
        flipped = [];
        matched = 0;
        moves = 0;
        canFlip = true;

        document.getElementById('memoryMoves').textContent = moves;
        document.getElementById('memoryPairs').textContent = matched;

        cards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.dataset.emoji = emoji;

            card.innerHTML = `
                <div class="memory-card-front">${emoji}</div>
                <div class="memory-card-back">❓</div>
            `;

            card.addEventListener('click', () => flipCard(card));
            grid.appendChild(card);
        });
    }

    function flipCard(card) {
        if (!canFlip || card.classList.contains('flipped') || card.classList.contains('matched')) return;

        card.classList.add('flipped');
        flipped.push(card);

        if (flipped.length === 2) {
            moves++;
            document.getElementById('memoryMoves').textContent = moves;
            canFlip = false;

            if (flipped[0].dataset.emoji === flipped[1].dataset.emoji) {
                flipped.forEach(c => c.classList.add('matched'));
                matched++;
                document.getElementById('memoryPairs').textContent = matched;
                flipped = [];
                canFlip = true;

                if (matched === 8) {
                    setTimeout(() => alert('🎉 Selamat! Kamu menyelesaikan Memory Game dalam ' + moves + ' moves!'), 500);
                }
            } else {
                setTimeout(() => {
                    flipped.forEach(c => c.classList.remove('flipped'));
                    flipped = [];
                    canFlip = true;
                }, 800);
            }
        }
    }

    document.getElementById('memoryResetBtn').addEventListener('click', createBoard);
    createBoard();
}

// ===== CLICKER GAME =====
function initClicker() {
    let clicks = 0;
    let timeLeft = 10;
    let gameActive = false;
    let timer = null;
    const target = document.getElementById('clickTarget');
    const area = document.getElementById('clickerArea');

    function moveTarget() {
        const maxX = area.clientWidth - 60;
        const maxY = area.clientHeight - 60;
        target.style.left = Math.random() * maxX + 'px';
        target.style.top = Math.random() * maxY + 'px';
    }

    target.addEventListener('click', () => {
        if (!gameActive) return;
        clicks++;
        document.getElementById('clickCount').textContent = clicks;
        moveTarget();

        // Click effect
        target.style.transform = 'scale(0.5)';
        setTimeout(() => target.style.transform = 'scale(1)', 100);
    });

    document.getElementById('clickerStartBtn').addEventListener('click', () => {
        if (gameActive) return;

        clicks = 0;
        timeLeft = 10;
        gameActive = true;
        document.getElementById('clickCount').textContent = clicks;
        document.getElementById('clickTime').textContent = timeLeft;
        moveTarget();
        target.style.display = 'flex';

        timer = setInterval(() => {
            timeLeft--;
            document.getElementById('clickTime').textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                gameActive = false;
                target.style.display = 'none';
                let rating = clicks < 20 ? '🐢 Slow!' : clicks < 40 ? '🐰 Good!' : clicks < 60 ? '🦊 Great!' : '🔥 AMAZING!';
                alert(`⚡ Waktu Habis!\n\nKlik: ${clicks}\nRating: ${rating}`);
            }
        }, 1000);
    });

    target.style.display = 'none';
}

// ===== WHACK A MOLE =====
function initWhack() {
    const grid = document.getElementById('whackGrid');
    let score = 0;
    let timeLeft = 30;
    let gameActive = false;
    let moleTimer = null;
    let countTimer = null;
    let currentMole = -1;

    // Create holes
    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const hole = document.createElement('div');
        hole.className = 'whack-hole';
        hole.dataset.index = i;
        hole.textContent = '🕳️';
        hole.addEventListener('click', () => whackMole(i));
        grid.appendChild(hole);
    }

    function showMole() {
        const holes = document.querySelectorAll('.whack-hole');
        holes.forEach(h => {
            h.classList.remove('active');
            h.textContent = '🕳️';
        });

        currentMole = Math.floor(Math.random() * 9);
        holes[currentMole].classList.add('active');
        holes[currentMole].textContent = '🐹';
    }

    function whackMole(index) {
        if (!gameActive) return;
        const holes = document.querySelectorAll('.whack-hole');
        if (index === currentMole && holes[index].classList.contains('active')) {
            score += 10;
            document.getElementById('whackScore').textContent = score;
            holes[index].classList.remove('active');
            holes[index].textContent = '💥';
            currentMole = -1;
            setTimeout(() => {
                if (holes[index]) holes[index].textContent = '🕳️';
            }, 200);
        }
    }

    document.getElementById('whackStartBtn').addEventListener('click', () => {
        if (gameActive) return;

        score = 0;
        timeLeft = 30;
        gameActive = true;
        document.getElementById('whackScore').textContent = score;
        document.getElementById('whackTime').textContent = timeLeft;

        moleTimer = setInterval(showMole, 800);

        countTimer = setInterval(() => {
            timeLeft--;
            document.getElementById('whackTime').textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(moleTimer);
                clearInterval(countTimer);
                gameActive = false;
                document.querySelectorAll('.whack-hole').forEach(h => {
                    h.classList.remove('active');
                    h.textContent = '🕳️';
                });
                let rating = score < 100 ? '🐢 Need practice!' : score < 200 ? '👍 Nice!' : score < 300 ? '🔥 Great!' : '🏆 PRO!';
                alert(`🔨 Waktu Habis!\n\nScore: ${score}\nRating: ${rating}`);
            }
        }, 1000);
    });
}

// ===== ENTERTAINMENT =====
function initEntertainment() {
    const quotes = [
        "Kode yang baik adalah kode yang bisa dibaca manusia.",
        "Bug adalah fitur yang belum terdokumentasi.",
        "Programmer terbaik adalah yang paling malas mencari bug.",
        "Kopi + Kode = Kehidupan.",
        "Deadline adalah motivasi terbaik.",
        "Setiap baris kode adalah seni.",
        "Debugging: Menjadi detektif di dunia digital.",
        "Jika coding itu mudah, semua orang sudah jadi programmer.",
        "Stay hungry, stay foolish, stay coding.",
        "The best error message is the one that never shows up.",
        "First, solve the problem. Then, write the code.",
        "Simplicity is the soul of efficiency."
    ];

    const jokes = [
        "Q: Kenapa programmer suka gelap? A: Karena banyak bug takut cahaya! 😂",
        "Q: Apa bahasa favorit programmer? A: Java...Script! 🤣",
        "Q: Kenapa komputer tidak pernah marah? A: Karena punya banyak RAM (calm)! 😄",
        "Q: Apa persamaan kopi dan kode? A: Keduanya butuh filter yang tepat! ☕",
        "Q: Kenapa programmer pakai kacamata? A: Karena nggak bisa C#! 😆",
        "Q: Apa makanan favorit server? A: Chip! 🍟",
        "Q: Kenapa WiFi putus? A: Karena lagi nggak ada connection sama kamu! 💔😂",
        "Q: Apa bedanya junior dan senior dev? A: Senior bikin bug yang lebih kreatif! 🎨"
    ];

    const facts = [
        "🧠 Otak manusia menggunakan 20% dari total energi tubuh, meski hanya 2% dari berat badan.",
        "🌍 Bumi berputar dengan kecepatan 1.670 km/jam di khatulistiwa!",
        "🐙 Gurita punya 3 jantung dan darahnya berwarna biru.",
        "💡 Rata-rata manusia berkedip 15-20 kali per menit.",
        "🎵 Musik bisa meningkatkan performa olahraga hingga 15%.",
        "🌙 Di bulan tidak ada atmosfer, jadi tidak ada suara.",
        "🐝 Lebah bisa mengenali wajah manusia.",
        "⚡ Petir 5x lebih panas dari permukaan matahari.",
        "🦈 Hiu sudah ada sebelum pohon ada di bumi.",
        "🧬 DNA manusia 99.9% identik satu sama lain.",
        "🌊 Lautan menghasilkan lebih dari 50% oksigen bumi.",
        "🎮 Gamer punya refleks 20% lebih cepat dari non-gamer."
    ];

    document.getElementById('newQuoteBtn').addEventListener('click', () => {
        document.getElementById('quoteText').textContent = '"' + quotes[Math.floor(Math.random() * quotes.length)] + '"';
    });

    document.getElementById('newJokeBtn').addEventListener('click', () => {
        document.getElementById('jokeText').textContent = jokes[Math.floor(Math.random() * jokes.length)];
    });

    document.getElementById('newFactBtn').addEventListener('click', () => {
        document.getElementById('factText').textContent = facts[Math.floor(Math.random() * facts.length)];
    });

    document.getElementById('newColorBtn').addEventListener('click', () => {
        const colors = [
            ['#6C63FF', '#00D2FF'], ['#FF6584', '#FFD600'], ['#00E676', '#00D2FF'],
            ['#FF4081', '#7C4DFF'], ['#00BCD4', '#8BC34A'], ['#FF9800', '#E91E63'],
            ['#9C27B0', '#673AB7'], ['#4CAF50', '#009688'], ['#F44336', '#FF5722'],
            ['#2196F3', '#3F51B5']
        ];
        const [c1, c2] = colors[Math.floor(Math.random() * colors.length)];
        const display = document.getElementById('colorDisplay');
        display.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
        display.textContent = `${c1} → ${c2}`;
    });
}

// ===== FEEDBACK FORM =====
const moodBtns = document.querySelectorAll('.mood-btn');
moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        moodBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('selectedMood').value = btn.dataset.mood;
    });
});

document.getElementById('feedbackForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('visitorName').value || 'Anonim';
    const email = document.getElementById('visitorEmail').value;
    const message = document.getElementById('visitorMessage').value;
    const mood = document.getElementById('selectedMood').value || '😊';
    const time = new Date().toLocaleString('id-ID');

    const msgData = { name, email, message, mood, time };

    // Simpan ke localStorage
    let messages = JSON.parse(localStorage.getItem('visitorMessages') || '[]');
    messages.unshift(msgData);
    localStorage.setItem('visitorMessages', JSON.stringify(messages));

    // Tampilkan pesan sukses
    document.getElementById('formSuccess').style.display = 'block';
    setTimeout(() => {
        document.getElementById('formSuccess').style.display = 'none';
    }, 5000);

    // Reset form
    e.target.reset();
    moodBtns.forEach(b => b.classList.remove('selected'));
    document.getElementById('selectedMood').value = '';

    // Reload messages
    loadMessages();
});

function loadMessages() {
    const messages = JSON.parse(localStorage.getItem('visitorMessages') || '[]');
    const list = document.getElementById('messagesList');

    if (messages.length === 0) {
        list.innerHTML = '<p class="no-messages">Belum ada pesan. Jadilah yang pertama! 💬</p>';
        return;
    }

    list.innerHTML = messages.slice(0, 20).map(msg => `
        <div class="message-item">
            <div class="msg-header">
                <span class="msg-name">${escapeHtml(msg.name)} ${msg.email ? '📧' : ''}</span>
                <span class="msg-mood">${msg.mood}</span>
            </div>
            <div class="msg-text">${escapeHtml(msg.message)}</div>
            <div class="msg-time">${msg.time}</div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== KONAMI CODE EASTER EGG =====
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join(',') === konamiSequence.join(',')) {
        document.body.style.animation = 'none';
        alert('🎉🎊 EASTER EGG! Kamu menemukan kode rahasia! 🎊🎉\n\nTerima kasih sudah sabar menunggu!\n- Griv.');

        // Rainbow effect
        let hue = 0;
        const rainbow = setInterval(() => {
            document.body.style.filter = `hue-rotate(${hue}deg)`;
            hue += 5;
            if (hue >= 360) {
                clearInterval(rainbow);
                document.body.style.filter = 'none';
            }
        }, 50);
    }
});