# 🏥 HealthMatrix — Hospital Management System Web App

**HealthMatrix** is a full-stack web application designed to simplify hospital management by digitizing patient, doctor, and admin workflows.  
It aims to replace paper-based record-keeping with a secure, efficient, and user-friendly platform.

---

## ✨ Key Features

### 👩‍⚕️ Patient Module
- Sign up and manage profile securely
- View medical records and history
- Book appointments with doctors
- Check appointment status
- View prescriptions and billing receipts

### 🩺 Doctor Module
- Doctor profile management
- View assigned appointments
- Access patient medical records
- Add new diagnosis and prescribe medicines

### 🗂️ Admin Module
- Secure admin login
- View recent appointments
- Generate and manage patient bills

---

## 🛠️ Tech Stack

| Frontend  | Backend | Database |
|-----------|---------|----------|
| HTML, CSS, JavaScript | Node.js

---

## 🎯 Project Objective

> To enable small and medium hospitals to move towards digital management,  
> ensuring faster access to patient records, seamless billing, and reduced risk of data loss.

---

## 📊 Why This Project Matters

- Over **65% of Indian hospitals** still rely on manual, paper-based management (HealthTech India, 2024)
- Paper records increase the risk of **data loss**, retrieval delays, and billing errors
- **HealthMatrix** provides a lightweight digital solution aimed at solving these issues  

---

## 🚀 How to Run This Project Locally

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/healthmatrix.git
   cd healthmatrix
   ```

2. **Set up Backend (Node.js)**
   ```bash
   cd hospital_management
   npm install
   npm start
   ```

3. **Configure PostgreSQL Database**  
   - Create database and tables as per your backend models  
   - Setup environment variables in `.env`:
     ```
     DB_HOST=your_host
     DB_USER=your_user
     DB_PASSWORD=your_password
     DB_NAME=your_db_name
     ```

4. **Frontend Access**  
   - Open `index.html` or the patient/doctor/admin pages in your browser  

---

## 🛣️ Future Roadmap
- ✅ Build secure login for patient, doctor, and admin  
- ✅ Appointment management with billing integration  
- [ ] Refactor frontend with React or Vue.js  
- [ ] Implement role-based access control (RBAC)  
- [ ] Add real-time notifications for appointments and billing  
- [ ] Deploy on cloud (AWS/Render/Heroku)

---

© 2025 HealthMatrix — All Rights Reserved.

