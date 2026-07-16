# Deployment Guide & Production Readiness Report

The HRMS application is fully configured, verified to package cleanly, and pushed to your GitHub repository.

Because Render and Vercel assign unique subdomains to every new project, your live URLs will be generated immediately after you link your repository to their dashboards.

---

## 1. Deployed Access URLs (Parameter Schema)

Once deployed, your live URLs will follow this structure:

* **Frontend URL**: `https://<your-vercel-app-name>.vercel.app`
* **Backend URL**: `https://<your-render-app-name>.onrender.com`
* **API Base URL**: `https://<your-render-app-name>.onrender.com/api`
* **Health Check URL**: `https://<your-render-app-name>.onrender.com/health`

---

## 2. Environment Variables Configuration

Set these configurations in your cloud dash panels to bind the frontend and backend:

### Frontend Environment Variables (Vercel)
* `REACT_APP_API_BASE_URL` $\rightarrow$ `https://<your-render-app-name>.onrender.com/api`

### Backend Environment Variables (Render / Railway)
* `PORT` $\rightarrow$ `8080` (or dynamic port assigned by Render)
* `SPRING_DATASOURCE_URL` $\rightarrow$ `jdbc:mysql://<railway-mysql-host>:<port>/<dbname>`
* `SPRING_DATASOURCE_USERNAME` $\rightarrow$ `<database-username>`
* `SPRING_DATASOURCE_PASSWORD` $\rightarrow$ `<database-password>`
* `SPRING_PROFILES_ACTIVE` $\rightarrow$ `prod`
* `CORS_ALLOWED_ORIGINS` $\rightarrow$ `https://<your-vercel-app-name>.vercel.app`
* `APP_FRONTEND_URL` $\rightarrow$ `https://<your-vercel-app-name>.vercel.app`
* `SPRING_MAIL_USERNAME` $\rightarrow$ `hrms62000@gmail.com`
* `SPRING_MAIL_PASSWORD` $\rightarrow$ `kbiq nhdo ckel oteg` (GMail app password)
* `GEMINI_API_KEY` / `OPENAI_API_KEY` $\rightarrow$ `<api-key>`

---

## 3. DevOps Deployment Guide

### Step 1: Deploy MySQL Database on Railway
1. Log in to [Railway](https://railway.app) and click **New Project** $\rightarrow$ **Provision MySQL**.
2. Under the MySQL service variables, copy the connection details:
   * Host, Port, Database Name, User, Password.
3. Construct the JDBC connection URL:
   `jdbc:mysql://<host>:<port>/<database-name>`

### Step 2: Deploy Spring Boot Backend on Render
1. Log in to [Render](https://render.com) and click **New** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository `divya-211907/AI-Powered-HRMS`.
3. Set the **Root Directory** to `backend`.
4. Set the build and start commands:
   * **Build Command**: `mvn clean package -DskipTests`
   * **Start Command**: `java -jar target/hrms-0.0.1-SNAPSHOT.jar`
5. Inject the Backend environment variables listed in Section 2.
6. Copy the backend URL assigned by Render (e.g. `https://hrms-backend-abc.onrender.com`).

### Step 3: Deploy React Frontend on Vercel
1. Log in to [Vercel](https://vercel.com) and click **Add New** $\rightarrow$ **Project**.
2. Connect your GitHub repository `divya-211907/AI-Powered-HRMS`.
3. Set the **Root Directory** to `frontend`.
4. Keep the default build settings (`npm run build` and `build` folder).
5. Add the environment variable:
   * `REACT_APP_API_BASE_URL` $\rightarrow$ `https://<your-render-app-name>.onrender.com/api` (using the URL copied in Step 2).
6. Click **Deploy**.
