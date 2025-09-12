const keys = [
  {key: "takbir", label: "الله أكبر"},
  {key: "subhan", label: "سبحان الله"},
  {key: "hamd", label: "الحمد لله"},
];

// Load counts from localStorage or initialize
const counts = {};
keys.forEach((k) => {
  const saved = parseInt(localStorage.getItem("dz_" + k.key)) || 0;
  counts[k.key] = saved;
  updateDOM(k.key);
});

// Helpers
function updateDOM(key) {
  const el = document.getElementById(key + "-count");
  if (el) el.textContent = counts[key];
}
function save(key) {
  localStorage.setItem("dz_" + key, counts[key]);
}

// Pulse animation controller
function showPulse(key) {
  const p = document.getElementById(key + "-pulse");
  if (!p) return;
  p.classList.remove("show");
  void p.offsetWidth;
  p.classList.add("show");
}

// Setup buttons
document.querySelectorAll(".circle-btn").forEach((btn) => {
  const key = btn.dataset.key;
  btn.addEventListener("click", () => {
    counts[key] = (counts[key] || 0) + 1;
    updateDOM(key);
    save(key);
    showPulse(key);
  });

  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      btn.click();
    }
  });

  let timer = null;
  let interval = null;
  btn.addEventListener("pointerdown", (e) => {
    timer = setTimeout(() => {
      interval = setInterval(() => {
        counts[key] = (counts[key] || 0) + 1;
        updateDOM(key);
        save(key);
        showPulse(key);
      }, 140);
    }, 450);
  });
  function stopHold() {
    clearTimeout(timer);
    timer = null;
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }
  btn.addEventListener("pointerup", stopHold);
  btn.addEventListener("pointercancel", stopHold);
  btn.addEventListener("pointerleave", stopHold);
});

// Modal handling
const modal = document.getElementById("reset-modal");
const modalKeyLabel = document.getElementById("modal-key-label");
const modalConfirm = document.getElementById("modal-confirm");
const modalCancel = document.getElementById("modal-cancel");
let currentResetKey = null;

// Reset buttons
document.querySelectorAll("[data-reset]").forEach((rbtn) => {
  rbtn.addEventListener("click", () => {
    const key = rbtn.dataset.reset;
    const keyLabel = keys.find((k) => k.key === key).label;
    currentResetKey = key;
    modalKeyLabel.textContent = keyLabel;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    modalConfirm.focus();
  });
});

// Modal confirm button
modalConfirm.addEventListener("click", () => {
  if (currentResetKey) {
    counts[currentResetKey] = 0;
    updateDOM(currentResetKey);
    save(currentResetKey);
  }
  closeModal();
});

// Modal cancel button
modalCancel.addEventListener("click", closeModal);

// Close modal on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("show")) {
    closeModal();
  }
});

// Close modal function
function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  currentResetKey = null;
}
