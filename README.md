# EduNaija

EduNaija is a Learning Management System (LMS) built with Django REST Framework and React. It allows instructors to create courses, organize lessons into sections, create quizzes, and manage students, while students can enroll in courses, track their learning progress, complete quizzes, and earn certificates after successfully completing a course.

This project was built as part of my journey into full-stack software development to strengthen my backend development skills while also gaining experience integrating a modern React frontend with a Django REST API.

---

## Live Demo

Frontend:
https://edunaija-kohl.vercel.app

Backend API:
https://edunaija-backend-7b22.onrender.com

---

## Features

### Student Features

- User registration and authentication
- Browse available courses
- Free and paid course enrollment
- Lesson progress tracking
- Course completion tracking
- Quiz attempts with instant grading
- Multiple choice, single choice and True/False questions
- Certificate generation after course completion
- Student dashboard
- Course reviews and ratings

### Instructor Features

- Create and manage courses
- Organize courses into sections
- Create lessons
- Upload course thumbnails
- Create quizzes
- Add different question types
- View enrolled students

### Admin Features

- Manage users
- Manage instructors
- Publish or unpublish courses
- Upload course images
- Manage quizzes
- Manage certificates
- Manage categories

---

## Tech Stack

### Backend

- Python
- Django
- Django REST Framework
- PostgreSQL
- Simple JWT
- Cloudinary
- ReportLab
- Paystack API

### Frontend

- React
- React Router
- Axios
- Tailwind CSS
- React Hot Toast

### Deployment

Backend: Render

Frontend: Vercel

Media Storage: Cloudinary

Database: PostgreSQL

---

## Main Functionality

### Authentication

The application uses JWT authentication with access and refresh tokens.

Users are assigned different roles which determine what actions they can perform within the application.

---

### Courses

Courses are organized into sections and lessons.

Each course can contain:

- Videos
- Reading materials
- Quizzes
- Completion tracking

Students can continue learning from where they previously stopped.

---

### Quiz System

The quiz module supports:

- Single Choice questions
- Multiple Choice questions
- True/False questions

Features include:

- Automatic grading
- Multiple attempts
- Pass score configuration
- Time limits
- Instant feedback
- Answer explanations
- Progress tracking

---

### Certificates

Students who complete all lessons and successfully pass the course quiz can generate a PDF certificate.

Certificates include a unique verification ID.

---

### Payments

Premium courses are integrated with Paystack for payment processing.

After successful payment, students are automatically enrolled in the course.

---

## Project Structure

```
backend/
    apps/
        accounts/
        certificates/
        courses/
        quizzes/
        payments/

frontend/
    src/
        components/
        pages/
        context/
        hooks/
        api/
```

---

## Running the Project

### Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/edunaija.git
```

### Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

python manage.py migrate

python manage.py createsuperuser

python manage.py runserver
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## Environment Variables

Create a `.env` file for the backend.

Example:

```env
SECRET_KEY=

DEBUG=True

DATABASE_URL=

PAYSTACK_SECRET_KEY=

PAYSTACK_PUBLIC_KEY=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

---

## Screenshots

The screenshots below show different parts of the application.

- Homepage
- Course List
- Course Details
- Lesson Player
- Quiz Page
- Quiz Result
- Student Dashboard
- Certificate
- Instructor Dashboard

(Images will be added.)

---

## Challenges

Some of the challenges encountered while building this project included:

- Designing a flexible quiz grading system
- Implementing partial scoring for multiple-choice questions
- Handling quiz attempts and progress tracking
- Integrating Paystack payments
- Configuring Cloudinary media storage
- Deploying the backend on Render and frontend on Vercel
- Managing authentication between the frontend and backend

Working through these challenges helped me gain a deeper understanding of API design, authentication, deployment, and state management.

---

## Future Improvements

Some features I would like to add in future versions include:

- Email notifications
- Discussion forums
- Assignment submission
- Instructor analytics dashboard
- Course recommendations
- Dark mode
- Live classes
- Video streaming support

---

## Author

Williams Alayode

Backend Developer | Django | React

GitHub:
https://github.com/YOUR_USERNAME

LinkedIn:
https://linkedin.com/in/YOUR_PROFILE

Email:
YOUR_EMAIL

---

## License

This project is available under the MIT License.
