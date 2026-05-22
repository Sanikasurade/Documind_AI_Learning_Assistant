# DocuMind AI - AI-Powered Learning Assistant

DocuMind AI is an advanced, full-stack AI-powered learning assistant designed to transform static study documents (such as PDFs) into interactive learning modules. By leveraging the **Google Gemini AI API**, the application parses documents to enable seamless document-based chats, automatic generation of flashcards, and dynamic custom quizzes. 

The application is built on the modern MERN stack (MongoDB, Express, React, Node.js) with features including email OTP verification via Nodemailer, subscription-based upgrades integrated with Razorpay, and a modern, responsive user interface with complete light and dark theme capabilities.

---

## 🚀 Key Features

*   **Interactive Document Chat & Concept Explanations:** Users can upload PDF documents and ask questions directly. They can highlight sections or query specific terms to receive tailored contextual responses.
*   **Automatic Flashcard Generation:** Instantly generates interactive flashcards with questions and answers extracted from the uploaded study material for quick reviews and retention.
*   **Dynamic Quiz Generator:** Automatically generates custom multiple-choice quizzes from documents, allowing users to test their understanding and view their score history.
*   **Secure Authentication & User Verification:** Features secure registration and login using JWT (JSON Web Tokens) combined with password hashing (bcryptjs) and 6-digit email OTP verification via Nodemailer.
*   **Premium Upgrades (Razorpay Integration):** Integrated payment flow enabling users to upgrade to premium plans with complete transaction verification and automated confirmation emails.
*   **Responsive Modern UI with Theme Support:** Beautifully designed user experience featuring interactive transitions (framer-motion), status notifications (react-hot-toast), and a persistent light/dark mode switch.

---

## 🛠️ Tech Stack

### Frontend
*   **React.js (Vite)** – High-performance Single Page Application (SPA) development.
*   **Tailwind CSS** – Styling and utility-first layout design with light/dark theme switching.
*   **Framer Motion** – Smooth components animations and micro-interactions.
*   **Axios** – Promise-based HTTP client for API consumption with request interceptors.
*   **React PDF** – Rendering PDF document views directly inside the browser.
*   **React Hot Toast** – Lightweight toast notifications for real-time user feedback.

### Backend
*   **Node.js & Express.js** – Structured API development following the MVC (Model-View-Controller) architecture.
*   **Google Gemini AI SDK (`@google/generative-ai`)** – AI-assisted explanations, flashcards, and quiz generation.
*   **Mongoose (MongoDB)** – Flexible Object Document Mapping (ODM) for database operations.
*   **Multer & PDF-Parse** – Handling multipart/form-data for PDF uploads and parsing raw text.
*   **Nodemailer** – Transactional email notifications and OTP dispatch.
*   **Razorpay SDK** – Integration with Razorpay payments API.
*   **JWT & BcryptJS** – Stateless authentication and password security.

---

## 📁 Repository Structure

```
AI_Learning_Assistant/
├── backend/
│   ├── config/            # DB, Gemini, and Nodemailer configuration
│   ├── controllers/       # Business logic for auth, documents, AI, payments, etc.
│   ├── middleware/        # Authentication gates, error handlers, upload helpers
│   ├── models/            # Mongoose Schemas (User, Document, Flashcard, Quiz)
│   ├── routes/            # Express router mapping
│   ├── services/          # Supporting services (email template engine)
│   ├── uploads/           # Temporary storage for uploaded PDF assets
│   ├── server.js          # Express entrypoint file
│   └── package.json       # Backend dependencies & npm scripts
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components (layout, forms, loading animations)
│   │   ├── context/       # React context for theme & auth states
│   │   ├── pages/         # Core views (Dashboard, Workspace, Profile, Upgrade, Auth)
│   │   ├── services/      # Axios API configuration & endpoints hookup
│   │   ├── App.jsx        # Root routing and theme orchestration
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Custom styles and Tailwind base imports
│   ├── package.json       # Frontend dependencies & Vite setup
│   └── tailwind.config.js # Tailwind color tokens & dark-mode configurations
```

---

## ⚙️ Environment Variables & Configuration

To run DocuMind locally, configure environment files for both the frontend and backend.

### Backend Config (`backend/.env`)

Create a `.env` file inside the `backend` folder and populate it with your credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb://your-mongodb-uri

# JWT Configuration
JWT_SECRET=your-secure-jwt-secret-string
JWT_EXPIRES_IN=7d

# Google Gemini API
GEMINI_API_KEY=your-google-gemini-api-key

# Nodemailer SMTP Configuration
EMAIL_USER=your-email-address@gmail.com
EMAIL_PASS=your-app-specific-email-password

# Client Base URL (For CORS policies)
CLIENT_URL=http://localhost:5173

# Razorpay API Credentials
TEST_API_KEY=your-razorpay-test-api-key
TEST_KEY_SECRET=your-razorpay-test-key-secret
```

### Frontend Config (`frontend/.env`)

Create a `.env` file (or `env` depending on your environment setups) inside the `frontend` folder:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 🛠️ Getting Started & Installation

### Prerequisites
*   Node.js (v16.x or higher)
*   npm or yarn
*   MongoDB Instance (Local or Atlas)

### Step 1: Clone the repository
```bash
git clone https://github.com/your-username/DocuMind_AI.git
cd DocuMind_AI
```

### Step 2: Set up the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the `.env` variables as specified in the environment configuration section.
4. Run in development mode:
   ```bash
   npm run dev
   ```
   *The server runs by default on `http://localhost:5000`.*

### Step 3: Set up the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the frontend `.env` file.
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client application runs by default on `http://localhost:5173`.*

---

## 📡 API Endpoints

The API is fully structured using RESTful design under the `/api/v1` namespace.

| Domain | Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :---: |
| **Authentication** | `POST` | `/api/v1/auth/signup` | Register a new user | No |
| | `POST` | `/api/v1/auth/login` | Log in user and request OTP | No |
| | `POST` | `/api/v1/auth/verify-login-otp` | Verify 6-digit login OTP | No |
| | `POST` | `/api/v1/auth/forgot-password` | Send password reset OTP | No |
| | `POST` | `/api/v1/auth/verify-forgot-otp` | Verify forgot password OTP | No |
| | `POST` | `/api/v1/auth/reset-password/:token` | Reset password using verified token | No |
| | `POST` | `/api/v1/auth/resend-otp` | Re-send OTP email | No |
| | `GET` | `/api/v1/auth/me` | Fetch currently logged-in user profile | **Yes** |
| | `PUT` | `/api/v1/auth/update-profile` | Update profile information | **Yes** |
| | `PUT` | `/api/v1/auth/update-avatar` | Upload new user avatar image | **Yes** |
| **Documents** | `POST` | `/api/v1/documents/upload` | Upload PDF and extract text content | **Yes** |
| | `GET` | `/api/v1/documents` | Retrieve all documents for the user | **Yes** |
| | `GET` | `/api/v1/documents/:id` | Fetch specific document data and parsed text | **Yes** |
| | `DELETE` | `/api/v1/documents/:id` | Remove a document resource | **Yes** |
| **AI Integration** | `POST` | `/api/v1/ai/chat` | Chat dynamically with document context | **Yes** |
| | `POST` | `/api/v1/ai/summary` | Generate summaries of documents | **Yes** |
| | `POST` | `/api/v1/ai/explain` | Explain concept from highlighted document text | **Yes** |
| | `POST` | `/api/v1/ai/flashcards` | Generate new AI flashcard sets | **Yes** |
| | `POST` | `/api/v1/ai/quiz` | Create AI quizzes based on file content | **Yes** |
| **Flashcards** | `GET` | `/api/v1/flashcards` | Fetch all user generated flashcards | **Yes** |
| | `GET` | `/api/v1/flashcards/:docId` | Fetch flashcard set of specific document | **Yes** |
| | `PATCH` | `/api/v1/flashcards/:id/favorite` | Favorite/unfavorite specific flashcard | **Yes** |
| | `DELETE` | `/api/v1/flashcards/:id` | Delete a flashcard set | **Yes** |
| **Quizzes** | `GET` | `/api/v1/quizzes/document/:docId` | Fetch quizzes created from a document | **Yes** |
| | `GET` | `/api/v1/quizzes/:id` | Fetch details of a specific quiz | **Yes** |
| | `POST` | `/api/v1/quizzes/:id/submit` | Submit answers and evaluate score | **Yes** |
| | `GET` | `/api/v1/quizzes/:id/result` | Fetch result analysis for a quiz | **Yes** |
| **Payments** | `GET` | `/api/v1/payments/plan` | Fetch current user plan status | **Yes** |
| | `POST` | `/api/v1/payments/create-order` | Request Razorpay order generation | **Yes** |
| | `POST` | `/api/v1/payments/verify` | Verify payment status and update subscription | **Yes** |
