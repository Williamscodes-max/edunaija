import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import QuizPage from './pages/QuizPage';
import Certificate from './pages/Certificate';
import NotFound from './pages/NotFound';
import LessonPlayer from './pages/LessonPlayer';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import PaymentVerify from './pages/PaymentVerify';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
       <ScrollToTop />
        <Toaster position="top-right" />
        <Navbar />
        <main className="min-h-screen">
          <Routes>
            <Route path="/payment/verify" element={<PaymentVerify />} />
            <Route path="/courses/:slug/learn" element={
           <ProtectedRoute role="student"><LessonPlayer /></ProtectedRoute>} />
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/courses/:slug" element={<CourseDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
            } />
            <Route path="/courses/:slug/quiz/:quizId" element={
            <ProtectedRoute role="student"><QuizPage /></ProtectedRoute>
            } />
            <Route path="/instructor/courses/new" element={
             <ProtectedRoute role="instructor"><CreateCourse /></ProtectedRoute> 
             } />
             <Route path="/instructor/courses/:id/edit" element={
               <ProtectedRoute role="instructor"><EditCourse /></ProtectedRoute>
            } />
            <Route path="/certificates" element={
              <ProtectedRoute role="student"><Certificate /></ProtectedRoute>
            } />
            <Route path="/instructor" element={
              <ProtectedRoute role="instructor"><InstructorDashboard /></ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;