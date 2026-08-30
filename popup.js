document.addEventListener('DOMContentLoaded', () => {
  const btnOpenChannels = document.getElementById('btn-open-channels');
  const btnText = document.getElementById('btn-text');
  const tabCountBadge = document.getElementById('tab-count-badge');
  const btnOpenSearchLinks = document.getElementById('btn-open-search-links');
  const searchBtnText = document.getElementById('search-btn-text');
  const searchTabBadge = document.getElementById('search-tab-badge');
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

  async function checkActiveTab() {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab && activeTab.url) {
        const isGoogle = activeTab.url.includes('google.com');
        if (isGoogle) {
          searchTabBadge.textContent = 'Google Search';
          searchTabBadge.style.color = '#81c784';
        } else {
          searchTabBadge.textContent = 'Active Page';
          searchTabBadge.style.color = '#aaa';
        }
      }
    } catch (e) {
      console.error('Error checking active tab:', e);
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

  btnOpenSearchLinks.addEventListener('click', async () => {
    hideStatus();
    showStatus('info', 'Triggering link extraction on active page...', '⏳');
    btnOpenSearchLinks.disabled = true;
    searchBtnText.textContent = 'Extracting...';

    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab || !activeTab.id) {
        showStatus('error', 'No active tab found in current window.', '⚠️');
        btnOpenSearchLinks.disabled = false;
        searchBtnText.textContent = 'Open Links';
        return;
      }

      chrome.tabs.sendMessage(activeTab.id, { action: 'trigger_open_links' }, async (response) => {
        if (chrome.runtime.lastError || !response) {
          try {
            const results = await chrome.scripting.executeScript({
              target: { tabId: activeTab.id },
              func: () => {
                if (typeof getAllLinks === 'function' && typeof createModal === 'function') {
                  const linksGroup = getAllLinks();
                  const totalFound = (linksGroup.videos?.length || 0) + (linksGroup.channels?.length || 0) + (linksGroup.playlists?.length || 0) + (linksGroup.others?.length || 0);
                  if (totalFound > 0) createModal(linksGroup);
                  return totalFound;
                }
                return 0;
              }
            });

            const count = results && results[0] ? results[0].result : 0;
            if (count > 0) {
              showStatus('success', `Found ${count} link(s)! Selection modal opened on tab.`, '✅');
            } else {
              showStatus('info', 'Please use this button on a Google Search results page with links.', 'ℹ️');
            }
          } catch (execErr) {
            console.error('Failed to execute script on active tab:', execErr);
            showStatus('error', 'Cannot extract links on this page. Try on a Google Search page.', '❌');
          }
        } else {
          if (response.count > 0) {
            showStatus('success', `Found ${response.count} link(s)! Selection modal opened on tab.`, '✅');
          } else {
            showStatus('info', 'No YouTube or external links found on active page.', 'ℹ️');
          }
        }

        btnOpenSearchLinks.disabled = false;
        searchBtnText.textContent = 'Open Links';
      });
    } catch (err) {
      console.error('Error opening search links:', err);
      showStatus('error', 'Failed to open links from active page.', '❌');
      btnOpenSearchLinks.disabled = false;
      searchBtnText.textContent = 'Open Links';
    }
  });

  // Start initial checks
  checkActiveTab();
  initializeTabs();
});
