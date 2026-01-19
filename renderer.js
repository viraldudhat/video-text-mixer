// ---------- ELEMENTS ----------
const paragraphEl = document.getElementById('paragraph');
const loadBtn = document.getElementById('loadBtn');
const linesEl = document.getElementById('lines');
const previewEl = document.getElementById('preview');

const fontSizeEl = document.getElementById('fontSize');
const fontColorEl = document.getElementById('fontColor');
const bgColorEl = document.getElementById('bgColor');
const fontFamilyEl = document.getElementById('fontFamily');
const savePresetBtn = document.getElementById('savePreset');

const typeSpeedEl = document.getElementById('typeSpeed');
const speedValueEl = document.getElementById('speedValue');

// ---------- STATE ----------
let lines = [];
let activeIndex = -1;

// Typewriter variables
let typingTimer = null; // <-- THIS IS REQUIRED
let TYPE_SPEED = 40; // ms per character, adjust as needed
// ---------- LOAD LINES ----------
loadBtn.addEventListener('click', () => {
  lines = paragraphEl.value
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  renderLines();
  selectLine(0);
});

function renderLines() {
  linesEl.innerHTML = '';

  lines.forEach((line, index) => {
    const div = document.createElement('div');
    div.className = 'line';
    div.innerText = line;
    div.onclick = () => selectLine(index);
    linesEl.appendChild(div);
  });
}

// function selectLine(index) {
//   if (index < 0 || index >= lines.length) return;
//   activeIndex = index;

//   document.querySelectorAll('.line').forEach((el, i) => {
//     el.classList.toggle('active', i === index);
//   });

//   previewEl.innerText = lines[index];
// }
function selectLine(index) {
  console.log('Selecting line:', index);
  if (index < 0 || index >= lines.length) return;
  activeIndex = index;

  // Highlight active line
  document.querySelectorAll('.line').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });
  if (TYPE_SPEED <= 0) {
    previewEl.innerText = lines[index];
    return;
  }
  // Start typewriter effect
  startTypewriter(lines[index]);
}
// function selectLine(index) {
//   if (index < 0 || index >= lines.length) return;
//   activeIndex = index;

//   document.querySelectorAll('.line').forEach((el, i) => {
//     el.classList.toggle('active', i === index);
//   });

//   // FADE OUT
//   previewEl.classList.add('fade-out');
//   previewEl.classList.remove('fade-in');

//   setTimeout(() => {
//     // Change text after fade out
//     previewEl.innerText = lines[index];

//     // FADE IN
//     previewEl.classList.remove('fade-out');
//     previewEl.classList.add('fade-in');
//   }, 300);
// }

// ---------- KEYBOARD ----------
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') selectLine(activeIndex + 1);
  if (e.key === 'ArrowUp') selectLine(activeIndex - 1);
});

// ---------- STYLE APPLY ----------
function applyPreviewStyle() {
  previewEl.style.fontSize = fontSizeEl.value + 'px';
  previewEl.style.color = fontColorEl.value;
  previewEl.style.background = bgColorEl.value;
  previewEl.style.fontFamily = fontFamilyEl.value;
}

// Live update
fontSizeEl.addEventListener('input', applyPreviewStyle);
fontColorEl.addEventListener('input', applyPreviewStyle);
bgColorEl.addEventListener('input', applyPreviewStyle);
fontFamilyEl.addEventListener('change', applyPreviewStyle);
typeSpeedEl.addEventListener('input', () => {
  TYPE_SPEED = parseInt(typeSpeedEl.value, 10);
  speedValueEl.textContent = TYPE_SPEED;
});

// ---------- PRESET AUTO LOAD ----------
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('previewPreset');
  if (!saved) return;

  try {
    const preset = JSON.parse(saved);

    fontSizeEl.value = preset.fontSize;
    fontColorEl.value = preset.fontColor;
    bgColorEl.value = preset.bgColor;
    fontFamilyEl.value = preset.fontFamily;

    if (preset.typeSpeed) {
      TYPE_SPEED = preset.typeSpeed;
      typeSpeedEl.value = TYPE_SPEED;
      speedValueEl.textContent = TYPE_SPEED;
    }

    applyPreviewStyle();
    console.log('✅ Preset auto-loaded');
  } catch (err) {
    console.error('❌ Preset load failed', err);
  }
});

// ---------- SAVE PRESET ----------
savePresetBtn.addEventListener('click', () => {
  const preset = {
    fontSize: fontSizeEl.value,
    fontColor: fontColorEl.value,
    bgColor: bgColorEl.value,
    fontFamily: fontFamilyEl.value,
    typeSpeed: parseInt(typeSpeedEl.value, 10)
  };

  localStorage.setItem('previewPreset', JSON.stringify(preset));

  // Visual confirmation (no alert)
  savePresetBtn.textContent = 'Saved ✔';
  setTimeout(() => {
    savePresetBtn.textContent = 'Save';
  }, 1200);

  console.log('✅ Preset saved:', preset);
});

function startTypewriter(text) {
  if (typingTimer) clearInterval(typingTimer);

  previewEl.innerText = '';
  let charIndex = 0;
  const chars = Array.from(text);

  typingTimer = setInterval(() => {
    previewEl.innerText = chars.slice(0, charIndex + 1).join('') + '|';
    charIndex++;

    if (charIndex >= chars.length) {
      clearInterval(typingTimer);
      typingTimer = null;
      previewEl.innerText = chars.join('');
    }
  }, TYPE_SPEED);
}
