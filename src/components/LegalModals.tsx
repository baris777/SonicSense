import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, FileText, Trash2, Mic, AlertCircle, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import { Language, translations } from '../translations';

interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const PrivacyPolicyModal: React.FC<ModalBaseProps> = ({ isOpen, onClose, language }) => {
  const t = translations[language];
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-2xl max-h-[85vh] bg-card-dark border border-green-900/20 rounded-[32px] p-6 md:p-10 shadow-2xl z-10 flex flex-col"
        >
          <div className="flex items-center justify-between pb-4 border-b border-green-900/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent-dark/10 flex items-center justify-center border border-accent-dark/20 text-accent-dark">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900">{t.privacyPolicy}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-green-900/5 hover:bg-green-900/10 flex items-center justify-center text-text-muted hover:text-gray-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto space-y-6 text-sm text-text-muted leading-relaxed pr-2">
            <div>
              <h3 className="text-gray-900 font-bold mb-1">1. Summary</h3>
              <p>
                Earforge is dedicated to protecting your privacy. We collect only the minimum data required to synchronize your ear-training progression, leaderboard achievements, and user preferences across your devices.
              </p>
            </div>

            <div>
              <h3 className="text-gray-900 font-bold mb-1">2. Audio Processing & Microphone Access</h3>
              <p>
                When you use the Vocal Pitch Detection feature, Earforge accesses your microphone to perform real-time pitch detection (via the client-side Web Audio API / Tone.js) strictly on your device. <strong>No raw audio or voice recordings are ever saved, stored, recorded, transmitted, or uploaded to any remote server.</strong>
              </p>
            </div>

            <div>
              <h3 className="text-gray-900 font-bold mb-1">3. Personal & Account Data</h3>
              <p>
                If you sign in using Google or Email/Password, we store your authentication identifier, email address, and chosen display name in Google Cloud Firestore via Firebase Authentication. We use this solely to maintain your statistics (such as accuracy, microtone tolerance, and streak records).
              </p>
            </div>

            <div>
              <h3 className="text-gray-900 font-bold mb-1">4. Leaderboards & Public Display</h3>
              <p>
                Only your chosen public display name, aggregate session accuracy, and microtonal scores are listed on the leaderboard. You can report inappropriate usernames or block users at any time.
              </p>
            </div>

            <div>
              <h3 className="text-gray-900 font-bold mb-1">5. Account & Data Deletion</h3>
              <p>
                You retain full control over your data. You may delete your account and all associated profile, statistics, and leaderboard records at any time directly in the app under <em>Settings &gt; Account Management &gt; Delete Account</em>. Account deletion permanently and instantaneously removes all your stored data.
              </p>
            </div>

            <div>
              <h3 className="text-gray-900 font-bold mb-1">6. Third-Party Services</h3>
              <p>
                We use Firebase (Google Cloud) for authentication and data storage, and the standard YouTube IFrame API to play user-assigned mnemonic video references. No user data is sold, rented, or shared with third-party advertisers.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-green-900/10 mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-accent-dark text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-accent-dark/90 transition-colors"
            >
              {t.closeDialog}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const TermsOfServiceModal: React.FC<ModalBaseProps> = ({ isOpen, onClose, language }) => {
  const t = translations[language];
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-2xl max-h-[85vh] bg-card-dark border border-green-900/20 rounded-[32px] p-6 md:p-10 shadow-2xl z-10 flex flex-col"
        >
          <div className="flex items-center justify-between pb-4 border-b border-green-900/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent-dark/10 flex items-center justify-center border border-accent-dark/20 text-accent-dark">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold uppercase tracking-tight text-gray-900">{t.termsOfService}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-green-900/5 hover:bg-green-900/10 flex items-center justify-center text-text-muted hover:text-gray-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto space-y-6 text-sm text-text-muted leading-relaxed pr-2">
            <div>
              <h3 className="text-gray-900 font-bold mb-1">1. Acceptance of Terms</h3>
              <p>
                By using Earforge, you agree to these Terms of Service. If you do not agree to these terms, please do not use the application.
              </p>
            </div>

            <div>
              <h3 className="text-gray-900 font-bold mb-1">2. User-Generated Content & Zero Tolerance</h3>
              <p>
                We maintain a <strong>strict zero tolerance policy</strong> against objectionable content and abusive users. You agree not to create, submit, or use display names or content that are abusive, defamatory, obscene, profane, racially offensive, or harmful. Any violation of this zero tolerance policy will result in immediate removal of the content and permanent suspension of the offending account without prior notice.
              </p>
            </div>

            <div>
              <h3 className="text-gray-900 font-bold mb-1">3. Mnemonic Media & YouTube References</h3>
              <p>
                The Mnemonic Engine allows users to reference public songs on YouTube for ear-training mnemonic triggers. All video playback is rendered strictly via the official YouTube IFrame Player in compliance with YouTube Terms of Service. Users are responsible for the validity of the links they configure.
              </p>
            </div>

            <div>
              <h3 className="text-gray-900 font-bold mb-1">4. Disclaimer of Warranty</h3>
              <p>
                Earforge is provided "as is" without warranty of any kind. While engineered for scientific ear training precision, we do not guarantee specific musical proficiency outcomes.
              </p>
            </div>

            <div>
              <h3 className="text-gray-900 font-bold mb-1">5. Account & Data Termination</h3>
              <p>
                You may terminate your account and wipe all personal data at any time via the in-app Settings menu under <em>Account Management &gt; Delete Account</em>.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-green-900/10 mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-accent-dark text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-accent-dark/90 transition-colors"
            >
              {t.closeDialog}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const MicrophonePermissionModal: React.FC<ModalBaseProps & { onRetry: () => void }> = ({
  isOpen,
  onClose,
  language,
  onRetry
}) => {
  const t = translations[language];
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-md bg-card-dark border border-green-900/20 rounded-[32px] p-6 md:p-8 shadow-2xl z-10"
        >
          <div className="flex items-center gap-3 text-accent-dark mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent-dark/10 flex items-center justify-center border border-accent-dark/20">
              <Mic className="w-5 h-5 text-accent-dark" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight text-gray-900">{t.micPermissionTitle}</h3>
          </div>

          <p className="text-sm text-text-muted leading-relaxed mb-4">
            {t.micPermissionDesc}
          </p>

          <div className="p-4 bg-green-900/5 rounded-2xl border border-green-900/10 mb-6 text-xs text-text-muted space-y-1">
            <p className="font-bold text-gray-900">{t.micPermissionSettingsHint}</p>
            <p>1. Open your browser or device Settings.</p>
            <p>2. Find Earforge permissions and set Microphone to "Allow".</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-green-900/20 text-gray-900 hover:bg-green-900/5 transition-colors font-bold uppercase tracking-widest text-xs"
            >
              {t.cancel}
            </button>
            <button
              onClick={() => {
                onClose();
                onRetry();
              }}
              className="flex-1 py-3 rounded-xl bg-accent-dark text-white hover:bg-accent-dark/90 transition-colors font-bold uppercase tracking-widest text-xs"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const ReauthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onConfirmPassword: (password: string) => Promise<void>;
  providerId: string | null;
  onProviderReauth: () => Promise<void>;
}> = ({ isOpen, onClose, language, onConfirmPassword, providerId, onProviderReauth }) => {
  const t = translations[language];
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsLoading(true);
    setError(null);
    try {
      await onConfirmPassword(password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderReauth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onProviderReauth();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative w-full max-w-md bg-card-dark border border-green-900/20 rounded-[32px] p-6 md:p-8 shadow-2xl z-10"
        >
          <div className="flex items-center gap-3 text-red-400 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <Lock className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight text-gray-900">{t.reauthRequiredTitle}</h3>
          </div>

          <p className="text-sm text-text-muted leading-relaxed mb-6">
            {t.reauthRequiredDesc}
          </p>

          {providerId === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider">
                  {t.enterPasswordToConfirm}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-green-900/5 border border-green-900/20 rounded-xl px-4 py-3 text-sm focus:border-accent-dark outline-none transition-colors"
                />
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl border border-green-900/20 text-gray-900 hover:bg-green-900/5 transition-colors font-bold uppercase tracking-widest text-xs"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.confirmReauth}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleProviderReauth}
                disabled={isLoading}
                className="w-full py-3.5 bg-accent-dark text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-accent-dark/90 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `${t.confirmReauth} (Google)`}
              </button>
              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-green-900/20 text-gray-900 hover:bg-green-900/5 transition-colors font-bold uppercase tracking-widest text-xs"
              >
                {t.cancel}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
