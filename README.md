# 🎙️ Speak With Me - AI English Tutor

**Speak With Me** is a modern, AI-powered voice-controlled English learning web application. It acts as a personal AI English Tutor, allowing users to practice conversations, receive step-by-step grammar corrections, and get real-time translations using auto-language detection. The application provides an engaging, ChatGPT-style interface with interactive character avatars and voice interactions to make learning a new language natural and fun.

---

## 🌟 Key Features

- **🗣️ Voice Interactions:** Built-in Speech-to-Text (STT) for hands-free speaking and Text-to-Speech (TTS) for natural auditory learning, powered by browser-native APIs.
- **🌍 Auto-Language Detection:** Speak in your native language (e.g., Tamil, Hindi, Spanish) and the AI will understand and respond in the same language while teaching English concepts.
- **🤖 Intelligent AI Tutor:** Powered by Google's Gemini (gemini-2.5-flash) model, providing structured, analytical, and supportive pedagogical feedback.
- **🎨 Premium UI/UX:** A sleek, colorful, and highly responsive interface with dark mode aesthetics, interactive components, and dynamic text streaming.
- **🎭 Engaging Avatars:** Visual robot and character avatars that react in real-time to listening, thinking, and speaking states.
- **🔐 Secure Authentication:** Seamless user login and session management powered by Supabase.
- **📜 Chat History:** Keeps track of your previous learning sessions via local storage and secure backend context management.

---

## 🚀 Tech Stack

### Frontend (Client)
- **Framework:** React 19 + Vite
- **Routing:** React Router
- **Styling:** Vanilla CSS (Modern CSS variables, Flexbox/Grid, Animations)
- **Icons:** Lucide React
- **Auth Client:** `@supabase/supabase-js`

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **AI Integration:** Google GenAI SDK (`@google/genai`)
- **Auth Validation:** Supabase Admin/Client SDK
- **Middleware:** CORS, Express JSON parser, Dotenv

---

## 📂 Project Structure

```text
speak-with-me/
├── client/                 # React Frontend Application
│   ├── public/             # Static assets
│   ├── src/                # React source code (Components, Pages, Hooks)
│   ├── index.html          # Entry HTML
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.js      # Vite configuration
│   └── netlify.toml        # Netlify deployment configuration
│
├── server/                 # Node.js Express Backend API
│   ├── index.js            # Main Express server and API routes
│   ├── package.json        # Backend dependencies
│   ├── vercel.json         # Vercel deployment configuration
│   └── .env                # Server environment variables
│
└── README.md               # Project documentation
```

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn package manager
- A Supabase Project (for Authentication)
- A Google Gemini API Key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "speak with me"
```

### 2. Environment Variables Setup

You will need to create `.env` files in both the `client` and `server` directories.

**For the Backend (`server/.env`):**
```env
PORT=3001
GEMINI_API_KEY=your_google_gemini_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

**For the Frontend (`client/.env`):**
```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Running Locally

You need to run both the frontend and backend servers concurrently.

**Start the Backend Server:**
Open a terminal and run:
```bash
cd server
npm install
npm run start # or node index.js
```
The server will start on `http://localhost:3001`.

**Start the Frontend Client:**
Open a new terminal and run:
```bash
cd client
npm install
npm run dev
```
The Vite development server will start, typically on `http://localhost:5173`.

---

## ☁️ Deployment

The project is structured to be easily deployed to modern cloud platforms:

- **Frontend (Client):** Configured for deployment on **Netlify**. The `netlify.toml` file handles build settings and single-page application routing redirects.
- **Backend (Server):** Configured for deployment on **Vercel**. The `vercel.json` file dictates how the Express app is packaged into a serverless function. 

*Make sure to set all corresponding environment variables in your deployment platform's dashboard.*

---

## 📄 License
This project is for educational purposes.
<img width="1884" height="784" alt="image" src="https://github.com/user-attachments/assets/69c27425-f9a4-4d67-aa71-2246b93768b7" />
<img width="1898" height="890" alt="image" src="https://github.com/user-attachments/assets/b520d7c2-48e7-4c77-83cb-cc9303526263" />
<img width="1901" height="868" alt="image" src="https://github.com/user-attachments/assets/576f8020-e876-4cb0-8fc9-290b705078a4" />
<img width="1894" height="867" alt="image" src="https://github.com/user-attachments/assets/2bfa4491-d596-4427-aa37-0212eafa5652" />


