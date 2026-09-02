import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Play, RotateCcw, Save, Trash2, Youtube, Clock, Link as LinkIcon, CheckCircle2, AlertCircle, Edit2, AlertTriangle, ChevronRight } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Language, translations } from '../translations';

export type Note = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export const NOTES: Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export interface SongMapping {
  note: Note;
  videoId: string;
  startTime: number;
  title: string;
}

interface PerfectPitchModuleProps {
  onBack: () => void;
  language?: Language;
}

const parseYouTubeUrl = (url: string) => {
  let videoId = '';
  let startTime = 0;

  try {
    // Check if it's already just an ID (11 chars)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return { videoId: url, startTime: 0 };
    }

    const urlObj = new URL(url.replace('www.', ''));
    
    if (urlObj.hostname === 'youtube.com') {
      videoId = urlObj.searchParams.get('v') || '';
    } else if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    }

    const tParam = urlObj.searchParams.get('t');
    if (tParam) {
      if (tParam.includes('s') || tParam.includes('m') || tParam.includes('h')) {
        // Parse format like 1h2m30s
        const hours = tParam.match(/(\d+)h/) ? parseInt(tParam.match(/(\d+)h/)![1]) : 0;
        const minutes = tParam.match(/(\d+)m/) ? parseInt(tParam.match(/(\d+)m/)![1]) : 0;
        const seconds = tParam.match(/(\d+)s/) ? parseInt(tParam.match(/(\d+)s/)![1]) : 0;
        
        let onlySecondsNum = 0;
        if (!tParam.includes('h') && !tParam.includes('m') && !tParam.includes('s')) {
             onlySecondsNum = parseInt(tParam); // some URLs just have ?t=45
        }

        startTime = hours * 3600 + minutes * 60 + seconds || onlySecondsNum;
      } else {
        startTime = parseInt(tParam) || 0;
      }
    }
  } catch (error) {
    // fallback parsing using regex
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
      
      const tMatch = url.match(/[?&]t=([^&]+)/);
      if (tMatch) {
         const tVal = tMatch[1];
         startTime = parseInt(tVal) || 0;
      }
    }
  }
  return { videoId, startTime };
};

export const PerfectPitchModule: React.FC<PerfectPitchModuleProps> = ({ onBack, language = 'en' }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'assign' | 'practice'>('assign');
  const [mappings, setMappings] = useState<Record<Note, SongMapping | null>>(
    NOTES.reduce((acc, note) => ({ ...acc, [note]: null }), {} as Record<Note, SongMapping | null>)
  );
  
  // Assign state
  const [selectedNote, setSelectedNote] = useState<Note>('C');
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Practice state
  const [practiceNote, setPracticeNote] = useState<Note | null>(null);
  const [isPlayingMnemonic, setIsPlayingMnemonic] = useState(false);

  useEffect(() => {
    if (practiceNote) {
      setIsPlayingMnemonic(false);
    }
  }, [practiceNote]);

  // Handle visibility change (backgrounding) to pause YouTube video
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const iframe = document.getElementById('youtube-player') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Edit state
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');
  const [showResetWarning, setShowResetWarning] = useState(false);

  const handleEditTitleStart = (note: Note, currentTitle: string) => {
    setEditingNote(note);
    setEditTitleInput(currentTitle);
  };

  const handleEditTitleSave = async (note: Note) => {
    const existing = mappings[note];
    if (!existing) return;
    const updatedMapping = { ...existing, title: editTitleInput };
    const updated = { ...mappings, [note]: updatedMapping };
    await saveMappings(updated);
    setEditingNote(null);
  };

  const handleResetAll = async () => {
    const empty = NOTES.reduce((acc, note) => ({ ...acc, [note]: null }), {} as Record<Note, SongMapping | null>);
    await saveMappings(empty);
    setShowResetWarning(false);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      loadMappings(user);
    });
    // Fallback to local storage on init in case offline or logged out
    const localData = localStorage.getItem('perfectPitchMappings');
    if (localData) {
      setMappings(JSON.parse(localData));
    }
    return () => unsubscribe();
  }, []);

  const loadMappings = async (currentUser: any) => {
    // Priority: Firebase -> LocalStorage
    if (currentUser) {
      try {
        const docRef = doc(db, 'user_profiles', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().perfectPitchMappings) {
          setMappings(docSnap.data().perfectPitchMappings);
          return;
        }
      } catch (e) {
        console.error("Error loading mapping from Firebase", e);
      }
    }
  };

  const saveMappings = async (newMappings: Record<Note, SongMapping | null>) => {
    setMappings(newMappings);
    localStorage.setItem('perfectPitchMappings', JSON.stringify(newMappings));
    
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const docRef = doc(db, 'user_profiles', currentUser.uid);
        await setDoc(docRef, { 
          perfectPitchMappings: newMappings,
        }, { merge: true });
      } catch (e) {
        console.error("Error saving mapping to Firebase", e);
      }
    }
  };

  const handleAssign = async () => {
    setErrorMsg('');
    if (!urlInput) {
      setErrorMsg(t.enterValidUrlError);
      return;
    }

    const { videoId, startTime } = parseYouTubeUrl(urlInput);
    if (!videoId) {
      setErrorMsg(t.couldNotParseVideoIdError);
      return;
    }

    setIsSaving(true);
    
    const defaultTitle = language === 'tr' 
      ? `${selectedNote} ${t.songForNoteDefault}`
      : `${t.songForNoteDefault} ${selectedNote}`;

    const newMapping: SongMapping = {
      note: selectedNote,
      videoId,
      startTime,
      title: titleInput || defaultTitle
    };

    const updated = { ...mappings, [selectedNote]: newMapping };
    await saveMappings(updated);
    
    setUrlInput('');
    setTitleInput('');
    setIsSaving(false);
  };

  const handleClearNote = async (note: Note) => {
    const updated = { ...mappings, [note]: null };
    await saveMappings(updated);
  };

  return (
    <div className="min-h-screen bg-bg-dark text-gray-900 flex flex-col font-sans pt-16 md:pt-0">
      {/* Header */}
      <header className="relative px-4 md:px-12 py-2 md:py-6 flex justify-between items-center border-b border-green-900/10 bg-white/80 sticky top-16 md:top-0 z-40 md:z-50 backdrop-blur-md">
        {/* Left: Back Button */}
        <div className="flex items-center md:pl-12">
          <button 
            onClick={onBack}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-900/5 flex items-center justify-center hover:bg-green-900/10 transition-colors border border-green-900/10 relative z-10"
            title={t.back}
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-700 hover:text-gray-900 rotate-180" />
          </button>
        </div>

        {/* Right: Desktop Tabs & Reset Button */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="hidden sm:flex bg-card-dark p-1 rounded-xl border border-green-900/20">
            <button 
              onClick={() => { setActiveTab('assign'); setPracticeNote(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'assign' ? 'bg-accent-dark text-white' : 'text-text-muted hover:text-gray-900'}`}
            >
              {t.assignSongsTab}
            </button>
            <button 
              onClick={() => setActiveTab('practice')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'practice' ? 'bg-accent-dark text-white' : 'text-text-muted hover:text-gray-900'}`}
            >
              {t.practiceModeTab}
            </button>
          </div>
          <button 
            onClick={() => setShowResetWarning(true)}
            className="px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-green-900/5 hover:bg-red-500/20 hover:text-red-400 text-text-muted border border-green-900/20 text-[9px] md:text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1.5"
            title={t.resetSectionBtn}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.resetSectionBtn}</span>
            <span className="sm:hidden">{t.reset}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-12 pb-28 sm:pb-12">
        <div className="max-w-5xl mx-auto">
          
          {activeTab === 'assign' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              
              {/* Left Column: Form */}
              <div className="bg-card-dark rounded-3xl p-6 md:p-8 border border-green-900/10 h-fit md:sticky md:top-24 shadow-xl relative">
                <div className="flex items-start justify-between mb-4">
                  <Music className="w-10 h-10 text-accent-dark" />
                </div>
                <h2 className="text-2xl font-extralight italic tracking-tight mb-2">{t.buildMnemonicsTitle}</h2>
                <p className="text-sm text-text-muted mb-8 leading-relaxed">
                  {t.buildMnemonicsDesc}
                </p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">{t.selectNoteLabel}</label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {NOTES.map(note => (
                        <button
                          key={note}
                          onClick={() => setSelectedNote(note)}
                          className={`py-3 rounded-xl font-bold transition-all border ${selectedNote === note ? 'bg-accent-dark text-white border-accent-dark scale-105 shadow-lg' : 'bg-green-900/5 border-green-900/10 text-gray-900/70 hover:border-green-900/20'}`}
                        >
                          {note}
                          {mappings[note] && <div className="w-1.5 h-1.5 rounded-full bg-green-500 mx-auto mt-1" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">{t.songTitleOptional}</label>
                    <div className="relative">
                      <Music className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input 
                        type="text"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        placeholder={t.songTitlePlaceholder}
                        className="w-full bg-green-900/5 border border-green-900/20 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-accent-dark outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">{t.youtubeUrlLabel}</label>
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input 
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder={t.youtubeUrlPlaceholder}
                        className="w-full bg-green-900/5 border border-green-900/20 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-accent-dark outline-none transition-colors"
                      />
                    </div>
                    {errorMsg && (
                      <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errorMsg}</p>
                    )}
                  </div>

                  <button 
                    onClick={handleAssign}
                    disabled={isSaving}
                    className="w-full py-4 bg-accent-dark text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 active:scale-95"
                  >
                    {isSaving ? t.savingBtn : <><Save className="w-4 h-4" /> {t.saveMnemonicMappingBtn}</>}
                  </button>
                </div>
              </div>

              {/* Right Column: List */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-4">{t.currentAssignmentsTitle}</h3>
                {NOTES.map(note => {
                  const mapping = mappings[note];
                  return (
                    <div key={note} className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${mapping ? 'bg-card-dark border-accent-dark/30 hover:border-accent-dark/60' : 'bg-transparent border-green-900/10 border-dashed opacity-50'}`}>
                      <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl font-bold text-lg ${mapping ? 'bg-accent-dark text-white' : 'bg-green-900/5 text-gray-900/50'}`}>
                        {note}
                      </div>
                      <div className="flex-1 min-w-0">
                        {mapping ? (
                          <>
                            {editingNote === note ? (
                              <div className="flex items-center gap-2 mb-1">
                                <input
                                  type="text"
                                  value={editTitleInput}
                                  onChange={(e) => setEditTitleInput(e.target.value)}
                                  className="flex-1 bg-green-900/5 border border-green-900/20 rounded-md px-2 py-1 text-sm focus:border-accent-dark outline-none text-gray-900 min-w-0"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditTitleSave(note);
                                    if (e.key === 'Escape') setEditingNote(null);
                                  }}
                                />
                                <button
                                  onClick={() => handleEditTitleSave(note)}
                                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-green-500/20 text-green-400 transition-colors"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="group/title flex items-center gap-2">
                                <h4 
                                  className="font-bold text-gray-900 truncate text-sm cursor-text hover:text-accent-dark transition-colors" 
                                  onClick={() => handleEditTitleStart(note, mapping.title)}
                                  title={t.clickToEditTitle}
                                >
                                  {mapping.title}
                                </h4>
                                <button
                                  onClick={() => handleEditTitleStart(note, mapping.title)}
                                  className="opacity-0 group-hover/title:opacity-100 transition-opacity text-text-muted hover:text-gray-900 flex-shrink-0"
                                  title={t.clickToEditTitle}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            <div className="flex items-center gap-3 mt-1 text-xs text-text-muted font-mono">
                              <span className="flex items-center gap-1"><Youtube className="w-3 h-3 text-red-500" /> {mapping.videoId}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {mapping.startTime}s</span>
                            </div>
                          </>
                        ) : (
                          <p className="text-xs font-mono text-text-muted uppercase tracking-widest">{t.unassignedLabel}</p>
                        )}
                      </div>
                      {mapping && (
                        <button 
                          onClick={() => handleClearNote(note)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

            </motion.div>
          )}

          {activeTab === 'practice' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
              <div className="text-center mb-8 md:mb-12 max-w-xl">
                 <h2 className="text-3xl md:text-5xl font-extralight text-gray-900 mb-4 italic tracking-tight">{t.recallEngineTitle}</h2>
                 <p className="text-text-muted text-sm leading-relaxed">
                   {t.recallEngineDesc}
                 </p>
              </div>

              {!practiceNote ? (
                <div className="w-full max-w-3xl bg-card-dark border border-green-900/10 rounded-[32px] p-6 md:p-10 shadow-2xl">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 md:gap-4">
                    {NOTES.map(note => {
                      const hasMapping = !!mappings[note];
                      return (
                        <button
                          key={note}
                          disabled={!hasMapping}
                          onClick={() => setPracticeNote(note)}
                          className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all border 
                            ${hasMapping ? 'bg-green-900/5 border-green-900/20 hover:border-accent-dark hover:bg-accent-dark/10 cursor-pointer active:scale-95' : 'bg-transparent border-dashed border-green-900/10 opacity-30 cursor-not-allowed'}`}
                        >
                          <span className={`text-2xl md:text-3xl font-bold ${hasMapping ? 'text-gray-900' : 'text-text-muted'}`}>{note}</span>
                          {hasMapping && (
                            <span className="text-[9px] font-mono uppercase tracking-widest text-accent-dark bg-accent-dark/10 px-2 py-1 rounded-md">{t.readyBadge}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {Object.values(mappings).every(m => m === null) && (
                     <div className="mt-8 text-center p-6 bg-accent-dark/10 rounded-2xl border border-accent-dark/20 text-accent-dark">
                       <AlertCircle className="w-8 h-8 mx-auto mb-3" />
                       <p className="font-bold text-sm">{t.noMnemonicsMapped}</p>
                       <p className="text-xs opacity-80 mt-1">{t.goToAssignPrompt}</p>
                     </div>
                  )}
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl bg-card-dark border border-green-900/20 rounded-[32px] p-6 md:p-8 shadow-2xl flex flex-col">
                   <div className="flex items-center justify-between mb-8">
                     <button 
                       onClick={() => setPracticeNote(null)}
                       className="flex items-center gap-2 text-text-muted hover:text-gray-900 transition-colors uppercase tracking-widest text-[10px] font-bold"
                     >
                       <RotateCcw className="w-4 h-4" /> {t.pickAnotherNoteBtn}
                     </button>
                     <div className="flex items-center gap-3">
                       <span className="text-xs font-mono text-text-muted uppercase">{t.targetPitchLabel}</span>
                       <div className="w-10 h-10 rounded-xl bg-accent-dark text-white font-bold text-xl flex items-center justify-center">
                         {practiceNote}
                       </div>
                     </div>
                   </div>

                   {mappings[practiceNote] && (
                     <div className="flex flex-col items-center w-full">
                        <div className="w-full aspect-video rounded-2xl overflow-hidden border border-green-900/20 bg-black shadow-2xl relative group">
                           {!isPlayingMnemonic ? (
                             <div 
                               className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center bg-gray-900"
                               onClick={() => setIsPlayingMnemonic(true)}
                             >
                               <img 
                                 src={`https://img.youtube.com/vi/${mappings[practiceNote]!.videoId}/hqdefault.jpg`} 
                                 alt="Thumbnail"
                                 className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"
                               />
                               <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent-dark text-white flex items-center justify-center z-10 shadow-[0_0_30px_rgba(34,197,94,0.3)] group-hover:scale-110 transition-transform">
                                 <Play className="w-8 h-8 md:w-10 md:h-10 ml-1 md:ml-2" />
                               </div>
                               <p className="mt-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-white z-10 shadow-black drop-shadow-md">Play Mnemonic</p>
                             </div>
                           ) : (
                             <iframe
                               id="youtube-player"
                               width="100%"
                               height="100%"
                               src={`https://www.youtube.com/embed/${mappings[practiceNote]!.videoId}?autoplay=1&playsinline=1&start=${mappings[practiceNote]!.startTime}&controls=1&rel=0&modestbranding=1&enablejsapi=1`}
                               title={mappings[practiceNote]!.title}
                               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                               allowFullScreen
                               className="w-full h-full object-cover"
                             />
                           )}
                        </div>
                        <div className="mt-6 text-center">
                          <h3 className="text-xl font-bold tracking-tight mb-2">{mappings[practiceNote]!.title}</h3>
                          <p className="text-xs font-mono text-text-muted flex items-center justify-center gap-4">
                            <span className="flex items-center gap-1"><Youtube className="w-4 h-4 text-red-500" /> {mappings[practiceNote]!.videoId}</span>
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {t.beginsAtLabel} {mappings[practiceNote]!.startTime}s</span>
                          </p>
                        </div>
                     </div>
                   )}
                </motion.div>
               )}

            </motion.div>
          )}
          
        </div>
      </main>

      {/* Reset Confirmation Warning Modal */}
      <AnimatePresence>
        {showResetWarning && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetWarning(false)}
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
                <h3 className="text-lg font-bold uppercase tracking-tight text-gray-900">{t.resetMnemonicModalTitle}</h3>
              </div>
              <p className="text-sm text-text-muted leading-relaxed mb-8">
                {t.resetMnemonicModalDesc}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetWarning(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-green-900/20 text-gray-900 hover:bg-green-900/5 transition-colors font-bold uppercase tracking-widest text-xs"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleResetAll}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-gray-900 hover:bg-red-600 transition-colors font-bold uppercase tracking-widest text-xs shadow-lg shadow-red-500/20"
                >
                  {t.confirmResetBtn}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Tab Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-card-dark/95 backdrop-blur-md border-t border-green-900/10 p-3 shadow-2xl flex gap-2">
        <button 
          onClick={() => { setActiveTab('assign'); setPracticeNote(null); }}
          className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-center ${activeTab === 'assign' ? 'bg-accent-dark text-white shadow-md' : 'bg-green-900/5 text-text-muted hover:text-gray-900'}`}
        >
          {t.assignSongsTab}
        </button>
        <button 
          onClick={() => setActiveTab('practice')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-center ${activeTab === 'practice' ? 'bg-accent-dark text-white shadow-md' : 'bg-green-900/5 text-text-muted hover:text-gray-900'}`}
        >
          {t.practiceModeTab}
        </button>
      </div>
    </div>
  );
};
