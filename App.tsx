import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { storage } from './services/storage';
import { User } from './types';

// Layouts
import Layout from './components/Layout';

// Pages
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import BookDetailsPage from './pages/BookDetailsPage';
import PostDetailsPage from './pages/PostDetailsPage';
import CreatePostPage from './pages/CreatePostPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';

// Context
export const AuthContext = React.createContext<{
  user: User | null;
  refreshUser: () => void;
  logout: () => void;
}>({ user: null, refreshUser: () => {}, logout: () => {} });

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(storage.getCurrentUser());

  const refreshUser = () => {
    setUser(storage.getCurrentUser());
  };

  const logout = () => {
    storage.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, refreshUser, logout }}>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="book/:id" element={<BookDetailsPage />} />
            <Route path="post/:id" element={<PostDetailsPage />} />
            <Route path="user/:id" element={<ProfilePage />} />
            <Route path="create" element={user ? <CreatePostPage /> : <Navigate to="/login" />} />
            <Route path="edit/:id" element={user ? <CreatePostPage /> : <Navigate to="/login" />} />
          </Route>
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;