# How to Load this Extension in Chrome

1. **Download the project**: In the AI Studio interface, go to the top-right menu and select **Export to ZIP**.
2. **Unzip**: Extract the downloaded ZIP file to folder on your computer.
3. **Open Chrome Extensions**: In your Chrome browser, type `chrome://extensions/` in the address bar and press Enter.
4. **Enable Developer Mode**: Toggle the switch in the top-right corner to turn on **Developer mode**.
5. **Load Unpacked**: Click the **Load unpacked** button in the top-left.
6. **Select the Folder**: Select the `dist` folder within your extracted project folder.
   * *Note: If you are developing locally, you should run `npm run build` first to generate the `dist` folder.*

## Features
- **Auto-Capture**: Sensing messages sent on LinkedIn and Sales Navigator.
- **Privacy-First**: All data is stored locally in your browser.
- **Analytics**: Beautiful charts showing your 7-day trend.
- **History**: Full table of daily activity.

## Project Structure
- `src/App.tsx`: The popup dashboard interface.
- `src/extension/content.ts`: The script that runs on LinkedIn to detect sends.
- `src/extension/background.ts`: The background worker that stores your data.
- `public/manifest.json`: Extension configuration.
