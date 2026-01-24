/**
 * ================================================
 * نظام الحفظ الاحترافي لموقع مهارة 01
 * متوافق 100% مع الكود القديم
 * يستبدل window.storage بـ localStorage تلقائياً
 * ================================================
 */

(function() {
    'use strict';
    
    console.log('🔥 نظام الحفظ الاحترافي: بدأ التشغيل!');

    // إنشاء window.storage API متوافق مع الكود القديم
    window.storage = {
        // دالة get - تحاكي window.storage.get
        get: async function(key) {
            try {
                const value = localStorage.getItem(key);
                if (value === null) {
                    throw new Error('Key not found');
                }
                return { key: key, value: value, shared: false };
            } catch (e) {
                throw e;
            }
        },

        // دالة set - تحاكي window.storage.set
        set: async function(key, value) {
            try {
                localStorage.setItem(key, value);
                return { key: key, value: value, shared: false };
            } catch (e) {
                console.error('خطأ في الحفظ:', e);
                return null;
            }
        },

        // دالة delete - تحاكي window.storage.delete
        delete: async function(key) {
            try {
                localStorage.removeItem(key);
                return { key: key, deleted: true, shared: false };
            } catch (e) {
                return null;
            }
        },

        // دالة list - تحاكي window.storage.list
        list: async function(prefix) {
            try {
                const keys = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (!prefix || key.startsWith(prefix)) {
                        keys.push(key);
                    }
                }
                return { keys: keys, prefix: prefix, shared: false };
            } catch (e) {
                return null;
            }
        }
    };

    console.log('✅ تم إنشاء window.storage API');

    // نظام النسخ الاحتياطي التلقائي
    let backupTimer = null;
    
    function createAutoBackup() {
        try {
            const backup = {
                players: [],
                matches: [],
                achievements: [],
                teamStats: { wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0 },
                currentFormation: '4-3-3',
                timestamp: new Date().toISOString()
            };

            // جمع البيانات
            const playersData = localStorage.getItem('mahara_players');
            if (playersData) backup.players = JSON.parse(playersData);

            const matchesData = localStorage.getItem('mahara_matches');
            if (matchesData) backup.matches = JSON.parse(matchesData);

            const achievementsData = localStorage.getItem('mahara_achievements');
            if (achievementsData) backup.achievements = JSON.parse(achievementsData);

            const statsData = localStorage.getItem('mahara_stats');
            if (statsData) backup.teamStats = JSON.parse(statsData);

            const formationData = localStorage.getItem('mahara_formation');
            if (formationData) backup.currentFormation = formationData;

            // حفظ النسخة الاحتياطية
            localStorage.setItem('mahara_backup', JSON.stringify(backup));
            console.log('💾 تم إنشاء نسخة احتياطية تلقائية');
        } catch (e) {
            console.error('خطأ في النسخ الاحتياطي:', e);
        }
    }

    // نسخة احتياطية كل 30 ثانية
    backupTimer = setInterval(createAutoBackup, 30000);

    // نسخة احتياطية عند إغلاق الصفحة
    window.addEventListener('beforeunload', () => {
        createAutoBackup();
        console.log('💾 تم الحفظ قبل إغلاق الصفحة');
    });

    // نسخة احتياطية عند تغيير الصفحة
    window.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            createAutoBackup();
        }
    });

    // استعادة من النسخة الاحتياطية
    window.restoreFromBackup = function() {
        try {
            const backupData = localStorage.getItem('mahara_backup');
            if (!backupData) {
                alert('لا توجد نسخة احتياطية!');
                return;
            }

            const backup = JSON.parse(backupData);
            
            if (backup.players) {
                localStorage.setItem('mahara_players', JSON.stringify(backup.players));
            }
            if (backup.matches) {
                localStorage.setItem('mahara_matches', JSON.stringify(backup.matches));
            }
            if (backup.achievements) {
                localStorage.setItem('mahara_achievements', JSON.stringify(backup.achievements));
            }
            if (backup.teamStats) {
                localStorage.setItem('mahara_stats', JSON.stringify(backup.teamStats));
            }
            if (backup.currentFormation) {
                localStorage.setItem('mahara_formation', backup.currentFormation);
            }

            alert('✅ تم استعادة النسخة الاحتياطية بنجاح!');
            location.reload();
        } catch (e) {
            console.error('خطأ في الاستعادة:', e);
            alert('❌ فشلت عملية الاستعادة!');
        }
    };

    // تنزيل نسخة احتياطية
    window.downloadBackup = function() {
        createAutoBackup();
        const backupData = localStorage.getItem('mahara_backup');
        if (!backupData) {
            alert('لا توجد بيانات للتنزيل!');
            return;
        }

        const blob = new Blob([backupData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mahara01_backup_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📥 تم تنزيل النسخة الاحتياطية');
        if (typeof window.showNotification === 'function') {
            window.showNotification('تم تنزيل النسخة الاحتياطية! 📥', 'success');
        }
    };

    // رفع نسخة احتياطية
    window.uploadBackup = function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const backup = JSON.parse(event.target.result);
                    
                    if (backup.players) {
                        localStorage.setItem('mahara_players', JSON.stringify(backup.players));
                    }
                    if (backup.matches) {
                        localStorage.setItem('mahara_matches', JSON.stringify(backup.matches));
                    }
                    if (backup.achievements) {
                        localStorage.setItem('mahara_achievements', JSON.stringify(backup.achievements));
                    }
                    if (backup.teamStats) {
                        localStorage.setItem('mahara_stats', JSON.stringify(backup.teamStats));
                    }
                    if (backup.currentFormation) {
                        localStorage.setItem('mahara_formation', backup.currentFormation);
                    }

                    alert('✅ تم استيراد البيانات بنجاح!');
                    location.reload();
                } catch (e) {
                    console.error('خطأ في القراءة:', e);
                    alert('❌ ملف غير صالح!');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    };

    // مسح كل البيانات
    window.clearAllData = function() {
        if (confirm('⚠️ هل أنت متأكد من حذف جميع البيانات؟\nهذا الإجراء لا يمكن التراجع عنه!')) {
            if (confirm('⚠️ تأكيد نهائي: سيتم حذف كل شيء!')) {
                // حفظ نسخة احتياطية أخيرة
                createAutoBackup();
                
                localStorage.removeItem('mahara_players');
                localStorage.removeItem('mahara_matches');
                localStorage.removeItem('mahara_achievements');
                localStorage.removeItem('mahara_stats');
                localStorage.removeItem('mahara_formation');
                
                console.log('🗑️ تم حذف جميع البيانات');
                alert('تم حذف جميع البيانات!\n(النسخة الاحتياطية محفوظة)');
                location.reload();
            }
        }
    };

    // عرض معلومات التخزين
    window.showStorageInfo = function() {
        let info = '📊 معلومات التخزين:\n';
        info += '==================\n';
        
        try {
            const playersData = localStorage.getItem('mahara_players');
            const players = playersData ? JSON.parse(playersData) : [];
            info += `👥 اللاعبين: ${players.length}\n`;
        } catch (e) {
            info += '👥 اللاعبين: 0\n';
        }
        
        try {
            const matchesData = localStorage.getItem('mahara_matches');
            const matches = matchesData ? JSON.parse(matchesData) : [];
            info += `⚽ المباريات: ${matches.length}\n`;
        } catch (e) {
            info += '⚽ المباريات: 0\n';
        }
        
        try {
            const achievementsData = localStorage.getItem('mahara_achievements');
            const achievements = achievementsData ? JSON.parse(achievementsData) : [];
            info += `🏆 الإنجازات: ${achievements.length}\n`;
        } catch (e) {
            info += '🏆 الإنجازات: 0\n';
        }
        
        try {
            const statsData = localStorage.getItem('mahara_stats');
            if (statsData) {
                const stats = JSON.parse(statsData);
                info += `📊 الإحصائيات: ${stats.wins}ف ${stats.draws}ت ${stats.losses}خ\n`;
            } else {
                info += '📊 الإحصائيات: 0ف 0ت 0خ\n';
            }
        } catch (e) {
            info += '📊 الإحصائيات: غير متوفرة\n';
        }
        
        try {
            const formationData = localStorage.getItem('mahara_formation');
            if (formationData) {
                info += `⚙️ التشكيلة: ${formationData}\n`;
            } else {
                info += '⚙️ التشكيلة: 4-3-3 (افتراضي)\n';
            }
        } catch (e) {
            info += '⚙️ التشكيلة: غير متوفرة\n';
        }
        
        // حساب المساحة المستخدمة
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }
        info += `💾 المساحة: ${(totalSize / 1024).toFixed(2)} KB\n`;
        info += '==================';
        
        console.log(info);
        alert(info);
    };

    // حفظ فوري لكل شيء
    window.forceSaveAll = function() {
        console.log('💾 حفظ فوري لكل البيانات...');
        createAutoBackup();
        
        if (typeof window.showNotification === 'function') {
            window.showNotification('تم حفظ جميع البيانات! 💾', 'success');
        } else {
            alert('✅ تم حفظ جميع البيانات!');
        }
        
        console.log('✅ اكتمل الحفظ الفوري!');
    };

    // مراقبة التغييرات وحفظها تلقائياً
    let changeDetected = false;
    
    function detectChanges() {
        // مراقبة أي تغييرات في localStorage
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            originalSetItem.apply(this, arguments);
            
            if (key.startsWith('mahara_')) {
                changeDetected = true;
                console.log(`🔄 تغيير في البيانات: ${key}`);
            }
        };
        
        // حفظ تلقائي كل 10 ثواني إذا كان هناك تغييرات
        setInterval(() => {
            if (changeDetected) {
                createAutoBackup();
                changeDetected = false;
            }
        }, 10000);
    }
    
    detectChanges();

    // عرض رسالة ترحيبية
    console.log('✅ نظام الحفظ الاحترافي: جاهز للعمل!');
    console.log('💡 الأوامر المتاحة:');
    console.log('   - showStorageInfo() : عرض معلومات التخزين');
    console.log('   - forceSaveAll() : حفظ فوري لكل شيء');
    console.log('   - downloadBackup() : تنزيل نسخة احتياطية');
    console.log('   - uploadBackup() : رفع نسخة احتياطية');
    console.log('   - restoreFromBackup() : استعادة آخر نسخة');
    console.log('   - clearAllData() : حذف جميع البيانات');
    console.log('');
    console.log('🔒 النسخ الاحتياطي التلقائي: مفعّل');
    console.log('⏰ يتم الحفظ كل 30 ثانية تلقائياً');
    
    // إنشاء نسخة احتياطية فورية
    setTimeout(() => {
        createAutoBackup();
        console.log('✅ تم إنشاء نسخة احتياطية أولية');
    }, 2000);

})();