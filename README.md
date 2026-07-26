# 🏥 DocTime — Smart Appointment Management System

> **Smart Appointments, Zero Wait**

DocTime is a full-stack healthcare appointment management system designed to eliminate long waiting times at hospitals and clinics. Patients can book doctor appointments digitally, track their real-time queue position, and receive smart slot assignments — all without any manual coordination.

---

## 🚀 Live Links

| Service | URL |
|---------|-----|
| 📱 Download App | https://splendid-crumble-61554f.netlify.app |


---

## 📱 App Features

### 👤 Patient
- Register and login securely
- Browse doctors by specialty, hospital, or name
- Find nearby doctors using GPS location
- Book appointments with auto slot assignment
- Track live queue position in real time
- View appointment history and cancel bookings

### 👨‍⚕️ Doctor
- Self-signup with admin approval workflow
- Manage working shifts and availability toggle
- View live patient queue
- Check in patients, mark consultations complete
- Handle no-shows and swap late patients

### 🔐 Admin
- Approve or reject doctor registrations
- View all doctors with status (Pending/Approved/Rejected)
- View all registered patients
- Dashboard with real-time statistics

---

## 🏗️ Project Structure

```
Smart-Appointment/
├── backend/                          ← Spring Boot REST API
│   └── src/main/java/com/doctime/backend/
│       ├── Config/                   ← JWT, Security, CORS, Rate Limiting
│       ├── Controller/               ← REST Controllers
│       ├── Dto/                      ← Request/Response DTOs
│       ├── Entity/                   ← JPA Entities
│       ├── Enum/                     ← DoctorStatus enum
│       ├── Repo/                     ← JPA Repositories
│       ├── Seeder/                   ← Admin seeder, Nightly cleanup job
│       └── Service/                  ← Business logic
│
└── frontend/
    ├── DocTime/                      ← React Native Mobile App (Expo)
    │   └── src/
    │       ├── api/                  ← Axios config with JWT interceptor
    │       ├── context/              ← AuthContext (token, role, user)
    │       ├── navigation/           ← Stack & Tab navigators
    │       └── screens/
    │           ├── patient/          ← Login, Signup, Dashboard, Queue, History
    │           ├── doctor/           ← LiveQueue, Schedule, DoctorSignup
    │           └── admin/            ← Pending, AllDoctors screens
    │
    └── doctime-web/                  ← React Web Admin Panel
        └── src/
            ├── api/                  ← Axios config
            ├── context/              ← AuthContext (localStorage)
            ├── components/           ← Sidebar navigation
            └── pages/                ← Login, Dashboard, Doctors, Patients, Download
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Java 17 + Spring Boot 3 | REST API framework |
| Spring Security + JWT | Authentication & role-based access |
| PostgreSQL + Hibernate JPA | Database & ORM |
| Spring Scheduler | Nightly cron job for expired appointments |
| BCrypt | Password encryption |
| Render | Cloud deployment platform |

### Mobile App
| Technology | Purpose |
|------------|---------|
| React Native + Expo SDK 54 | Cross-platform mobile (Android & iOS) |
| React Navigation | Stack & bottom tab navigation |
| Axios | HTTP client with JWT interceptors |
| Expo SecureStore | Encrypted local token storage |
| Expo Location | GPS-based nearby doctor discovery |
| EAS Build | Cloud APK builder for Android |

### Web Admin Panel
| Technology | Purpose |
|------------|---------|
| React.js | Single Page Application |
| Material UI (MUI) | Professional UI components |
| React Router DOM | Client-side routing with protected routes |
| Netlify | Static site hosting |

---

## 🔑 API Endpoints

### Authentication
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/patient/signup` | Public |
| POST | `/api/auth/doctor/signup` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Bearer Token |

### Patient Dashboard
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/dashboard/all` | PATIENT |
| GET | `/api/dashboard/categories` | PATIENT |
| GET | `/api/dashboard/nearby?lat=&lng=` | PATIENT |
| GET | `/api/dashboard/search?name=` | PATIENT |
| GET | `/api/dashboard/specialty/{specialty}` | PATIENT |
| GET | `/api/dashboard/hospital?name=` | PATIENT |

### Appointments
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/appointments/book` | PATIENT |
| GET | `/api/appointments/my-history` | PATIENT |
| DELETE | `/api/appointments/cancel/{id}` | PATIENT |

### Queue Management
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/queue/my-queue` | DOCTOR |
| GET | `/api/queue/my-position` | PATIENT |
| PUT | `/api/queue/checkin/{id}` | DOCTOR |
| PUT | `/api/queue/complete/{id}` | DOCTOR |
| PUT | `/api/queue/noshow/{id}` | DOCTOR |
| PUT | `/api/queue/swap/{id}` | DOCTOR |

### Doctor
| Method | Endpoint | Access |
|--------|----------|--------|
| PUT | `/api/doctors/my-schedule` | DOCTOR |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/admin/pending-doctors` | ADMIN |
| GET | `/api/admin/all-doctors` | ADMIN |
| GET | `/api/admin/all-patients` | ADMIN |
| PUT | `/api/admin/approve/{id}` | ADMIN |
| PUT | `/api/admin/reject/{id}` | ADMIN |

---

## ⚙️ Local Setup

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 13+
- Maven
- Expo CLI / EAS CLI

### Backend
```bash
# Navigate to backend
cd backend

# Configure database in src/main/resources/application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/doctime_db
spring.datasource.username=postgres
spring.datasource.password=yourpassword

# Run
./mvnw spring-boot:run
```

### Mobile App
```bash
cd frontend/DocTime

# Install dependencies
npm install

# Update API URL in src/api/axios.js
const BASE_URL = 'http://YOUR_LOCAL_IP:8080';

# Start
npm start
```

### Web Admin Panel
```bash
cd frontend/doctime-web

# Install dependencies
npm install

# Update API URL in src/api/axios.js
const BASE_URL = 'http://YOUR_LOCAL_IP:8080';

# Start
npm start
```

---

## 🗄️ Database Schema

| Entity | Fields |
|--------|--------|
| Patient | id, name, email, password, age, gender, phone |
| Doctor | id, name, email, password, specialization, hospitalName, averageConsultationTime, available, status, latitude, longitude |
| Shift | id, doctor, startTime, endTime |
| Appointment | id, patient, doctor, appointmentTime, queuePosition, status, lateArrival |
| Admin | id, name, email, password |
| BlacklistedToken | id, token, blacklistedAt |

---

## 🔐 Security Features

- JWT token-based stateless authentication
- Token blacklisting on logout
- Role-based access control (PATIENT, DOCTOR, ADMIN)
- BCrypt password encryption
- Rate limiting on API endpoints
- CORS configuration for allowed origins
- HTTPS enforcement via Render and Netlify

---

## 🚀 Deployment

### Backend (Render)
- Deployed via Docker on Render free tier
- PostgreSQL database on Render
- Auto-deploys on push to `main` branch
- Environment variables configured in Render dashboard

### Web Admin (Netlify)
- React build deployed on Netlify
- `_redirects` file for React Router support
- Redeploy by dragging new `build` folder to Deploys tab

### Mobile App (EAS Build)
- APK built using Expo EAS cloud build
- Distributed via Google Drive
- Download link available on web landing page

---

## 📊 Smart Queue Logic

```
Patient books → Auto slot assigned based on shift time and queue length
Patient arrives → Doctor checks in (status: CHECKED_IN)
Late patient → Swap with next present patient
No show → Mark as NO_SHOW, queue shifts forward
Nightly job → Auto-mark expired appointments as NO_SHOW
```

---

## 👨‍💻 Developer

**Arjun Nikam**
- GitHub: [@Arjun-Nikam](https://github.com/Arjun-Nikam)

---

## 📄 License

This project is built for educational and portfolio purposes.
