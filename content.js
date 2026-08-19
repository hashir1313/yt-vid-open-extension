function processYouTubeUrl(rawUrl) {
  try {
    let urlStr = rawUrl;
    if (urlStr.includes('google.com/url')) {
      const parsed = new URL(urlStr);
      const target = parsed.searchParams.get('q') || parsed.searchParams.get('url');
      if (target) {
        urlStr = target;
      }
    }

    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase();
    
    if (!host.includes('youtube.com') && !host.includes('youtu.be')) {
      return null;
    }

    const pathname = url.pathname;

    // 1. YouTube Channel Link Patterns
    const handleMatch = pathname.match(/^\/(@[^\/]+)/);
    if (handleMatch) {
      return { type: 'channel', url: `https://www.youtube.com/${handleMatch[1]}/videos` };
    }

    const cMatch = pathname.match(/^\/(c\/[^\/]+)/);
    if (cMatch) {
      return { type: 'channel', url: `https://www.youtube.com/${cMatch[1]}/videos` };
    }

    const channelMatch = pathname.match(/^\/(channel\/[^\/]+)/);
    if (channelMatch) {
      return { type: 'channel', url: `https://www.youtube.com/${channelMatch[1]}/videos` };
    }

    const userMatch = pathname.match(/^\/(user\/[^\/]+)/);
    if (userMatch) {
      return { type: 'channel', url: `https://www.youtube.com/${userMatch[1]}/videos` };
    }

    // 2. YouTube Playlist Link Patterns
    if (pathname === '/playlist') {
      const list = url.searchParams.get('list');
      if (list) {
        return { type: 'playlist', url: `https://www.youtube.com/playlist?list=${list}` };
      }
    }

    // 3. YouTube Video Link Patterns
    if (pathname === '/watch') {
      const v = url.searchParams.get('v');
      if (v) {
        return { type: 'video', url: `https://www.youtube.com/watch?v=${v}` };
      }
    }

    if (host.includes('youtu.be')) {
      const videoId = pathname.slice(1).split('/')[0];
      if (videoId) {
        return { type: 'video', url: `https://youtu.be/${videoId}` };
      }
    }

    const shortsMatch = pathname.match(/^\/shorts\/([^\/]+)/);
    if (shortsMatch) {
      return { type: 'video', url: `https://www.youtube.com/shorts/${shortsMatch[1]}` };
    }

    return null;
  } catch (e) {
    return null;
  }
}

function getYouTubeLinks() {
  const links = document.querySelectorAll('a[href]');
  const videosSet = new Set();
  const channelsSet = new Set();
  const playlistsSet = new Set();

  links.forEach(link => {
    const res = processYouTubeUrl(link.href);
    if (res) {
      if (res.type === 'video') videosSet.add(res.url);
      else if (res.type === 'channel') channelsSet.add(res.url);
      else if (res.type === 'playlist') playlistsSet.add(res.url);
    }
  });

  return {
    videos: [...videosSet],
    channels: [...channelsSet],
    playlists: [...playlistsSet]
  };
}

function removeModal() {
  const overlay = document.getElementById('yt-modal-overlay');
  if (overlay) overlay.remove();
}

function createModal(linksGroup) {
  removeModal();

  const videos = linksGroup.videos || [];
  const channels = linksGroup.channels || [];
  const playlists = linksGroup.playlists || [];
  const totalFound = videos.length + channels.length + playlists.length;

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
  modal.style.cssText = 'background:#fff;border-radius:12px;padding:28px 32px;min-width:360px;box-shadow:0 8px 30px rgba(0,0,0,0.4);pointer-events:auto;';
  modal.addEventListener('click', (e) => e.stopPropagation());

  const title = document.createElement('h3');
  title.textContent = `${totalFound} YouTube link(s) found`;
  title.style.cssText = 'margin:0 0 16px 0;font-size:18px;color:#333;';

  const checkboxContainer = document.createElement('div');
  checkboxContainer.style.cssText = 'display:flex;flex-direction:column;gap:10px;margin-bottom:20px;';

  function createCheckbox(id, text, count) {
    const wrapper = document.createElement('label');
    wrapper.style.cssText = 'display:flex;align-items:center;gap:10px;font-size:14px;color:#333;cursor:pointer;' + (count === 0 ? 'opacity:0.5;cursor:not-allowed;' : '');

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = id;
    cb.checked = count > 0;
    cb.disabled = count === 0;
    cb.style.cssText = 'width:18px;height:18px;cursor:' + (count === 0 ? 'not-allowed' : 'pointer') + ';';

    const span = document.createElement('span');
    span.textContent = `${text} (${count})`;

    wrapper.appendChild(cb);
    wrapper.appendChild(span);
    return { wrapper, cb };
  }

  const { wrapper: vWrap, cb: cbVideos } = createCheckbox('yt-cb-videos', 'Open Videos', videos.length);
  const { wrapper: cWrap, cb: cbChannels } = createCheckbox('yt-cb-channels', 'Open Channels', channels.length);
  const { wrapper: pWrap, cb: cbPlaylists } = createCheckbox('yt-cb-playlists', 'Open Playlists', playlists.length);

  checkboxContainer.appendChild(vWrap);
  checkboxContainer.appendChild(cWrap);
  checkboxContainer.appendChild(pWrap);

  const label = document.createElement('label');
  label.style.cssText = 'font-size:14px;color:#555;display:block;margin-bottom:6px;';

  const input = document.createElement('input');
  input.type = 'number';
  input.min = '1';
  input.style.cssText = 'width:100%;padding:10px 12px;font-size:16px;border:2px solid #ddd;border-radius:6px;box-sizing:border-box;outline:none;';

  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:10px;margin-top:20px;justify-content:flex-end;';

  const openBtn = document.createElement('button');
  openBtn.textContent = 'Open Links';
  openBtn.style.cssText = 'padding:10px 20px;font-size:14px;font-weight:600;border:none;border-radius:6px;cursor:pointer;background:#ff0000;color:#fff;';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = 'padding:10px 20px;font-size:14px;font-weight:600;border:none;border-radius:6px;cursor:pointer;background:#eee;color:#333;';

  let currentSelectedLinks = [];

  function updateSelection() {
    currentSelectedLinks = [];
    if (cbVideos.checked) currentSelectedLinks.push(...videos);
    if (cbChannels.checked) currentSelectedLinks.push(...channels);
    if (cbPlaylists.checked) currentSelectedLinks.push(...playlists);

    const len = currentSelectedLinks.length;
    label.textContent = `How many to open? (Selected: ${len})`;
    input.max = String(len);
    input.value = String(len);

    if (len === 0) {
      input.disabled = true;
      openBtn.disabled = true;
      openBtn.style.opacity = '0.5';
      openBtn.style.cursor = 'not-allowed';
    } else {
      input.disabled = false;
      openBtn.disabled = false;
      openBtn.style.opacity = '1';
      openBtn.style.cursor = 'pointer';
    }
  }

  cbVideos.addEventListener('change', updateSelection);
  cbChannels.addEventListener('change', updateSelection);
  cbPlaylists.addEventListener('change', updateSelection);

  updateSelection();

  openBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const count = parseInt(input.value, 10);
    if (isNaN(count) || count < 1 || currentSelectedLinks.length === 0) return;
    const toOpen = currentSelectedLinks.slice(0, count);
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
  modal.appendChild(checkboxContainer);
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
  btn.textContent = 'Open YouTube Links';
  btn.style.cssText = 'padding:14px 24px;background-color:#ff0000;color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);pointer-events:auto;';

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
    const linksGroup = getYouTubeLinks();
    const totalFound = (linksGroup.videos?.length || 0) + (linksGroup.channels?.length || 0) + (linksGroup.playlists?.length || 0);
    if (totalFound === 0) {
      btn.textContent = 'No links found';
      setTimeout(() => { btn.textContent = 'Open YouTube Links'; }, 2000);
      return;
    }
    createModal(linksGroup);
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
