import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import { AuthContext } from '../App';
import { BookOpen } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState(''); // Only for register
  const [error, setError] = useState('');
  
  const { refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = storage.login(email);
      if (user) {
        refreshUser();
        navigate('/');
      } else {
        setError('User not found. Please register.');
      }
    } else {
      if (!name) {
        setError('Name is required');
        return;
      }
      storage.register(name, email);
      refreshUser();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-6 text-indigo-600">
          <BookOpen size={48} />
        </div>
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">
          {isLogin ? 'Welcome Back' : 'Join BiblioShare'}
        </h2>
        <p className="text-center text-slate-500 mb-8">
          {isLogin ? 'Enter your email to sign in.' : 'Create an account to start writing.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
              placeholder="you@example.com"
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-md"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 hover:underline font-medium text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          <p>For demo purposes, no password is required.</p>
          <p>Mock data is stored in your browser's LocalStorage.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;