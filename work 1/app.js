/**
 * 個人專屬時鐘主頁核心邏輯腳本 (app.js)
 * 提供精確即時時鐘、指針渲染、問候語判定、個人資料設定及主題持久化
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 狀態管理 (State)
  // ---------------------------------------------------------------------------
  const state = {
    userName: localStorage.getItem('personal_hub_name') || '你的名字',
    userBio: localStorage.getItem('personal_hub_bio') || '在專注與時間中探索無限可能 ✨',
    theme: localStorage.getItem('personal_hub_theme') || 'cyber-neon',
    is24Hour: localStorage.getItem('personal_hub_24h') !== 'false', // 預設 24 小時制
    showSeconds: localStorage.getItem('personal_hub_show_seconds') !== 'false', // 預設顯示秒數
    clockView: localStorage.getItem('personal_hub_view') || 'digital', // 'digital' | 'analog'
    soundEnabled: localStorage.getItem('personal_hub_sound') === 'true', // 預設關閉音效
    lastSecond: -1
  };

  // ---------------------------------------------------------------------------
  // 每日時間名言資料庫 (Quotes Database)
  // ---------------------------------------------------------------------------
  const quotes = [
    '「時間是最公平的財富，珍惜當下的每一秒，便是投資未來。」',
    '「昨日已成歷史，明日尚不可知，而當下是一份珍貴的禮物。」',
    '「專注於你所熱愛的事物，時間將為你釀造最好的成果。」',
    '「不要等待時機，去創造時機；把握現在，就是最好的起點。」',
    '「心若專注，時間便為你駐足；步履不停，終將抵達心之所向。」',
    '「每一秒的累積，都在悄悄形塑你未來的模樣。」'
  ];
  let currentQuoteIndex = 0;

  // ---------------------------------------------------------------------------
  // DOM 元素引用
  // ---------------------------------------------------------------------------
  const elements = {
    // 姓名與簡介
    userNameDisplay: document.getElementById('user-name-display'),
    userBioDisplay: document.getElementById('user-bio-display'),
    userAvatarText: document.getElementById('user-avatar-text'),
    editNameBtn: document.getElementById('edit-name-btn'),
    // 問候與時區
    greetingBadge: document.getElementById('greeting-badge'),
    greetingText: document.getElementById('greeting-text'),
    greetingIcon: document.getElementById('greeting-icon'),
    timezonePill: document.getElementById('timezone-pill'),
    // 數位時鐘
    digitalPanel: document.getElementById('digital-clock-panel'),
    clockHours: document.getElementById('clock-hours'),
    clockMinutes: document.getElementById('clock-minutes'),
    clockSeconds: document.getElementById('clock-seconds'),
    colon2: document.getElementById('colon-2'),
    clockAmpm: document.getElementById('clock-ampm'),
    secondsGroup: document.querySelectorAll('.seconds-group'),
    dayProgressBar: document.getElementById('day-progress-bar'),
    dayProgressText: document.getElementById('day-progress-text'),
    // 指針時鐘
    analogPanel: document.getElementById('analog-clock-panel'),
    dialMarks: document.getElementById('dial-marks'),
    hourHand: document.getElementById('analog-hour-hand'),
    minuteHand: document.getElementById('analog-minute-hand'),
    secondHand: document.getElementById('analog-second-hand'),
    // 控制項
    tabDigitalBtn: document.getElementById('tab-digital-btn'),
    tabAnalogBtn: document.getElementById('tab-analog-btn'),
    toggleFormatBtn: document.getElementById('toggle-format-btn'),
    formatLabel: document.getElementById('format-label'),
    toggleSecondsBtn: document.getElementById('toggle-seconds-btn'),
    secondsLabel: document.getElementById('seconds-label'),
    toggleSoundBtn: document.getElementById('toggle-sound-btn'),
    soundIconMuted: document.getElementById('sound-icon-muted'),
    soundIconActive: document.getElementById('sound-icon-active'),
    fullscreenToggleBtn: document.getElementById('fullscreen-toggle-btn'),
    // 日曆資訊
    dateDisplayText: document.getElementById('date-display-text'),
    weekNumberBadge: document.getElementById('week-number-badge'),
    dayOfYearBadge: document.getElementById('day-of-year-badge'),
    lunarCalendarBadge: document.getElementById('lunar-calendar-badge'),
    // 世界時鐘
    timeTokyo: document.getElementById('time-tokyo'),
    timeLondon: document.getElementById('time-london'),
    timeNy: document.getElementById('time-ny'),
    // 每日佳句
    dailyQuoteText: document.getElementById('daily-quote-text'),
    refreshQuoteBtn: document.getElementById('refresh-quote-btn'),
    // Modal & Toast
    modalBackdrop: document.getElementById('edit-name-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    editProfileForm: document.getElementById('edit-profile-form'),
    nameInput: document.getElementById('name-input'),
    bioInput: document.getElementById('bio-input'),
    toastMessage: document.getElementById('toast-message'),
    // 主題按鈕集合
    themeButtons: document.querySelectorAll('[data-theme-btn]')
  };

  // ---------------------------------------------------------------------------
  // Web Audio API 秒針滴答音效 (輕量合成，無需外部音訊檔)
  // ---------------------------------------------------------------------------
  let audioCtx = null;
  function playTickSound() {
    if (!state.soundEnabled) return;
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.015);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.015);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.018);
    } catch (err) {
      console.warn('Audio play tick error:', err);
    }
  }

  // ---------------------------------------------------------------------------
  // 更新使用者頭像與名稱展示
  // ---------------------------------------------------------------------------
  function renderUserProfile() {
    elements.userNameDisplay.textContent = state.userName;
    elements.userBioDisplay.textContent = state.userBio;

    // 根據姓名產生頭像縮寫（中文取後1~2字或首字，英文取首字母）
    const trimmed = state.userName.trim();
    if (trimmed) {
      if (/[\u4e00-\u9fa5]/.test(trimmed)) {
        // 中文字
        elements.userAvatarText.textContent = trimmed.length >= 2 ? trimmed.slice(-2) : trimmed;
      } else {
        // 英數
        elements.userAvatarText.textContent = trimmed.slice(0, 2).toUpperCase();
      }
    } else {
      elements.userAvatarText.textContent = '訪';
    }
  }

  // ---------------------------------------------------------------------------
  // 產生指針鐘 60 個刻度
  // ---------------------------------------------------------------------------
  function initAnalogMarks() {
    elements.dialMarks.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 60; i++) {
      const mark = document.createElement('div');
      mark.className = 'dial-mark' + (i % 5 === 0 ? ' major' : '');
      mark.style.transform = `rotate(${i * 6}deg)`;
      fragment.appendChild(mark);
    }
    elements.dialMarks.appendChild(fragment);
  }

  // ---------------------------------------------------------------------------
  // 即時時鐘與日期核心更新邏輯
  // ---------------------------------------------------------------------------
  function updateClock() {
    const now = new Date();
    const hours24 = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ms = now.getMilliseconds();

    // 1. 數位時鐘時間處理
    let displayHours = hours24;
    let ampmText = '';

    if (!state.is24Hour) {
      ampmText = hours24 >= 12 ? 'PM' : 'AM';
      displayHours = hours24 % 12 || 12;
    } else {
      ampmText = '24H';
    }

    const strHours = String(displayHours).padStart(2, '0');
    const strMinutes = String(minutes).padStart(2, '0');
    const strSeconds = String(seconds).padStart(2, '0');

    elements.clockHours.textContent = strHours;
    elements.clockMinutes.textContent = strMinutes;
    elements.clockSeconds.textContent = strSeconds;
    elements.clockAmpm.textContent = ampmText;

    // 2. 今日進度條計算 (00:00:00 到 23:59:59)
    const secondsPassed = hours24 * 3600 + minutes * 60 + seconds;
    const dayProgress = ((secondsPassed / 86400) * 100).toFixed(1);
    elements.dayProgressBar.style.width = `${dayProgress}%`;
    elements.dayProgressText.textContent = `${dayProgress}%`;

    // 3. 指針鐘角度計算 (平滑連續旋轉)
    const secondAngle = (seconds + ms / 1000) * 6;
    const minuteAngle = (minutes + seconds / 60) * 6;
    const hourAngle = ((hours24 % 12) + minutes / 60 + seconds / 3600) * 30;

    elements.secondHand.style.transform = `rotate(${secondAngle}deg)`;
    elements.minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
    elements.hourHand.style.transform = `rotate(${hourAngle}deg)`;

    // 4. 秒針音效判定 (整秒觸發一次)
    if (seconds !== state.lastSecond) {
      state.lastSecond = seconds;
      playTickSound();
    }

    // 5. 更新動態問候語
    updateGreeting(hours24);

    // 6. 更新日期與統計標籤
    updateDateDetails(now);

    // 7. 更新全球城市時間
    updateWorldClocks(now);
  }

  // ---------------------------------------------------------------------------
  // 動態問候語判定
  // ---------------------------------------------------------------------------
  function updateGreeting(hour) {
    let greeting = '';
    let icon = '✨';

    if (hour >= 5 && hour < 11) {
      greeting = '早安，美好的一天開始了';
      icon = '🌅';
    } else if (hour >= 11 && hour < 14) {
      greeting = '午安，記得好好享用午餐';
      icon = '☀️';
    } else if (hour >= 14 && hour < 18) {
      greeting = '下午好，保持專注與好心情';
      icon = '🌤️';
    } else if (hour >= 18 && hour < 22) {
      greeting = '晚上好，放鬆身心享受愜意時光';
      icon = '🌙';
    } else {
      greeting = '夜深了，注意休息養足精神';
      icon = '🌌';
    }

    elements.greetingText.textContent = greeting;
    elements.greetingIcon.textContent = icon;
  }

  // ---------------------------------------------------------------------------
  // 日期與曆法資訊計算
  // ---------------------------------------------------------------------------
  function updateDateDetails(now) {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const daysArr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const dayOfWeek = daysArr[now.getDay()];

    elements.dateDisplayText.textContent = `${year}年${month}月${date}日 ${dayOfWeek}`;

    // 計算今年第幾天 (Day of Year)
    const startOfYear = new Date(year, 0, 1);
    const diffTime = now - startOfYear;
    const dayOfYear = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    elements.dayOfYearBadge.textContent = `第 ${dayOfYear} 天`;

    // 計算第幾週 (Week Number)
    const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay()) / 7);
    elements.weekNumberBadge.textContent = `第 ${weekNumber} 週`;

    // 干支年份推算 (2026年對應 丙午馬年)
    const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const animals = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];
    
    // 干支紀年公式 (西元年 - 4) % 60
    const offset = (year - 4) % 60;
    const stem = heavenlyStems[offset % 10];
    const branch = earthlyBranches[offset % 12];
    const animal = animals[offset % 12];
    elements.lunarCalendarBadge.textContent = `${stem}${branch}${animal}年`;

    // 時區標籤
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Taipei';
    const offsetMinutes = -now.getTimezoneOffset();
    const offsetHours = offsetMinutes / 60;
    const sign = offsetHours >= 0 ? '+' : '';
    elements.timezonePill.textContent = `${timeZone} UTC${sign}${offsetHours}`;
  }

  // ---------------------------------------------------------------------------
  // 全球城市時間速覽
  // ---------------------------------------------------------------------------
  function updateWorldClocks(now) {
    const timeFormat = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !state.is24Hour
    };

    try {
      elements.timeTokyo.textContent = new Intl.DateTimeFormat('zh-TW', { ...timeFormat, timeZone: 'Asia/Tokyo' }).format(now);
      elements.timeLondon.textContent = new Intl.DateTimeFormat('zh-TW', { ...timeFormat, timeZone: 'Europe/London' }).format(now);
      elements.timeNy.textContent = new Intl.DateTimeFormat('zh-TW', { ...timeFormat, timeZone: 'America/New_York' }).format(now);
    } catch (e) {
      console.warn('World time formatting fallback', e);
    }
  }

  // ---------------------------------------------------------------------------
  // Toast 通知提示
  // ---------------------------------------------------------------------------
  let toastTimer = null;
  function showToast(text) {
    if (toastTimer) clearTimeout(toastTimer);
    elements.toastMessage.textContent = text;
    elements.toastMessage.classList.add('show');
    toastTimer = setTimeout(() => {
      elements.toastMessage.classList.remove('show');
    }, 2800);
  }

  // ---------------------------------------------------------------------------
  // 控制項互動事件綁定
  // ---------------------------------------------------------------------------
  function initControls() {
    // 1. 切換數位 / 指針時鐘
    elements.tabDigitalBtn.addEventListener('click', () => switchClockView('digital'));
    elements.tabAnalogBtn.addEventListener('click', () => switchClockView('analog'));

    function switchClockView(view) {
      state.clockView = view;
      localStorage.setItem('personal_hub_view', view);

      if (view === 'digital') {
        elements.digitalPanel.classList.remove('hidden');
        elements.digitalPanel.classList.add('active');
        elements.analogPanel.classList.add('hidden');
        elements.analogPanel.classList.remove('active');

        elements.tabDigitalBtn.classList.add('active');
        elements.tabDigitalBtn.setAttribute('aria-selected', 'true');
        elements.tabAnalogBtn.classList.remove('active');
        elements.tabAnalogBtn.setAttribute('aria-selected', 'false');
      } else {
        elements.analogPanel.classList.remove('hidden');
        elements.analogPanel.classList.add('active');
        elements.digitalPanel.classList.add('hidden');
        elements.digitalPanel.classList.remove('active');

        elements.tabAnalogBtn.classList.add('active');
        elements.tabAnalogBtn.setAttribute('aria-selected', 'true');
        elements.tabDigitalBtn.classList.remove('active');
        elements.tabDigitalBtn.setAttribute('aria-selected', 'false');
      }
    }
    // 套用初始檢視
    switchClockView(state.clockView);

    // 2. 切換 12H / 24H 制
    elements.toggleFormatBtn.addEventListener('click', () => {
      state.is24Hour = !state.is24Hour;
      localStorage.setItem('personal_hub_24h', state.is24Hour);
      updateFormatButtonState();
      updateClock();
      showToast(state.is24Hour ? '已切換為 24 小時制' : '已切換為 12 小時制 (AM/PM)');
    });

    function updateFormatButtonState() {
      if (state.is24Hour) {
        elements.toggleFormatBtn.classList.remove('active');
        elements.formatLabel.textContent = '24 小時制';
      } else {
        elements.toggleFormatBtn.classList.add('active');
        elements.formatLabel.textContent = '12 小時制';
      }
    }
    updateFormatButtonState();

    // 3. 切換秒數顯示開關
    elements.toggleSecondsBtn.addEventListener('click', () => {
      state.showSeconds = !state.showSeconds;
      localStorage.setItem('personal_hub_show_seconds', state.showSeconds);
      updateSecondsDisplay();
      showToast(state.showSeconds ? '已開啟秒數顯示' : '已隱藏秒數');
    });

    function updateSecondsDisplay() {
      if (state.showSeconds) {
        elements.toggleSecondsBtn.classList.add('active');
        elements.secondsLabel.textContent = '顯示秒數';
        elements.colon2.classList.remove('hidden');
        elements.clockSeconds.classList.remove('hidden');
        elements.secondHand.style.display = 'block';
      } else {
        elements.toggleSecondsBtn.classList.remove('active');
        elements.secondsLabel.textContent = '隱藏秒數';
        elements.colon2.classList.add('hidden');
        elements.clockSeconds.classList.add('hidden');
        elements.secondHand.style.display = 'none';
      }
    }
    updateSecondsDisplay();

    // 4. 秒針音效開關
    elements.toggleSoundBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      localStorage.setItem('personal_hub_sound', state.soundEnabled);
      updateSoundButtonState();
      if (state.soundEnabled) {
        playTickSound();
        showToast('秒針音效已開啟 🔊');
      } else {
        showToast('秒針音效已靜音 🔇');
      }
    });

    function updateSoundButtonState() {
      if (state.soundEnabled) {
        elements.toggleSoundBtn.classList.add('active');
        elements.soundIconMuted.classList.add('hidden');
        elements.soundIconActive.classList.remove('hidden');
      } else {
        elements.toggleSoundBtn.classList.remove('active');
        elements.soundIconMuted.classList.remove('hidden');
        elements.soundIconActive.classList.add('hidden');
      }
    }
    updateSoundButtonState();

    // 5. 主題切換
    elements.themeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.themeBtn;
        applyTheme(theme);
        showToast(`已切換至主題：${btn.getAttribute('title')}`);
      });
    });

    function applyTheme(theme) {
      state.theme = theme;
      localStorage.setItem('personal_hub_theme', theme);
      document.documentElement.setAttribute('data-theme', theme);

      elements.themeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.themeBtn === theme);
      });
    }
    applyTheme(state.theme);

    // 6. 全螢幕切換
    elements.fullscreenToggleBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn('Error attempting to enable fullscreen:', err);
        });
      } else {
        document.exitFullscreen();
      }
    });

    // 7. 每日佳句切換
    elements.refreshQuoteBtn.addEventListener('click', () => {
      currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
      elements.dailyQuoteText.style.opacity = '0';
      setTimeout(() => {
        elements.dailyQuoteText.textContent = quotes[currentQuoteIndex];
        elements.dailyQuoteText.style.opacity = '1';
      }, 150);
    });

    // 8. 編輯個人檔案 Modal 事件
    function openProfileModal() {
      elements.nameInput.value = state.userName;
      elements.bioInput.value = state.userBio;
      elements.modalBackdrop.classList.remove('hidden');
      setTimeout(() => elements.nameInput.focus(), 100);
    }

    function closeProfileModal() {
      elements.modalBackdrop.classList.add('hidden');
    }

    elements.editNameBtn.addEventListener('click', openProfileModal);
    elements.userNameDisplay.addEventListener('click', openProfileModal);
    elements.modalCloseBtn.addEventListener('click', closeProfileModal);
    elements.modalCancelBtn.addEventListener('click', closeProfileModal);

    elements.modalBackdrop.addEventListener('click', (e) => {
      if (e.target === elements.modalBackdrop) {
        closeProfileModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !elements.modalBackdrop.classList.contains('hidden')) {
        closeProfileModal();
      }
    });

    elements.editProfileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = elements.nameInput.value.trim();
      const newBio = elements.bioInput.value.trim();

      if (newName) {
        state.userName = newName;
        state.userBio = newBio || '在專注與時間中探索無限可能 ✨';

        localStorage.setItem('personal_hub_name', state.userName);
        localStorage.setItem('personal_hub_bio', state.userBio);

        renderUserProfile();
        closeProfileModal();
        showToast(`你好，${state.userName}！個人設定已成功更新 ✨`);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 初始化應用程式
  // ---------------------------------------------------------------------------
  function init() {
    renderUserProfile();
    initAnalogMarks();
    initControls();
    updateClock();

    // 高頻率時鐘循環，確保秒數跳動零延遲
    setInterval(updateClock, 100);
  }

  // 待 DOM 載入完畢執行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
