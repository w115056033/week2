# 個人專屬時鐘主頁與時間儀表板 (Personal Portal & Live Timekeeper)
> **實作者**：w115056033（郭冠良）  
> **儲存庫網址**：[https://github.com/w115056033/week2](https://github.com/w115056033/week2)（或對應 GitHub 倉庫）  
> **Live Demo Page**：[https://w115056033.github.io/week2/](https://huanchen1107.github.io/0916-2/)  

---

## 📌 1. 專案定位與教學故事線（Pedagogical Storyline）

本實作是 **AIoT-DA 課程 Lecture 2** 的核心實作專案（DIC-1），堅持採用 **「零框架、零建構依賴（Zero-Dependency Vanilla Stack）」**，讓學習者能穿透當前前端框架（React、Vue 等）的層層抽象，直探 Web 原生底層運作原理：

$$\underbrace{\text{Browser}}_{\text{宿主環境}} \longrightarrow \underbrace{\text{HTML5}}_{\text{語意結構與 ARIA}} \longrightarrow \underbrace{\text{CSS3}}_{\text{Design Tokens 與毛玻璃}} \longrightarrow \underbrace{\text{Modern JS}}_{\text{時鐘演算法與事件循環}} \longrightarrow \underbrace{\text{Web Audio API}}_{\text{原生聲學合成}} \longrightarrow \underbrace{\text{LocalStorage}}_{\text{狀態樹持久化}} \longrightarrow \underbrace{\text{GitHub Pages}}_{\text{無伺服器全球部署}}$$

> 💡 **銜接後續單元的教學伏筆**：  
> 學習者在 L2 掌握了 DOM 操作、時間狀態機與本機資料持久化機制。進入 **Lecture 3** 後，本地的時間與狀態將無縫對接 **FastAPI + SQLite** 與物聯網感測節點，將個人首頁進一步升級為即時監控感測數據與設備狀態的 **AIoT 儀表板**。

---

## 📁 2. 專案結構與模組職責

本專案目錄結構精簡嚴謹，各模組職責單一明確：

```text
work 1/
├── index.html               # 語意化 HTML5 骨架、個人檔案卡片、雙模時鐘與編輯彈窗
├── style.css                # CSS Custom Properties (Tokens)、四套主題、毛玻璃與動態光暈系統
├── app.js                   # 高精度時鐘引擎、平滑指針演算法、Web Audio API 合成與狀態管理
├── skills-lock.json         # Workspace AI 技能相依鎖定檔
├── README.md                # 專案文檔與 GitHub Pages 部署手冊
└── .agents/                 # Workspace 自訂 AI 協作技能庫
    └── skills/
        ├── codebase-design/ # 深度模組化架構設計技能
        ├── diagnosing-bugs/ # 系統化除錯診斷技能
        ├── grill-me/        # 需求規格與設計訪談技能
        ├── tdd/             # 測試驅動開發技能
        └── ... (共 37 項專業工程與寫作技能)
```

### 核心檔案角色與技術重點

| 檔案 | 角色與技術重點 |
| :--- | :--- |
| **`index.html`** | **結構層**：語意化標籤（`<header>`、`<main>`、`<section>`、`<footer>`）、SEO Meta 資訊、無障礙 ARIA 屬性（`role="tablist"`、`aria-modal`）、雙模時鐘面板切換與個人檔案編輯 Modal。 |
| **`style.css`** | **樣式層**：基於 CSS 自訂屬性（CSS Custom Properties）構建之 Design Tokens、四套主題切換系統、多層 `backdrop-filter` 磨砂毛玻璃質感、動態環境光暈（Mesh Glow Animation）、全響應式流暢佈局（RWD）。 |
| **`app.js`** | **行為層**：100ms 高頻時鐘更新循環、指針鐘平滑連續旋轉插值計算、時間感知自動問候語演算法、Web Audio API 零外部資源秒針聲學合成、個人姓名動態縮寫生成、`localStorage` 雙向同步持久化。 |
| **`.agents/`** | **AI 協作層**：導入 Matt Pocock 精選之 37 項工程與架構工作流技能，支援程式碼審查、架構優化與規格撰寫。 |

---

## 🚀 3. 核心功能與工程亮點 (Features & Highlights)

### 1. 雙模式高精度即時時鐘 (Dual-Mode Real-time Clock)
- **數位時鐘 (Digital Mode)**：
  - 採用現代等寬發光字體 (`JetBrains Mono`)，確保時、分、秒數字跳動時不產生版面晃動。
  - **12H / 24H 制無縫切換**：支援即時切換 AM/PM 標籤，狀態自動記憶。
  - **秒數顯示自由切換**：可選擇顯示或隱藏秒數。
  - **今日時間進度條**：以當前經過秒數精準換算今日流逝百分比（精確至小數點後一位），搭配發光漸變進度條直觀展示時間維度。
- **指針時鐘 (Analog Mode)**：
  - 包含 60 格精密刻度與 12 個主要發光整點標記。
  - 獨立計算時針、分針與秒針旋轉角度：
    $$\theta_{\text{second}} = (s + \frac{ms}{1000}) \times 6^\circ$$
    $$\theta_{\text{minute}} = (m + \frac{s}{60}) \times 6^\circ$$
    $$\theta_{\text{hour}} = ((h \bmod 12) + \frac{m}{60} + \frac{s}{3600}) \times 30^\circ$$
  - 秒針呈現平滑流暢之連續走針效果。

### 2. 即時個人識別與持久化編輯 (Live Identity Customization)
- **免登入即時修改**：點擊首頁姓名或「編輯姓名」按鈕即可喚起互動對話框，即時更新姓名與個人狀態簽名。
- **智慧頭像演算法**：自動辨識使用者輸入之姓名，中文自動擷取後 1~2 字，英數自動擷取前兩位字母大寫作為專屬頭像，並搭配動態旋轉光環。
- **時段感知智慧問候**：依據瀏覽器本機時間動態轉換問候語與專屬 Emoji：
  - 晨光清爽（05:00 ~ 11:00）：`早安，美好的一天開始了 🌅`
  - 日正當中（11:00 ~ 14:00）：`午安，記得好好享用午餐 ☀️`
  - 專注午後（14:00 ~ 18:00）：`下午好，保持專注與好心情 🌤️`
  - 暮光之夜（18:00 ~ 22:00）：`晚上好，放鬆身心享受愜意時光 🌙`
  - 靜謐深夜（22:00 ~ 05:00）：`夜深了，注意休息養足精神 🌌`

### 3. 四套現代美學視覺主題 (Curated Themes)
透過修改頂層 `data-theme` 屬性，全站即時響應不同光影基調，並儲存於本機偏好：
- 🌌 **賽博霓虹 (Cyber Neon)**：深邃靛藍搭配霓虹品紅微光，營造極致賽博龐克科技感。
- 🌿 **極光翡翠 (Emerald Aurora)**：以墨綠與青色交織出寧靜的大自然極光意境。
- 🌅 **日落琥珀 (Sunset Amber)**：金黃琥珀與夕陽暖橘色調，帶來溫暖舒適的沈浸體驗。
- ⚡ **曜石沉黑 (Obsidian Slate)**：極簡純粹的黑灰曜石高對比金屬感，適合極簡主義者。

### 4. 零依賴 Web Audio API 聲學微合成 (Zero-Dependency Audio)
- **無外部音檔載入**：無需請求任何 `.mp3` 或 `.wav` 音檔，擺脫跨域 (CORS) 與網路延遲問題。
- **純原生震盪器合成**：運用 Web Audio API 之 `AudioContext`，即時合成由 $1200\text{ Hz}\rightarrow 300\text{ Hz}$ 快速衰減（$15\text{ ms}$）之微弱正弦波，完美還原高級石英/機械鐘錶之清脆滴答聲。
- **預設靜音體驗**：遵循現代瀏覽器 Autoplay 規範，右上角提供記憶狀態之音效開關。

### 5. 全球時鐘速覽、曆法與每日時間箴言
- **全球城市時區速覽**：運用 `Intl.DateTimeFormat` 零時差即時轉換顯示東京（Tokyo）、倫敦（London）與紐約（New York）當前時間。
- **傳統曆法與年週期計算**：即時換算干支紀年（如 2026 丙午馬年）、今年第幾週與第幾天。
- **每日時間靈感箴言**：精選時間哲學金句，點擊「換一句」即可動態漸層切換。

---

## 💻 4. 本機預覽與測試指南

本專案為純原生靜態網頁，無需建置編譯步驟或配置龐大的 `node_modules`。

### 啟動本機伺服器

#### 方法一：使用 Python 內建 HTTP 伺服器 (推薦)
```powershell
python -m http.server 3000
```
開啟瀏覽器前往：[http://localhost:3000](http://localhost:3000)

#### 方法二：使用 Node.js / npx
```powershell
npx serve .
```

#### 方法三：直接瀏覽器開啟
直接於檔案總管中雙擊 `index.html` 即可完整執行所有離線功能！

---

## 🌐 5. GitHub Pages 全球上線部署手冊

只需簡單兩步驟，即可將個人時鐘網頁發布至全球網際網路：

### 步驟 1：初始化 Git 並推送到 GitHub
```powershell
# 1. 初始化本地 Git 儲存庫
git init
git add .
git commit -m "feat: DIC-1 個人動態時鐘與入口網站完工"

# 2. 關聯遠端儲存庫 (請將 URL 替換為您的實際 GitHub 倉庫網址)
git branch -M main
git remote add origin https://github.com/w115056033/week2.git

# 3. 推送代碼至 main 分支
git push -u origin main
```

### 步驟 2：啟用 GitHub Pages 無伺服器託管
1. 瀏覽至您的 GitHub 儲存庫頁面（例如 `https://github.com/w115056033/week2`）。
2. 點選儲存庫頂部導航之 **Settings**（設定）。
3. 於左側選單選擇 **Pages**。
4. 在 **Build and deployment** 下方的 **Source** 選擇 `Deploy from a branch`。
5. 在 **Branch** 選單選擇 `main` 分支與 `/ (root)` 目錄，點擊 **Save**。
6. 等待約 30 ~ 60 秒後重新整理，即可在頁面上方看見發布成功的綠色標籤，並取得您的專屬 Live URL：
   $$\text{https://w115056033.github.io/week2/}$$

---

## 🧪 6. 學習成果驗證清單 (Learning Checklist)



- [x] **零相依現代架構**：能理解在基礎 Web 核心中，如何不依賴打包工具（Webpack/Vite）實現純粹高效的網頁。
- [x] **時間狀態與動畫機制**：能掌握 `setInterval` / `requestAnimationFrame` 與時間戳之數學換算。
- [x] **CSS Tokens 設計系統**：能理解如何藉由 CSS 自訂屬性動態驅動主題色系與暗色模式切換。
- [x] **原生聲學 API 應用**：能瞭解 Web Audio API 振盪器（Oscillator）與增益節點（GainNode）之聲學合成基礎。
- [x] **狀態持久化實踐**：能熟練運用 `localStorage` 讀寫使用者設定，實現跨連線狀態記憶。
- [x] **版本控制與部署**：已成功建立 Git 儲存庫並透過 GitHub Pages 完成公開部署。

---

## 📄 版權與授權 (License)

本專案遵循 [MIT License](https://opensource.org/licenses/MIT) 開源授權，歡迎自由學習、修改與延伸應用。
