// المنطق التفاعلي لموقع الصدقة الجارية (ناديه صالح رحمها الله)
import { 
  TASBEEH_PRESETS, 
  MORNING_AZKAR, 
  EVENING_AZKAR, 
  POST_PRAYER_AZKAR, 
  DUAS_FOR_DECEASED, 
  GENERAL_DUAS, 
  QURAN_SURAHS,
  INSPIRATIONAL_QUOTES 
} from './data.js';

import { sfx } from './audio.js';

// ==========================================================
// 1. إدارة الحالة العامة والتخزين المحلي
// ==========================================================

const CIRCUMFERENCE = 2 * Math.PI * 54; // 339.292

let state = {
  activeSection: 'section-tasbeeh',
  activeCategory: 'morning',
  currentPresetIndex: 0,
  targetCount: 33,
  tasbeehCounts: {},
  azkarRemaining: {},
  ameenCounts: {},
  currentTrackIndex: 0,
  isPlayingAudio: false,
  theme: localStorage.getItem('dz_theme') || 'dark',
};

// تهيئة العدادات المحفوظة
TASBEEH_PRESETS.forEach(p => {
  state.tasbeehCounts[p.id] = parseInt(localStorage.getItem('dz_cnt_' + p.id)) || 0;
});

// تهيئة عدادات التأمين
DUAS_FOR_DECEASED.forEach(d => {
  state.ameenCounts[d.id] = parseInt(localStorage.getItem('dz_ameen_' + d.id)) || Math.floor(Math.random() * 25) + 12;
});

// أيقونات SVG المشتركة
const COPY_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
const SHARE_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`;

// ==========================================================
// 2. عناصر واجهة المستخدم الرئيسية
// ==========================================================

const elements = {
  soundToggleBtn: document.getElementById('sound-toggle-btn'),
  soundIconSvg: document.getElementById('sound-icon-svg'),
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  themeIconSvg: document.getElementById('theme-icon-svg'),
  shareSiteBtn: document.getElementById('share-site-btn'),
  quoteText: document.getElementById('quote-text'),
  quoteSource: document.getElementById('quote-source'),
  refreshQuoteBtn: document.getElementById('refresh-quote-btn'),

  // السبحة
  tasbeehPresetsContainer: document.getElementById('tasbeeh-presets-container'),
  activePhraseText: document.getElementById('active-phrase-text'),
  activePhraseVirtue: document.getElementById('active-phrase-virtue'),
  tasbeehCount: document.getElementById('tasbeeh-count'),
  tasbeehTargetHint: document.getElementById('tasbeeh-target-hint'),
  tasbeehProgressBar: document.getElementById('tasbeeh-progress-bar'),
  tasbeehBtn: document.getElementById('tasbeeh-btn'),
  dedicateDeedBtn: document.getElementById('dedicate-deed-btn'),
  tasbeehResetTrigger: document.getElementById('tasbeeh-reset-trigger'),
  modeBtns: document.querySelectorAll('.mode-btn'),

  // موسوعة الأذكار
  azkarTabBtns: document.querySelectorAll('.azkar-tab-btn'),
  azkarCardsContainer: document.getElementById('azkar-cards-container'),
  azkarProgressText: document.getElementById('azkar-progress-text'),
  azkarProgressFill: document.getElementById('azkar-progress-fill'),

  // أدعية ناديه
  nadiaDuasContainer: document.getElementById('nadia-duas-container'),

  // أدعية مأثورة
  generalDuasContainer: document.getElementById('general-duas-container'),

  // مشغل سور القرآن
  audioPlayer: document.getElementById('quran-audio-player'),
  audioMainPlayBtn: document.getElementById('audio-main-play-btn'),
  playerPlayIcon: document.getElementById('player-play-icon'),
  playerTitle: document.getElementById('player-title'),
  playerReciter: document.getElementById('player-reciter'),
  soundWaveBox: document.getElementById('sound-wave-box'),
  audioTracksContainer: document.getElementById('audio-tracks-container'),

  // شريط التنقل الرئيسي (أعلى الصفحة)
  navItems: document.querySelectorAll('.top-nav-bar .nav-item, .bottom-nav-bar .nav-item, .nav-item'),
  viewSections: document.querySelectorAll('.view-section'),

  // الإشعارات والمودال
  toastMsg: document.getElementById('toast-msg'),
  resetModal: document.getElementById('reset-modal'),
  modalConfirmBtn: document.getElementById('modal-confirm-btn'),
  modalCancelBtn: document.getElementById('modal-cancel-btn')
};

// ==========================================================
// 3. الدوال المساعدة وتحديث الواجهة
// ==========================================================

function showToast(text) {
  if (!elements.toastMsg) return;
  elements.toastMsg.textContent = text;
  elements.toastMsg.classList.add('show');
  setTimeout(() => {
    elements.toastMsg.classList.remove('show');
  }, 2600);
}

// تبديل المظهر (Dark / Light)
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('dz_theme', theme);
  if (elements.themeIconSvg) {
    if (theme === 'light') {
      // شمس
      elements.themeIconSvg.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
    } else {
      // هلال
      elements.themeIconSvg.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    }
  }
}

// عرض تذكرة أو نفحة
function displayRandomQuote() {
  const quote = INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)];
  if (elements.quoteText) elements.quoteText.textContent = `"${quote.text}"`;
  if (elements.quoteSource) elements.quoteSource.textContent = `— ${quote.source}`;
}

// ==========================================================
// 4. منطق السبحة الإلكترونية
// ==========================================================

function renderTasbeehPresets() {
  if (!elements.tasbeehPresetsContainer) return;
  elements.tasbeehPresetsContainer.innerHTML = '';

  TASBEEH_PRESETS.forEach((preset, idx) => {
    const chip = document.createElement('button');
    chip.className = `preset-chip ${idx === state.currentPresetIndex ? 'active' : ''}`;
    chip.textContent = preset.label;
    chip.addEventListener('click', () => {
      selectTasbeehPreset(idx);
    });
    elements.tasbeehPresetsContainer.appendChild(chip);
  });
}

function selectTasbeehPreset(index) {
  state.currentPresetIndex = index;
  const preset = TASBEEH_PRESETS[index];

  elements.activePhraseText.textContent = preset.label;
  elements.activePhraseVirtue.textContent = preset.virtue;

  document.querySelectorAll('.preset-chip').forEach((c, i) => {
    c.classList.toggle('active', i === index);
  });

  updateTasbeehDisplay();
}

function updateTasbeehDisplay() {
  const preset = TASBEEH_PRESETS[state.currentPresetIndex];
  const count = state.tasbeehCounts[preset.id] || 0;

  if (elements.tasbeehCount) elements.tasbeehCount.textContent = count;

  if (elements.tasbeehTargetHint) {
    elements.tasbeehTargetHint.textContent = state.targetCount > 0 
      ? `الهدف: ${state.targetCount}` 
      : 'تسبيح حر';
  }

  // تحديث شريط التقدم الدائري
  if (elements.tasbeehProgressBar) {
    if (state.targetCount > 0) {
      const currentCycle = count % state.targetCount;
      const progress = currentCycle / state.targetCount;
      const offset = CIRCUMFERENCE - (progress * CIRCUMFERENCE);
      elements.tasbeehProgressBar.style.strokeDashoffset = offset;
    } else {
      elements.tasbeehProgressBar.style.strokeDashoffset = 0;
    }
  }
}

function handleTasbeehPress() {
  const preset = TASBEEH_PRESETS[state.currentPresetIndex];
  state.tasbeehCounts[preset.id] = (state.tasbeehCounts[preset.id] || 0) + 1;
  const count = state.tasbeehCounts[preset.id];

  localStorage.setItem('dz_cnt_' + preset.id, count);

  sfx.playClick();
  sfx.vibrate([20]);

  if (state.targetCount > 0 && count % state.targetCount === 0) {
    sfx.playCompletion();
    sfx.vibrate([40, 70, 40]);
    showToast(`أتممت ${state.targetCount} تسبيحة.. تقبل الله`);
  }

  updateTasbeehDisplay();
}

// ==========================================================
// 5. موسوعة الأذكار
// ==========================================================

function getCategoryData(cat) {
  if (cat === 'morning') return MORNING_AZKAR;
  if (cat === 'evening') return EVENING_AZKAR;
  if (cat === 'post_prayer') return POST_PRAYER_AZKAR;
  return MORNING_AZKAR;
}

function renderAzkarList() {
  if (!elements.azkarCardsContainer) return;
  elements.azkarCardsContainer.innerHTML = '';

  const list = getCategoryData(state.activeCategory);

  list.forEach(item => {
    const storageKey = `dz_azkar_${state.activeCategory}_${item.id}`;
    if (state.azkarRemaining[item.id] === undefined) {
      const saved = localStorage.getItem(storageKey);
      state.azkarRemaining[item.id] = saved !== null ? parseInt(saved) : item.count;
    }

    const currentRemaining = state.azkarRemaining[item.id];
    const isDone = currentRemaining === 0;

    const card = document.createElement('div');
    card.className = `azkar-card ${isDone ? 'completed' : ''}`;
    card.id = `azkar-card-${item.id}`;

    card.innerHTML = `
      <p class="azkar-text">${item.text}</p>
      <div class="azkar-virtue-tag">
        <span>${item.virtue}</span>
      </div>
      <div class="card-footer-controls">
        <div class="card-action-icons">
          <button class="card-action-btn copy-btn" title="نسخ الذكر" aria-label="نسخ">${COPY_SVG}<span>نسخ</span></button>
          <button class="card-action-btn share-btn" title="مشاركة عبر واتساب" aria-label="مشاركة">${SHARE_SVG}<span>مشاركة</span></button>
        </div>
        <button class="card-counter-btn ${isDone ? 'completed' : ''}" id="btn-count-${item.id}">
          ${isDone ? 'تم بحمد الله' : `المتبقي: ${currentRemaining}`}
        </button>
      </div>
    `;

    // زر العداد
    const countBtn = card.querySelector(`#btn-count-${item.id}`);
    countBtn.addEventListener('click', () => {
      handleAzkarCountClick(item, card, countBtn);
    });

    // زر النسخ
    card.querySelector('.copy-btn').addEventListener('click', () => {
      copyToClipboard(`${item.text}\n\n[${item.virtue}]\n\nصدقة جارية عن ناديه صالح رحمها الله`);
    });

    // زر واتساب
    card.querySelector('.share-btn').addEventListener('click', () => {
      const shareUrl = window.location.href;
      const text = encodeURIComponent(`"${item.text}"\n\nفضل الذكر: ${item.virtue}\n\nصدقة جارية لروح ناديه صالح رحمها الله:\n${shareUrl}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    });

    elements.azkarCardsContainer.appendChild(card);
  });

  updateAzkarProgress();
}

function handleAzkarCountClick(item, card, countBtn) {
  if (state.azkarRemaining[item.id] > 0) {
    state.azkarRemaining[item.id]--;
    const current = state.azkarRemaining[item.id];
    localStorage.setItem(`dz_azkar_${state.activeCategory}_${item.id}`, current);

    sfx.playClick();
    sfx.vibrate([20]);

    if (current === 0) {
      countBtn.classList.add('completed');
      countBtn.textContent = 'تم بحمد الله';
      card.classList.add('completed');
      sfx.playCompletion();
      sfx.vibrate([40, 60, 40]);
      showToast('أتممت قراءة الذكر، جزاك الله خيراً');
    } else {
      countBtn.textContent = `المتبقي: ${current}`;
    }

    updateAzkarProgress();
  }
}

function updateAzkarProgress() {
  const list = getCategoryData(state.activeCategory);
  let doneCount = 0;

  list.forEach(item => {
    if (state.azkarRemaining[item.id] === 0) {
      doneCount++;
    }
  });

  const total = list.length;
  const percentage = Math.round((doneCount / total) * 100);

  if (elements.azkarProgressText) {
    elements.azkarProgressText.textContent = `${doneCount} من أصل ${total} (${percentage}%)`;
  }
  if (elements.azkarProgressFill) {
    elements.azkarProgressFill.style.width = `${percentage}%`;
  }
}

// ==========================================================
// 6. أدعية للمتوفاة ناديه صالح
// ==========================================================

function renderNadiaDuasList() {
  if (!elements.nadiaDuasContainer) return;
  elements.nadiaDuasContainer.innerHTML = '';

  DUAS_FOR_DECEASED.forEach(dua => {
    const card = document.createElement('div');
    card.className = 'dua-card';
    card.id = `dua-card-${dua.id}`;

    const ameenCount = state.ameenCounts[dua.id] || 15;

    card.innerHTML = `
      <div class="dua-card-header">
        <span class="dua-badge">${dua.badge}</span>
        <h3 class="dua-title">${dua.title}</h3>
      </div>
      <p class="dua-text">${dua.text}</p>
      <div class="dua-footer">
        <button class="ameen-btn" id="ameen-btn-${dua.id}">
          <span>آمـيـن يا رب</span>
          <span class="ameen-count-badge" id="ameen-badge-${dua.id}">${ameenCount}</span>
        </button>
        <div class="card-action-icons">
          <button class="card-action-btn copy-btn" title="نسخ الدعاء" aria-label="نسخ">${COPY_SVG}<span>نسخ</span></button>
          <button class="card-action-btn share-btn" title="مشاركة الدعاء" aria-label="مشاركة">${SHARE_SVG}<span>مشاركة</span></button>
        </div>
      </div>
    `;

    // زر التأمين
    const ameenBtn = card.querySelector(`#ameen-btn-${dua.id}`);
    const ameenBadge = card.querySelector(`#ameen-badge-${dua.id}`);

    ameenBtn.addEventListener('click', () => {
      state.ameenCounts[dua.id] = (state.ameenCounts[dua.id] || 0) + 1;
      localStorage.setItem('dz_ameen_' + dua.id, state.ameenCounts[dua.id]);
      ameenBadge.textContent = state.ameenCounts[dua.id];

      sfx.playCompletion();
      sfx.vibrate([30, 50]);
      showToast('اللهم استجب وتقبل.. غفر الله لها ورحمها');
    });

    // زر النسخ
    card.querySelector('.copy-btn').addEventListener('click', () => {
      copyToClipboard(`${dua.title}\n\n"${dua.text}"\n\nاللهم اغفر لأختنا ناديه صالح وارحمها`);
    });

    // زر المشاركة
    card.querySelector('.share-btn').addEventListener('click', () => {
      const text = encodeURIComponent(`${dua.title}\n\n"${dua.text}"\n\nاللهم اغفر لأختنا ناديه صالح وارحمها:\n${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    });

    elements.nadiaDuasContainer.appendChild(card);
  });
}

// ==========================================================
// 7. أدعية قرآنية ونبوية عامة
// ==========================================================

function renderGeneralDuas() {
  if (!elements.generalDuasContainer) return;
  elements.generalDuasContainer.innerHTML = '';

  GENERAL_DUAS.forEach(dua => {
    const card = document.createElement('div');
    card.className = 'general-dua-card';

    card.innerHTML = `
      <span class="general-dua-category">${dua.category}</span>
      <p class="general-dua-text">${dua.text}</p>
      <div class="card-footer-controls">
        <span class="general-dua-ref">${dua.reference}</span>
        <div class="card-action-icons">
          <button class="card-action-btn copy-btn" title="نسخ" aria-label="نسخ">${COPY_SVG}<span>نسخ</span></button>
          <button class="card-action-btn share-btn" title="مشاركة" aria-label="مشاركة">${SHARE_SVG}<span>مشاركة</span></button>
        </div>
      </div>
    `;

    card.querySelector('.copy-btn').addEventListener('click', () => {
      copyToClipboard(`"${dua.text}"\n[${dua.reference}]\n\nصدقة جارية لروح ناديه صالح رحمها الله`);
    });

    card.querySelector('.share-btn').addEventListener('click', () => {
      const text = encodeURIComponent(`"${dua.text}"\n[${dua.reference}]\n\nصدقة جارية:\n${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    });

    elements.generalDuasContainer.appendChild(card);
  });
}

// ==========================================================
// 8. سور القرآن الكريم والتلاوات
// ==========================================================
function renderAudioTracks() {
  if (!elements.audioTracksContainer) return;
  elements.audioTracksContainer.innerHTML = '';

  QURAN_SURAHS.forEach((track, idx) => {
    const item = document.createElement('div');
    item.className = `track-item ${idx === state.currentTrackIndex ? 'active' : ''}`;
    const isCurrentPlaying = idx === state.currentTrackIndex && state.isPlayingAudio;

    item.innerHTML = `
      <div class="track-info">
        <p class="track-name">${track.name}</p>
        <p class="track-reciter">${track.reciter}</p>
      </div>
      <div class="track-meta">
        <span>${track.duration}</span>
        <span class="track-play-icon">
          ${isCurrentPlaying ? `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
          ` : `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          `}
        </span>
      </div>
    `;

    item.addEventListener('click', () => {
      if (idx === state.currentTrackIndex && state.isPlayingAudio) {
        pauseAudio();
      } else {
        playTrack(idx);
      }
    });

    elements.audioTracksContainer.appendChild(item);
  });
}

function playTrack(idx) {
  state.currentTrackIndex = idx;
  const track = QURAN_SURAHS[idx];

  if (elements.playerTitle) elements.playerTitle.textContent = track.name;
  if (elements.playerReciter) elements.playerReciter.textContent = track.reciter;

  if (elements.audioPlayer) {
    elements.audioPlayer.src = track.src;
    elements.audioPlayer.play().then(() => {
      state.isPlayingAudio = true;
      updateAudioUI(true);
    }).catch(() => {
      state.isPlayingAudio = false;
      updateAudioUI(false);
      showToast('تعذر تشغيل الصوت، يرجى الضغط مرة أخرى');
    });
  }
}

function pauseAudio() {
  if (elements.audioPlayer) {
    elements.audioPlayer.pause();
  }
  state.isPlayingAudio = false;
  updateAudioUI(false);
}

function updateAudioUI(isPlaying) {
  if (elements.playerPlayIcon) {
    elements.playerPlayIcon.innerHTML = isPlaying 
      ? `<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>`
      : `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;
  }
  if (elements.soundWaveBox) {
    elements.soundWaveBox.classList.toggle('playing', isPlaying);
  }
  renderAudioTracks();
}

// ==========================================================
// 9. ربط أحداث واجهة المستخدم
// ==========================================================

function setupEventListeners() {
  // شريط الموبايل السفلي
  elements.navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.dataset.target;
      state.activeSection = targetId;

      elements.navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      elements.viewSections.forEach(sec => {
        sec.classList.toggle('active', sec.id === targetId);
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // نقر زر السبحة
  if (elements.tasbeehBtn) {
    elements.tasbeehBtn.addEventListener('click', handleTasbeehPress);
    elements.tasbeehBtn.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleTasbeehPress();
      }
    });
  }

  // أزرار تحديد الهدف
  elements.modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.targetCount = parseInt(btn.dataset.target);
      updateTasbeehDisplay();
    });
  });

  // زر إهداء الثواب
  if (elements.dedicateDeedBtn) {
    elements.dedicateDeedBtn.addEventListener('click', () => {
      sfx.playCompletion();
      sfx.vibrate([50, 70, 50]);
      showToast('تم إهداء ثواب هذا التسبيح لروح ناديه صالح.. تقبل الله طاعتكم');
    });
  }

  // إعادة تعيين العداد
  if (elements.tasbeehResetTrigger) {
    elements.tasbeehResetTrigger.addEventListener('click', () => {
      elements.resetModal.classList.add('show');
    });
  }

  if (elements.modalConfirmBtn) {
    elements.modalConfirmBtn.addEventListener('click', () => {
      const preset = TASBEEH_PRESETS[state.currentPresetIndex];
      state.tasbeehCounts[preset.id] = 0;
      localStorage.setItem('dz_cnt_' + preset.id, 0);
      updateTasbeehDisplay();
      elements.resetModal.classList.remove('show');
      showToast('تمت إعادة ضبط العداد إلى الصفر');
    });
  }

  if (elements.modalCancelBtn) {
    elements.modalCancelBtn.addEventListener('click', () => {
      elements.resetModal.classList.remove('show');
    });
  }

  // تبويب الأذكار
  elements.azkarTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.azkarTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.dataset.category;
      renderAzkarList();
    });
  });

  // أزرار الترويسة
  if (elements.themeToggleBtn) {
    elements.themeToggleBtn.addEventListener('click', () => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  }

  if (elements.soundToggleBtn) {
    elements.soundToggleBtn.addEventListener('click', () => {
      const isEnabled = sfx.toggleSound();
      if (elements.soundIconSvg) {
        elements.soundIconSvg.innerHTML = isEnabled 
          ? `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>`
          : `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>`;
      }
      showToast(isEnabled ? 'تم تشغيل أصوات التسبيح' : 'تم كتم أصوات التسبيح');
    });
  }

  if (elements.shareSiteBtn) {
    elements.shareSiteBtn.addEventListener('click', shareSite);
  }

  if (elements.refreshQuoteBtn) {
    elements.refreshQuoteBtn.addEventListener('click', displayRandomQuote);
  }

  // مشغل سور القرآن
  if (elements.audioMainPlayBtn) {
    elements.audioMainPlayBtn.addEventListener('click', () => {
      if (state.isPlayingAudio) {
        pauseAudio();
      } else {
        playTrack(state.currentTrackIndex);
      }
    });
  }

  if (elements.audioPlayer) {
    elements.audioPlayer.addEventListener('ended', () => {
      const nextIdx = (state.currentTrackIndex + 1) % QURAN_SURAHS.length;
      playTrack(nextIdx);
    });
  }

  // زر تثبيت التطبيق على الموبايل
  setupPwaInstall();
}

let deferredPrompt = null;
function setupPwaInstall() {
  const installBtn = document.getElementById('install-app-btn');
  const installModal = document.getElementById('install-modal');
  const installModalClose = document.getElementById('install-modal-close');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast('تم بدء تثبيت التطبيق بنجاح!');
        }
        deferredPrompt = null;
      } else {
        // إظهار نافذة الإرشادات للمستخدم (خصوصاً للآيفون أو في حال عدم دعم المتصفح للمطالبة المباشرة)
        if (installModal) {
          installModal.classList.add('show');
        }
      }
    });
  }

  if (installModalClose) {
    installModalClose.addEventListener('click', () => {
      if (installModal) installModal.classList.remove('show');
    });
  }

  // تفريغ الكاش القديم وتحديث Service Worker
  if ('caches' in window) {
    caches.keys().then((keys) => {
      keys.forEach((k) => {
        if (k !== 'sadaka-v3') caches.delete(k);
      });
    });
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=3').then((reg) => {
      reg.update();
    }).catch(() => {});
  }
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('تم النسخ بنجاح');
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast('تم النسخ بنجاح');
}

function shareSite() {
  const shareData = {
    title: 'صدقة جارية — ناديه صالح رحمها الله',
    text: 'موقع صدقة جارية في ذكرى أختنا ناديه صالح رحمها الله — أذكار الصباح والمساء، سبحة إلكترونية، وأدعية مباركة:',
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else {
    copyToClipboard(`${shareData.text}\n${shareData.url}`);
  }
}

// ==========================================================
// 9. بدء تشغيل التطبيق
// ==========================================================

function initApp() {
  applyTheme(state.theme);
  displayRandomQuote();

  renderTasbeehPresets();
  updateTasbeehDisplay();

  renderAzkarList();
  renderNadiaDuasList();
  renderGeneralDuas();
  renderAudioTracks();

  setupEventListeners();
}

document.addEventListener('DOMContentLoaded', initApp);
