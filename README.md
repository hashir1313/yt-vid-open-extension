# Open All YouTube Videos - Chrome Extension

A lightweight, powerful Google Chrome Extension (Manifest V3) that automatically extracts, categorizes, and batch-opens YouTube video, channel, and playlist links directly from Google Search result pages into new browser tabs.

---

## 🚀 Features

- **Automated YouTube Link Discovery**: Scans Google Search result pages for all YouTube links, including standard watch links, `youtu.be` short links, YouTube Shorts, channel handles (`/@handle`), legacy channel URLs, and playlists.
- **Google Search Redirect Unpacking**: Unpacks internal Google redirect URLs (`google.com/url?q=...`) to extract clean, direct YouTube links.
- **Smart Link Categorization**: Categorizes discovered links into four distinct groups:
  - 🎬 **Videos** (Watch links, Shorts, Youtu.be)
  - 👤 **Channels** (Channel pages, Handles, User profiles)
  - 📑 **Playlists** (YouTube Playlists)
  - 🌐 **Other Links** (General search result links on external sites)
- **Interactive UI Modal**:
  - Filter by link type using individual toggle checkboxes.
  - Choose exact number of links to batch open.
  - Open selected links cleanly in separate tabs with a single click.
- **Non-Intrusive Floating Button**: Appears neatly at the bottom-right corner of Google Search results pages.

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

1. Perform any search on **Google** that includes YouTube results (e.g., search `"Antigravity AI tutorials"`).
2. Look for the red floating button **"Open YouTube Links"** in the bottom-right corner of the page.
3. Click the button to launch the selection modal.
4. Select the link types you wish to open (Videos, Channels, Playlists) and specify how many tabs to open.
5. Click **"Open Links"**.

---

## 📁 Project Structure

```text
├── manifest.json   # Extension manifest (Manifest V3 definition & permissions)
├── content.js      # Content script for parsing YouTube links and rendering UI
└── styles.css      # Custom extension styling stylesheet
```

---

## 📜 License

MIT License. Feel free to modify and adapt for your own workflows!
