import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, User, Github } from 'lucide-react';

import { isProfane } from '../lib/safety';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!isLogin && !username) {
      setError('Please choose a username');
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Set display name for new users
        await updateProfile(userCredential.user, {
          displayName: username
        });
      }
      navigate('/');
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled in Firebase. Please enable it in the console.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      if (result.user && result.user.displayName) {
        if (isProfane(result.user.displayName)) {
          let newName = window.prompt("This display name contains inappropriate language. Please choose another:\n\nPlease enter a new display name:");
          while (newName !== null && (!newName.trim() || isProfane(newName))) {
            newName = window.prompt("Invalid or inappropriate username. Please choose a new valid username:");
          }
          await updateProfile(result.user, { displayName: newName ? newName.trim() : 'Player' });
        }
      }
      navigate('/');
    } catch (err: any) {
      console.error("Google auth error:", err);
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card-dark p-8 md:p-10 rounded-[32px] border border-green-900/20 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold uppercase tracking-tight mb-2">
            {isLogin ? 'Welcome Back' : 'Join EarForge'}
          </h2>
          <p className="text-text-muted text-sm">
            {isLogin ? 'Sign in to sync your progress' : 'Create an account to start training'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Username"
                className="w-full pl-12 pr-4 py-4 bg-green-900/5 rounded-2xl border border-green-900/20 focus:border-accent-dark focus:outline-none transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-4 bg-green-900/5 rounded-2xl border border-green-900/20 focus:border-accent-dark focus:outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-12 pr-4 py-4 bg-green-900/5 rounded-2xl border border-green-900/20 focus:border-accent-dark focus:outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-500 text-xs text-center">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-accent-dark text-white rounded-2xl font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-green-900/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card-dark px-4 text-text-muted tracking-widest">Or continue with</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin} 
          disabled={isLoading}
          className="w-full bg-green-900/5 border border-green-900/20 text-gray-900 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-green-900/10 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/pickers/google.svg" className="w-4 h-4" alt="Google" />
          Continue with Google
        </button>

        <p className="mt-8 text-[11px] text-text-muted text-center leading-relaxed">
          By continuing, you agree to our Terms of Service and Privacy Policy. We maintain a zero tolerance policy for objectionable content or abusive users.
        </p>

        <button 
          onClick={() => setIsLogin(!isLogin)} 
          disabled={isLoading}
          className="w-full mt-8 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-accent-dark transition-all"
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </button>
      </div>
    </div>
  );
}

