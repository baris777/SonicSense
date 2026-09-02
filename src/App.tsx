import { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Tone from 'tone';
import { 
  Play, 
  RotateCcw, 
  ChevronRight, 
  Settings2, 
  Trophy, 
  Activity,
  CheckCircle2,
  XCircle,
  Volume2,
  Music,
  Brain,
  Piano,
  ArrowRight,
  Mic,
  Plus,
  Minus,
  LogOut,
  User as UserIcon,
  Loader2,
  Info,
  Menu,
  Home,
  BookOpen,
  AlertTriangle,
  Flag,
  Ban,
  ShieldCheck,
  FileText,
  Trash2
} from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  EmailAuthProvider,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  onAuthStateChanged, 
  User,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { 
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  runTransaction,
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where 
} from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { isProfane } from './lib/safety';
import { 
  PrivacyPolicyModal, 
  TermsOfServiceModal, 
  MicrophonePermissionModal, 
  ReauthModal 
} from './components/LegalModals';

import { PerfectPitchModule } from './components/PerfectPitchModule';
import { Language, translations } from './translations';

// --- Firebase Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

  // --- Pitch Detection Helper ---
function autoCorrelate(buffer: Float32Array, sampleRate: number) {
  let SIZE = buffer.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) {
    let val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);
  
  // Lowered threshold to pick up quieter mic signals
  if (rms < 0.005) return -1; 

  let r1 = 0, r2 = SIZE - 1, thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buffer[SIZE - i]) < thres) { r2 = SIZE - i; break; }
  }

  let buf = buffer.slice(r1, r2);
  let BUF_SIZE = buf.length;

  let c = new Float32Array(BUF_SIZE);
  for (let i = 0; i < BUF_SIZE; i++) {
    for (let j = 0; j < BUF_SIZE - i; j++) {
      c[i] = c[i] + buf[j] * buf[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1, maxpos = -1;
  for (let i = d; i < BUF_SIZE; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }
  let T0 = maxpos;

  if (T0 < 0 || T0 >= BUF_SIZE) return -1;

  let x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
  let a = (x1 + x3 - 2 * x2) / 2;
  let b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}

// --- Constants & Types ---
const INITIAL_DIFFERENCE = 40; 
const MIN_DIFFERENCE = 0.5;

type GameMode = 'pitch' | 'interval' | 'imitate' | 'vocal' | 'perfect_pitch';
type GameStatus = 'idle' | 'playing' | 'selecting' | 'correct' | 'incorrect' | 'onboarding' | 'calculating' | 'imitating' | 'recording' | 'session_summary';
type ViewState = 'intro' | 'auth' | 'guide' | 'home' | 'app' | 'settings' | 'perfect_pitch';
type AuthMode = 'signin' | 'signup';

interface IntroViewProps {
  onFinish: () => void;
}

interface AuthViewProps {
  user: User | null;
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  displayName: string;
  setDisplayName: (name: string) => void;
  authError: string | null;
  isLoggingIn: boolean;
  handleEmailAuth: (e: FormEvent) => void;
  handleLogin: () => void;
  language: Language;
  onShowPrivacy: () => void;
  onShowTerms: () => void;
}

interface SettingsViewProps {
  user: User | null;
  onBack: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  onResetSection: (section: GameMode | 'all', title: string) => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  onShowPrivacy: () => void;
  onShowTerms: () => void;
}

const IntroView = ({ onFinish }: IntroViewProps) => (
  <div className="min-h-screen bg-bg-dark text-gray-900 flex flex-col items-center justify-center p-6 text-center">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl"
    >
      <div className="text-accent-dark font-bold text-2xl tracking-[0.4em] mb-12">
        EARFORGE
      </div>
      
      <h1 className="text-4xl md:text-6xl font-extralight italic tracking-tight mb-8">
        The path to <span className="text-accent-dark">Perfect Pitch.</span>
      </h1>
      
      <p className="text-lg md:text-xl text-text-muted font-light leading-relaxed mb-12">
        Attain perfect pitch by training your ears to identify even the smallest sound differences. 
        Scientific frequency analysis meets musical intuition.
      </p>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onFinish}
        className="bg-accent-dark text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors"
      >
        Enter Earforge
      </motion.button>
    </motion.div>
    
    <div className="absolute bottom-12 left-0 w-full flex justify-center gap-1 opacity-20">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ height: [10, 30, 10] }}
          transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
          className="w-1 bg-accent-dark rounded-full"
        />
      ))}
    </div>
  </div>
);

const AuthView = ({ 
  authMode, setAuthMode, email, setEmail, password, setPassword, 
  displayName, setDisplayName, authError, isLoggingIn, handleEmailAuth, handleLogin,
  language, onShowPrivacy, onShowTerms
}: AuthViewProps) => {
  const t = translations[language];

  return (
  <div className="min-h-screen bg-bg-dark text-gray-900 flex flex-col items-center justify-center p-6">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-card-dark border border-green-900/10 rounded-3xl p-8 md:p-12 shadow-2xl"
    >
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-accent-dark/10 flex items-center justify-center border border-accent-dark/20">
            <UserIcon className="w-8 h-8 text-accent-dark" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">{authMode === 'signin' ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-text-muted text-sm leading-relaxed">
          {authMode === 'signin' ? 'Sign in to sync your progress' : 'Join the elite ear training platform'}
        </p>
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        {authMode === 'signup' && (
          <input 
            type="text" placeholder="Full Name / Display Name" required value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={32}
            className="w-full bg-green-900/5 border border-green-900/20 rounded-xl px-4 py-3 text-sm focus:border-accent-dark outline-none transition-colors"
          />
        )}
        <input 
          type="email" placeholder="Email Address" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-green-900/5 border border-green-900/20 rounded-xl px-4 py-3 text-sm focus:border-accent-dark outline-none transition-colors"
        />
        <input 
          type="password" placeholder="Password" required value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-green-900/5 border border-green-900/20 rounded-xl px-4 py-3 text-sm focus:border-accent-dark outline-none transition-colors"
        />
        
        {authError && <p className="text-red-400 text-xs text-center">{authError}</p>}

        <button 
          type="submit" disabled={isLoggingIn}
          className="w-full bg-accent-dark text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors disabled:opacity-50"
        >
          {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (authMode === 'signin' ? 'Sign In' : 'Sign Up')}
        </button>

      </form>

      <div className="my-6 flex items-center gap-4 opacity-20">
        <div className="h-px bg-white flex-1" />
        <span className="text-[10px] uppercase font-bold tracking-widest">or</span>
        <div className="h-px bg-white flex-1" />
      </div>

      <div className="space-y-4">
        {/* Sign in with Google */}
        <button 
          onClick={handleLogin} disabled={isLoggingIn}
          className="w-full bg-green-900/5 border border-green-900/20 text-gray-900 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-green-900/10 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/pickers/google.svg" className="w-4 h-4" alt="Google" />
          Continue with Google
        </button>
      </div>

      <p className="mt-8 text-[11px] text-text-muted text-center leading-relaxed">
        {t.termsAgreementNotice}{' '}
        <button type="button" onClick={onShowTerms} className="text-accent-dark font-bold hover:underline">{t.termsOfService}</button>
        {' & '}
        <button type="button" onClick={onShowPrivacy} className="text-accent-dark font-bold hover:underline">{t.privacyPolicy}</button>
      </p>

      <p className="mt-6 text-center text-xs text-text-muted">
        {authMode === 'signin' ? "Don't have an account? " : "Already have an account? "}
        <button 
          onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
          className="text-accent-dark font-bold hover:underline"
        >
          {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
        </button>
      </p>
    </motion.div>
  </div>
  );
};

const SettingsView = ({ 
  user, onBack, onLogout, onDeleteAccount, showDeleteConfirm, setShowDeleteConfirm, 
  onResetSection, language, onSelectLanguage, onShowPrivacy, onShowTerms 
}: SettingsViewProps) => {
  const t = translations[language];

  return (
  <div className="min-h-screen bg-bg-dark text-gray-900 p-6 pt-24 md:pt-12 md:p-12 pb-24">
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-green-900/5 flex items-center justify-center hover:bg-green-900/10 transition-colors"
        >
          <Plus className="w-5 h-5 rotate-45" /> {/* Close/Back icon substitute */}
        </button>
        <h1 className="text-3xl font-light italic tracking-tight">{t.settings}</h1>
      </div>

      <div className="space-y-8">
        {/* Language Selection */}
        <section className="bg-card-dark border border-green-900/10 rounded-3xl p-8 space-y-6">
          <h2 className="text-lg font-bold text-accent-dark uppercase tracking-widest text-xs">{t.languageSelection}</h2>
          <p className="text-xs text-text-muted">{t.languageDesc}</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { code: 'en' as Language, label: 'English', flag: 'EN' },
              { code: 'tr' as Language, label: 'Türkçe', flag: 'TR' },
              { code: 'de' as Language, label: 'Deutsch', flag: 'DE' },
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => onSelectLanguage(l.code)}
                className={`p-3.5 md:p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${
                  language === l.code
                    ? 'border-accent-dark bg-accent-dark/10 font-bold text-gray-900 shadow-sm'
                    : 'border-green-900/10 bg-green-900/5 text-text-muted hover:border-accent-dark/50'
                }`}
              >
                <span className="text-xl font-bold font-mono tracking-wider">{l.flag}</span>
                <span className="text-xs md:text-sm font-semibold">{l.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-card-dark border border-green-900/10 rounded-3xl p-8">
          <h2 className="text-lg font-bold mb-6 text-accent-dark uppercase tracking-widest text-xs">{t.profile}</h2>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-green-900/5 flex items-center justify-center border border-green-900/20 text-3xl font-light">
              {user?.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full rounded-2xl object-cover" /> : user?.displayName?.[0] || '?'}
            </div>
            <div>
              <p className="text-xl font-bold">{user?.displayName || 'Anonymous User'}</p>
              <p className="text-text-muted text-sm">{user?.email}</p>
            </div>
          </div>
        </section>

        {/* Section Reset Management */}
        <section className="bg-card-dark border border-green-900/10 rounded-3xl p-8 space-y-6">
          <h2 className="text-lg font-bold text-accent-dark uppercase tracking-widest text-xs">{t.resetSectionProgress}</h2>
          <div className="space-y-3">
            {[
              { id: 'pitch' as GameMode, title: t.pitchDetectionTitle },
              { id: 'interval' as GameMode, title: t.intervalRecognitionTitle },
              { id: 'imitate' as GameMode, title: t.frequencyImitationTitle },
              { id: 'vocal' as GameMode, title: t.vocalPitchTitle },
              { id: 'perfect_pitch' as GameMode, title: t.mnemonicEngineTitle },
            ].map((sec) => (
              <div key={sec.id} className="flex items-center justify-between p-4 bg-green-900/5 rounded-2xl border border-green-900/10">
                <div>
                  <p className="font-bold text-sm">{sec.title}</p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider">{t.resetSectionDesc}</p>
                </div>
                <button 
                  onClick={() => onResetSection(sec.id, sec.title)}
                  className="bg-green-900/5 text-text-muted hover:text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-green-900/20 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> {t.reset}
                </button>
              </div>
            ))}
            
            <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-2xl border border-red-500/10 mt-4">
              <div>
                <p className="font-bold text-sm text-red-400">{t.resetAllSections}</p>
                <p className="text-[10px] text-red-400/60 uppercase tracking-wider">{t.resetAllDesc}</p>
              </div>
              <button 
                onClick={() => onResetSection('all', t.resetAllSections)}
                className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-gray-900 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-red-500/30 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> {t.resetAll}
              </button>
            </div>
          </div>
        </section>

        {/* Legal & Compliance Section */}
        <section className="bg-card-dark border border-green-900/10 rounded-3xl p-8 space-y-4">
          <h2 className="text-lg font-bold text-accent-dark uppercase tracking-widest text-xs">Legal & Compliance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={onShowPrivacy}
              className="p-4 bg-green-900/5 hover:bg-green-900/10 rounded-2xl border border-green-900/10 flex items-center gap-3 text-left transition-colors"
            >
              <ShieldCheck className="w-5 h-5 text-accent-dark flex-shrink-0" />
              <div>
                <p className="font-bold text-xs">{t.privacyPolicy}</p>
                <p className="text-[9px] text-text-muted">Data & audio usage</p>
              </div>
            </button>

            <button
              onClick={onShowTerms}
              className="p-4 bg-green-900/5 hover:bg-green-900/10 rounded-2xl border border-green-900/10 flex items-center gap-3 text-left transition-colors"
            >
              <FileText className="w-5 h-5 text-accent-dark flex-shrink-0" />
              <div>
                <p className="font-bold text-xs">{t.termsOfService}</p>
                <p className="text-[9px] text-text-muted">User guidelines</p>
              </div>
            </button>
          </div>
        </section>

        <section className="bg-card-dark border border-green-900/10 rounded-3xl p-8 space-y-6">
          <h2 className="text-lg font-bold text-accent-dark uppercase tracking-widest text-xs">{t.accountManagement}</h2>
          
          <div className="flex items-center justify-between p-4 bg-green-900/5 rounded-2xl border border-green-900/10">
            <div>
              <p className="font-bold text-sm">{t.signOut}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">{t.signOutDesc}</p>
            </div>
            <button 
              onClick={onLogout}
              className="bg-green-900/5 text-gray-900 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 hover:text-red-400 transition-all border border-green-900/20"
            >
              {t.signOut}
            </button>
          </div>

          <div className="flex flex-col gap-4 p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
            {!showDeleteConfirm ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-red-400">{t.deleteAccount}</p>
                  <p className="text-[10px] text-red-400/50 uppercase tracking-wider">{t.deleteAccountDesc}</p>
                </div>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500 text-gray-900 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  {t.deleteAccount}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-red-400 text-sm font-bold">{t.deleteConfirmTitle}</p>
                <p className="text-text-muted text-xs leading-relaxed italic">
                  {t.deleteConfirmDesc}
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={onDeleteAccount}
                    className="flex-1 bg-red-500 text-gray-900 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all"
                  >
                    {t.confirmDeletion}
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-green-900/5 text-gray-900 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-green-900/10 transition-all border border-green-900/20"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  </div>
  );
};

interface HistoryItem {
  id: string;
  type: GameMode;
  correct: boolean;
  intensity: string;
}

interface LeaderboardScore {
  id: string;
  userId: string;
  username: string;
  gameMode: string;
  avgAccuracy: number;
  totalCorrect: number;
  totalQuestions: number;
  avgGap?: number;
  avgTolerance?: number;
  totalSessions: number;
  lastUpdated: any;
}

const INTERVALS = [
  { name: 'm2', semitones: 1, label: 'Minor 2nd' },
  { name: 'M2', semitones: 2, label: 'Major 2nd' },
  { name: 'm3', semitones: 3, label: 'Minor 3rd' },
  { name: 'M3', semitones: 4, label: 'Major 3rd' },
  { name: 'P4', semitones: 5, label: 'Perfect 4th' },
  { name: 'P5', semitones: 7, label: 'Perfect 5th' },
  { name: 'M6', semitones: 9, label: 'Major 6th' },
  { name: 'M7', semitones: 11, label: 'Major 7th' },
  { name: 'P8', semitones: 12, label: 'Octave' },
];

interface HomeViewProps {
  onSelectMode: (mode: GameMode) => void;
  onOpenSettings: () => void;
  user: User | null;
  language: Language;
}
const HomeView = ({ onSelectMode, onOpenSettings, user, language }: HomeViewProps) => {
  const [selectedInstruction, setSelectedInstruction] = useState<GameMode | null>(null);
  const homeScrollRef = useRef<number>(0);
  const t = translations[language];

  const handleOpenInstruction = (modeId: GameMode) => {
    homeScrollRef.current = window.scrollY || document.documentElement.scrollTop || 0;
    setSelectedInstruction(modeId);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleCloseInstruction = () => {
    setSelectedInstruction(null);
    requestAnimationFrame(() => {
      window.scrollTo({ top: homeScrollRef.current, behavior: 'instant' });
      setTimeout(() => {
        window.scrollTo({ top: homeScrollRef.current, behavior: 'instant' });
      }, 40);
    });
  };

  const modeInfo = [
    {
      id: 'pitch' as GameMode,
      title: t.pitchDetectionTitle,
      desc: t.pitchDetectionShort,
      icon: Volume2,
      instruction: t.pitchDetectionDesc
    },
    {
      id: 'interval' as GameMode,
      title: t.intervalRecognitionTitle,
      desc: t.intervalRecognitionShort,
      icon: Piano,
      instruction: t.intervalRecognitionDesc
    },
    {
      id: 'imitate' as GameMode,
      title: t.frequencyImitationTitle,
      desc: t.frequencyImitationShort,
      icon: Activity,
      instruction: t.frequencyImitationDesc
    },
    {
      id: 'vocal' as GameMode,
      title: t.vocalPitchTitle,
      desc: t.vocalPitchShort,
      icon: Mic,
      instruction: t.vocalPitchDesc
    },
    {
      id: 'perfect_pitch' as GameMode,
      title: t.mnemonicEngineTitle,
      desc: t.mnemonicEngineShort,
      icon: Music,
      instruction: t.mnemonicEngineDesc
    }
  ];

  return (
    <div className="min-h-screen bg-bg-dark text-green-800 p-4 pt-24 md:pt-12 md:p-12 font-sans flex flex-col">
      <header className="hidden md:flex relative justify-between items-center mb-12 border-transparent">
        <div className="text-accent-dark font-bold text-xl tracking-[0.2em]">
          EARFORGE
        </div>
        <div className="relative flex items-center gap-4">
          {user && <span className="inline-block text-sm font-bold opacity-80">{user.displayName}</span>}
          <button onClick={onOpenSettings} className="w-10 h-10 rounded-full bg-card-dark flex items-center justify-center border border-border-dark hover:border-accent-dark transition-colors">
            <UserIcon className="w-5 h-5 text-accent-dark" />
          </button>
        </div>
      </header>

      {selectedInstruction ? (
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
             <button onClick={handleCloseInstruction} className="mb-8 text-accent-dark hover:underline flex items-center gap-2">
               <RotateCcw className="w-4 h-4"/> {t.back}
             </button>
             {(() => {
               const mode = modeInfo.find(m => m.id === selectedInstruction)!;
               const Icon = mode.icon;
               return (
                 <div className="bg-card-dark border border-border-dark p-6 md:p-8 rounded-3xl w-full">
                   <Icon className="w-12 h-12 md:w-16 md:h-16 text-accent-dark mx-auto mb-4 md:mb-6" />
                   <h2 className="text-2xl md:text-3xl font-extralight mb-4 text-gray-900 uppercase tracking-tight">{mode.title}</h2>
                   <p className="text-text-muted text-base md:text-lg leading-relaxed mb-6 md:mb-8">{mode.instruction}</p>
                   <button onClick={() => onSelectMode(mode.id)} className="w-full bg-accent-dark text-white font-bold py-4 rounded-xl uppercase tracking-widest hover:bg-opacity-90 transition-all">
                     {t.startSession}
                   </button>
                 </div>
               )
             })()}
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-10 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-extralight text-gray-900 md:mb-4 italic tracking-tight">{t.trainingModulesTitle}</h1>
            <p className="hidden md:block text-text-muted text-xs md:text-base uppercase tracking-widest">{t.trainingModulesSubtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto w-full">
            {modeInfo.map(mode => (
              <div key={mode.id} className="bg-card-dark border border-border-dark rounded-2xl p-5 md:p-6 hover:border-accent-dark transition-all flex flex-col">
                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl bg-bg-dark flex items-center justify-center border border-border-dark">
                    <mode.icon className="w-4 h-4 md:w-6 md:h-6 text-accent-dark" />
                  </div>
                  <h3 className="text-base md:text-xl font-bold text-gray-900 tracking-tight uppercase">{mode.title}</h3>
                </div>
                <p className="text-gray-600 text-sm md:text-sm mb-5 md:mb-6 flex-1">{mode.desc}</p>
                
                <div className="flex gap-2 md:gap-3 mt-auto">
                  <button 
                    onClick={() => handleOpenInstruction(mode.id)}
                    className="flex-1 py-2 md:py-3 px-2 md:px-4 rounded-xl border border-border-dark text-xs md:text-xs uppercase tracking-widest font-bold hover:bg-border-dark hover:text-gray-900 transition-colors text-text-muted text-center"
                  >
                    {t.instructions}
                  </button>
                  <button 
                    onClick={() => onSelectMode(mode.id)}
                    className="flex-1 py-2 md:py-3 px-2 md:px-4 rounded-xl bg-accent-dark text-white text-xs md:text-xs uppercase tracking-widest font-bold hover:bg-opacity-90 transition-colors text-center"
                  >
                    {t.play}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


export type ThemeId = 'green' | 'blue' | 'purple' | 'amber' | 'rose' | 'midnight';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  color: string;
}

export const THEMES: ThemeOption[] = [
  { id: 'green', name: 'Emerald', color: '#16A34A' },
  { id: 'blue', name: 'Ocean Blue', color: '#2563EB' },
  { id: 'purple', name: 'Royal Purple', color: '#9333EA' },
  { id: 'amber', name: 'Sunset Amber', color: '#D97706' },
  { id: 'rose', name: 'Rose', color: '#E11D48' },
  { id: 'midnight', name: 'Midnight Obsidian', color: '#090D16' },
];

const Sidebar = ({ 
  isOpen, 
  onClose, 
  currentView, 
  onNavigate,
  onOpenLeaderboard,
  currentTheme,
  onSelectTheme,
  language
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onOpenLeaderboard: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  language: Language;
}) => {
  const t = translations[language];

  const menuItems = [
    { id: 'guide' as ViewState, label: t.scientificGuide, icon: BookOpen },
    { id: 'home' as ViewState, label: t.home, icon: Home },
    { id: 'settings' as ViewState, label: t.settings, icon: Settings2 },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 md:w-72 bg-card-dark border-r border-green-900/10 z-[101] shadow-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="text-accent-dark font-bold text-lg tracking-[0.2em]">
                  EARFORGE
                </div>
                <button onClick={onClose} className="p-2 hover:bg-green-900/5 rounded-full transition-colors">
                  <Plus className="w-5 h-5 rotate-45 text-text-muted" />
                </button>
              </div>

              <nav className="space-y-2 flex-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-accent-dark text-white font-bold' 
                          : 'text-text-muted hover:bg-green-900/5 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="uppercase tracking-widest text-xs">{item.label}</span>
                    </button>
                  );
                })}

                <div className="pt-4 mt-4 border-t border-green-900/10">
                  <button
                    onClick={() => {
                      onOpenLeaderboard();
                      onClose();
                    }}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all text-text-muted hover:bg-green-900/5 hover:text-gray-900 group"
                  >
                    <Trophy className="w-5 h-5 group-hover:text-accent-dark" />
                    <span className="uppercase tracking-widest text-xs">{t.leaderboard}</span>
                  </button>
                </div>
              </nav>

              <div className="mt-auto pt-6 border-t border-green-900/10">
                <div className="flex items-center justify-center gap-2.5">
                  {THEMES.map((th) => (
                    <button
                      key={th.id}
                      onClick={() => onSelectTheme(th.id)}
                      className={`w-6 h-6 rounded-full transition-all ${
                        currentTheme === th.id
                          ? 'ring-2 ring-offset-2 ring-accent-dark scale-110 shadow-sm'
                          : 'opacity-70 hover:opacity-100 hover:scale-105 border border-black/10'
                      }`}
                      style={{ backgroundColor: th.color }}
                      title={th.name}
                      aria-label={th.name}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Empty - logic moved to App for better control */}
    </>
  );
};

const ResetWarningModal = ({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel
}: {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-card-dark border border-red-500/30 rounded-3xl p-6 md:p-8 shadow-2xl z-10"
        >
          <div className="flex items-center gap-3 text-red-400 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight text-gray-900">{title}</h3>
          </div>
          <p className="text-sm text-text-muted leading-relaxed mb-8">
            {description}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-xl border border-green-900/20 text-gray-900 hover:bg-green-900/5 transition-colors font-bold uppercase tracking-widest text-xs"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-gray-900 hover:bg-red-600 transition-colors font-bold uppercase tracking-widest text-xs shadow-lg shadow-red-500/20"
            >
              Confirm Reset
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const GuideSectionCard = ({ header, text, cutoffIndex, icon: Icon, visualAssetPlaceholder }: {
  header: string;
  text: string;
  cutoffIndex: number;
  icon: any;
  visualAssetPlaceholder: string;
}) => {
  return (
    <div className="bg-card-dark border border-green-900/10 shadow-lg rounded-2xl md:rounded-[2rem] p-5 md:p-8 flex flex-col md:flex-row gap-4 md:gap-10 items-center">
      {/* Left Side: Content */}
      <div className="flex-1 w-full flex flex-col space-y-3 md:space-y-4">
        <div className="flex items-center gap-3 text-accent-dark">
          <Icon className="w-6 h-6 md:w-8 md:h-8" />
          <h3 className="text-xl md:text-2xl font-bold tracking-wider text-gray-900">{header}</h3>
        </div>
        
        {/* Full text (both mobile and desktop) */}
        <p className="text-text-muted leading-relaxed text-sm md:text-lg">
          {text}
        </p>
      </div>

      {/* Right Side: Visual Asset Placeholder (Hidden on mobile) */}
      <div className="hidden md:flex w-full md:w-[280px] lg:w-[320px] aspect-video md:aspect-square bg-bg-dark border border-green-900/10 rounded-xl items-center justify-center text-text-muted text-sm italic shadow-inner">
        [{visualAssetPlaceholder}]
      </div>
    </div>
  );
};

const GuideView = ({ language }: { language: Language }) => {
  const t = translations[language];
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-12 bg-bg-dark text-gray-900 font-sans">
      <div className="max-w-5xl mx-auto pt-24 pb-8 md:py-16 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 md:space-y-12"
        >
           <header className="text-center space-y-4 pt-10 md:pt-0 pb-4 md:pb-0 border-b border-green-500/30 md:border-transparent">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              {t.guideHeading} <span className="text-accent-dark">{t.guideSubheadingHighlight}</span>
            </h1>
          </header>

          <div className="flex flex-col gap-5 md:gap-10">
            <GuideSectionCard 
              header={t.guideIntervalsTitle}
              text={t.guideIntervalsText}
              cutoffIndex={0}
              icon={Music}
              visualAssetPlaceholder={t.waveformAsset}
            />
            
            <GuideSectionCard 
              header={t.guidePitchTitle}
              text={t.guidePitchText}
              cutoffIndex={0}
              icon={Activity}
              visualAssetPlaceholder={t.spectrogramAsset}
            />

            <GuideSectionCard 
              header={t.guideFreqImitationTitle}
              text={t.guideFreqImitationText}
              cutoffIndex={0}
              icon={Volume2}
              visualAssetPlaceholder={t.dialAsset}
            />

            <GuideSectionCard 
              header={t.guideImitationTitle}
              text={t.guideImitationText}
              cutoffIndex={0}
              icon={Mic}
              visualAssetPlaceholder={t.singerAsset}
            />

            <GuideSectionCard 
              header={t.guideMnemonicTitle}
              text={t.guideMnemonicText}
              cutoffIndex={0}
              icon={Brain}
              visualAssetPlaceholder={t.memoryAsset}
            />
          </div>

          <footer className="pt-8 border-t border-green-600/20 text-center">
            <p className="text-sm md:text-base text-text-muted font-medium">
              {t.guideFooterText}
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
};


// --- Component ---
export default function App() {
  // Language State
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('app_language') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const t = translations[language];

  // Theme State
  const [theme, setTheme] = useState<ThemeId>(() => {
    return (localStorage.getItem('app_theme') as ThemeId) || 'green';
  });

  useEffect(() => {
    if (theme === 'green') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  // Navigation State
  const [viewState, setViewState] = useState<ViewState>('auth');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollPositions = useRef<Record<string, number>>({});

  const navigateTo = (nextView: ViewState) => {
    // Record current scroll position for current view
    scrollPositions.current[viewState] = window.scrollY || document.documentElement.scrollTop || 0;
    setViewState(nextView);
  };

  useEffect(() => {
    const savedScroll = scrollPositions.current[viewState];
    if (savedScroll !== undefined && savedScroll > 0) {
      const r1 = requestAnimationFrame(() => {
        window.scrollTo({ top: savedScroll, behavior: 'instant' as ScrollBehavior });
      });
      const t1 = setTimeout(() => {
        window.scrollTo({ top: savedScroll, behavior: 'instant' as ScrollBehavior });
      }, 40);
      const t2 = setTimeout(() => {
        window.scrollTo({ top: savedScroll, behavior: 'instant' as ScrollBehavior });
      }, 120);
      return () => {
        cancelAnimationFrame(r1);
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [viewState]);

  // Global State
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>('pitch');
  const [status, setStatus] = useState<GameStatus>('idle');

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);

  // Compliance & Safety Modals State
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showMicModal, setShowMicModal] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthProviderId, setReauthProviderId] = useState<string | null>(null);
  const [reportNotice, setReportNotice] = useState<string | null>(null);

  // UGC Moderation / Blocked Users State
  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('earforge_blocked_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Deep Link / URL Parameter Handling for Google Play & App Store Compliance
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const page = params.get('page');
      const pathname = window.location.pathname;
      if (page === 'privacy' || pathname === '/privacy') {
        setShowPrivacyModal(true);
      } else if (page === 'terms' || pathname === '/terms') {
        setShowTermsModal(true);
      } else if (page === 'delete-account' || pathname === '/delete-account') {
        setViewState('settings');
        setShowDeleteConfirm(true);
      }
    } catch (e) {
      console.warn("Could not check URL parameters", e);
    }
  }, []);

  // Leaderboard State
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardScore[]>([]);
  const [isFetchingLeaderboard, setIsFetchingLeaderboard] = useState(false);
  const [leaderboardMode, setLeaderboardMode] = useState<GameMode>('pitch');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // Handle navigation based on auth state
      if (currentUser) {
        setViewState('intro');
      } else {
        setViewState('auth');
      }

      if (currentUser) {
        // Fetch user profile settings
        try {
          const profileRef = doc(db, 'user_profiles', currentUser.uid);
          const profileDoc = await getDoc(profileRef);
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            if (data.vocalMin && data.vocalMax) {
              setVocalRange({ min: data.vocalMin, max: data.vocalMax });
            }
            if (data.proficiency) {
              setProficiency((prev: any) => ({
                ...prev,
                ...data.proficiency,
                pitch: { ...prev.pitch, ...(data.proficiency.pitch || {}) },
                interval: { ...prev.interval, ...(data.proficiency.interval || {}) },
                imitate: { ...prev.imitate, ...(data.proficiency.imitate || {}) },
                vocal: { ...prev.vocal, ...(data.proficiency.vocal || {}) }
              }));
            }
            if (data.blockedUsers) {
              setBlockedUsers(data.blockedUsers);
              localStorage.setItem('earforge_blocked_users', JSON.stringify(data.blockedUsers));
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user && result.user.displayName) {
        if (isProfane(result.user.displayName)) {
          let newName = window.prompt(translations[language].inappropriateUsernameError + "\n\nPlease enter a new display name:");
          while (newName !== null && (!newName.trim() || isProfane(newName))) {
            newName = window.prompt("Invalid or inappropriate username. Please choose a new valid username:");
          }
          await updateProfile(result.user, { displayName: newName ? newName.trim() : 'Player' });
        }
      }
      setViewState('guide');
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        setAuthError(error.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      if (authMode === 'signup') {
        // App Store / Play Store UGC compliance: check username profanity
        if (isProfane(displayName)) {
          setAuthError(translations[language].inappropriateUsernameError);
          setIsLoggingIn(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setViewState('guide');
    } catch (error: any) {
      console.error("Email auth failed", error);
      setAuthError(error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setViewState('auth');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      const uid = user.uid;

      // 1. Delete user profile document
      try {
        await deleteDoc(doc(db, 'user_profiles', uid));
      } catch (e) {
        console.warn("Could not delete user_profile doc:", e);
      }

      // 2. Delete aggregate player stats across all modes
      const modes: GameMode[] = ['pitch', 'interval', 'imitate', 'vocal', 'perfect_pitch'];
      for (const m of modes) {
        try {
          await deleteDoc(doc(db, 'player_stats', `${uid}_${m}`));
        } catch (e) {
          console.warn(`Could not delete player_stats for ${m}:`, e);
        }
      }

      // 3. Query and delete all user's individual session scores in leaderboard
      try {
        const q = query(collection(db, 'leaderboard'), where('userId', '==', uid));
        const snap = await getDocs(q);
        for (const scoreDoc of snap.docs) {
          await deleteDoc(doc(db, 'leaderboard', scoreDoc.id));
        }
      } catch (e) {
        console.warn("Could not delete leaderboard documents:", e);
      }

      // 4. Wipe local preferences and mappings
      localStorage.removeItem('perfectPitchMappings');
      localStorage.removeItem('perfect_pitch_mappings');
      localStorage.removeItem('earforge_blocked_users');

      // 5. Delete Firebase Auth User
      await deleteUser(user);
      setViewState('auth');
      setShowDeleteConfirm(false);
    } catch (error: any) {
      console.error("Delete account error:", error);
      if (error.code === 'auth/requires-recent-login') {
        const provider = user.providerData[0]?.providerId || 'password';
        setReauthProviderId(provider);
        setShowReauthModal(true);
      } else {
        alert(`Account deletion failed: ${error.message}`);
      }
    }
  };

  const handleConfirmReauthPassword = async (pwd: string) => {
    if (!user || !user.email) return;
    const cred = EmailAuthProvider.credential(user.email, pwd);
    await reauthenticateWithCredential(user, cred);
    await handleDeleteAccount();
  };

  const handleConfirmReauthProvider = async () => {
    if (!user) return;
    const provider = new GoogleAuthProvider();
    await reauthenticateWithPopup(user, provider);
    await handleDeleteAccount();
  };

  const handleReportUser = async (reportedUserId: string, reportedUsername: string) => {
    if (!user) {
      alert(translations[language].signInLeaderboardPrompt);
      return;
    }
    try {
      await addDoc(collection(db, 'user_reports'), {
        reportedUserId,
        reportedUsername,
        reporterUserId: user.uid,
        reason: 'inappropriate_username',
        timestamp: serverTimestamp()
      });
      setReportNotice(translations[language].reportSubmitted);
      setTimeout(() => setReportNotice(null), 4000);
    } catch (err) {
      console.error("Report error:", err);
    }
  };

  const handleBlockUser = async (userIdToBlock: string) => {
    const updated = [...blockedUsers, userIdToBlock];
    setBlockedUsers(updated);
    localStorage.setItem('earforge_blocked_users', JSON.stringify(updated));
    setReportNotice(translations[language].userBlockedNotice);
    setTimeout(() => setReportNotice(null), 4000);

    if (user) {
      try {
        const profileRef = doc(db, 'user_profiles', user.uid);
        await setDoc(profileRef, { blockedUsers: updated }, { merge: true });
      } catch (err) {
        console.error("Error saving blocked users:", err);
      }
    }
  };

  const fetchLeaderboard = async (mode: GameMode) => {
    setIsFetchingLeaderboard(true);
    setLeaderboardMode(mode);
    setShowLeaderboard(true);
    const path = 'player_stats';
    try {
      let q;
      if (mode === 'pitch') {
        q = query(
          collection(db, path),
          where('gameMode', '==', mode),
          orderBy('avgTolerance', 'asc'),
          limit(25)
        );
      } else if (mode === 'interval') {
        q = query(
          collection(db, path),
          where('gameMode', '==', mode),
          orderBy('avgAccuracy', 'desc'),
          limit(25)
        );
      } else {
        q = query(
          collection(db, path),
          where('gameMode', '==', mode),
          orderBy('avgGap', 'asc'),
          limit(25)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const scores: any[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as any;
        scores.push({ 
          id: docSnap.id, 
          ...data,
          totalCorrect: data.avgAccuracy // Display the average accuracy in the UI
        });
      });
      setLeaderboardData(scores);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setIsFetchingLeaderboard(false);
    }
  };
  
  // Modular Proficiency System
  const [proficiency, setProficiency] = useState<any>({
    pitch: { level: 1, score: 0, streak: 0, bestStreak: 0, diff: INITIAL_DIFFERENCE },
    interval: { level: 1, score: 0, streak: 0, bestStreak: 0 },
    imitate: { level: 1, score: 0, streak: 0, bestStreak: 0, totalGap: 0, attempts: 0 },
    vocal: { level: 1, score: 0, streak: 0, bestStreak: 0, totalGap: 0, attempts: 0 }
  });

  // Session Control
  const [sessionLimit, setSessionLimit] = useState<number | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [sessionStats, setSessionStats] = useState({ correct: 0, totalGap: 0, attempts: 0 });
  const [showSessionSummary, setShowSessionSummary] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Reset modal state
  const [resetModalInfo, setResetModalInfo] = useState<{
    isOpen: boolean;
    section: GameMode | 'all';
    title: string;
  }>({
    isOpen: false,
    section: 'all',
    title: ''
  });

  const handleTriggerReset = (section: GameMode | 'all', title: string) => {
    setResetModalInfo({
      isOpen: true,
      section,
      title
    });
  };

  const handleConfirmReset = async () => {
    const { section } = resetModalInfo;
    setResetModalInfo(prev => ({ ...prev, isOpen: false }));

    if (section === 'all') {
      const defaultProficiency = {
        pitch: { level: 1, score: 0, streak: 0, bestStreak: 0, diff: INITIAL_DIFFERENCE },
        interval: { level: 1, score: 0, streak: 0, bestStreak: 0 },
        imitate: { level: 1, score: 0, streak: 0, bestStreak: 0, totalGap: 0, attempts: 0 },
        vocal: { level: 1, score: 0, streak: 0, bestStreak: 0, totalGap: 0, attempts: 0 }
      };
      setProficiency(defaultProficiency);
      localStorage.removeItem('perfectPitchMappings');
      localStorage.removeItem('perfect_pitch_mappings');
      setHistory([]);
      setStatus('idle');
      setDiagStep(0);
      setDiagResults([]);
      setHasCompletedOnboarding(true);

      if (user) {
        try {
          const modes = ['pitch', 'interval', 'imitate', 'vocal'];
          for (const m of modes) {
            try {
              await deleteDoc(doc(db, 'player_stats', `${user.uid}_${m}`));
            } catch (ignored) {}
          }
          const profileRef = doc(db, 'user_profiles', user.uid);
          await setDoc(profileRef, {
            perfectPitchMappings: {},
            proficiency: defaultProficiency,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (err) {
          console.error("Error clearing cloud data:", err);
        }
      }
    } else if (section === 'perfect_pitch') {
      localStorage.removeItem('perfectPitchMappings');
      localStorage.removeItem('perfect_pitch_mappings');
      if (user) {
        try {
          const profileRef = doc(db, 'user_profiles', user.uid);
          await setDoc(profileRef, {
            perfectPitchMappings: {},
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (err) {
          console.error("Error clearing user mappings:", err);
        }
      }
    } else {
      const defaultSectionProficiency = section === 'pitch'
        ? { level: 1, score: 0, streak: 0, bestStreak: 0, diff: INITIAL_DIFFERENCE }
        : (section === 'imitate' || section === 'vocal')
        ? { level: 1, score: 0, streak: 0, bestStreak: 0, totalGap: 0, attempts: 0 }
        : { level: 1, score: 0, streak: 0, bestStreak: 0 };

      setProficiency((prev: any) => ({
        ...prev,
        [section]: defaultSectionProficiency
      }));
      if (gameMode === section) {
        setStatus('idle');
      }
      if (user) {
        try {
          await deleteDoc(doc(db, 'player_stats', `${user.uid}_${section}`));
          const profileRef = doc(db, 'user_profiles', user.uid);
          await setDoc(profileRef, {
            proficiency: {
              ...proficiency,
              [section]: defaultSectionProficiency
            },
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (err) {
          console.error(`Error clearing ${section} stats:`, err);
        }
      }
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Derived current stats
  const currentLevel = proficiency[gameMode].level;
  const currentStreak = proficiency[gameMode].streak;
  const currentBest = proficiency[gameMode].bestStreak;
  const currentDiff = gameMode === 'pitch' ? proficiency[gameMode].diff : 0;
  const currentScore = proficiency[gameMode].score;

  // ... rest of state ...

  const handleFinishIntro = () => {
    setViewState('guide');
  };

  const startSession = async (limit: number) => {
    setSessionLimit(limit);
    setSessionCount(0);
    setSessionStats({ correct: 0, totalGap: 0, attempts: 0 });
    await startNewRound();
  };

  const commitSession = async () => {
    const accuracy = (sessionStats.correct / (sessionLimit || 1)) * 100;
    const avgGap = sessionStats.attempts > 0 ? (sessionStats.totalGap / sessionStats.attempts) : 0;

    // Save to Firebase if user is logged in
    if (user) {
      const path = 'leaderboard';
      const statsPath = 'player_stats';
      try {
        // 1. Log the individual session
        await addDoc(collection(db, path), {
          userId: user.uid,
          username: user.displayName || 'Anonymous',
          gameMode: gameMode,
          score: Math.round(accuracy),
          avgGap: Number(avgGap.toFixed(2)),
          tolerance: gameMode === 'pitch' ? proficiency.pitch.diff : null,
          correctAnswers: sessionStats.correct,
          totalQuestions: sessionLimit || 0,
          timestamp: serverTimestamp()
        });

        // 2. Update aggregate player stats
        const statsRef = doc(db, statsPath, `${user.uid}_${gameMode}`);
        await runTransaction(db, async (transaction) => {
          const statsDoc = await transaction.get(statsRef);
          
          if (!statsDoc.exists()) {
            transaction.set(statsRef, {
              userId: user.uid,
              username: user.displayName || 'Anonymous',
              gameMode: gameMode,
              avgAccuracy: Math.round(accuracy),
              totalCorrect: sessionStats.correct,
              totalQuestions: sessionLimit || 0,
              avgGap: (gameMode === 'imitate' || gameMode === 'vocal') ? Number(avgGap.toFixed(2)) : null,
              avgTolerance: gameMode === 'pitch' ? Number(proficiency.pitch.diff.toFixed(2)) : null,
              totalSessions: 1,
              lastUpdated: serverTimestamp()
            });
          } else {
            const data = statsDoc.data();
            const n = data.totalSessions;
            const newAvgAccuracy = Math.round(((data.avgAccuracy * n) + accuracy) / (n + 1));
            
            let newAvgGap = data.avgGap;
            if (gameMode === 'imitate' || gameMode === 'vocal') {
               newAvgGap = Number((((data.avgGap || 0) * n) + avgGap) / (n + 1)).toFixed(2);
               newAvgGap = Number(newAvgGap);
            }

            let newAvgTolerance = data.avgTolerance;
            if (gameMode === 'pitch') {
              newAvgTolerance = Number((((data.avgTolerance || 0) * n) + proficiency.pitch.diff) / (n + 1)).toFixed(2);
              newAvgTolerance = Number(newAvgTolerance);
            }

            transaction.update(statsRef, {
              username: user.displayName || 'Anonymous',
              avgAccuracy: newAvgAccuracy,
              totalCorrect: (data.totalCorrect || 0) + sessionStats.correct,
              totalQuestions: (data.totalQuestions || 0) + (sessionLimit || 0),
              avgGap: newAvgGap ?? null,
              avgTolerance: newAvgTolerance ?? null,
              totalSessions: n + 1,
              lastUpdated: serverTimestamp()
            });
          }
        });

      } catch (error) {
        console.error("Firebase update failed:", error);
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }

    setProficiency((prev: any) => {
      const mode = prev[gameMode];
      const newStreak = sessionStats.correct >= (sessionLimit! / 2) ? mode.streak + 1 : 0;
      const newScore = mode.score + (sessionStats.correct * 100);
      const newBest = Math.max(mode.bestStreak, newStreak);
      
      let newTotalGap = (mode.totalGap || 0) + sessionStats.totalGap;
      let newAttempts = (mode.attempts || 0) + sessionStats.attempts;
      
      let newLevel = mode.level;
      if (newStreak > 0 && newStreak % 3 === 0) newLevel = Math.min(10, newLevel + 1);

      return {
        ...prev,
        [gameMode]: {
          ...mode,
          streak: newStreak,
          score: newScore,
          bestStreak: newBest,
          level: newLevel,
          totalGap: newTotalGap,
          attempts: newAttempts,
          ...(gameMode === 'pitch' ? { diff: Math.max(0.1, mode.diff * (sessionStats.correct / sessionLimit! > 0.8 ? 0.8 : 1.1)) } : {})
        }
      };
    });
    setShowSessionSummary(false);
    setSessionLimit(null);
    setSessionCount(0);
    setStatus('idle');
  };

  // Diagnostic State
  const [diagStep, setDiagStep] = useState(0);
  const [diagResults, setDiagResults] = useState<boolean[]>([]);
  const diagDiffs = [40, 20, 10, 5, 2];

  // Game specific state
  const [currentFreqs, setCurrentFreqs] = useState<{ a: number, b: number } | null>(null);
  const [currentInterval, setCurrentInterval] = useState<{ base: string, target: string, name: string } | null>(null);
  
  // Imitate State
  const [targetFreq, setTargetFreq] = useState<number | null>(null);
  const [userFreq, setUserFreq] = useState<number>(440);
  const [imitateOffset, setImitateOffset] = useState<number | null>(null);
  const [vocalRange, setVocalRange] = useState({ min: 100, max: 300 });
  const isInitialLoad = useRef(true);

  // Debounced profile persistence
  useEffect(() => {
    if (!user) return;
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    
    const timer = setTimeout(async () => {
      try {
        const profileRef = doc(db, 'user_profiles', user.uid);
        await setDoc(profileRef, {
          vocalMin: vocalRange.min,
          vocalMax: vocalRange.max,
          proficiency,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        console.error("Error saving profile:", error);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [vocalRange, proficiency, user]);

  const updateVocalRange = (newRange: { min: number; max: number }) => {
    setVocalRange(newRange);
  };
  const [isRecording, setIsRecording] = useState(false);
  const [vocalSamples, setVocalSamples] = useState<number[]>([]);
  const [micVolume, setMicVolume] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [showVocalRangeSetup, setShowVocalRangeSetup] = useState(false);

  // Audio Refs
  const synthRef = useRef<Tone.Synth | null>(null);
  const pianoRef = useRef<Tone.Sampler | null>(null);
  const micRef = useRef<Tone.UserMedia | null>(null);
  const analyzerRef = useRef<Tone.Analyser | null>(null);
  const rafRef = useRef<number | null>(null);
  const vocalSamplesRef = useRef<number[]>([]);
  const isRecordingRef = useRef<boolean>(false);

  const initAudio = useCallback(async () => {
    if (Tone.getContext().state !== 'running') {
      await Tone.getContext().resume();
      await Tone.start();
    }
    
    if (!synthRef.current) {
      synthRef.current = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.8 }
      }).toDestination();
    }

    if (!pianoRef.current) {
      pianoRef.current = new Tone.Sampler({
        urls: {
          A1: "A1.mp3",
          A2: "A2.mp3",
        },
        baseUrl: "https://tonejs.github.io/audio/salamander/",
        release: 1,
      }).toDestination();
    }

    if (!micRef.current) {
      micRef.current = new Tone.UserMedia();
    }
    if (!analyzerRef.current) {
      analyzerRef.current = new Tone.Analyser('waveform', 2048);
    }

    setAudioEnabled(true);
  }, []);

  const detectPitchLoop = useCallback(() => {
    if (!analyzerRef.current || !isRecordingRef.current) return;
    
    // Get raw waveform data
    const waveform = analyzerRef.current.getValue() as Float32Array;
    const pitch = autoCorrelate(waveform, Tone.getContext().sampleRate);
    
    if (pitch !== -1 && pitch > 80 && pitch < 1200) {
      vocalSamplesRef.current.push(pitch);
      setUserFreq(pitch);
    }
    
    // Update volume for visualizer
    let sum = 0;
    for (let i = 0; i < waveform.length; i++) {
        sum += waveform[i] * waveform[i];
    }
    setMicVolume(Math.sqrt(sum / waveform.length));

    rafRef.current = requestAnimationFrame(detectPitchLoop);
  }, []);

  useEffect(() => {
    if (isRecording) {
      isRecordingRef.current = true;
      vocalSamplesRef.current = [];
      rafRef.current = requestAnimationFrame(detectPitchLoop);
    } else {
      isRecordingRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isRecording, detectPitchLoop]);

  const startVocalRecording = async () => {
    if (!micRef.current || !analyzerRef.current) return;
    try {
      // Ensure audio context is RUNNING
      if (Tone.getContext().state !== 'running') {
        await Tone.getContext().resume();
      }

      await micRef.current.open();
      micRef.current.connect(analyzerRef.current);
      
      setMicError(null);
      setVocalSamples([]);
      setIsRecording(true);
      setStatus('recording');
      
      // Stop recording after 4 seconds for better capture
      setTimeout(() => {
        stopVocalRecording();
      }, 4000);
    } catch (e) {
      console.error("Mic access denied", e);
      setMicError("Microphone access denied or not available. Please check permissions.");
      setShowMicModal(true);
      setStatus('idle');
    }
  };

  const stopVocalRecording = () => {
    setIsRecording(false);
    isRecordingRef.current = false;
    micRef.current?.close();
    setStatus('calculating');

    // Use samples from Ref for stability
    const samples = vocalSamplesRef.current;
    if (samples.length < 5) {
      handleSelection('fail', 0);
      return;
    }

    // Filter out some garbage and find median
    const sorted = [...samples].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    setUserFreq(median);
    setVocalSamples(samples);
    
    setTimeout(() => {
      handleSelection('vocal_submit', median);
    }, 1200);
  };

  const playPitchRound = useCallback((diff: number) => {
    const isALower = Math.random() > 0.5;
    const base = 220 + Math.random() * 440;
    const freqs = isALower ? { a: base, b: base + diff } : { a: base + diff, b: base };
    
    setCurrentFreqs(freqs);
    setStatus('playing');

    const now = Tone.now();
    synthRef.current?.triggerAttackRelease(freqs.a, 0.5, now);
    synthRef.current?.triggerAttackRelease(freqs.b, 0.5, now + 0.8);

    setTimeout(() => setStatus('selecting'), 1600);
  }, []);

  const playIntervalRound = useCallback(() => {
    const baseNotes = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3'];
    const baseNote = baseNotes[Math.floor(Math.random() * baseNotes.length)];
    const interval = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
    
    const baseFreq = Tone.Frequency(baseNote).toFrequency();
    const targetFreq = baseFreq * Math.pow(2, interval.semitones / 12);
    
    setCurrentInterval({ 
      base: baseNote, 
      target: Tone.Frequency(targetFreq).toNote(),
      name: interval.label 
    });
    
    setStatus('playing');
    const now = Tone.now();
    
    // Fallback to simple synthesizer if samples aren't loaded yet
    if (pianoRef.current?.loaded) {
      pianoRef.current.triggerAttackRelease(baseNote, "2n", now);
      pianoRef.current.triggerAttackRelease(Tone.Frequency(targetFreq).toNote(), "2n", now + 0.8);
    } else {
      synthRef.current?.triggerAttackRelease(baseNote, "4n", now);
      synthRef.current?.triggerAttackRelease(Tone.Frequency(targetFreq).toNote(), "4n", now + 0.8);
    }

    setTimeout(() => setStatus('selecting'), 1600);
  }, []);

  const handleSelection = (choice: string, finalVal?: number) => {
    // Hide range setup if it was open
    setShowVocalRangeSetup(false);

    if (!hasCompletedOnboarding) {
      const isCorrect = choice === 'a' ? currentFreqs!.a < currentFreqs!.b : currentFreqs!.b < currentFreqs!.a;
      
      // Show feedback
      if (isCorrect) setStatus('correct');
      else setStatus('incorrect');

      const results = [...diagResults, isCorrect];
      setDiagResults(results);
      
          // Delayed to show feedback before next step
          setTimeout(() => {
            const nextStep = diagStep + 1;
            if (nextStep < 5) {
              setDiagStep(nextStep);
              setStatus('idle');
              // Small delay before next diag round
              setTimeout(() => playPitchRound(diagDiffs[nextStep]), 400);
            } else {
              const correctCount = results.filter(r => r).length;
              const startingLevel = correctCount === 0 ? 1 : correctCount;
              const diffMap = { 5: 2, 4: 5, 3: 10, 2: 20, 1: 40 };
              const initialDiff = diffMap[startingLevel as keyof typeof diffMap] || 40;
              
              setProficiency(prev => ({
                ...prev,
                pitch: { ...prev.pitch, level: startingLevel, diff: initialDiff }
              }));
              
              setStatus('calculating');
              setTimeout(() => {
                setHasCompletedOnboarding(true);
                setStatus('idle');
              }, 2000);
            }
          }, 1200);
          return;
        }

    const compareVal = finalVal !== undefined ? finalVal : userFreq;
    let isCorrect = false;

    if (gameMode === 'pitch') {
      isCorrect = choice === 'a' ? currentFreqs!.a < currentFreqs!.b : currentFreqs!.b < currentFreqs!.a;
    } else if (gameMode === 'interval') {
      isCorrect = choice === currentInterval!.name;
    } else if (gameMode === 'imitate') {
      const diff = Math.abs(compareVal - targetFreq!);
      isCorrect = diff < Math.max(1, 10 - currentLevel); 
      setImitateOffset(diff);
    } else if (gameMode === 'vocal') {
      if (choice === 'fail') {
        isCorrect = false;
        setImitateOffset(999);
      } else {
        const diff = Math.abs(compareVal - targetFreq!);
        const ratio = Math.max(compareVal / targetFreq!, targetFreq! / compareVal);
        const cents = 1200 * Math.log2(ratio);
        isCorrect = cents < 100; 
        setImitateOffset(diff);
      }
    }

    const currentGap = (gameMode === 'imitate' || gameMode === 'vocal') && choice !== 'fail' ? Math.abs(compareVal - targetFreq!) : 0;

    setSessionStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      totalGap: prev.totalGap + currentGap,
      attempts: prev.attempts + ((gameMode === 'imitate' || gameMode === 'vocal') && choice !== 'fail' ? 1 : 0)
    }));

    setSessionCount(prev => prev + 1);

    setHistory(prev => [{
      id: Math.random().toString(),
      type: gameMode,
      correct: isCorrect,
      intensity: gameMode === 'pitch' ? `${currentDiff.toFixed(1)}Hz` : 
                 gameMode === 'interval' ? currentInterval!.name : 
                 `${Math.abs(compareVal - targetFreq!).toFixed(1)}Hz Δ`
    }, ...prev].slice(0, 10));

    if (isCorrect) {
      setStatus('correct');
    } else {
      setStatus('incorrect');
    }

    if (sessionCount + 1 >= (sessionLimit || 999)) {
      setTimeout(() => setStatus('session_summary'), 1500);
    }
  };

  const playImitateRound = useCallback(() => {
    const base = 220 + Math.random() * 220; // Lower range for imitation
    setTargetFreq(base);
    setUserFreq(440); 
    setImitateOffset(null);
    setStatus('playing');

    const now = Tone.now();
    synthRef.current?.triggerAttackRelease(base, 2.0, now);

    setTimeout(() => setStatus('selecting'), 2200);
  }, []);

  const playVocalRound = useCallback(() => {
    const range = vocalRange.max - vocalRange.min;
    const base = vocalRange.min + Math.random() * range;
    setTargetFreq(base);
    setUserFreq(0);
    setVocalSamples([]);
    setImitateOffset(null);
    setStatus('playing');

    const now = Tone.now();
    synthRef.current?.triggerAttackRelease(base, 2.5, now);

    setTimeout(() => setStatus('selecting'), 2700);
  }, [vocalRange]);

  const skipOnboarding = () => {
    setProficiency(prev => ({
      ...prev,
      pitch: { ...prev.pitch, level: 1, diff: 40 }
    }));
    setHasCompletedOnboarding(true);
    setStatus('idle');
  };

  const startNewRound = async () => {
    setShowVocalRangeSetup(false);
    if (!audioEnabled) {
      await initAudio();
    }
    if (Tone.getContext().state !== 'running') {
      await Tone.getContext().resume();
    }
    if (gameMode === 'pitch') playPitchRound(currentDiff);
    else if (gameMode === 'interval') playIntervalRound();
    else if (gameMode === 'imitate') playImitateRound();
    else playVocalRound();
  };

  const playUserGuess = async () => {
    if (!audioEnabled) return;
    if (Tone.getContext().state !== 'running') {
      await Tone.getContext().resume();
    }
    synthRef.current?.triggerAttackRelease(userFreq, 0.5);
  };

  const replay = async () => {
    if (!audioEnabled || status !== 'selecting' || isReplaying) return;
    setIsReplaying(true);
    if (Tone.getContext().state !== 'running') {
      await Tone.getContext().resume();
    }
    const now = Tone.now();
    let duration = 2.0;

    if (gameMode === 'pitch' && currentFreqs) {
      synthRef.current?.triggerAttackRelease(currentFreqs.a, 0.5, now);
      synthRef.current?.triggerAttackRelease(currentFreqs.b, 0.5, now + 0.8);
      duration = 1.6;
    } else if (gameMode === 'interval' && currentInterval) {
      if (pianoRef.current?.loaded) {
        pianoRef.current.triggerAttackRelease(currentInterval.base, "2n", now);
        pianoRef.current.triggerAttackRelease(currentInterval.target, "2n", now + 0.8);
      } else {
        synthRef.current?.triggerAttackRelease(currentInterval.base, "4n", now);
        synthRef.current?.triggerAttackRelease(currentInterval.target, "4n", now + 0.8);
      }
      duration = 1.6;
    } else if (gameMode === 'imitate' && targetFreq) {
      synthRef.current?.triggerAttackRelease(targetFreq, 2.0, now);
      duration = 2.2;
    } else if (gameMode === 'vocal' && targetFreq) {
      synthRef.current?.triggerAttackRelease(targetFreq, 2.5, now);
      duration = 2.7;
    }

    setTimeout(() => setIsReplaying(false), duration * 1000);
  };

  const handleNextPhase = async () => {
    if (sessionLimit && sessionCount >= sessionLimit) {
      setStatus('session_summary');
    } else {
      await startNewRound();
    }
  };

  const resetGame = () => {
    setProficiency({
      pitch: { level: 1, score: 0, streak: 0, bestStreak: 0, diff: INITIAL_DIFFERENCE },
      interval: { level: 1, score: 0, streak: 0, bestStreak: 0 },
      imitate: { level: 1, score: 0, streak: 0, bestStreak: 0, totalGap: 0, attempts: 0 },
      vocal: { level: 1, score: 0, streak: 0, bestStreak: 0, totalGap: 0, attempts: 0 }
    });
    setHistory([]);
    setStatus('idle');
    setDiagStep(0);
    setDiagResults([]);
    setHasCompletedOnboarding(true);
  };

  // --- Main Render ---
  return (
    <div className="relative min-h-screen bg-bg-dark">
      {/* Sidebar is only available in these views */}
      {(viewState === 'guide' || viewState === 'home' || viewState === 'app' || viewState === 'settings' || viewState === 'perfect_pitch') && (
        <>
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            currentView={viewState}
            onNavigate={(view) => navigateTo(view)}
            onOpenLeaderboard={() => fetchLeaderboard(gameMode)}
            currentTheme={theme}
            onSelectTheme={setTheme}
            language={language}
          />
          
          {/* Mobile Global Header */}
          <div className="md:hidden fixed top-0 left-0 right-0 h-16 z-[80] bg-card-dark/95 backdrop-blur-md border-b border-green-900/10 flex items-center justify-between px-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-green-900/5 transition-colors border border-green-900/10"
            >
              <Menu className="w-5 h-5 text-accent-dark" />
            </button>
            <div className="text-accent-dark font-bold text-lg tracking-[0.2em] absolute left-1/2 -translate-x-1/2">
              EARFORGE
            </div>
            <button 
              onClick={() => navigateTo('settings')}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-green-900/5 transition-colors border border-green-900/10"
            >
              <UserIcon className="w-5 h-5 text-accent-dark" />
            </button>
          </div>

          {/* Desktop Hamburger Icon */}
          <div className="hidden md:block fixed top-4 left-4 z-[80]">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-green-900/10 flex items-center justify-center hover:bg-green-900/10 transition-colors shadow-lg shadow-black/10"
            >
              <Menu className="w-5 h-5 text-accent-dark" />
            </button>
          </div>

          {/* Swipe handle to open sidebar */}
          {!isSidebarOpen && (
            <motion.div 
              className="fixed left-0 top-0 bottom-0 w-8 z-[70] cursor-e-resize"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 50) {
                  setIsSidebarOpen(true);
                }
              }}
            />
          )}
        </>
      )}

      <AnimatePresence mode="wait">
        {viewState === 'intro' ? (
          <motion.div key="intro" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <IntroView onFinish={handleFinishIntro} />
          </motion.div>
        ) : viewState === 'auth' ? (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <AuthView 
              user={user}
              authMode={authMode}
              setAuthMode={setAuthMode}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              displayName={displayName}
              setDisplayName={setDisplayName}
              authError={authError}
              isLoggingIn={isLoggingIn}
              handleEmailAuth={handleEmailAuth}
              handleLogin={handleLogin}
              language={language}
              onShowPrivacy={() => setShowPrivacyModal(true)}
              onShowTerms={() => setShowTermsModal(true)}
            />
          </motion.div>
        ) : viewState === 'guide' ? (
          <motion.div key="guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="min-h-screen flex flex-col">
             <GuideView language={language} />
          </motion.div>
        ) : viewState === 'settings' ? (
          <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <SettingsView 
              user={user}
              onBack={() => navigateTo('home')}
              onLogout={handleLogout}
              onDeleteAccount={handleDeleteAccount}
              showDeleteConfirm={showDeleteConfirm}
              setShowDeleteConfirm={setShowDeleteConfirm}
              onResetSection={handleTriggerReset}
              language={language}
              onSelectLanguage={setLanguage}
              onShowPrivacy={() => setShowPrivacyModal(true)}
              onShowTerms={() => setShowTermsModal(true)}
            />
          </motion.div>
        ) : viewState === 'perfect_pitch' ? (
          <motion.div key="perfect_pitch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="min-h-screen">
            <PerfectPitchModule onBack={() => navigateTo('home')} language={language} />
          </motion.div>
        ) : viewState === 'home' ? (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <HomeView 
              user={user}
              language={language}
              onSelectMode={(mode) => {
                if (mode === 'perfect_pitch') {
                  navigateTo('perfect_pitch');
                } else {
                  setGameMode(mode);
                  setStatus('idle');
                  setShowVocalRangeSetup(false);
                  navigateTo('app');
                }
              }}
              onOpenSettings={() => navigateTo('settings')}
            />
          </motion.div>
        ) : (
          <motion.div 
            key="app" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="min-h-screen bg-bg-dark text-gray-800 font-sans flex flex-col"
          >
            {/* Header */}
        <header className="relative px-4 md:px-12 py-2 md:py-6 flex justify-between items-center border-b border-green-900/10 bg-white/80 sticky top-16 md:top-0 z-40 md:z-50 backdrop-blur-md">
          {/* Left: Back Button */}
          <div className="flex items-center md:pl-12">
            <button 
              onClick={() => { setStatus('idle'); navigateTo('home'); }} 
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-900/5 flex items-center justify-center hover:bg-green-900/10 transition-colors border border-green-900/10 relative z-10"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-700 hover:text-gray-900 rotate-180" />
            </button>
            <div className="text-green-700 font-bold text-base md:text-xl tracking-[0.2em] whitespace-nowrap hidden md:block ml-4 relative z-10">
              {gameMode === 'pitch' ? 'FREQUENCY MATCH' : gameMode === 'interval' ? 'INTERVAL RECOGNITION' : gameMode === 'imitate' ? 'FREQUENCY IMITATION' : 'VOCAL PITCH'}
            </div>
          </div>

          {/* Center: Tolerance / Level */}
          <div className="absolute inset-0 flex gap-4 md:gap-8 items-center justify-center pointer-events-none">
          {gameMode === 'pitch' && (
            <div className="text-center pointer-events-auto">
              <p className="text-gray-500 text-[9px] md:text-[10px] uppercase tracking-wider mb-0.5 font-bold">{t.tolerance}</p>
              <p className="text-green-700 font-mono font-bold leading-none text-xs md:text-sm">{proficiency.pitch.diff.toFixed(1)}Hz</p>
            </div>
          )}
          {(gameMode === 'imitate' || gameMode === 'vocal') && (
            <div className="text-center pointer-events-auto">
              <p className="text-gray-500 text-[9px] md:text-[10px] uppercase tracking-wider mb-0.5 font-bold">{t.avgGap}</p>
              <p className="text-green-700 font-mono font-bold leading-none text-xs md:text-sm">
                {proficiency[gameMode].attempts > 0 
                  ? (proficiency[gameMode].totalGap / proficiency[gameMode].attempts).toFixed(1) 
                  : '0.0'}Hz
              </p>
            </div>
          )}
          <div className="text-center pointer-events-auto">
            <p className="text-gray-500 text-[9px] md:text-[10px] uppercase tracking-wider mb-0.5 font-bold">{t.level}</p>
            <p className="text-green-700 font-mono font-bold text-sm md:text-lg leading-none">{currentLevel}</p>
          </div>
          </div>
          
          {/* Right: Reset Button */}
          <div className="flex items-center relative z-10">
            <button 
              onClick={() => handleTriggerReset(
                gameMode, 
                gameMode === 'pitch' ? t.pitchDetectionTitle : 
                gameMode === 'interval' ? t.intervalRecognitionTitle : 
                gameMode === 'imitate' ? t.frequencyImitationTitle : t.vocalPitchTitle
              )}
              className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all border border-red-200 text-[9px] md:text-[10px] font-bold uppercase tracking-wider"
              title="Reset this section"
            >
              RESET
            </button>
          </div>
        </header>
      {/* Main Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-4 md:py-8 relative">
        {status === 'idle' && (
          <div className="text-center mt-20 md:mt-16 mb-3 md:mb-10 max-w-xl mx-auto px-4">
            <h2 className="text-[26px] font-[Arial,sans-serif] text-black mb-1.5 md:mb-2 italic tracking-tight leading-tight">
              {gameMode === 'pitch' ? t.identifyLowerPitch : 
               gameMode === 'interval' ? t.identifyInterval :
               gameMode === 'imitate' ? t.matchTargetFrequency :
               t.vocalPitchDetection}
            </h2>
            <p className="text-black text-[12px] tracking-wide font-[Arial,sans-serif] uppercase opacity-100">
              {gameMode === 'pitch' ? t.selectLowerFrequency : 
               gameMode === 'interval' ? t.listenIntervalNotes :
               gameMode === 'imitate' ? t.adjustDial :
               t.imitateWithVoice}
            </p>
          </div>
        )}
        <div className="w-full flex flex-col items-center justify-center flex-1">
          {status === 'selecting' && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={replay}
              disabled={isReplaying}
              className="mb-6 md:mb-10 flex items-center gap-2.5 px-6 py-2.5 bg-accent-dark/5 hover:bg-accent-dark/10 border border-accent-dark/20 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-accent-dark transition-all active:scale-95 z-40 backdrop-blur-sm disabled:opacity-20 disabled:scale-100"
            >
              <RotateCcw className={`w-4 h-4 ${isReplaying ? 'animate-spin' : ''}`} /> {t.replaySound}
            </motion.button>
          )}
          {status === 'idle' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-sm md:max-w-md"
            >
              {!showVocalRangeSetup ? (
                <>
                  <div className="text-center w-full">
                    <p className="font-[Arial,sans-serif] text-[12px] text-black uppercase tracking-[0.3em] mb-4 md:mb-6">{t.selectSessionIntensity}</p>
                    <div className="flex justify-center gap-2 md:gap-4">
                      {[5, 10, 20].map(limit => (
                        <button
                          key={limit}
                          onClick={() => startSession(limit)}
                          className="w-16 md:w-24 h-16 md:h-24 rounded-2xl border border-green-900/10 bg-card-dark hover:border-accent-dark hover:text-accent-dark transition-all flex flex-col items-center justify-center group active:scale-95 touch-manipulation"
                        >
                          <span className="text-xl md:text-3xl font-bold leading-none mb-1">{limit}</span>
                          <span className="hidden md:inline-block text-[8px] md:text-[10px] font-mono opacity-40 group-hover:opacity-100 uppercase tracking-widest">Q's</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[12px] font-[Arial,sans-serif] text-black uppercase tracking-widest text-center px-6">{t.questionsPerSession}</p>

                  {gameMode === 'vocal' && (
                    <button 
                      onClick={() => setShowVocalRangeSetup(true)}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 md:py-4 bg-green-900/5 hover:bg-green-900/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-green-900/10 mt-3 md:mt-4"
                    >
                      <Settings2 className="w-4 h-4 text-accent-dark" /> {t.configureVocalRange}
                    </button>
                  )}
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full p-6 md:p-8 bg-card-dark rounded-[24px] md:rounded-[32px] border border-green-900/20 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-4 md:mb-8">
                    <button 
                      onClick={() => setShowVocalRangeSetup(false)}
                      className="p-2 hover:bg-green-900/5 rounded-full transition-all"
                    >
                      <Plus className="w-5 h-5 rotate-45 text-text-muted" />
                    </button>
                    <p className="font-mono text-[10px] md:text-[12px] text-gray-900 font-bold uppercase tracking-[0.2em]">Vocal Range Setup</p>
                    <div className="w-9" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6 md:mb-10">
                    {[
                      { name: 'Bass', min: 100, max: 300 },
                      { name: 'Bariton', min: 150, max: 350 },
                      { name: 'Tenor', min: 200, max: 400 },
                      { name: 'Alto', min: 200, max: 400 },
                      { name: 'Mezzo', min: 250, max: 400 },
                      { name: 'Soprano', min: 350, max: 600 },
                    ].map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => updateVocalRange({ min: preset.min, max: preset.max })}
                        className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${vocalRange.min === preset.min && vocalRange.max === preset.max ? 'bg-accent-dark text-white border-accent-dark' : 'bg-green-900/5 text-text-muted border-green-900/10 hover:border-green-900/20'}`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4 md:space-y-8">
                    <div>
                      <div className="flex justify-between text-[9px] md:text-[10px] font-mono text-text-muted uppercase mb-2 md:mb-3">
                        <span>Min: {vocalRange.min}Hz</span>
                        <span className="text-accent-dark">Floor</span>
                      </div>
                      <input 
                        type="range" min="50" max="400" step="1"
                        value={vocalRange.min}
                        onChange={(e) => {
                          const newMin = Math.min(vocalRange.max - 20, parseInt(e.target.value));
                          updateVocalRange({ ...vocalRange, min: newMin });
                        }}
                        className="w-full h-1.5 bg-green-900/10 rounded-lg appearance-none cursor-pointer accent-accent-dark"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] md:text-[10px] font-mono text-text-muted uppercase mb-2 md:mb-3">
                        <span>Max: {vocalRange.max}Hz</span>
                        <span className="text-accent-dark">Ceiling</span>
                      </div>
                      <input 
                        type="range" min="150" max="800" step="1"
                        value={vocalRange.max}
                        onChange={(e) => {
                          const newMax = Math.max(vocalRange.min + 20, parseInt(e.target.value));
                          updateVocalRange({ ...vocalRange, max: newMax });
                        }}
                        className="w-full h-1.5 bg-green-900/10 rounded-lg appearance-none cursor-pointer accent-accent-dark"
                      />
                    </div>
                  </div>

                  <div className="mt-6 md:mt-10 pt-4 md:pt-8 border-t border-green-900/10">
                    <p className="font-mono text-[9px] md:text-[10px] text-text-muted uppercase tracking-[0.2em] mb-4 md:mb-6 text-center">Preview Selected Range</p>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-2 md:gap-3">
                      <button 
                        onClick={async () => {
                          if (!audioEnabled) await initAudio();
                          if (Tone.getContext().state !== 'running') await Tone.getContext().resume();
                          synthRef.current?.triggerAttackRelease(vocalRange.min, "4n");
                        }}
                        className="py-3 md:py-4 bg-green-900/5 hover:bg-green-900/10 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-bold uppercase transition-all"
                      >
                        <Volume2 className="w-3 h-3 md:w-4 md:h-4 text-accent-dark" /> Hear Floor
                      </button>
                      <button 
                        onClick={async () => {
                          if (!audioEnabled) await initAudio();
                          if (Tone.getContext().state !== 'running') await Tone.getContext().resume();
                          synthRef.current?.triggerAttackRelease(vocalRange.max, "4n");
                        }}
                        className="py-3 md:py-4 bg-green-900/5 hover:bg-green-900/10 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-bold uppercase transition-all"
                      >
                        <Volume2 className="w-3 h-3 md:w-4 md:h-4 text-accent-dark" /> Hear Ceiling
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setShowVocalRangeSetup(false);
                      // Provide quick logic feedback or just closure as intended
                    }}
                    className="w-full mt-6 md:mt-8 py-3 md:py-4 bg-accent-dark text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Apply & Save Range
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}


          {status === 'session_summary' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm md:max-w-lg bg-card-dark border border-accent-dark/30 rounded-3xl p-8 md:p-10 text-center shadow-2xl shadow-accent-dark/10"
            >
              <Brain className="w-10 h-10 md:w-12 md:h-12 text-accent-dark mx-auto mb-4 md:mb-6" />
              <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-2 uppercase">Session Complete</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4 my-6 md:my-8 text-center">
                <div className="bg-green-900/5 p-4 rounded-xl">
                  <p className="text-[9px] md:text-[10px] text-text-muted uppercase font-mono mb-1">Accuracy</p>
                  <p className="text-xl md:text-2xl font-bold text-accent-dark">{((sessionStats.correct / (sessionLimit || 1)) * 100).toFixed(0)}%</p>
                </div>
                <div className="bg-green-900/5 p-4 rounded-xl">
                  <p className="text-[9px] md:text-[10px] text-text-muted uppercase font-mono mb-1">
                    {gameMode === 'imitate' || gameMode === 'vocal' ? 'Avg Gap' : 'Hits'}
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-accent-dark">
                    {gameMode === 'imitate' || gameMode === 'vocal'
                      ? `${sessionStats.attempts > 0 ? (sessionStats.totalGap / sessionStats.attempts).toFixed(1) : '0.0'}Hz`
                      : `${sessionStats.correct}/${sessionLimit}`
                    }
                  </p>
                </div>
              </div>
              <p className="text-xs md:text-sm text-text-muted mb-8 italic px-4">Integrate metrics into EarForge record?</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={commitSession}
                  className="w-full py-4 bg-accent-dark text-white font-bold rounded-xl uppercase tracking-widest text-[10px] md:text-xs hover:scale-[1.02] active:scale-[0.98] transition-all touch-manipulation"
                >
                  Save Results
                </button>
                <button 
                  onClick={() => { setStatus('idle'); setSessionLimit(null); setSessionCount(0); }}
                  className="w-full py-4 border border-green-900/20 text-text-muted font-bold rounded-xl uppercase tracking-widest text-[10px] md:text-xs hover:bg-green-900/5 transition-all touch-manipulation"
                >
                  Discard
                </button>
              </div>
            </motion.div>
          )}

          {status !== 'idle' && status !== 'session_summary' && (
            <>
              {sessionLimit && (
                <div className="w-full max-w-sm md:max-w-xl mb-4 md:mb-6 px-4">
                  <div className="flex justify-between items-center mb-2 md:mb-3">
                    <span className="text-xs md:text-sm font-mono text-text-muted uppercase tracking-widest leading-none">Session Progress</span>
                    <span className="text-xs md:text-sm font-mono text-accent-dark uppercase leading-none font-bold">{sessionCount}/{sessionLimit}</span>
                  </div>
                  <div className="w-full h-1 bg-green-900/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(sessionCount / (sessionLimit || 1)) * 100}%` }}
                      className="h-full bg-accent-dark shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                    />
                  </div>
                </div>
              )}

              {gameMode === 'pitch' ? (
                <div className={`w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-12 transition-all duration-500`}>
                  {['a', 'b'].map((id) => (
                    <motion.div
                      key={id}
                      whileHover={status === 'selecting' && !isMobile ? { y: -4, borderColor: '#4ADE80' } : {}}
                      className={`
                        bg-card-dark border rounded-xl p-4 md:p-6 flex flex-col items-center transition-all relative overflow-hidden group active:scale-[0.98] touch-manipulation min-h-[100px] md:min-h-[140px] justify-center
                        ${status === 'selecting' ? 'cursor-pointer hover:bg-[#20503B] border-border-dark' : 'border-transparent opacity-80 cursor-default'}
                      `}
                      onClick={() => status === 'selecting' && handleSelection(id)}
                    >
                      <Play className={`w-4 h-4 md:w-8 md:h-8 md:mb-2 transition-colors ${status === 'playing' ? 'text-accent-dark animate-pulse' : 'text-gray-900/10 group-hover:text-accent-dark'}`} />
                      <h3 className="text-gray-900 text-base md:text-xl font-extralight tracking-tight uppercase">Sound {id}</h3>
                      
                      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent-dark to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                </div>
              ) : gameMode === 'interval' ? (
                <div className={`w-full max-w-5xl mb-6 md:mb-12 transition-all duration-500 px-4`}>
                  <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3 transition-opacity ${status === 'selecting' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                     {INTERVALS.map((int) => (
                       <button
                         key={int.name}
                         onClick={() => handleSelection(int.label)}
                         className="bg-card-dark border border-green-900/10 rounded-xl md:rounded-lg py-3.5 px-2 md:py-4 md:px-1 min-h-[48px] md:min-h-0 flex items-center justify-center hover:bg-accent-dark hover:text-white transition-all text-xs sm:text-[10px] md:text-[11px] font-bold uppercase tracking-tight md:tracking-tighter active:scale-95 touch-manipulation text-center"
                       >
                         {int.label}
                       </button>
                     ))}
                  </div>
                  {status === 'playing' && (
                    <div className="mt-8 flex justify-center items-center gap-4 text-accent-dark font-mono text-[10px] md:text-xs uppercase animate-pulse">
                      <Piano className="w-4 h-4" /> Synthesizing Harmonics...
                    </div>
                  )}
                </div>
              ) : gameMode === 'imitate' ? (
                <div className={`w-full max-w-lg mb-6 md:mb-12 bg-card-dark border border-green-900/10 rounded-2xl p-5 md:p-10 flex flex-col items-center transition-all duration-500`}>
                  <div className="mb-4 md:mb-8 text-center px-4">
                     <Volume2 className={`w-8 h-8 md:w-12 md:h-12 mx-auto mb-3 text-gray-900/20`} />
                     <p className="font-mono text-xs md:text-xs text-text-muted uppercase tracking-widest">Tuning Oscillator V.01</p>
                  </div>

                  <div className="w-full mb-6 md:mb-10 flex items-center gap-2 md:gap-4 px-2">
                    <button 
                      disabled={status !== 'selecting'}
                      onClick={() => {
                        const newVal = Math.max(220, userFreq - 0.1);
                        setUserFreq(newVal);
                        if (status === 'selecting') playUserGuess();
                      }}
                      className="w-10 h-10 md:w-10 md:h-10 flex items-center justify-center bg-green-900/5 active:bg-green-900/10 rounded-lg transition-colors disabled:opacity-20 touch-manipulation"
                    >
                      <Minus className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent-dark" />
                    </button>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs md:text-[10px] font-mono text-text-muted uppercase mb-3 items-center">
                          <span>220Hz</span>
                          <span className="text-accent-dark font-bold underline decoration-accent-dark/30 underline-offset-4 tracking-wider text-xs md:text-[10px]">{userFreq.toFixed(1)}Hz Input</span>
                          <span>660Hz</span>
                      </div>
                      <input 
                        type="range" min="220" max="660" step="0.1" 
                        value={userFreq}
                        onChange={(e) => {
                          setUserFreq(parseFloat(e.target.value));
                          if (status === 'selecting') playUserGuess();
                        }}
                        disabled={status !== 'selecting'}
                        className="w-full h-1.5 md:h-2 bg-green-900/10 rounded-lg appearance-none cursor-pointer accent-accent-dark touch-manipulation"
                      />
                    </div>
                    <button 
                      disabled={status !== 'selecting'}
                      onClick={() => {
                        const newVal = Math.min(660, userFreq + 0.1);
                        setUserFreq(newVal);
                        if (status === 'selecting') playUserGuess();
                      }}
                      className="w-10 h-10 md:w-10 md:h-10 flex items-center justify-center bg-green-900/5 active:bg-green-900/10 rounded-lg transition-colors disabled:opacity-20 touch-manipulation"
                    >
                      <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent-dark" />
                    </button>
                  </div>

                  <button 
                    disabled={status !== 'selecting'}
                    onClick={() => handleSelection('submit')}
                    className="w-full py-4 bg-accent-dark text-white font-bold rounded-xl uppercase tracking-widest text-xs md:text-xs hover:bg-opacity-90 active:scale-[0.98] transition-all disabled:opacity-20 touch-manipulation"
                  >
                    Confirm Frequency Match
                  </button>
                </div>
              ) : (
                <div className={`w-full max-w-lg mb-6 md:mb-12 bg-card-dark border border-green-900/10 rounded-2xl p-6 md:p-10 flex flex-col items-center transition-all duration-500`}>
                  <div className="mb-4 md:mb-8 text-center px-4">
                     <div className={`w-12 h-12 md:w-20 md:h-20 rounded-full border border-green-900/20 flex items-center justify-center mb-3 md:mb-6 relative`}>
                        {status === 'recording' && <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity }} className="absolute inset-1 bg-accent-dark/20 rounded-full" />}
                     <Mic className={`w-6 h-6 md:w-10 md:h-10 ${status === 'recording' ? 'text-accent-dark' : micError ? 'text-red-500' : 'text-gray-900/10'}`} />
                     </div>
                     <p className="font-mono text-xs md:text-[9px] text-text-muted uppercase tracking-widest">
                       {micError || 'Listening for fundamental frequency...'}
                     </p>
                     {status === 'recording' && userFreq > 0 && (
                       <p className="text-accent-dark font-mono text-xl md:text-3xl mt-2 md:mt-4 font-bold leading-none">{userFreq.toFixed(1)} Hz</p>
                     )}
                  </div>

                  <button 
                    disabled={status === 'recording'}
                    onClick={startVocalRecording}
                    className="w-full py-4 bg-accent-dark text-white font-bold rounded-xl uppercase tracking-widest text-[10px] md:text-xs hover:bg-opacity-90 active:scale-[0.98] transition-all disabled:opacity-20 flex items-center justify-center gap-2 touch-manipulation"
                  >
                    <Mic className="w-4 h-4" /> 
                    {status === 'recording' ? 'LISTENING...' : 'Engage Voice Stream'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

            {/* Visualizer */}
            <div className="flex gap-1 items-center justify-center h-6 md:h-12 mt-1 md:mt-2 mb-3 md:mb-8">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-[3px] bg-accent-dark rounded-full"
                  animate={status === 'recording' ? {
                    height: 10 + (micVolume * 300),
                    opacity: 0.1 + (micVolume * 4)
                  } : (status === 'playing' || (gameMode === 'imitate' && status === 'selecting')) ? {
                    height: [10, 30, 45, 30, 10][i % 5],
                    opacity: [0.1, 0.4, 0.6, 0.4, 0.1][i % 5]
                  } : { height: 10, opacity: 0.1 }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.05 }}
                />
              ))}
            </div>

            <AnimatePresence>
              {(status === 'correct' || status === 'incorrect') && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className={`absolute inset-0 flex flex-col items-center justify-center z-40 px-6`}
                >
                  <div className={`w-full max-w-sm md:max-w-md p-8 md:p-12 rounded-[2.5rem] bg-bg-dark/80 backdrop-blur-xl border border-green-900/20 shadow-2xl flex flex-col items-center text-center ${status === 'correct' ? 'text-accent-dark' : 'text-[#FF4444]'}`}>
                    {status === 'correct' ? <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 mb-4" /> : <XCircle className="w-12 h-12 md:w-16 md:h-16 mb-4" />}
                    <h2 className="text-xl md:text-2xl font-bold tracking-[0.2em] mb-3 font-mono uppercase leading-tight">
                      {status === 'correct' ? 'CORRECT' : 'INCORRECT'}
                    </h2>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-text-muted text-[10px] md:text-xs font-mono tracking-widest uppercase opacity-80">
                        {(gameMode === 'imitate' || gameMode === 'vocal') && imitateOffset !== null && `${imitateOffset.toFixed(1)}Hz deviance recorded`}
                      </p>
                      {(gameMode === 'imitate' || gameMode === 'vocal') && (
                        <div className="flex flex-wrap justify-center gap-2 md:gap-4 px-4 py-2 mt-4 bg-green-900/5 rounded-2xl border border-green-900/10 font-mono text-[9px] md:text-[10px] tracking-widest uppercase">
                          <span className="text-accent-dark/60 whitespace-nowrap">Target: {targetFreq?.toFixed(1)}Hz</span>
                          <span className="text-gray-900/60 whitespace-nowrap">Capture: {userFreq.toFixed(1)}Hz</span>
                        </div>
                      )}
                      <button 
                        onClick={handleNextPhase}
                        className={`mt-8 md:mt-10 px-10 md:px-14 py-4 bg-white text-gray-900 font-bold rounded-2xl uppercase tracking-widest text-[10px] md:text-xs hover:bg-accent-dark transition-all shadow-xl shadow-green-900/5 flex items-center justify-center gap-3 w-full active:scale-95 touch-manipulation`}
                      >
                        NEXT <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
              {status === 'recording' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-10 flex flex-col items-center">
                   <div className="text-accent-dark font-mono text-xs animate-pulse">ANALYZING VOCAL STREAM...</div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Footer */}
          <footer className="hidden md:flex px-6 md:px-12 py-6 bg-white/90 border-t border-green-900/10 flex-wrap gap-6 justify-between items-center text-xs">
            <div className="flex-1 flex justify-center">
               <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] opacity-40">Earforge Precision Audio engine // v2.4</p>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {showLeaderboard && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-xl"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-md bg-card-dark border border-green-900/20 rounded-[32px] overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-green-900/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-accent-dark" /> {t.leaderboard}
                </h3>
                <button 
                  onClick={() => setShowLeaderboard(false)}
                  className="p-2 hover:bg-green-900/5 rounded-full transition-all"
                >
                  <Plus className="w-5 h-5 rotate-45 text-text-muted" />
                </button>
              </div>
              <div className="flex p-1 bg-green-900/5 rounded-xl border border-green-900/10 overflow-x-auto no-scrollbar">
                {(['pitch', 'interval', 'imitate', 'vocal'] as GameMode[]).map((m) => {
                  const label = m === 'pitch' ? t.pitchDetectionTitle :
                                m === 'interval' ? t.intervalRecognitionTitle :
                                m === 'imitate' ? t.frequencyImitationTitle : t.vocalPitchTitle;
                  return (
                    <button
                      key={m}
                      onClick={() => fetchLeaderboard(m)}
                      className={`flex-1 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${leaderboardMode === m ? 'bg-accent-dark text-white' : 'text-text-muted hover:text-gray-900'}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto no-scrollbar">
              {reportNotice && (
                <div className="mb-4 p-3 bg-accent-dark/10 border border-accent-dark/20 text-accent-dark text-xs rounded-xl text-center font-medium">
                  {reportNotice}
                </div>
              )}
              {isFetchingLeaderboard ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-8 h-8 text-accent-dark animate-spin" />
                  <p className="text-[10px] font-mono text-text-muted uppercase tracking-[0.3em]">{t.syncingWithCloud}</p>
                </div>
              ) : leaderboardData.filter(item => !blockedUsers.includes(item.userId)).length > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between px-4 pb-2 text-[10px] font-mono text-text-muted uppercase tracking-widest border-b border-green-900/10 mb-4">
                    <span>{t.nameColumn}</span>
                    <span>{leaderboardMode === 'pitch' ? t.toleranceColumn : leaderboardMode === 'interval' ? t.accuracyColumn : t.gapColumn}</span>
                  </div>
                  {leaderboardData
                    .filter(item => !blockedUsers.includes(item.userId))
                    .map((item, idx) => (
                    <div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl border ${item.userId === user?.uid ? 'bg-accent-dark/10 border-accent-dark/30' : 'bg-green-900/5 border-green-900/10'}`}>
                      <div className="flex items-center gap-4 min-w-0">
                        <span className={`w-4 text-[10px] font-mono font-bold ${idx < 3 ? 'text-accent-dark' : 'text-text-muted'}`}>{idx + 1}</span>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-gray-900 truncate">{item.username}</p>
                            {user && item.userId !== user.uid && (
                              <div className="flex items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReportUser(item.userId, item.username);
                                  }}
                                  className="p-1 text-gray-500 hover:text-red-500 rounded transition-colors"
                                  title={t.reportUser}
                                  aria-label={t.reportUser}
                                >
                                  <Flag className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBlockUser(item.userId);
                                  }}
                                  className="p-1 text-gray-500 hover:text-red-500 rounded transition-colors"
                                  title={t.blockUser}
                                  aria-label={t.blockUser}
                                >
                                  <Ban className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-[8px] text-text-muted uppercase font-mono tracking-tighter">
                            {item.totalSessions} {t.sessionsAveraged}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-accent-dark leading-none">
                          {leaderboardMode === 'pitch' && item.avgTolerance != null && `${item.avgTolerance.toFixed(1)}Hz`}
                          {leaderboardMode === 'interval' && item.totalCorrect != null && `${item.totalCorrect}%`}
                          {(leaderboardMode === 'imitate' || leaderboardMode === 'vocal') && item.avgGap != null && `${item.avgGap}Hz`}
                          {(leaderboardMode === 'pitch' && item.avgTolerance == null) && '—'}
                          {(leaderboardMode === 'interval' && item.totalCorrect == null) && '—'}
                          {((leaderboardMode === 'imitate' || leaderboardMode === 'vocal') && item.avgGap == null) && '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                  <Music className="w-10 h-10 mb-4" />
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-center">{t.noScoresRecorded}</p>
                </div>
              )}
            </div>

            {!user && (
              <div className="px-8 py-6 bg-accent-dark/5 border-t border-green-900/10 text-center">
                <p className="text-[9px] text-text-muted uppercase tracking-wider mb-4 leading-relaxed whitespace-pre-line">{t.signInLeaderboardPrompt}</p>
                <button 
                  onClick={handleLogin}
                  className="w-full py-3 bg-accent-dark text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  {t.authenticateNow}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Warning Confirmation Modal for Section Reset */}
    <ResetWarningModal 
      isOpen={resetModalInfo.isOpen}
      title={`Reset ${resetModalInfo.title}`}
      description={`Are you sure you want to reset ${resetModalInfo.title}? This will reset all your levels, statistics, and records for this section. This action cannot be undone.`}
      onConfirm={handleConfirmReset}
      onCancel={() => setResetModalInfo(prev => ({ ...prev, isOpen: false }))}
    />

    {/* Legal & Compliance Modals */}
    <PrivacyPolicyModal 
      isOpen={showPrivacyModal}
      onClose={() => setShowPrivacyModal(false)}
      language={language}
    />

    <TermsOfServiceModal 
      isOpen={showTermsModal}
      onClose={() => setShowTermsModal(false)}
      language={language}
    />

    <MicrophonePermissionModal 
      isOpen={showMicModal}
      onClose={() => setShowMicModal(false)}
      language={language}
      onRetry={startVocalRecording}
    />

    <ReauthModal 
      isOpen={showReauthModal}
      onClose={() => setShowReauthModal(false)}
      language={language}
      providerId={reauthProviderId}
      onConfirmPassword={handleConfirmReauthPassword}
      onProviderReauth={handleConfirmReauthProvider}
    />
  </div>

  );
}
