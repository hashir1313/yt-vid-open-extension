document.addEventListener('DOMContentLoaded', () => {
  const btnOpenChannels = document.getElementById('btn-open-channels');
  const btnText = document.getElementById('btn-text');
  const tabCountBadge = document.getElementById('tab-count-badge');
  const statusContainer = document.getElementById('status-container');
  const statusIcon = document.getElementById('status-icon');
  const statusMessage = document.getElementById('status-message');

  let cachedVideoTabs = [];
  let isTabsExtracted = false;

  function showStatus(type, message, icon = 'ℹ️') {
    statusContainer.className = `status-container ${type}`;
    statusIcon.textContent = icon;
    statusMessage.textContent = message;
  }

  function hideStatus() {
    statusContainer.className = 'status-container hidden';
  }

  function isYouTubeVideoUrl(rawUrl) {
    if (!rawUrl) return false;
    try {
      const url = new URL(rawUrl);
      const host = url.hostname.toLowerCase();
      if (!host.includes('youtube.com') && !host.includes('youtu.be')) return false;
      return url.pathname === '/watch' || url.pathname.startsWith('/shorts/') || host.includes('youtu.be');
    } catch (e) {
      return false;
    }
  }

  async function initializeTabs() {
    tabCountBadge.className = 'badge loading';
    tabCountBadge.textContent = 'Scanning tabs...';
    btnOpenChannels.disabled = true;

    try {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      cachedVideoTabs = tabs.filter(tab => isYouTubeVideoUrl(tab.url));
      isTabsExtracted = true;

      const count = cachedVideoTabs.length;
      tabCountBadge.className = 'badge';
      tabCountBadge.textContent = `${count} video tab${count === 1 ? '' : 's'}`;

      if (count === 0) {
        tabCountBadge.style.color = '#888';
        showStatus('info', 'No open YouTube video tabs in current window.', 'ℹ️');
        btnOpenChannels.disabled = true;
      } else {
        tabCountBadge.style.color = '#3ea6ff';
        btnOpenChannels.disabled = false;
      }
    } catch (e) {
      console.error('Error initializing tabs:', e);
      tabCountBadge.className = 'badge';
      tabCountBadge.textContent = '0 video tabs';
      showStatus('error', 'Failed to scan browser tabs.', '❌');
    }
  }

  function formatChannelVideosUrl(rawUrl) {
    if (!rawUrl) return null;
    try {
      const url = new URL(rawUrl);
      const pathname = url.pathname.replace(/\/+$/, '');

      const handleMatch = pathname.match(/^\/(@[^\/]+)/);
      if (handleMatch) return `https://www.youtube.com/${handleMatch[1]}/videos`;

      const channelMatch = pathname.match(/^\/(channel\/[^\/]+)/);
      if (channelMatch) return `https://www.youtube.com/${channelMatch[1]}/videos`;

      const cMatch = pathname.match(/^\/(c\/[^\/]+)/);
      if (cMatch) return `https://www.youtube.com/${cMatch[1]}/videos`;

      const userMatch = pathname.match(/^\/(user\/[^\/]+)/);
      if (userMatch) return `https://www.youtube.com/${userMatch[1]}/videos`;

      return null;
    } catch (e) {
      return null;
    }
  }

  // Executed inside YouTube video tab context
  function extractChannelUrlFromPage() {
    try {
      const selectors = [
        '#owner #channel-name a[href]',
        'ytd-video-owner-renderer a[href]',
        '#upload-info a[href]',
        'a[href*="/@"]',
        'a[href*="/channel/"]',
        'a[href*="/c/"]',
        'a[href*="/user/"]'
      ];

      for (const sel of selectors) {
        const elements = document.querySelectorAll(sel);
        for (const el of elements) {
          const href = el.getAttribute('href');
          if (href && (href.startsWith('/@') || href.includes('/channel/') || href.includes('/c/') || href.includes('/user/'))) {
            return href.startsWith('http') ? href : 'https://www.youtube.com' + href;
          }
        }
      }

      const metaChannelId = document.querySelector('meta[itemprop="channelId"]');
      if (metaChannelId && metaChannelId.content) {
        return `https://www.youtube.com/channel/${metaChannelId.content}`;
      }

      const linkAuthor = document.querySelector('span[itemprop="author"] link[itemprop="url"]');
      if (linkAuthor && linkAuthor.href) {
        return linkAuthor.href;
      }
    } catch (e) {
      console.error('Error extracting channel URL:', e);
    }
    return null;
  }

  btnOpenChannels.addEventListener('click', async () => {
    if (!isTabsExtracted || cachedVideoTabs.length === 0) return;

    hideStatus();
    showStatus('info', 'Extracting channels...', '⏳');
    btnOpenChannels.disabled = true;
    btnText.textContent = 'Extracting...';

    try {
      // Execute extraction across all detected video tabs concurrently via Promise.all
      const resultsArray = await Promise.all(
        cachedVideoTabs.map(tab =>
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: extractChannelUrlFromPage
          }).catch(err => {
            console.warn(`Could not execute script on tab ${tab.id}:`, err);
            return null;
          })
        )
      );

      const channelUrlsMap = new Set();
      resultsArray.forEach(res => {
        if (res && res[0] && res[0].result) {
          const formattedUrl = formatChannelVideosUrl(res[0].result);
          if (formattedUrl) {
            channelUrlsMap.add(formattedUrl);
          }
        }
      });

      const uniqueChannelUrls = Array.from(channelUrlsMap);

      if (uniqueChannelUrls.length === 0) {
        showStatus('error', `Found ${cachedVideoTabs.length} video tab(s), but couldn't extract channel links. Make sure video pages are fully loaded.`, '❌');
      } else {
        // Open each unique channel in a new background tab
        await Promise.all(
          uniqueChannelUrls.map(channelUrl =>
            chrome.tabs.create({ url: channelUrl, active: false })
          )
        );

        showStatus(
          'success',
          `Opened ${uniqueChannelUrls.length} unique channel page${uniqueChannelUrls.length === 1 ? '' : 's'} from ${cachedVideoTabs.length} video tab${cachedVideoTabs.length === 1 ? '' : 's'}!`,
          '✅'
        );
      }
    } catch (err) {
      console.error('Error during channel extraction:', err);
      showStatus('error', 'An error occurred while opening channel links.', '❌');
    } finally {
      btnOpenChannels.disabled = false;
      btnText.textContent = 'Open Channels';
    }
  });

  // Start initial tab scanning immediately without blocking render
  initializeTabs();
});
