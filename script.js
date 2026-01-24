// المتغيرات العامة
let isAdmin = false;
let players = [];
let matches = [];
let achievements = [];
let teamStats = { wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0 };
let currentFormation = '4-3-3';
let draggedPlayer = null;
let selectedPlayerForMedal = null;

// التشكيلات
const formations = {
    '4-3-3': [
        { pos: 'GK', x: 50, y: 90 },
        { pos: 'LB', x: 20, y: 75 }, { pos: 'CB', x: 40, y: 75 }, { pos: 'CB', x: 60, y: 75 }, { pos: 'RB', x: 80, y: 75 },
        { pos: 'CM', x: 30, y: 55 }, { pos: 'CM', x: 50, y: 55 }, { pos: 'CM', x: 70, y: 55 },
        { pos: 'LW', x: 20, y: 25 }, { pos: 'ST', x: 50, y: 20 }, { pos: 'RW', x: 80, y: 25 }
    ],
    '4-4-2': [
        { pos: 'GK', x: 50, y: 90 },
        { pos: 'LB', x: 20, y: 75 }, { pos: 'CB', x: 40, y: 75 }, { pos: 'CB', x: 60, y: 75 }, { pos: 'RB', x: 80, y: 75 },
        { pos: 'LM', x: 20, y: 50 }, { pos: 'CM', x: 40, y: 55 }, { pos: 'CM', x: 60, y: 55 }, { pos: 'RM', x: 80, y: 50 },
        { pos: 'ST', x: 40, y: 20 }, { pos: 'ST', x: 60, y: 20 }
    ],
    '3-5-2': [
        { pos: 'GK', x: 50, y: 90 },
        { pos: 'CB', x: 30, y: 75 }, { pos: 'CB', x: 50, y: 75 }, { pos: 'CB', x: 70, y: 75 },
        { pos: 'LM', x: 15, y: 50 }, { pos: 'CM', x: 35, y: 55 }, { pos: 'CM', x: 50, y: 50 }, { pos: 'CM', x: 65, y: 55 }, { pos: 'RM', x: 85, y: 50 },
        { pos: 'ST', x: 40, y: 20 }, { pos: 'ST', x: 60, y: 20 }
    ],
    '4-2-3-1': [
        { pos: 'GK', x: 50, y: 90 },
        { pos: 'LB', x: 20, y: 75 }, { pos: 'CB', x: 40, y: 75 }, { pos: 'CB', x: 60, y: 75 }, { pos: 'RB', x: 80, y: 75 },
        { pos: 'CDM', x: 40, y: 60 }, { pos: 'CDM', x: 60, y: 60 },
        { pos: 'LW', x: 20, y: 40 }, { pos: 'CAM', x: 50, y: 35 }, { pos: 'RW', x: 80, y: 40 },
        { pos: 'ST', x: 50, y: 15 }
    ]
};

// الميداليات
const medals = [
    { id: 'motm', name: 'رجل المباراة', icon: '⭐' },
    { id: 'topscorer', name: 'الهداف', icon: '⚽' },
    { id: 'goalkeeper', name: 'حارس محترف', icon: '🧤' },
    { id: 'captain', name: 'القائد', icon: '👑' },
    { id: 'assist', name: 'صانع الألعاب', icon: '🎯' },
    { id: 'fighter', name: 'المحارب', icon: '💪' }
];

// التحميل عند بدء الصفحة
window.addEventListener('load', async () => {
    await loadAllData();
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 2000);
    updateUI();
    drawField();
    
    // ربط زر دخول المدير
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) {
        adminBtn.onclick = () => {
            if (!isAdmin) {
                document.getElementById('login-modal').classList.remove('hidden');
            } else {
                isAdmin = false;
                updateAdminUI();
                showNotification('تم تسجيل الخروج', 'info');
            }
        };
    }
});

// تحميل كل البيانات
async function loadAllData() {
    try {
        const playersData = await window.storage.get('mahara_players');
        if (playersData && playersData.value) {
            players = JSON.parse(playersData.value);
        }
    } catch (e) {
        console.log('تحميل اللاعبين للمرة الأولى');
    }

    try {
        const matchesData = await window.storage.get('mahara_matches');
        if (matchesData && matchesData.value) {
            matches = JSON.parse(matchesData.value);
        }
    } catch (e) {
        console.log('تحميل المباريات للمرة الأولى');
    }

    try {
        const achievementsData = await window.storage.get('mahara_achievements');
        if (achievementsData && achievementsData.value) {
            achievements = JSON.parse(achievementsData.value);
        }
    } catch (e) {
        console.log('تحميل الإنجازات للمرة الأولى');
    }

    try {
        const statsData = await window.storage.get('mahara_stats');
        if (statsData && statsData.value) {
            teamStats = JSON.parse(statsData.value);
        }
    } catch (e) {
        console.log('تحميل الإحصائيات للمرة الأولى');
    }

    try {
        const formationData = await window.storage.get('mahara_formation');
        if (formationData && formationData.value) {
            currentFormation = formationData.value;
            document.getElementById('formation-select').value = currentFormation;
        }
    } catch (e) {
        console.log('استخدام التشكيلة الافتراضية');
    }
}

// حفظ البيانات
async function saveData(key, data) {
    try {
        showSaveStatus('💾');
        await window.storage.set(key, JSON.stringify(data));
        showSaveStatus('✅');
        setTimeout(() => showSaveStatus(''), 2000);
    } catch (e) {
        showSaveStatus('⚠️');
        console.error('خطأ في الحفظ:', e);
    }
}

// إظهار حالة الحفظ
function showSaveStatus(status) {
    document.getElementById('save-status').textContent = status;
}

// إظهار إشعار
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// تسجيل الدخول
function handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (username === 'admin' && password === 'rahimdz.dz') {
        isAdmin = true;
        closeLoginModal();
        updateAdminUI();
        showNotification('مرحباً بك يا مدير! 🎉', 'success');
    } else {
        showNotification('خطأ في البيانات! ❌', 'error');
    }
}

// إغلاق نافذة تسجيل الدخول
function closeLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
}

// تبديل إظهار كلمة المرور
function togglePassword() {
    const passwordInput = document.getElementById('login-password');
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
}

// تحديث واجهة المدير
function updateAdminUI() {
    const adminBtn = document.getElementById('admin-btn');

    if (isAdmin) {
        adminBtn.textContent = '🚪 خروج';
        adminBtn.classList.add('logout');
        adminBtn.onclick = () => {
            isAdmin = false;
            updateAdminUI();
            showNotification('تم تسجيل الخروج', 'info');
        };

        document.querySelectorAll('.admin-panel').forEach(panel => {
            panel.classList.remove('hidden');
        });
    } else {
        adminBtn.textContent = '🔐 دخول المدير';
        adminBtn.classList.remove('logout');
        adminBtn.onclick = () => {
            document.getElementById('login-modal').classList.remove('hidden');
        };

        document.querySelectorAll('.admin-panel').forEach(panel => {
            panel.classList.add('hidden');
        });
    }

    updateUI();
}

// إضافة لاعب
function addPlayer() {
    const name = document.getElementById('player-name').value.trim();
    const number = document.getElementById('player-number').value.trim();
    const position = document.getElementById('player-position').value.trim() || 'لاعب';
    const emoji = document.getElementById('player-emoji').value.trim() || '⚽';
    const rating = parseInt(document.getElementById('player-rating').value);
    const imageInput = document.getElementById('player-image');

    if (!name || !number) {
        showNotification('املأ الحقول المطلوبة! ⚠️', 'error');
        return;
    }

    const existingPlayer = players.find(p => p.number === number);
    if (existingPlayer) {
        showNotification('الرقم محجوز مسبقاً! ⚠️', 'error');
        return;
    }

    const mainCount = players.filter(p => p.status === 'main').length;

    const newPlayer = {
        id: Date.now(),
        name,
        number,
        position,
        emoji,
        rating,
        status: mainCount < 11 ? 'main' : 'reserve',
        medals: [],
        x: null,
        y: null,
        visitorRatings: [],
        imageData: null
    };

    if (imageInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = (e) => {
            newPlayer.imageData = e.target.result;
            players.push(newPlayer);
            saveData('mahara_players', players);
            updateUI();
            clearPlayerForm();
            showNotification(`تمت إضافة ${name}! ⚽`, 'success');
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        players.push(newPlayer);
        saveData('mahara_players', players);
        updateUI();
        clearPlayerForm();
        showNotification(`تمت إضافة ${name}! ⚽`, 'success');
    }
}

// تنظيف نموذج اللاعب
function clearPlayerForm() {
    document.getElementById('player-name').value = '';
    document.getElementById('player-number').value = '';
    document.getElementById('player-position').value = '';
    document.getElementById('player-emoji').value = '';
    document.getElementById('player-rating').value = 85;
    document.getElementById('rating-value').textContent = 85;
    document.getElementById('player-image').value = '';
    document.getElementById('image-status').textContent = '';
}

// حذف لاعب
function deletePlayer(id) {
    const player = players.find(p => p.id === id);
    if (confirm(`هل تريد حذف ${player.name}؟`)) {
        players = players.filter(p => p.id !== id);
        saveData('mahara_players', players);
        updateUI();
        showNotification(`تم حذف ${player.name}`, 'info');
    }
}

// نقل لاعب للاحتياط
function moveToReserve(id) {
    players = players.map(p => p.id === id ? { ...p, status: 'reserve' } : p);
    saveData('mahara_players', players);
    updateUI();
    showNotification('تم النقل للاحتياط', 'info');
}

// نقل لاعب للأساسي
function moveToMain(id) {
    const mainCount = players.filter(p => p.status === 'main').length;
    if (mainCount >= 11) {
        showNotification('التشكيلة مكتملة! (11 لاعب)', 'error');
        return;
    }

    players = players.map(p => p.id === id ? { ...p, status: 'main', x: null, y: null } : p);
    saveData('mahara_players', players);
    updateUI();
    showNotification('تم النقل للأساسي', 'success');
}

// رسم الملعب
function drawField() {
    const canvas = document.getElementById('football-field');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // الخلفية
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#1a5d3a');
    gradient.addColorStop(0.5, '#22723f');
    gradient.addColorStop(1, '#1a5d3a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // خطوط العشب
    ctx.strokeStyle = 'rgba(26, 93, 58, 0.4)';
    ctx.lineWidth = 50;
    for (let i = 0; i < h; i += 100) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(w, i);
        ctx.stroke();
    }

    // خطوط الملعب
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 10;

    // الحدود الخارجية
    ctx.strokeRect(40, 40, w - 80, h - 80);

    // خط المنتصف
    ctx.beginPath();
    ctx.moveTo(40, h / 2);
    ctx.lineTo(w - 40, h / 2);
    ctx.stroke();

    // دائرة المنتصف
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 90, 0, Math.PI * 2);
    ctx.stroke();

    // نقطة المنتصف
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // منطقة الجزاء العلوية
    ctx.strokeRect(w / 2 - 160, 40, 320, 130);
    ctx.strokeRect(w / 2 - 90, 40, 180, 70);

    // منطقة الجزاء السفلية
    ctx.strokeRect(w / 2 - 160, h - 170, 320, 130);
    ctx.strokeRect(w / 2 - 90, h - 110, 180, 70);

    // المرمى العلوي
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(w / 2 - 70, 15, 140, 25);
    ctx.strokeRect(w / 2 - 70, 15, 140, 25);

    // المرمى السفلي
    ctx.fillRect(w / 2 - 70, h - 40, 140, 25);
    ctx.strokeRect(w / 2 - 70, h - 40, 140, 25);

    // نقطة الجزاء العلوية
    ctx.beginPath();
    ctx.arc(w / 2, 110, 6, 0, Math.PI * 2);
    ctx.fill();

    // نقطة الجزاء السفلية
    ctx.beginPath();
    ctx.arc(w / 2, h - 110, 6, 0, Math.PI * 2);
    ctx.fill();

    // رسم اللاعبين
    const mainPlayers = players.filter(p => p.status === 'main');
    const formPos = formations[currentFormation];

    mainPlayers.forEach((player, idx) => {
        if (idx < formPos.length) {
            const pos = player.x != null && player.y != null ? { x: player.x, y: player.y } : formPos[idx];
            const x = (pos.x / 100) * (w - 80) + 40;
            const y = (pos.y / 100) * (h - 80) + 40;

            // ظل اللاعب
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.ellipse(x, y + 55, 40, 15, 0, 0, Math.PI * 2);
            ctx.fill();

            // دائرة اللاعب
            const playerGrad = ctx.createRadialGradient(x - 12, y - 12, 8, x, y, 50);
            playerGrad.addColorStop(0, '#FFD700');
            playerGrad.addColorStop(0.6, '#FFA500');
            playerGrad.addColorStop(1, '#FF8C00');
            ctx.fillStyle = playerGrad;
            ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(x, y, 50, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 4;
            ctx.stroke();

            // صورة أو Emoji اللاعب
            if (player.imageData) {
                const img = new Image();
                img.onload = () => {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(x, y, 45, 0, Math.PI * 2);
                    ctx.clip();
                    ctx.drawImage(img, x - 45, y - 45, 90, 90);
                    ctx.restore();
                };
                img.src = player.imageData;
            } else {
                ctx.font = 'bold 40px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#000000';
                ctx.fillText(player.emoji, x, y);
            }

            // رقم اللاعب
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.fillRect(x - 28, y + 55, 56, 35);
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.strokeRect(x - 28, y + 55, 56, 35);
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 24px Arial';
            ctx.fillText(player.number, x, y + 72);

            // اسم اللاعب
            ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
            ctx.fillRect(x - 70, y - 70, 140, 30);
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(player.name, x, y - 55);

            // التقييم
            ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
            ctx.beginPath();
            ctx.arc(x - 55, y - 35, 22, 0, Math.PI * 2);
            ctx.fill();

            const ratingColor = player.rating >= 90 ? '#00FF00' : 
                                player.rating >= 85 ? '#7CFC00' : 
                                player.rating >= 80 ? '#FFD700' : '#FFA500';
            ctx.fillStyle = ratingColor;
            ctx.font = 'bold 18px Arial';
            ctx.fillText(player.rating, x - 55, y - 32);

            // عرض الميداليات
            if (player.medals && player.medals.length > 0) {
                ctx.font = '20px Arial';
                player.medals.slice(0, 3).forEach((medal, i) => {
                    const medalData = medals.find(m => m.id === medal);
                    if (medalData) {
                        ctx.fillText(medalData.icon, x + 40 + (i * 15), y - 35);
                    }
                });
            }
        }
    });
}

// التعامل مع السحب
const canvas = document.getElementById('football-field');
if (canvas) {
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
}

function handleMouseDown(e) {
    if (!isAdmin) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const mainPlayers = players.filter(p => p.status === 'main');
    const formPos = formations[currentFormation];

    for (let i = 0; i < mainPlayers.length; i++) {
        const player = mainPlayers[i];
        const pos = player.x != null && player.y != null ? { x: player.x, y: player.y } : formPos[i];
        const x = (pos.x / 100) * (canvas.width - 80) + 40;
        const y = (pos.y / 100) * (canvas.height - 80) + 40;
        const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);

        if (distance < 50) {
            draggedPlayer = player.id;
            break;
        }
    }
}

function handleMouseMove(e) {
    if (!isAdmin || !draggedPlayer) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const newX = ((mouseX - 40) / (canvas.width - 80)) * 100;
    const newY = ((mouseY - 40) / (canvas.height - 80)) * 100;

    players = players.map(p => 
        p.id === draggedPlayer ? 
        { ...p, x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) } : 
        p
    );

    drawField();
}

function handleMouseUp() {
    if (draggedPlayer) {
        saveData('mahara_players', players);
        showNotification('تم تحديث موقع اللاعب', 'success');
    }
    draggedPlayer = null;
}

// تحديث التشكيلة
document.getElementById('formation-select')?.addEventListener('change', (e) => {
    currentFormation = e.target.value;
    saveData('mahara_formation', currentFormation);
    drawField();
    showNotification(`تم التغيير إلى ${currentFormation}`, 'success');
});

// تحديث قيمة التقييم
document.getElementById('player-rating')?.addEventListener('input', (e) => {
    document.getElementById('rating-value').textContent = e.target.value;
});

// عرض الصفحات
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`page-${pageName}`).classList.add('active');
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

    updateUI();
}

// تحديث واجهة المستخدم
function updateUI() {
    drawField();
    updateReservePlayers();
    updateMainPlayersManagement();
    updateStats();
    updateMatches();
    updateAchievements();
    updateRatings();
    updateFooterStats();
}

// تحديث لاعبي الاحتياط
function updateReservePlayers() {
    const reserveSection = document.getElementById('reserve-players');
    const reservePlayers = players.filter(p => p.status === 'reserve');

    if (reservePlayers.length === 0) {
        reserveSection.innerHTML = '';
        return;
    }

    let html = '<h3 class="section-title">👥 لاعبو الاحتياط</h3><div class="reserve-grid">';

    reservePlayers.forEach(player => {
        html += `
            <div class="player-card">
                ${player.imageData ? 
                    `<img src="${player.imageData}" alt="${player.name}">` : 
                    `<div class="emoji">${player.emoji}</div>`
                }
                <div class="name">${player.name}</div>
                <div class="number">#${player.number}</div>
                <div class="position">${player.position}</div>
                <div class="rating">${player.rating}</div>
                ${isAdmin ? `
                    <div class="actions">
                        <button onclick="moveToMain(${player.id})" class="btn-small btn-green">نقل للأساسي</button>
                        <button onclick="deletePlayer(${player.id})" class="btn-small btn-red">حذف</button>
                    </div>
                ` : ''}
            </div>
        `;
    });

    html += '</div>';
    reserveSection.innerHTML = html;
}

// تحديث إدارة اللاعبين الأساسيين
function updateMainPlayersManagement() {
    if (!isAdmin) return;

    const managementSection = document.getElementById('main-players-management');
    const mainPlayers = players.filter(p => p.status === 'main');

    if (mainPlayers.length === 0) {
        managementSection.innerHTML = '';
        return;
    }

    let html = '<h3 class="panel-title">⚙️ إدارة اللاعبين الأساسيين</h3><div class="reserve-grid">';

    mainPlayers.forEach(player => {
        html += `
            <div class="player-card">
                ${player.imageData ? 
                    `<img src="${player.imageData}" alt="${player.name}">` : 
                    `<div class="emoji">${player.emoji}</div>`
                }
                <div class="name">${player.name}</div>
                <div class="number">#${player.number}</div>
                <div class="position">${player.position}</div>
                <div class="rating">${player.rating}</div>
                <div class="actions">
                    <button onclick="openMedalModal(${player.id})" class="btn-small btn-green">منح ميدالية</button>
                    <button onclick="moveToReserve(${player.id})" class="btn-small btn-orange">نقل للاحتياط</button>
                    <button onclick="deletePlayer(${player.id})" class="btn-small btn-red">حذف</button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    managementSection.innerHTML = html;
}

// فتح نافذة منح الميدالية
function openMedalModal(playerId) {
    selectedPlayerForMedal = playerId;
    const player = players.find(p => p.id === playerId);

    let html = '';
    medals.forEach(medal => {
        const hasMedal = player.medals && player.medals.includes(medal.id);
        html += `
            <div class="medal-option" onclick="toggleMedal('${medal.id}')">
                <div class="medal-icon">${medal.icon}</div>
                <div class="medal-name">${medal.name}</div>
                ${hasMedal ? '<div style="color: #00ff00;">✓ ممنوحة</div>' : ''}
            </div>
        `;
    });

    document.getElementById('medals-list').innerHTML = html;
    document.getElementById('medal-modal').classList.remove('hidden');
}

// إغلاق نافذة الميداليات
function closeMedalModal() {
    document.getElementById('medal-modal').classList.add('hidden');
    selectedPlayerForMedal = null;
}

// تبديل الميدالية
function toggleMedal(medalId) {
    if (!selectedPlayerForMedal) return;

    players = players.map(p => {
        if (p.id === selectedPlayerForMedal) {
            const medals = p.medals || [];
            const hasMedal = medals.includes(medalId);

            return {
                ...p,
                medals: hasMedal ? medals.filter(m => m !== medalId) : [...medals, medalId]
            };
        }
        return p;
    });

    saveData('mahara_players', players);
    const medal = medals.find(m => m.id === medalId);
    showNotification(`تم ${players.find(p => p.id === selectedPlayerForMedal).medals.includes(medalId) ? 'منح' : 'إزالة'} ميدالية ${medal.name}`, 'success');
    openMedalModal(selectedPlayerForMedal);
    updateUI();
}

// تحديث الإحصائيات
function updateStats() {
    document.getElementById('stat-wins').textContent = teamStats.wins;
    document.getElementById('stat-draws').textContent = teamStats.draws;
    document.getElementById('stat-losses').textContent = teamStats.losses;
    document.getElementById('stat-goals-scored').textContent = teamStats.goalsScored;
    document.getElementById('stat-goals-conceded').textContent = teamStats.goalsConceded;

    const totalMatches = teamStats.wins + teamStats.draws + teamStats.losses;
    const winRate = totalMatches > 0 ? ((teamStats.wins / totalMatches) * 100).toFixed(1) : 0;
    document.getElementById('stat-win-rate').textContent = winRate + '%';

    // تحديث أفضل اللاعبين
    updateTopPlayers();

    // تحديث قيم التعديل للمدير
    if (isAdmin) {
        document.getElementById('edit-wins').value = teamStats.wins;
        document.getElementById('edit-draws').value = teamStats.draws;
        document.getElementById('edit-losses').value = teamStats.losses;
        document.getElementById('edit-goals-scored').value = teamStats.goalsScored;
        document.getElementById('edit-goals-conceded').value = teamStats.goalsConceded;
    }
}

// تحديث أفضل اللاعبين
function updateTopPlayers() {
    const topPlayersList = document.getElementById('top-players-list');
    const sortedPlayers = [...players].sort((a, b) => {
        const avgA = a.visitorRatings.length > 0 ? 
            a.visitorRatings.reduce((sum, r) => sum + r, 0) / a.visitorRatings.length : 0;
        const avgB = b.visitorRatings.length > 0 ? 
            b.visitorRatings.reduce((sum, r) => sum + r, 0) / b.visitorRatings.length : 0;
        return avgB - avgA;
    }).slice(0, 6);

    let html = '';
    sortedPlayers.forEach(player => {
        const avgRating = player.visitorRatings.length > 0 ? 
            (player.visitorRatings.reduce((sum, r) => sum + r, 0) / player.visitorRatings.length).toFixed(1) : 
            'لا يوجد';

        html += `
            <div class="player-card">
                ${player.imageData ? 
                    `<img src="${player.imageData}" alt="${player.name}">` : 
                    `<div class="emoji">${player.emoji}</div>`
                }
                <div class="name">${player.name}</div>
                <div class="number">#${player.number}</div>
                <div class="rating">${player.rating}</div>
                <div style="color: #ffd700; font-weight: bold; margin-top: 5px;">
                    ⭐ ${avgRating}
                </div>
            </div>
        `;
    });

    topPlayersList.innerHTML = html || '<p style="text-align: center; color: #aaa;">لا يوجد لاعبون بعد</p>';
}

// تحديث إحصائيات الفريق
function updateStats() {
    document.getElementById('stat-wins').textContent = teamStats.wins;
    document.getElementById('stat-draws').textContent = teamStats.draws;
    document.getElementById('stat-losses').textContent = teamStats.losses;
    document.getElementById('stat-goals-scored').textContent = teamStats.goalsScored;
    document.getElementById('stat-goals-conceded').textContent = teamStats.goalsConceded;

    const totalMatches = teamStats.wins + teamStats.draws + teamStats.losses;
    const winRate = totalMatches > 0 ? ((teamStats.wins / totalMatches) * 100).toFixed(1) : 0;
    document.getElementById('stat-win-rate').textContent = winRate + '%';

    updateTopPlayers();

    if (isAdmin) {
        document.getElementById('edit-wins').value = teamStats.wins;
        document.getElementById('edit-draws').value = teamStats.draws;
        document.getElementById('edit-losses').value = teamStats.losses;
        document.getElementById('edit-goals-scored').value = teamStats.goalsScored;
        document.getElementById('edit-goals-conceded').value = teamStats.goalsConceded;
    }
}

// حفظ الإحصائيات المعدلة
function updateStatsData() {
    teamStats = {
        wins: parseInt(document.getElementById('edit-wins').value) || 0,
        draws: parseInt(document.getElementById('edit-draws').value) || 0,
        losses: parseInt(document.getElementById('edit-losses').value) || 0,
        goalsScored: parseInt(document.getElementById('edit-goals-scored').value) || 0,
        goalsConceded: parseInt(document.getElementById('edit-goals-conceded').value) || 0
    };

    saveData('mahara_stats', teamStats);
    showNotification('تم تحديث الإحصائيات! 📊', 'success');
    updateStats();
}

// فتح نافذة إضافة مباراة
function openAddMatchModal() {
    document.getElementById('match-modal').classList.remove('hidden');
}

// إغلاق نافذة المباراة
function closeMatchModal() {
    document.getElementById('match-modal').classList.add('hidden');
    document.getElementById('match-opponent').value = '';
    document.getElementById('match-date').value = '';
    document.getElementById('match-time').value = '';
    document.getElementById('match-stadium').value = '';
    document.getElementById('match-competition').value = '';
}

// إضافة مباراة
function addMatch() {
    const opponent = document.getElementById('match-opponent').value.trim();
    const date = document.getElementById('match-date').value;
    const time = document.getElementById('match-time').value;
    const stadium = document.getElementById('match-stadium').value.trim();
    const competition = document.getElementById('match-competition').value;

    if (!opponent || !date || !time || !competition) {
        showNotification('املأ جميع الحقول! ⚠️', 'error');
        return;
    }

    const newMatch = {
        id: Date.now(),
        opponent,
        date,
        time,
        stadium: stadium || 'غير محدد',
        competition,
        status: 'upcoming',
        result: null
    };

    matches.push(newMatch);
    saveData('mahara_matches', matches);
    updateUI();
    closeMatchModal();
    showNotification(`تمت إضافة مباراة ضد ${opponent}! ⚽`, 'success');
}

// حذف مباراة
function deleteMatch(id) {
    if (confirm('هل تريد حذف هذه المباراة؟')) {
        matches = matches.filter(m => m.id !== id);
        saveData('mahara_matches', matches);
        updateUI();
        showNotification('تم حذف المباراة', 'info');
    }
}

// تحديث المباريات
function updateMatches() {
    const upcomingContainer = document.getElementById('upcoming-matches');
    const pastContainer = document.getElementById('past-matches');

    const now = new Date();
    const upcomingMatches = matches.filter(m => {
        const matchDate = new Date(m.date + ' ' + m.time);
        return matchDate > now;
    }).sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

    const pastMatches = matches.filter(m => {
        const matchDate = new Date(m.date + ' ' + m.time);
        return matchDate <= now;
    }).sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));

    // المباريات القادمة
    if (upcomingMatches.length === 0) {
        upcomingContainer.innerHTML = '<p style="text-align: center; color: #aaa; padding: 40px;">لا توجد مباريات قادمة</p>';
    } else {
        let html = '';
        upcomingMatches.forEach(match => {
            const countdown = getCountdown(match.date, match.time);
            html += `
                <div class="match-card">
                    <div class="match-header">
                        <div class="match-competition">${match.competition}</div>
                        ${isAdmin ? `<button onclick="deleteMatch(${match.id})" class="btn-small btn-red">حذف</button>` : ''}
                    </div>
                    <div class="match-teams">
                        <div class="match-vs">مهارة 01 🆚 ${match.opponent}</div>
                    </div>
                    <div class="match-details">
                        <div class="match-detail">📅 ${formatDate(match.date)}</div>
                        <div class="match-detail">🕐 ${match.time}</div>
                        <div class="match-detail">🏟️ ${match.stadium}</div>
                    </div>
                    <div class="countdown">${countdown}</div>
                </div>
            `;
        });
        upcomingContainer.innerHTML = html;
    }

    // المباريات السابقة
    if (pastMatches.length === 0) {
        pastContainer.innerHTML = '<p style="text-align: center; color: #aaa; padding: 40px;">لا توجد مباريات سابقة</p>';
    } else {
        let html = '';
        pastMatches.forEach(match => {
            html += `
                <div class="match-card" style="opacity: 0.8;">
                    <div class="match-header">
                        <div class="match-competition">${match.competition}</div>
                        ${isAdmin ? `<button onclick="deleteMatch(${match.id})" class="btn-small btn-red">حذف</button>` : ''}
                    </div>
                    <div class="match-teams">
                        <div class="match-vs">مهارة 01 🆚 ${match.opponent}</div>
                    </div>
                    <div class="match-details">
                        <div class="match-detail">📅 ${formatDate(match.date)}</div>
                        <div class="match-detail">🕐 ${match.time}</div>
                        <div class="match-detail">🏟️ ${match.stadium}</div>
                    </div>
                    <div style="text-align: center; padding: 10px; color: #aaa; font-weight: bold;">
                        ⏱️ انتهت المباراة
                    </div>
                </div>
            `;
        });
        pastContainer.innerHTML = html;
    }
}

// حساب العد التنازلي
function getCountdown(date, time) {
    const matchDate = new Date(date + ' ' + time);
    const now = new Date();
    const diff = matchDate - now;

    if (diff < 0) return 'انتهت المباراة';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `⏰ بعد ${days} يوم و ${hours} ساعة`;
    if (hours > 0) return `⏰ بعد ${hours} ساعة و ${minutes} دقيقة`;
    return `⏰ بعد ${minutes} دقيقة`;
}

// تنسيق التاريخ
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('ar-DZ', options);
}

// تحديث المباريات كل دقيقة
setInterval(updateMatches, 60000);

// فتح نافذة إضافة إنجاز
function openAddAchievementModal() {
    document.getElementById('achievement-modal').classList.remove('hidden');
}

// إغلاق نافذة الإنجاز
function closeAchievementModal() {
    document.getElementById('achievement-modal').classList.add('hidden');
    document.getElementById('achievement-title').value = '';
    document.getElementById('achievement-year').value = '';
    document.getElementById('achievement-type').value = '';
}

// إضافة إنجاز
function addAchievement() {
    const title = document.getElementById('achievement-title').value.trim();
    const year = document.getElementById('achievement-year').value.trim();
    const type = document.getElementById('achievement-type').value;

    if (!title || !year || !type) {
        showNotification('املأ جميع الحقول! ⚠️', 'error');
        return;
    }

    const newAchievement = {
        id: Date.now(),
        title,
        year,
        icon: type
    };

    achievements.push(newAchievement);
    saveData('mahara_achievements', achievements);
    updateUI();
    closeAchievementModal();
    showNotification(`تمت إضافة إنجاز ${title}! 🏆`, 'success');
}

// حذف إنجاز
function deleteAchievement(id) {
    if (confirm('هل تريد حذف هذا الإنجاز؟')) {
        achievements = achievements.filter(a => a.id !== id);
        saveData('mahara_achievements', achievements);
        updateUI();
        showNotification('تم حذف الإنجاز', 'info');
    }
}

// تحديث الإنجازات
function updateAchievements() {
    const achievementsGrid = document.getElementById('achievements-grid');

    if (achievements.length === 0) {
        achievementsGrid.innerHTML = '<p style="text-align: center; color: #aaa; padding: 40px; grid-column: 1/-1;">لا توجد إنجازات بعد</p>';
        return;
    }

    let html = '';
    achievements.forEach(achievement => {
        html += `
            <div class="achievement-card">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-year">${achievement.year}</div>
                ${isAdmin ? `
                    <button onclick="deleteAchievement(${achievement.id})" class="btn-small btn-red" style="margin-top: 15px;">
                        حذف
                    </button>
                ` : ''}
            </div>
        `;
    });

    achievementsGrid.innerHTML = html;
}

// تحديث التقييمات
function updateRatings() {
    const ratingsGrid = document.getElementById('players-ratings');

    if (players.length === 0) {
        ratingsGrid.innerHTML = '<p style="text-align: center; color: #aaa; padding: 40px; grid-column: 1/-1;">لا يوجد لاعبون للتقييم</p>';
        return;
    }

    let html = '';
    players.forEach(player => {
        const avgRating = player.visitorRatings && player.visitorRatings.length > 0 ? 
            (player.visitorRatings.reduce((sum, r) => sum + r, 0) / player.visitorRatings.length).toFixed(1) : 
            0;

        const ratingsCount = player.visitorRatings ? player.visitorRatings.length : 0;

        html += `
            <div class="rating-card">
                ${player.imageData ? 
                    `<img src="${player.imageData}" alt="${player.name}">` : 
                    `<div class="emoji">${player.emoji}</div>`
                }
                <div class="name">${player.name}</div>
                <div class="number">#${player.number}</div>
                <div class="position">${player.position}</div>
                <div class="stars" id="stars-${player.id}">
                    ${[1,2,3,4,5].map(i => `<span class="star" onclick="ratePlayer(${player.id}, ${i})">⭐</span>`).join('')}
                </div>
                <div class="average-rating">
                    متوسط التقييم: ${avgRating} ⭐ (${ratingsCount} تقييم)
                </div>
            </div>
        `;
    });

    ratingsGrid.innerHTML = html;
}

// تقييم اللاعب
function ratePlayer(playerId, rating) {
    players = players.map(p => {
        if (p.id === playerId) {
            const ratings = p.visitorRatings || [];
            return { ...p, visitorRatings: [...ratings, rating] };
        }
        return p;
    });

    saveData('mahara_players', players);
    updateUI();
    showNotification(`تم تقييم اللاعب بـ ${rating} نجوم! ⭐`, 'success');
}

// تحديث إحصائيات الفوتر
function updateFooterStats() {
    document.getElementById('footer-players-count').textContent = players.length;
    document.getElementById('footer-achievements-count').textContent = achievements.length;
    document.getElementById('footer-matches-count').textContent = matches.length;
}

// عند تحميل صورة اللاعب
document.getElementById('player-image')?.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        if (file.size > 5000000) {
            showNotification('الصورة كبيرة جداً! (أقل من 5MB)', 'error');
            e.target.value = '';
            return;
        }
        document.getElementById('image-status').textContent = '✅ تم اختيار الصورة';
    }
});