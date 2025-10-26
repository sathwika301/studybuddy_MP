import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import GroupChannelDetail from "./components/GroupChannelDetail";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import ChatInterface from "./components/ChatInterface";
import ResourcesPage from "./components/ResourcesPage";
import ProfilePage from "./components/ProfilePage";
import Flashcards from "./components/Flashcards";
import QuizMaker from "./components/QuizMaker";
import QuizList from "./components/QuizList";
import QuizTaker from "./components/QuizTaker";
import QuizEnvironment from "./components/QuizEnvironment";
import NotesGenerator from "./components/NotesGenerator";
import Footer from "./components/Footer";
import Layout from "./components/Layout";

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <Layout>
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/channels/:id/details" element={<GroupChannelDetail />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/chat" element={<ChatInterface />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/quiz-maker" element={<QuizMaker />} />
              <Route path="/quizzes" element={<QuizList />} />
              <Route path="/quiz/:id" element={<QuizTakerWrapper />} />
              <Route path="/quiz-environment" element={<QuizEnvironment />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/notes" element={<NotesGenerator />} />
            </Routes>
          </Layout>
          <Footer />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Wrapper component to fetch quiz data
const QuizTakerWrapper = () => {
  const [quiz, setQuiz] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const quizId = window.location.pathname.split('/').pop();

  React.useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setQuiz(data.quiz);
        } else {
          setError('Failed to load quiz');
        }
      } catch (err) {
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.href = '/quizzes'}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  return <QuizTaker quiz={quiz} onBack={() => window.location.href = '/quizzes'} />;
};

export default App;
