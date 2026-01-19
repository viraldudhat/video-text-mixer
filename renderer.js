// ---------- ELEMENTS ----------
const paragraphEl = document.getElementById('paragraph');
const loadBtn = document.getElementById('loadBtn');
const linesEl = document.getElementById('lines');
const previewEl = document.getElementById('preview');

const fontSizeEl = document.getElementById('fontSize');
const fontColorEl = document.getElementById('fontColor');
const bgColorEl = document.getElementById('bgColor');
const fontSizeValueEl = document.getElementById('fontSizeValue');

const savePresetBtn = document.getElementById('savePreset');

const typeSpeedEl = document.getElementById('typeSpeed');
const speedValueEl = document.getElementById('speedValue');

const titleInput = document.getElementById('titleInput');
const saveBtn = document.getElementById('saveBtn');
const scriptSelect = document.getElementById('scriptSelect');
const savedList = document.getElementById('savedList');
const deleteBtn = document.getElementById('deleteBtn');

const boldBtn = document.getElementById('boldBtn');
const italicBtn = document.getElementById('italicBtn');
const underlineBtn = document.getElementById('underlineBtn');

const openPopupBtn = document.getElementById('openPopupBtn');
const bgImageInput = document.getElementById('bgImageInput');
const bgImageSelect = document.getElementById('bgImageSelect');
const deleteBgBtn = document.getElementById('deleteBgBtn');

const posXEl = document.getElementById('posX');
const posXValueEl = document.getElementById('posXValue');
const posYEl = document.getElementById('posY');
const posYValueEl = document.getElementById('posYValue');

// ---------- STATE ----------
let lines = [];
let activeIndex = -1;

// Typewriter variables
let typingTimer = null; // <-- THIS IS REQUIRED
let TYPE_SPEED = 0; // ms per character, adjust as needed

let isBold = false;
let isItalic = false;
let isUnderline = false;

let popupWindow = null;
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
  if (index < 0 || index >= lines.length) return;
  activeIndex = index;

  document.querySelectorAll('.line').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });

  if (TYPE_SPEED <= 0) {
    previewEl.innerText = lines[index];
    sendToPopup();
    return;
  }

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
  fontSizeValueEl.textContent = fontSizeEl.value;

  previewEl.style.fontWeight = isBold ? 'bold' : 'normal';
  previewEl.style.fontStyle = isItalic ? 'italic' : 'normal';
  previewEl.style.textDecoration = isUnderline ? 'underline' : 'none';
  sendToPopup();
}

// Live update
fontSizeEl.addEventListener('input', applyPreviewStyle);
fontColorEl.addEventListener('input', applyPreviewStyle);
bgColorEl.addEventListener('input', applyPreviewStyle);

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
    fontSizeValueEl.textContent = preset.fontSize;

    // NEW
    posXEl.value = preset.posX ?? 960;
    posYEl.value = preset.posY ?? 540;
    if (preset.typeSpeed !== undefined) {
      TYPE_SPEED = preset.typeSpeed;
      typeSpeedEl.value = TYPE_SPEED;
      speedValueEl.textContent = TYPE_SPEED;
    }

    loadBgDropdown();
    // select saved background
    if (preset.bgImage) {
      bgImageSelect.value = preset.bgImage;
    }
    applyPreviewStyle();
    loadScriptDropdown();

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
    typeSpeed: parseInt(typeSpeedEl.value, 10),

    // NEW
    bgImage: bgImageSelect.value || '',
    posX: posXEl.value,
    posY: posYEl.value
  };

  localStorage.setItem('previewPreset', JSON.stringify(preset));

  // Visual confirmation (no alert)
  savePresetBtn.textContent = 'Saved ✔';
  setTimeout(() => {
    savePresetBtn.textContent = 'Save';
  }, 1200);

  console.log('✅ Preset saved:', preset);
});

saveBtn.addEventListener('click', () => {
  const title = titleInput.value.trim();
  const content = paragraphEl.value.trim();

  if (!title || !content) {
    alert('Title and content required');
    return;
  }

  const scripts = getScripts();
  scripts[title] = content;
  saveScripts(scripts);

  titleInput.value = '';
  paragraphEl.value = '';
  loadScriptDropdown();
});

scriptSelect.addEventListener('change', () => {
  const title = scriptSelect.value;
  if (!title) return;

  const scripts = getScripts();
  paragraphEl.value = scripts[title];
  titleInput.value = title;
  loadBtn.click(); // auto load lines
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
    sendToPopup();
  }, TYPE_SPEED);
}

function getScripts() {
  return JSON.parse(localStorage.getItem('scripts') || '{}');
}

function saveScripts(data) {
  localStorage.setItem('scripts', JSON.stringify(data));
}

function loadSavedList(filter = '') {
  const scripts = getScripts();
  savedList.innerHTML = '';

  Object.keys(scripts)
    .filter((title) => title.toLowerCase().includes(filter.toLowerCase()))
    .forEach((title) => {
      const div = document.createElement('div');
      div.className = 'saved-item';
      div.innerText = title;

      div.onclick = () => {
        paragraphEl.value = scripts[title];
        loadBtn.click(); // auto load lines
      };

      savedList.appendChild(div);
    });
}

function loadScriptDropdown() {
  const scripts = getScripts();

  scriptSelect.innerHTML = '<option value="">-- Select Script --</option>';

  Object.keys(scripts).forEach((title) => {
    const option = document.createElement('option');
    option.value = title;
    option.textContent = title;
    scriptSelect.appendChild(option);
  });
}

// DELETE SCRIPT
deleteBtn.addEventListener('click', () => {
  const title = scriptSelect.value;
  if (!title) return alert('Select a script first');

  if (!confirm(`Delete "${title}"?`)) return;

  const scripts = getScripts();
  delete scripts[title];
  saveScripts(scripts);

  localStorage.removeItem('lastScript');
  scriptSelect.value = '';
  paragraphEl.value = '';
  linesEl.innerHTML = '';
  previewEl.innerText = '';

  loadScriptDropdown();
});

// BOLD
boldBtn.addEventListener('click', () => {
  isBold = !isBold;
  boldBtn.classList.toggle('active', isBold);
  applyPreviewStyle();
});

// ITALIC
italicBtn.addEventListener('click', () => {
  isItalic = !isItalic;
  italicBtn.classList.toggle('active', isItalic);
  applyPreviewStyle();
});

// UNDERLINE
underlineBtn.addEventListener('click', () => {
  isUnderline = !isUnderline;
  underlineBtn.classList.toggle('active', isUnderline);
  applyPreviewStyle();
});

openPopupBtn.addEventListener('click', () => {
  popupWindow = window.open('popup.html', 'OBSPreview', 'width=1920,height=1080');
  // Send data after popup loads
  setTimeout(sendToPopup, 300);
});
bgImageInput.addEventListener('change', () => {
  const file = bgImageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const images = JSON.parse(localStorage.getItem('bgImages') || '[]');
    images.push(reader.result);
    localStorage.setItem('bgImages', JSON.stringify(images));
    loadBgDropdown();
  };
  reader.readAsDataURL(file);
});

function loadBgDropdown() {
  const images = JSON.parse(localStorage.getItem('bgImages') || '[]');
  bgImageSelect.innerHTML = '<option value="">-- Saved Backgrounds --</option>';

  images.forEach((img, i) => {
    const opt = document.createElement('option');
    opt.value = img;
    opt.textContent = `Background ${i + 1}`;
    bgImageSelect.appendChild(opt);
  });
}

bgImageSelect.addEventListener('change', () => {
  sendToPopup();
});
function sendToPopup() {
  if (!popupWindow) return;
  posXValueEl.textContent = posXEl.value;
  posYValueEl.textContent = posYEl.value;
  popupWindow.postMessage(
    {
      text: previewEl.innerText,
      fontSize: fontSizeEl.value,
      fontColor: fontColorEl.value,
      // fontFamily: fontFamilyEl.value,
      bold: isBold,
      italic: isItalic,
      underline: isUnderline,
      bgImage: bgImageSelect.value || '',
      x: posXEl.value,
      y: posYEl.value
    },
    '*'
  );
}
posXEl.addEventListener('input', sendToPopup);
posYEl.addEventListener('input', sendToPopup);

deleteBgBtn.addEventListener('click', () => {
  const selectedBg = bgImageSelect.value;
  if (!selectedBg) {
    alert('Select a background to delete');
    return;
  }

  if (!confirm('Delete selected background image?')) return;

  let images = JSON.parse(localStorage.getItem('bgImages') || '[]');

  // Remove selected image
  images = images.filter((img) => img !== selectedBg);

  localStorage.setItem('bgImages', JSON.stringify(images));

  // Clear selection
  bgImageSelect.value = '';
  previewEl.style.backgroundImage = '';

  // If preset used this background, clear it
  const preset = JSON.parse(localStorage.getItem('previewPreset') || '{}');
  if (preset.bgImage === selectedBg) {
    preset.bgImage = '';
    localStorage.setItem('previewPreset', JSON.stringify(preset));
  }

  loadBgDropdown();
  sendToPopup();

  console.log('🗑 Background deleted');
});
