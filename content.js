function getYouTubeLinks() {
  const links = document.querySelectorAll('a[href]');
  const ytLinks = new Set();
  links.forEach(link => {
    const href = link.href;
    if (href.match(/youtube\.com\/watch\?v=|youtu\.be\//)) {
      ytLinks.add(href);
    }
  });
  return [...ytLinks];
}

function removeModal() {
  const overlay = document.getElementById('yt-modal-overlay');
  if (overlay) overlay.remove();
}

function createModal(videos) {
  removeModal();

  const overlay = document.createElement('div');
  overlay.id = 'yt-modal-overlay';
  overlay.style.cssText = 'position:fixed !important;top:0 !important;left:0 !important;width:100vw !important;height:100vh !important;background:rgba(0,0,0,0.6);z-index:2147483647 !important;display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif;pointer-events:auto !important;';

  overlay.addEventListener('click', (e) => {
    e.stopPropagation();
    if (e.target === overlay) removeModal();
  });
  overlay.addEventListener('mousedown', (e) => e.stopPropagation());
  overlay.addEventListener('mouseup', (e) => e.stopPropagation());

  const modal = document.createElement('div');
  modal.id = 'yt-modal';
  modal.style.cssText = 'background:#fff;border-radius:12px;padding:28px 32px;min-width:340px;box-shadow:0 8px 30px rgba(0,0,0,0.4);pointer-events:auto;';
  modal.addEventListener('click', (e) => e.stopPropagation());

  const title = document.createElement('h3');
  title.textContent = videos.length + ' YouTube video(s) found';
  title.style.cssText = 'margin:0 0 16px 0;font-size:18px;color:#333;';

  const label = document.createElement('label');
  label.textContent = 'How many to open?';
  label.style.cssText = 'font-size:14px;color:#555;display:block;margin-bottom:6px;';

  const input = document.createElement('input');
  input.type = 'number';
  input.min = '1';
  input.max = String(videos.length);
  input.value = String(videos.length);
  input.style.cssText = 'width:100%;padding:10px 12px;font-size:16px;border:2px solid #ddd;border-radius:6px;box-sizing:border-box;outline:none;';

  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:10px;margin-top:20px;justify-content:flex-end;';

  const openBtn = document.createElement('button');
  openBtn.textContent = 'Open Videos';
  openBtn.style.cssText = 'padding:10px 20px;font-size:14px;font-weight:600;border:none;border-radius:6px;cursor:pointer;background:#ff0000;color:#fff;';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = 'padding:10px 20px;font-size:14px;font-weight:600;border:none;border-radius:6px;cursor:pointer;background:#eee;color:#333;';

  openBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const count = parseInt(input.value, 10);
    if (isNaN(count) || count < 1) return;
    const toOpen = videos.slice(0, count);
    toOpen.forEach(url => window.open(url, '_blank'));
    removeModal();
  });

  cancelBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    removeModal();
  });

  btnRow.appendChild(openBtn);
  btnRow.appendChild(cancelBtn);
  modal.appendChild(title);
  modal.appendChild(label);
  modal.appendChild(input);
  modal.appendChild(btnRow);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  input.focus();
  input.select();
}

function createButton() {
  const existing = document.getElementById('yt-open-all-btn');
  if (existing) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'yt-open-all-btn';
  wrapper.style.cssText = 'position:fixed !important;bottom:30px !important;right:30px !important;z-index:2147483647 !important;pointer-events:auto !important;';

  const btn = document.createElement('button');
  btn.textContent = 'Open All Videos';
  btn.style.cssText = 'padding:14px 24px;background-color:#ff0000;color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);pointer-events:auto;';

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
    const videos = getYouTubeLinks();
    if (videos.length === 0) {
      btn.textContent = 'No videos found';
      setTimeout(() => { btn.textContent = 'Open All Videos'; }, 2000);
      return;
    }
    createModal(videos);
  });

  btn.addEventListener('mousedown', (e) => {
    e.stopImmediatePropagation();
    e.stopPropagation();
  });

  wrapper.appendChild(btn);
  document.body.appendChild(wrapper);
}

const params = new URLSearchParams(window.location.search);
if (!params.has('start') || params.get('start') === '0') {
  createButton();
}
