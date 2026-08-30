# YouTube Utilities & Link Opener - Chrome Extension

A lightweight, powerful Google Chrome Extension (Manifest V3) that extracts and batch-opens YouTube videos, channels, playlists, and external links directly from Google Search results and open browser tabs.

Includes a modern toolbar **Extension Popup UI** with zero-delay instant loading, live tab detection, and parallel link extraction.

---

## 🚀 Features

### 1. Toolbar Extension Popup UI
- **Instant Opening & Loading State**: Popup opens with zero lag, showing a pulsating `Scanning tabs...` indicator while tabs are detected asynchronously.
- **Ultra-Fast Parallel Extraction**: Uses `Promise.all` script execution to extract channel links from multiple YouTube tabs concurrently in ~100ms.

### 2. Open Channels Feature ("Channel Extraction")
- **Active Window Scanner**: Automatically scans all open YouTube video tabs (`/watch?v=...` and `/shorts/`) in your current Chrome window.
- **Smart DOM Extraction**: Locates channel links (`/@Handle`, `/channel/...`, `/c/...`, `/user/...`) from video pages.
- **Direct `/videos` Tab Navigation**: Normalizes creator URLs directly to `https://www.youtube.com/@Handle/videos`.
- **Deduplication**: Ensures each creator's channel page is opened only once.

### 3. Search Page Links Feature ("Open Links")
- **Popup Search Trigger**: Trigger link extraction on your active Google Search page directly from the extension popup.
- **Floating Action Button**: Non-intrusive floating button injected at the bottom-right corner of Google Search results.
- **Google Search Redirect Unpacking**: Automatically unwraps Google redirect links (`google.com/url?q=...`) into direct URLs.
- **Smart Categorization Modal**:
  - 🎬 **Videos** (Watch links, Shorts, Youtu.be)
  - 👤 **Channels** (Channel pages, Handles, User profiles)
  - 📑 **Playlists** (YouTube Playlists)
  - 🌐 **Other Links** (External non-Google web links)
- **Custom Batch Control**: Interactive modal allowing you to filter link types and specify the exact number of tabs to open.

---

## 🛠️ Installation (Developer / Unpacked Mode)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/hashir1313/yt-uti.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the project folder containing `manifest.json`.

---

## 📖 How to Use

### 🎬 Open Channels from Video Tabs
1. Open YouTube video tabs in your Chrome browser window.
2. Click the **YouTube Utilities** extension icon in your Chrome toolbar.
3. Click **"Open Channels"**.
4. The extension will extract each creator's channel and batch-open their `/@Handle/videos` pages in new background tabs.

### 🔍 Open Links from Google Search
**Method A: Extension Popup**
1. Navigate to a Google Search page containing video or web results.
2. Click the **YouTube Utilities** extension icon in your Chrome toolbar.
3. Click **"Open Links"** under the **Search Page Links** card.
4. Filter categories and select tab count in the interactive modal, then click **"Open Links"**.

**Method B: In-Page Floating Button**
1. Perform any Google Search with YouTube results.
2. Click the red floating **"Open Links"** button at the bottom-right of the page.
3. Choose your link categories and tab count in the modal.

---

## 📁 Project Structure

```text
├── manifest.json   # Extension manifest (Manifest V3 definition & permissions)
├── popup.html      # Toolbar action popup interface HTML
├── popup.css       # Dark theme styling for popup UI
├── popup.js        # Controller script for tab querying & channel extraction
├── content.js      # Content script for parsing YouTube links on Google Search
├── styles.css      # Styling for Google Search floating action button
└── public/         # Extension icon assets
    ├── ico.svg        # Vector SVG icon source
    ├── icon16.png     # 16x16 PNG icon
    ├── icon32.png     # 32x32 PNG icon
    ├── icon48.png     # 48x48 PNG icon
    └── icon128.png    # 128x128 PNG icon
```

---

## 📜 License

MIT License. Free to use, modify, and adapt for your own workflows!
