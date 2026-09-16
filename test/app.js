/**
 * Personal Dashboard & Live Clock Engine
 */

(function () {
  'use strict';

  // --- DOM Elements ---
  const hoursEl = document.getElementById('clock-hours');
  const minutesEl = document.getElementById('clock-minutes');
  const secondsEl = document.getElementById('clock-seconds');
  const secondsWrapper = document.getElementById('seconds-wrapper');
  const periodBadge = document.getElementById('period-badge');
  const dateDisplay = document.getElementById('date-display');
  const timezoneDisplay = document.getElementById('timezone-display');

  const greetingIcon = document.getElementById('greeting-icon');
  const greetingText = document.getElementById('greeting-text');
  const userNameEl = document.getElementById('user-name');
  const editNameBtn = document.getElementById('edit-name-btn');
  const avatarInitialsEl = document.getElementById('avatar-initials');

  const formatToggleBtn = document.getElementById('format-toggle-btn');
  const formatLabel = document.getElementById('format-label');
  const secondsToggleBtn = document.getElementById('seconds-toggle-btn');
  const secondsLabel = document.getElementById('seconds-label');

  const themeBtns = document.querySelectorAll('.theme-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');

  // Modal Elements
  const nameModal = document.getElementById('name-modal');
  const nameForm = document.getElementById('name-form');
  const nameInput = document.getElementById('name-input');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');

  // --- State Configuration & LocalStorage ---
  const STORAGE_KEYS = {
    NAME: 'personal_dash_name',
    FORMAT_24H: 'personal_dash_is24h',
    SHOW_SECONDS: 'personal_dash_seconds',
    THEME: 'personal_dash_theme'
  };

  let state = {
    name: localStorage.getItem(STORAGE_KEYS.NAME) || 'Alex Morgan',
    is24Hour: localStorage.getItem(STORAGE_KEYS.FORMAT_24H) === 'true',
    showSeconds: localStorage.getItem(STORAGE_KEYS.SHOW_SECONDS) !== 'false', // default true
    theme: localStorage.getItem(STORAGE_KEYS.THEME) || 'violet'
  };

  // --- Init Profile / Name ---
  function updateInitials(name) {
    if (!name || !name.trim()) return 'ME';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function applyProfile() {
    userNameEl.textContent = state.name;
    avatarInitialsEl.textContent = updateInitials(state.name);
  }

  // --- Time & Greeting Logic ---
  function updateGreeting(hours24) {
    let greeting = 'Welcome';
    let icon = '✨';

    if (hours24 >= 5 && hours24 < 12) {
      greeting = 'Good Morning';
      icon = '☀️';
    } else if (hours24 >= 12 && hours24 < 17) {
      greeting = 'Good Afternoon';
      icon = '🌤️';
    } else if (hours24 >= 17 && hours24 < 21) {
      greeting = 'Good Evening';
      icon = '🌆';
    } else {
      greeting = 'Good Night';
      icon = '🌙';
    }

    if (greetingText.textContent !== greeting) {
      greetingText.textContent = greeting;
      greetingIcon.textContent = icon;
    }
  }

  function updateClock() {
    const now = new Date();
    const rawHours = now.getHours();
    const rawMinutes = now.getMinutes();
    const rawSeconds = now.getSeconds();

    // 1. Dynamic Greeting
    updateGreeting(rawHours);

    // 2. Format Hours & Period Badge
    let displayHours = rawHours;
    let period = '';

    if (!state.is24Hour) {
      period = rawHours >= 12 ? 'PM' : 'AM';
      displayHours = rawHours % 12;
      if (displayHours === 0) displayHours = 12;
    }

    const formattedHours = String(displayHours).padStart(2, '0');
    const formattedMinutes = String(rawMinutes).padStart(2, '0');
    const formattedSeconds = String(rawSeconds).padStart(2, '0');

    hoursEl.textContent = formattedHours;
    minutesEl.textContent = formattedMinutes;
    secondsEl.textContent = formattedSeconds;

    if (state.is24Hour) {
      periodBadge.classList.add('hidden');
    } else {
      periodBadge.classList.remove('hidden');
      periodBadge.textContent = period;
    }

    // 3. Date String
    const dateOptions = {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    dateDisplay.textContent = now.toLocaleDateString(undefined, dateOptions);

    // 4. Timezone & UTC Offset
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
      const offsetMinutes = -now.getTimezoneOffset();
      const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
      const remainingMins = Math.abs(offsetMinutes) % 60;
      const sign = offsetMinutes >= 0 ? '+' : '-';
      const offsetStr = `UTC${sign}${offsetHours}${remainingMins > 0 ? ':' + String(remainingMins).padStart(2, '0') : ''}`;

      timezoneDisplay.textContent = `${offsetStr} • ${tz}`;
    } catch (e) {
      timezoneDisplay.textContent = 'Local Time';
    }
  }

  // --- Toggle Buttons Setup ---
  function applyToggles() {
    // 12/24H format button
    if (state.is24Hour) {
      formatToggleBtn.classList.add('active');
      formatToggleBtn.setAttribute('aria-pressed', 'true');
      formatLabel.textContent = '24-Hour Format';
    } else {
      formatToggleBtn.classList.remove('active');
      formatToggleBtn.setAttribute('aria-pressed', 'false');
      formatLabel.textContent = '12-Hour Format';
    }

    // Seconds display button
    if (state.showSeconds) {
      secondsToggleBtn.classList.add('active');
      secondsToggleBtn.setAttribute('aria-pressed', 'true');
      secondsLabel.textContent = 'Seconds Shown';
      secondsWrapper.classList.remove('hidden');
    } else {
      secondsToggleBtn.classList.remove('active');
      secondsToggleBtn.setAttribute('aria-pressed', 'false');
      secondsLabel.textContent = 'Seconds Hidden';
      secondsWrapper.classList.add('hidden');
    }
  }

  formatToggleBtn.addEventListener('click', () => {
    state.is24Hour = !state.is24Hour;
    localStorage.setItem(STORAGE_KEYS.FORMAT_24H, state.is24Hour);
    applyToggles();
    updateClock();
  });

  secondsToggleBtn.addEventListener('click', () => {
    state.showSeconds = !state.showSeconds;
    localStorage.setItem(STORAGE_KEYS.SHOW_SECONDS, state.showSeconds);
    applyToggles();
  });

  // --- Theme Switching ---
  function applyTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    state.theme = themeName;
    localStorage.setItem(STORAGE_KEYS.THEME, themeName);

    themeBtns.forEach((btn) => {
      if (btn.getAttribute('data-color') === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  themeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedTheme = btn.getAttribute('data-color');
      if (selectedTheme) {
        applyTheme(selectedTheme);
      }
    });
  });

  // --- Fullscreen Toggle ---
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request blocked or not supported:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });

  // --- Name Editing Modal ---
  function openNameModal() {
    nameInput.value = state.name;
    nameModal.showModal();
    nameInput.focus();
    nameInput.select();
  }

  function closeNameModal() {
    nameModal.close();
  }

  userNameEl.addEventListener('click', openNameModal);
  editNameBtn.addEventListener('click', openNameModal);
  modalCloseBtn.addEventListener('click', closeNameModal);
  modalCancelBtn.addEventListener('click', closeNameModal);

  // Close when clicking modal backdrop
  nameModal.addEventListener('click', (e) => {
    const rect = nameModal.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      closeNameModal();
    }
  });

  nameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const trimmed = nameInput.value.trim();
    if (trimmed) {
      state.name = trimmed;
      localStorage.setItem(STORAGE_KEYS.NAME, state.name);
      applyProfile();
      closeNameModal();
    }
  });

  // --- Initialization ---
  function init() {
    applyTheme(state.theme);
    applyProfile();
    applyToggles();
    updateClock();

    // High accuracy tick: run every 250ms to guarantee responsive seconds
    setInterval(updateClock, 250);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
