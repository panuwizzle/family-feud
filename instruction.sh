gemini write project "Create a local web app version of the TV game show Family Feud for office play.

🧩 Requirements:
- The app must run locally (no external deployment).
- There are 2 front-end views:
  1. Host Panel (for the quiz master)
  2. Display Board (for showing on a TV screen)
- Host Panel functions:
  - Input a question
  - Add up to 8 answers with points
  - Reveal each answer individually
  - Track strikes (max 3)
  - Manage team scores (Team A, Team B)
  - Send all state changes to Display Board in real time
- Display Board functions:
  - Show the current question
  - Show up to 8 answer slots that reveal when triggered
  - Show team scores and strikes
  - Animate answer reveals and strikes

⚙️ Tech Stack:
- Frontend: React + Vite + TailwindCSS + Framer Motion
- Backend: Node.js (Express + Socket.IO)
- Communication: WebSocket via Socket.IO
- Storage: In-memory (no database)
- Everything must run locally on `localhost`
- Folder structure:
  family-feud/
  ├─ backend/server.js
  ├─ frontend/src/pages/Host.jsx
  ├─ frontend/src/pages/Display.jsx
  ├─ frontend/src/components/
  ├─ package.json

🎯 Commands to start:
- `npm run dev` → starts frontend (Vite)
- `node backend/server.js` → starts backend Socket.IO server

💅 UI:
- Host Panel: dark theme, simple input fields, add/reveal buttons.
- Display Board: full screen, blue theme, large text, animations on reveal.

Output full code for all files necessary to run the project locally."
