# AI-Powered HRMS (Human Resource Management System)

An enterprise-grade, AI-powered Human Resource Management System built with React, Spring Boot, MySQL, and Gemini/OpenAI integrations. Features dynamic department health indexes, AI salary revision assistant, automatic verification OTP verification flow, dynamic credentials messaging, and premium glassmorphic UI aesthetics.

## Repository Structure

```text
AI-Powered-HRMS
├── frontend      # React Single Page Application (CRA)
├── backend       # Spring Boot Backend API (Maven project)
└── README.md     # Consolidated Project Documentation
```

---

## Environment Variables List

Set up the following configuration variables in your production platforms (Vercel, Render, Railway, etc.):

### Frontend Environment Variables (Vercel)
* `REACT_APP_API_BASE_URL`: The production API base URL of the backend (e.g. `https://ai-powered-hrms-backend.onrender.com/api`).

### Backend Environment Variables (Render/Railway)
* `PORT`: Port on which the Spring Boot API will run (Default: `8080`).
* `SPRING_DATASOURCE_URL`: Cloud MySQL connection JDBC URL (e.g. `jdbc:mysql://<host>:<port>/<dbname>`).
* `SPRING_DATASOURCE_USERNAME`: Cloud MySQL database username.
* `SPRING_DATASOURCE_PASSWORD`: Cloud MySQL database password.
* `CORS_ALLOWED_ORIGINS`: Allowed origins (e.g. your production Vercel URL: `https://ai-powered-hrms-frontend.vercel.app`).
* `SPRING_MAIL_USERNAME`: GMail account address to send system notifications from.
* `SPRING_MAIL_PASSWORD`: GMail App Password for authentication.
* `GEMINI_API_KEY` / `OPENAI_API_KEY`: API Key for AI Insights, leave recommendations, resume extractions, and chat sentinel.

---

## Frontend Setup & Deployment (Vercel)

### Local Development
1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run local dev server:
   ```bash
   npm start
   ```

### Vercel Deployment Instructions
1. Import this repository into Vercel.
2. Select `frontend` as the **Root Directory**.
3. Set the build command to `npm run build` and output directory to `build`.
4. Configure the environment variable:
   * `REACT_APP_API_BASE_URL` $\rightarrow$ Point to your active deployed backend API.
5. Deploy.

---

## Backend Setup & Deployment (Render/Railway)

### Local Development
1. Navigate to backend folder:
   ```bash
   cd backend
   ```
2. Build package:
   ```bash
   mvn clean package
   ```
3. Run the Spring Boot app:
   ```bash
   mvn spring-boot:run
   ```

### Render Deployment Instructions
1. Create a new **Web Service** on Render and connect this repository.
2. Select `backend` as the **Root Directory**.
3. Configure the environment:
   * **Runtime**: `Docker` (if using a Dockerfile) or **Java** (select Maven build command `mvn clean package` and start command `java -jar target/hrms-0.0.1-SNAPSHOT.jar`).
4. Add all environment variables listed in the **Backend Environment Variables** section.
5. Deploy.
