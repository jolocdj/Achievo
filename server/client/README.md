# 🚀 Achievo – Task Manager Web App

Achievo is a fullstack task management web application that allows users to securely manage their tasks with authentication and real-time data handling.

---

## 🧠 Overview

This project demonstrates fullstack development using modern technologies, including frontend-backend integration, RESTful APIs, authentication, and database management.

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- JavaScript
- HTML & CSS
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL

### Authentication
- JSON Web Token (JWT)
- bcrypt (password hashing)

### Tools & Platforms
- Git & GitHub
- Thunder Client (API testing)
- pgAdmin (database management)

---

## ✨ Features

- 🔐 User registration and login (JWT authentication)
- 🧾 Create, read, update, and delete tasks (CRUD)
- 🔒 Protected routes (only authenticated users can access tasks)
- ⚡ Real-time interaction between frontend and backend
- 📱 Responsive UI design

---

## 🔄 Application Flow

1. User registers an account
2. User logs in and receives a JWT token
3. Token is stored in localStorage
4. Authenticated requests are sent to protected API routes
5. Tasks are fetched, created, updated, and deleted via API

---

## 📡 API Endpoints

### Auth
- `POST /register` → Register new user
- `POST /login` → Login and receive token

### Tasks
- `GET /tasks` → Get all tasks (protected)
- `POST /tasks` → Create new task
- `PUT /tasks/:id` → Update task
- `DELETE /tasks/:id` → Delete task

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/achievo.git
cd achievo
