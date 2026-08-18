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

function createButton() {
  const existing = document.getElementById('yt-open-all-btn');
  if (existing) return;

  const btn = document.createElement('button');
  btn.id = 'yt-open-all-btn';
  btn.textContent = 'Open All Videos';

  btn.addEventListener('click', () => {
    const videos = getYouTubeLinks();
    if (videos.length === 0) {
      btn.textContent = 'No videos found';
      setTimeout(() => { btn.textContent = 'Open All Videos'; }, 2000);
      return;
    }
    videos.forEach(url => window.open(url, '_blank'));
    btn.textContent = `Opened ${videos.length} video(s)`;
    setTimeout(() => { btn.textContent = 'Open All Videos'; }, 2000);
  });

  document.body.appendChild(btn);
}

createButton();
