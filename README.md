# Code Flow

Generate Mermaid flowcharts from your codebase using Gemini, then render them directly in the UI.

## Features

- **Upload files or select a folder** (`.js`, `.ts`, `.py`)
- **Gemini-powered analysis** that returns Mermaid `graph TD`
- **Mermaid rendering** in-app with zoom + SVG export

## Screenshot

> Replace this placeholder with a real screenshot once you’ve run the app.

![Code Flow screenshot](./docs/screenshot.png)

## How to Install

### Prerequisites

- **Node.js**: latest LTS recommended
- A **Gemini API key**

### 1) Clone

```bash
git clone https://github.com/Percival009/Code_Flow.git
cd Code_Flow
```

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment variables

Create a `.env.local` file in the project root:

```bash
GEMINI_API_KEY=your_api_key_here
```

### 4) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Usage

1. Go to **Flowcharts**
2. Click **Select Files** or **Select Folder**
3. Wait for Gemini to return Mermaid
4. The diagram renders in the main viewer

## Notes

- The API route lives at `app/api/analyze/route.ts`.
- The app requests **raw Mermaid** and sanitizes the response to ensure it starts with **`graph TD`**.

## License

MIT (add/adjust if you prefer a different license).

