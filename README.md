# YouTube Utilities & Link Opener - Chrome Extension

A lightweight, powerful Google Chrome Extension (Manifest V3) that extracts and batch-opens YouTube links from Google Search results, and features a toolbar Extension Popup to extract and open channel `/videos` pages from all open YouTube video tabs in your current window.

---

## 🚀 Features

- **Toolbar Extension Popup UI**: Clean, dark-mode extension popup accessible directly from your browser toolbar.
- **Open Channels Feature**: Scans open YouTube video tabs (`/watch?v=...` and `/shorts/`) in the current window, extracts each creator's channel link, normalizes it to `/@Handle/videos`, and batch-opens them in new tabs.
- **Automated YouTube Link Discovery**: Scans Google Search result pages for all YouTube links, including standard watch links, `youtu.be` short links, YouTube Shorts, channel handles (`/@handle`), legacy channel URLs, and playlists.
- **Google Search Redirect Unpacking**: Unpacks internal Google redirect URLs (`google.com/url?q=...`) to extract clean, direct YouTube links.
- **Smart Link Categorization**: Categorizes search result links into four distinct groups:
  - 🎬 **Videos** (Watch links, Shorts, Youtu.be)
  - 👤 **Channels** (Channel pages, Handles, User profiles)
  - 📑 **Playlists** (YouTube Playlists)
  - 🌐 **Other Links** (General search result links on external sites)
- **Interactive UI Modal**:
  - Filter by link type using individual toggle checkboxes.
  - Choose exact number of links to batch open.
  - Open selected links cleanly in separate tabs with a single click.

---

## 🛠️ Installation (Developer / Unpacked Mode)

1. Clone or download this repository to your local machine:
   ```bash
   git clone https://github.com/your-username/yt-vid-open-extension.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the project folder containing `manifest.json`.

---

## 📖 How to Use

### 1. Extension Popup ("Open Channels")
1. Open YouTube video tabs in your Chrome browser window.
2. Click the **YouTube Utilities** extension icon in your Chrome toolbar.
3. Click the **"Open Channels"** button.
4. The extension will automatically extract each video's creator channel and open their `/@Handle/videos` page in background tabs.

### 2. Google Search Link Opener
1. Perform any search on **Google** that includes YouTube results.
2. Look for the red floating button **"Open Links"** in the bottom-right corner of the page.
3. Click the button to launch the selection modal.
4. Select link types (Videos, Channels, Playlists, Other) and specify tab count.
5. Click **"Open Links"**.

---

## 📁 Project Structure

```text
├── manifest.json   # Extension manifest (Manifest V3 definition & permissions)
├── popup.html      # Toolbar action popup interface HTML
├── popup.css       # Dark theme styling for popup UI
├── popup.js        # Controller script for tab querying & channel extraction
├── content.js      # Content script for parsing YouTube links on Google Search
└── styles.css      # Styling for Google Search floating action button
```

---

## 📜 License

MIT License. Feel free to modify and adapt for your own workflows!

