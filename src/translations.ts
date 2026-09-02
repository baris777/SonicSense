export type Language = 'en' | 'tr' | 'de';

export interface Translations {
  // Navigation & Common
  home: string;
  scientificGuide: string;
  settings: string;
  leaderboard: string;
  back: string;
  close: string;
  reset: string;
  resetAll: string;
  level: string;
  tolerance: string;
  avgGap: string;
  streak: string;
  accuracy: string;
  best: string;
  instructions: string;
  play: string;
  startSession: string;
  replaySound: string;
  questionsPerSession: string;
  selectSessionIntensity: string;
  configureVocalRange: string;
  
  // Training Modules Home View
  trainingModulesTitle: string;
  trainingModulesSubtitle: string;

  // Game Prompts
  identifyLowerPitch: string;
  selectLowerFrequency: string;
  identifyInterval: string;
  listenIntervalNotes: string;
  matchTargetFrequency: string;
  adjustDial: string;
  vocalPitchDetection: string;
  imitateWithVoice: string;
  sound1: string;
  sound2: string;
  submitAnswer: string;
  correct: string;
  incorrect: string;
  nextQuestion: string;
  sessionComplete: string;

  // Modes
  pitchDetectionTitle: string;
  pitchDetectionShort: string;
  pitchDetectionDesc: string;

  intervalRecognitionTitle: string;
  intervalRecognitionShort: string;
  intervalRecognitionDesc: string;

  frequencyImitationTitle: string;
  frequencyImitationShort: string;
  frequencyImitationDesc: string;

  vocalPitchTitle: string;
  vocalPitchShort: string;
  vocalPitchDesc: string;

  mnemonicEngineTitle: string;
  mnemonicEngineShort: string;
  mnemonicEngineDesc: string;

  // Mnemonic Module Detailed Translations
  assignSongsTab: string;
  practiceModeTab: string;
  resetSectionBtn: string;
  buildMnemonicsTitle: string;
  buildMnemonicsDesc: string;
  selectNoteLabel: string;
  songTitleOptional: string;
  songTitlePlaceholder: string;
  youtubeUrlLabel: string;
  youtubeUrlPlaceholder: string;
  enterValidUrlError: string;
  couldNotParseVideoIdError: string;
  savingBtn: string;
  saveMnemonicMappingBtn: string;
  currentAssignmentsTitle: string;
  unassignedLabel: string;
  clickToEditTitle: string;
  recallEngineTitle: string;
  recallEngineDesc: string;
  readyBadge: string;
  noMnemonicsMapped: string;
  goToAssignPrompt: string;
  pickAnotherNoteBtn: string;
  targetPitchLabel: string;
  beginsAtLabel: string;
  resetMnemonicModalTitle: string;
  resetMnemonicModalDesc: string;
  confirmResetBtn: string;
  songForNoteDefault: string;

  // Settings
  languageSelection: string;
  languageDesc: string;
  profile: string;
  resetSectionProgress: string;
  resetSectionDesc: string;
  resetAllSections: string;
  resetAllDesc: string;
  accountManagement: string;
  signOut: string;
  signOutDesc: string;
  deleteAccount: string;
  deleteAccountDesc: string;
  deleteConfirmTitle: string;
  deleteConfirmDesc: string;
  confirmDeletion: string;
  cancel: string;

  // Scientific Guide
  guideHeading: string;
  guideSubheadingHighlight: string;
  guideIntervalsTitle: string;
  guideIntervalsText: string;
  guidePitchTitle: string;
  guidePitchText: string;
  guideFreqImitationTitle: string;
  guideFreqImitationText: string;
  guideImitationTitle: string;
  guideImitationText: string;
  guideMnemonicTitle: string;
  guideMnemonicText: string;
  guideFooterText: string;
  waveformAsset: string;
  spectrogramAsset: string;
  dialAsset: string;
  singerAsset: string;
  memoryAsset: string;

  // Leaderboard
  syncingWithCloud: string;
  nameColumn: string;
  toleranceColumn: string;
  accuracyColumn: string;
  gapColumn: string;
  sessionsAveraged: string;
  noScoresRecorded: string;
  signInLeaderboardPrompt: string;
  authenticateNow: string;

  // Compliance & Safety
  continueWithApple: string;
  privacyPolicy: string;
  termsOfService: string;
  termsAgreementNotice: string;
  reportUser: string;
  blockUser: string;
  reportSubmitted: string;
  userBlockedNotice: string;
  inappropriateUsernameError: string;
  reauthRequiredTitle: string;
  reauthRequiredDesc: string;
  enterPasswordToConfirm: string;
  confirmReauth: string;
  micPermissionTitle: string;
  micPermissionDesc: string;
  micPermissionDenied: string;
  micPermissionSettingsHint: string;
  externalDeletionTitle: string;
  externalDeletionDesc: string;
  requestDeletionBtn: string;
  deletionRequestSent: string;
  closeDialog: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    home: 'Home Page',
    scientificGuide: 'Scientific Guide',
    settings: 'Settings',
    leaderboard: 'Leaderboard',
    back: 'Back',
    close: 'Close',
    reset: 'Reset',
    resetAll: 'Reset All',
    level: 'Level',
    tolerance: 'Tolerance',
    avgGap: 'Avg Gap',
    streak: 'Streak',
    accuracy: 'Accuracy',
    best: 'Best',
    instructions: 'Instructions',
    play: 'Play',
    startSession: 'Start Session',
    replaySound: 'Replay Sound',
    questionsPerSession: 'Questions per session',
    selectSessionIntensity: 'Select Session Intensity',
    configureVocalRange: 'Configure Vocal Range',

    trainingModulesTitle: 'Training Modules',
    trainingModulesSubtitle: 'Ear Training Laboratory',

    identifyLowerPitch: 'Identify the lower pitch.',
    selectLowerFrequency: 'Select the sound with the lower frequency.',
    identifyInterval: 'Identify the musical interval.',
    listenIntervalNotes: 'Listen carefully to the two notes played sequentially.',
    matchTargetFrequency: 'Match the target frequency dial.',
    adjustDial: 'Adjust the dial to match the frequency you heard.',
    vocalPitchDetection: 'Vocal Pitch Detection.',
    imitateWithVoice: 'Imitate the sound you heard with your voice.',
    sound1: 'Sound 1',
    sound2: 'Sound 2',
    submitAnswer: 'Submit Answer',
    correct: 'Correct!',
    incorrect: 'Incorrect',
    nextQuestion: 'Next Question',
    sessionComplete: 'Session Complete',

    pitchDetectionTitle: 'Pitch Detection',
    pitchDetectionShort: 'Identify the lower frequency between two sine waves.',
    pitchDetectionDesc: 'Listen to two pure tones. Your goal is to identify which of the two sounds has a lower pitch (frequency). As you progress, the difference in frequency will become smaller.',

    intervalRecognitionTitle: 'Interval Recognition',
    intervalRecognitionShort: 'Identify the musical interval between two notes.',
    intervalRecognitionDesc: 'Two notes will be played sequentially. Listen carefully to the distance between them, known as the interval, and select the correct musical interval name from the options.',

    frequencyImitationTitle: 'Frequency Imitation',
    frequencyImitationShort: 'Adjust the dial to match the target frequency.',
    frequencyImitationDesc: 'You will hear a target frequency. Use the slider to adjust your oscillator until the pitches match. Hone your relative pitch by minimizing the gap.',

    vocalPitchTitle: 'Vocal Pitch Detection',
    vocalPitchShort: 'Imitate the pitch using your own voice.',
    vocalPitchDesc: 'A note will be played. Sing the same note into your microphone. The app will detect your fundamental frequency and measure how close you are to the target.',

    mnemonicEngineTitle: 'Mnemonic Engine',
    mnemonicEngineShort: 'Associate notes to recognizable songs.',
    mnemonicEngineDesc: 'Assign specific songs to all 12 musical notes. Use the practice mode to trigger your mnemonics and build absolute pitch memory.',

    assignSongsTab: 'Assign Songs',
    practiceModeTab: 'Practice Mode',
    resetSectionBtn: 'Reset Section',
    buildMnemonicsTitle: 'Build Your Mnemonics',
    buildMnemonicsDesc: "Assign a recognizable song to each note. When you hear the first few notes of the song, you'll immediately know what pitch it is.",
    selectNoteLabel: 'Select Note',
    songTitleOptional: 'Song Title (Optional)',
    songTitlePlaceholder: 'e.g. Bohemian Rhapsody - Queen',
    youtubeUrlLabel: 'YouTube URL with Timestamp',
    youtubeUrlPlaceholder: 'https://youtu.be/dQw4w9WgXcQ?t=43',
    enterValidUrlError: 'Please enter a YouTube URL or video ID.',
    couldNotParseVideoIdError: 'Could not parse a valid YouTube Video ID.',
    savingBtn: 'Saving...',
    saveMnemonicMappingBtn: 'Save Mnemonic Mapping',
    currentAssignmentsTitle: 'Current Assignments',
    unassignedLabel: 'Unassigned',
    clickToEditTitle: 'Click to edit title',
    recallEngineTitle: 'Recall Engine',
    recallEngineDesc: 'Select a target note. The Engine will instantly spin up your assigned mnemonic song, autoplaying from your precise timestamp to trigger your pitch memory.',
    readyBadge: 'Ready',
    noMnemonicsMapped: 'No mnemonics mapped yet.',
    goToAssignPrompt: 'Go to "Assign Songs" to configure your memory triggers.',
    pickAnotherNoteBtn: 'Pick Another Note',
    targetPitchLabel: 'Target Pitch',
    beginsAtLabel: 'Begins at',
    resetMnemonicModalTitle: 'Reset Mnemonic Engine?',
    resetMnemonicModalDesc: 'Warning: This will clear all 12 note mnemonic song assignments. This action cannot be undone.',
    confirmResetBtn: 'Confirm Reset',
    songForNoteDefault: 'Song for Note',

    languageSelection: 'Language',
    languageDesc: 'Choose your preferred display language',
    profile: 'Profile',
    resetSectionProgress: 'Reset Section Progress',
    resetSectionDesc: 'Reset section levels & stats',
    resetAllSections: 'Reset All Sections',
    resetAllDesc: 'Reset all training modules to default',
    accountManagement: 'Account Management',
    signOut: 'Sign Out',
    signOutDesc: 'End your current session',
    deleteAccount: 'Delete Account',
    deleteAccountDesc: 'Permanently remove account and all stored data',
    deleteConfirmTitle: 'Permanently Delete Account & Data?',
    deleteConfirmDesc: 'This action cannot be undone. All your account information, training levels, statistics, leaderboard scores, and custom mnemonics will be permanently erased.',
    confirmDeletion: 'Delete Account & All Data',
    cancel: 'Cancel',

    guideHeading: 'How to Attain',
    guideSubheadingHighlight: 'Perfect Pitch',
    guideIntervalsTitle: 'INTERVALS',
    guideIntervalsText: 'Before you can identify notes in isolation, you must master the relationship between them. Using the Intervals function trains your brain to hear the distance between notes. This builds the mental architecture needed to eventually recognize the specific "height" of each individual pitch.',
    guidePitchTitle: 'PITCH DETECTION',
    guidePitchText: 'Every frequency has its own unique "color." The Frequency Select mode forces you to discriminate between micro-tones. By identifying the lower frequency consistently, you sensitize your auditory cortex to the subtle characteristics of sound waves, making absolute recognition possible.',
    guideFreqImitationTitle: 'FREQUENCY IMITATION',
    guideFreqImitationText: 'Active pitch matching trains fine motor-auditory coordination. By manually tuning an oscillator to match a reference frequency, you eliminate the gap between passive hearing and active frequency alignment, drastically refining your pitch resolution and microtonal sensitivity.',
    guideImitationTitle: 'VOCAL IMITATION',
    guideImitationText: 'The final bridge is Vocalization. When you sing a pitch, you engage muscle memory and physical resonance. Using the Imitation and Vocal functions turns passive listening into active physical production, solidifying the mental imprint of a note more deeply than listening ever could.',
    guideMnemonicTitle: 'MNEMONIC ENGINE',
    guideMnemonicText: 'Anchor pitches to deeply ingrained musical memories. By associating all 12 chromatic pitches with the exact opening timestamps of iconic songs, your brain forms rapid semantic triggers that bypass guesswork, creating a reliable bridge toward true absolute pitch recall.',
    guideFooterText: 'Training for 15 minutes daily is more effective than a 3-hour weekly session. Consistency is the key to Forge.',
    waveformAsset: 'Waveform',
    spectrogramAsset: 'Spectrogram',
    dialAsset: 'Dial / Oscillator',
    singerAsset: 'Singer silhouette',
    memoryAsset: 'Memory Triggers',

    syncingWithCloud: 'Syncing with Cloud...',
    nameColumn: 'Name',
    toleranceColumn: 'Tolerance',
    accuracyColumn: 'Accuracy',
    gapColumn: 'Gap',
    sessionsAveraged: 'sessions averaged',
    noScoresRecorded: 'No scores recorded for this mode yet.',
    signInLeaderboardPrompt: 'Sign in to publish your scores and climb the global rankings',
    authenticateNow: 'Authenticate Now',

    continueWithApple: 'Continue with Apple',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    termsAgreementNotice: 'By continuing, you agree to our Terms of Service and Privacy Policy. We maintain a zero tolerance policy for objectionable content or abusive users.',
    reportUser: 'Report Username',
    blockUser: 'Block User',
    reportSubmitted: 'Report submitted. Thank you for keeping our community safe.',
    userBlockedNotice: 'User has been blocked. Their scores will no longer appear on your leaderboard.',
    inappropriateUsernameError: 'This display name contains inappropriate language. Please choose another.',
    reauthRequiredTitle: 'Confirm Your Identity',
    reauthRequiredDesc: 'For your security, please confirm your credentials before permanently deleting your account.',
    enterPasswordToConfirm: 'Enter your password to confirm deletion:',
    confirmReauth: 'Verify & Delete',
    micPermissionTitle: 'Microphone Permission Required',
    micPermissionDesc: 'HearEar uses your microphone strictly for real-time pitch detection on your device. Audio is never recorded or uploaded.',
    micPermissionDenied: 'Microphone access was denied. Please allow microphone access in your browser or device settings to use vocal training.',
    micPermissionSettingsHint: 'Check browser/device privacy settings to allow microphone permissions.',
    externalDeletionTitle: 'Account & Data Deletion Portal',
    externalDeletionDesc: 'In compliance with App Store and Google Play policies, you may request permanent deletion of your account and all associated training data at any time.',
    requestDeletionBtn: 'Submit Deletion Request',
    deletionRequestSent: 'Your deletion request has been registered and will be processed immediately.',
    closeDialog: 'Close',
  },

  tr: {
    home: 'Ana Sayfa',
    scientificGuide: 'Bilimsel Rehber',
    settings: 'Ayarlar',
    leaderboard: 'Liderlik Tablosu',
    back: 'Geri',
    close: 'Kapat',
    reset: 'Sıfırla',
    resetAll: 'Tümünü Sıfırla',
    level: 'Seviye',
    tolerance: 'Tolerans',
    avgGap: 'Ort. Fark',
    streak: 'Seri',
    accuracy: 'Doğruluk',
    best: 'En İyi',
    instructions: 'Talimatlar',
    play: 'Oyna',
    startSession: 'Oturumu Başlat',
    replaySound: 'Sesi Tekrar Çal',
    questionsPerSession: 'Oturum başına soru',
    selectSessionIntensity: 'Oturum Yoğunluğunu Seç',
    configureVocalRange: 'Ses Aralığını Yapılandır',

    trainingModulesTitle: 'Eğitim Modülleri',
    trainingModulesSubtitle: 'Kulak Eğitimi Laboratuvarı',

    identifyLowerPitch: 'Daha pes (alçak) sesi belirleyin.',
    selectLowerFrequency: 'Daha düşük frekansa sahip sesi seçin.',
    identifyInterval: 'Müzikal aralığı belirleyin.',
    listenIntervalNotes: 'Ardışık olarak çalınan iki notayı dikkatlice dinleyin.',
    matchTargetFrequency: 'Kadranı hedef frekansla eşleştirin.',
    adjustDial: 'Duyduğunuz frekansı eşleştirmek için kadranı ayarlayın.',
    vocalPitchDetection: 'Vokal Perde Algılama.',
    imitateWithVoice: 'Duyduğunuz sesi sesinizle taklit edin.',
    sound1: 'Ses 1',
    sound2: 'Ses 2',
    submitAnswer: 'Cevabı Gönder',
    correct: 'Doğru!',
    incorrect: 'Yanlış',
    nextQuestion: 'Sonraki Soru',
    sessionComplete: 'Oturum Tamamlandı',

    pitchDetectionTitle: 'Perde Algılama',
    pitchDetectionShort: 'İki sinüs dalgası arasındaki daha alçak (pes) frekansı belirleyin.',
    pitchDetectionDesc: 'İki saf ton dinleyin. Amacınız hangi sesin daha alçak frekansa sahip olduğunu belirlemektir. İlerledikçe frekans farkı giderek azalacaktır.',

    intervalRecognitionTitle: 'Aralık Tanıma',
    intervalRecognitionShort: 'İki nota arasındaki müzikal aralığı belirleyin.',
    intervalRecognitionDesc: 'Ardışık olarak iki nota çalınacaktır. Notalar arasındaki mesafeyi (aralığı) dikkatle dinleyin ve seçenekler arasından doğru aralık adını seçin.',

    frequencyImitationTitle: 'Frekans Taklidi',
    frequencyImitationShort: 'Hedef frekansı eşleştirmek için kadranı ayarlayın.',
    frequencyImitationDesc: 'Bir hedef frekans duyacaksınız. Perdeler eşleşene kadar osilatörünüzü kadranla ayarlayın. Farkı en aza indirerek rölatif kulağınızı geliştirin.',

    vocalPitchTitle: 'Vokal Perde Algılama',
    vocalPitchShort: 'Duyduğunuz perdeyi kendi sesinizle taklit edin.',
    vocalPitchDesc: 'Bir nota çalınacak. Aynı notayı mikrofonunuza söyleyin. Uygulama temel frekansınızı tespit edecek ve hedefe ne kadar yakın olduğunuzu ölçecektir.',

    mnemonicEngineTitle: 'Mnemonic Motoru',
    mnemonicEngineShort: 'Notaları bilinen şarkılarla eşleştirin.',
    mnemonicEngineDesc: '12 müzik notasının tümüne belirli şarkılar atayın. Mnemonic çağrışımlarınızı tetiklemek ve mutlak kulak hafızası oluşturmak için pratik modunu kullanın.',

    assignSongsTab: 'Şarkıları Ata',
    practiceModeTab: 'Pratik Modu',
    resetSectionBtn: 'Bölümü Sıfırla',
    buildMnemonicsTitle: "Mnemonic'lerinizi Oluşturun",
    buildMnemonicsDesc: 'Her notaya tanıdık bir şarkı atayın. Şarkının ilk birkaç notasını duyduğunuzda, hangi perde olduğunu hemen anlayacaksınız.',
    selectNoteLabel: 'Nota Seçin',
    songTitleOptional: 'Şarkı Başlığı (İsteğe Bağlı)',
    songTitlePlaceholder: 'örn. Bohemian Rhapsody - Queen',
    youtubeUrlLabel: 'Zaman Damgalı YouTube Bağlantısı',
    youtubeUrlPlaceholder: 'https://youtu.be/dQw4w9WgXcQ?t=43',
    enterValidUrlError: 'Lütfen bir YouTube bağlantısı veya video kimliği girin.',
    couldNotParseVideoIdError: 'Geçerli bir YouTube Video Kimliği ayrıştırılamadı.',
    savingBtn: 'Kaydediliyor...',
    saveMnemonicMappingBtn: 'Mnemonic Eşlemesini Kaydet',
    currentAssignmentsTitle: 'Mevcut Atamalar',
    unassignedLabel: 'Atanmamış',
    clickToEditTitle: 'Başlığı düzenlemek için tıklayın',
    recallEngineTitle: 'Hatırlama Motoru',
    recallEngineDesc: 'Bir hedef nota seçin. Motor, perde hafızanızı tetiklemek için belirlediğiniz zaman damgasından başlayarak atadığınız mnemonic şarkıyı anında çalacaktır.',
    readyBadge: 'Hazır',
    noMnemonicsMapped: 'Henüz bir mnemonic eşlenmedi.',
    goToAssignPrompt: 'Hafıza tetikleyicilerinizi yapılandırmak için "Şarkıları Ata" bölümüne gidin.',
    pickAnotherNoteBtn: 'Başka Bir Nota Seç',
    targetPitchLabel: 'Hedef Perde',
    beginsAtLabel: 'Başlangıç:',
    resetMnemonicModalTitle: 'Mnemonic Motorunu Sıfırla?',
    resetMnemonicModalDesc: 'Uyarı: Bu işlem 12 notanın tamamındaki mnemonic şarkı atamalarını temizleyecektir. Bu işlem geri alınamaz.',
    confirmResetBtn: 'Sıfırlamayı Onayla',
    songForNoteDefault: 'Notası İçin Şarkı',

    languageSelection: 'Dil Seçimi',
    languageDesc: 'Uygulama dilini belirleyin',
    profile: 'Profil',
    resetSectionProgress: 'Bölüm İlerlemesini Sıfırla',
    resetSectionDesc: 'Bölüm seviyelerini ve istatistiklerini sıfırla',
    resetAllSections: 'Tüm Bölümleri Sıfırla',
    resetAllDesc: 'Tüm eğitim modüllerini başlangıç durumuna sıfırla',
    accountManagement: 'Hesap Yönetimi',
    signOut: 'Çıkış Yap',
    signOutDesc: 'Mevcut oturumunuzu sonlandırın',
    deleteAccount: 'Hesabı Sil',
    deleteAccountDesc: 'Hesabınızı ve tüm verilerinizi kalıcı olarak silin',
    deleteConfirmTitle: 'Hesabı ve Tüm Verileri Silmek İstediğinize Emin Misiniz?',
    deleteConfirmDesc: 'Bu işlem geri alınamaz. Profiliniz, tüm eğitim seviyeleriniz, liderlik tablosu puanlarınız ve kayıtlı şarkı atamalarınız kalıcı olarak silinecektir.',
    confirmDeletion: 'Hesabı ve Tüm Verileri Sil',
    cancel: 'İptal',

    guideHeading: 'Nasıl Kazanılır:',
    guideSubheadingHighlight: 'Mutlak Kulak',
    guideIntervalsTitle: 'ARALIKLAR',
    guideIntervalsText: 'Notaları tek başlarına tanımlamadan önce, aralarındaki ilişkiyi kavramalısınız. Aralıklar fonksiyonunu kullanmak beyninizi notalar arasındaki mesafeyi duymaya alıştırır. Bu, her bir perdenin kendine özgü yüksekliğini zamanla doğrudan tanımak için gereken zihinsel altyapıyı inşa eder.',
    guidePitchTitle: 'PERDE ALGILAMA',
    guidePitchText: 'Her frekansın kendine has benzersiz bir "rengi" vardır. Frekans Seçim modu sizi mikro tonlar arasında ayrım yapmaya zorlar. Daha pes (düşük) frekansı düzenli olarak doğru belirleyerek, işitsel korteksinizi ses dalgalarının ince nüanslarına duyarlı hale getirir ve mutlak tanımayı mümkün kılarsınız.',
    guideFreqImitationTitle: 'FREKANS TAKLİDİ',
    guideFreqImitationText: 'Aktif perde eşleme, ince motor-işitsel koordinasyonu eğitir. Bir referans frekansla eşleşecek şekilde bir osilatörü manuel olarak ayarlayarak, pasif dinleme ile aktif frekans hizalama arasındaki boşluğu kapatır; perde çözünürlüğünüzü ve mikrotonal duyarlılığınızı önemli ölçüde keskinleştirirsiniz.',
    guideImitationTitle: 'VOKAL TAKLİT',
    guideImitationText: 'Son köprü seslendirmedir. Bir perdeyi sesinizle çıkardığınızda, kas hafızasını ve fiziksel rezonansı devreye sokarsınız. Vokal fonksiyonlarını kullanmak pasif dinlemeyi aktif üretime dönüştürerek notanın zihindeki izini dinlemenin tek başına yapabileceğinden çok daha derin kazır.',
    guideMnemonicTitle: 'MNEMONIC MOTORU',
    guideMnemonicText: 'Perdeleri zihninizde derin yer etmiş müzik anılarına sabitleyin. 12 kromatik perdenin tamamını ikonik şarkıların başlangıç zaman damgalarıyla ilişkilendirerek, beyniniz tahmin yürütmeyi ortadan kaldıran hızlı anlamsal tetikleyiciler oluşturur ve gerçek mutlak kulak hatırlamasına giden güvenilir bir köprü kurar.',
    guideFooterText: 'Günde 15 dakika çalışmak, haftada bir 3 saat çalışmaktan çok daha etkilidir. Başarının anahtarı sürekliliktir.',
    waveformAsset: 'Dalga Formu',
    spectrogramAsset: 'Spektrogram',
    dialAsset: 'Kadran / Osilatör',
    singerAsset: 'Vokal Silüeti',
    memoryAsset: 'Hafıza Tetikleyicileri',

    syncingWithCloud: 'Bulut ile eşitleniyor...',
    nameColumn: 'Kullanıcı',
    toleranceColumn: 'Tolerans',
    accuracyColumn: 'Doğruluk',
    gapColumn: 'Fark',
    sessionsAveraged: 'oturum ortalaması',
    noScoresRecorded: 'Bu mod için henüz kaydedilmiş skor bulunmuyor.',
    signInLeaderboardPrompt: 'Skorlarınızı yayınlamak ve küresel sıralamada yer almak için giriş yapın',
    authenticateNow: 'Giriş Yap',

    continueWithApple: 'Apple ile Devam Et',
    privacyPolicy: 'Gizlilik Politikası',
    termsOfService: 'Kullanım Koşulları',
    termsAgreementNotice: 'Devam ederek Kullanım Koşulları ve Gizlilik Politikasını kabul ediyorsunuz. Uygunsuz içeriğe ve tacizkar kullanıcılara karşı sıfır tolerans (zero tolerance) politikası uyguluyoruz.',
    reportUser: 'Kullanıcıyı Bildir',
    blockUser: 'Kullanıcıyı Engelle',
    reportSubmitted: 'Bildiriminiz iletildi. Güvenli bir topluluk ortamı sağladığınız için teşekkürler.',
    userBlockedNotice: 'Kullanıcı engellendi. Skorları artık liderlik tablonuzda görünmeyecektir.',
    inappropriateUsernameError: 'Bu kullanıcı adı uygunsuz sözcükler içeriyor. Lütfen başka bir ad seçin.',
    reauthRequiredTitle: 'Kimliğinizi Doğrulayın',
    reauthRequiredDesc: 'Güvenliğiniz için, hesabınızı kalıcı olarak silmeden önce kimliğinizi doğrulayın.',
    enterPasswordToConfirm: 'Silme işlemini onaylamak için şifrenizi girin:',
    confirmReauth: 'Doğrula ve Sil',
    micPermissionTitle: 'Mikrofon İzni Gerekli',
    micPermissionDesc: 'HearEar, cihazınızda gerçek zamanlı perde algılaması yapmak için mikrofonu kullanır. Sesler asla kaydedilmez veya yüklenmez.',
    micPermissionDenied: 'Mikrofon erişimi reddedildi. Vokal eğitimini kullanmak için lütfen tarayıcı veya cihaz ayarlarından izin verin.',
    micPermissionSettingsHint: 'Mikrofon iznini etkinleştirmek için tarayıcı/cihaz gizlilik ayarlarını kontrol edin.',
    externalDeletionTitle: 'Hesap ve Veri Silme Portalı',
    externalDeletionDesc: 'App Store ve Google Play politikaları uyarınca, hesabınızın ve ilişkili tüm verilerinizin kalıcı olarak silinmesini talep edebilirsiniz.',
    requestDeletionBtn: 'Silme Talebini Gönder',
    deletionRequestSent: 'Silme talebiniz alındı ve derhal işleme koyulacaktır.',
    closeDialog: 'Kapat',
  },

  de: {
    home: 'Startseite',
    scientificGuide: 'Wissenschaftlicher Leitfaden',
    settings: 'Einstellungen',
    leaderboard: 'Bestenliste',
    back: 'Zurück',
    close: 'Schließen',
    reset: 'Zurücksetzen',
    resetAll: 'Alles zurücksetzen',
    level: 'Stufe',
    tolerance: 'Toleranz',
    avgGap: 'Durchschn. Abstand',
    streak: 'Serie',
    accuracy: 'Genauigkeit',
    best: 'Bestwert',
    instructions: 'Anleitung',
    play: 'Spielen',
    startSession: 'Sitzung starten',
    replaySound: 'Ton wiederholen',
    questionsPerSession: 'Fragen pro Sitzung',
    selectSessionIntensity: 'Sitzungsintensität wählen',
    configureVocalRange: 'Stimmlage konfigurieren',

    trainingModulesTitle: 'Trainingsmodule',
    trainingModulesSubtitle: 'Gehörbildungs-Labor',

    identifyLowerPitch: 'Bestimmen Sie den tieferen Ton.',
    selectLowerFrequency: 'Wählen Sie den Ton mit der niedrigeren Frequenz.',
    identifyInterval: 'Bestimmen Sie das musikalische Intervall.',
    listenIntervalNotes: 'Hören Sie den nacheinander gespielten Noten aufmerksam zu.',
    matchTargetFrequency: 'Passen Sie den Regler an die Zielfrequenz an.',
    adjustDial: 'Stellen Sie den Regler so ein, dass er der gehörten Frequenz entspricht.',
    vocalPitchDetection: 'Vokale Tonhöhenerkennung.',
    imitateWithVoice: 'Imitieren Sie den gehörten Ton mit Ihrer Stimme.',
    sound1: 'Ton 1',
    sound2: 'Ton 2',
    submitAnswer: 'Antwort senden',
    correct: 'Richtig!',
    incorrect: 'Falsch',
    nextQuestion: 'Nächste Frage',
    sessionComplete: 'Sitzung abgeschlossen',

    pitchDetectionTitle: 'Tonhöhenerkennung',
    pitchDetectionShort: 'Identifizieren Sie die tiefere Frequenz zwischen zwei Sinustönen.',
    pitchDetectionDesc: 'Hören Sie sich zwei reine Töne an. Ihr Ziel ist es zu bestimmen, welcher Ton die tiefere Frequenz hat. Mit steigendem Fortschritt wird der Unterschied geringer.',

    intervalRecognitionTitle: 'Intervallerkennung',
    intervalRecognitionShort: 'Bestimmen Sie das musikalische Intervall zwischen zwei Noten.',
    intervalRecognitionDesc: 'Zwei Noten werden nacheinander gespielt. Achten Sie genau auf den Abstand zwischen ihnen (das Intervall) und wählen Sie den richtigen Intervallnamen aus.',

    frequencyImitationTitle: 'Frequenz-Imitation',
    frequencyImitationShort: 'Passen Sie den Regler an die Zielfrequenz an.',
    frequencyImitationDesc: 'Sie hören eine Zielfrequenz. Nutzen Sie den Regler, bis die Tonhöhen übereinstimmen. Schärfen Sie Ihr Gehör, indem Sie die Abweichung minimieren.',

    vocalPitchTitle: 'Vokale Tonhöhenerkennung',
    vocalPitchShort: 'Imitieren Sie den Ton mit Ihrer eigenen Stimme.',
    vocalPitchDesc: 'Eine Note wird gespielt. Singen Sie dieselbe Note in Ihr Mikrofon. Die App erkennt Ihre Grundfrequenz und misst die Genauigkeit zum Zielton.',

    mnemonicEngineTitle: 'Mnemotext-Engine',
    mnemonicEngineShort: 'Verknüpfen Sie Noten mit bekannten Liedern.',
    mnemonicEngineDesc: 'Weisen Sie allen 12 Noten bestimmte Lieder zu. Nutzen Sie den Übungsmodus, um Ihr Gedächtnis zu trainieren und ein absolutes Gehör aufzubauen.',

    assignSongsTab: 'Lieder zuweisen',
    practiceModeTab: 'Übungsmodus',
    resetSectionBtn: 'Abschnitt zurücksetzen',
    buildMnemonicsTitle: 'Erstellen Sie Ihre Mnemotechnik',
    buildMnemonicsDesc: 'Weisen Sie jeder Note ein bekanntes Lied zu. Wenn Sie die ersten Noten des Liedes hören, wissen Sie sofort, um welche Tonhöhe es sich handelt.',
    selectNoteLabel: 'Note auswählen',
    songTitleOptional: 'Songtitel (Optional)',
    songTitlePlaceholder: 'z. B. Bohemian Rhapsody - Queen',
    youtubeUrlLabel: 'YouTube-URL mit Zeitstempel',
    youtubeUrlPlaceholder: 'https://youtu.be/dQw4w9WgXcQ?t=43',
    enterValidUrlError: 'Bitte geben Sie eine YouTube-URL oder Video-ID ein.',
    couldNotParseVideoIdError: 'Konnte keine gültige YouTube-Video-ID analysieren.',
    savingBtn: 'Wird gespeichert...',
    saveMnemonicMappingBtn: 'Mnemotext-Zuordnung speichern',
    currentAssignmentsTitle: 'Aktuelle Zuweisungen',
    unassignedLabel: 'Nicht zugewiesen',
    clickToEditTitle: 'Klicken, um den Titel zu bearbeiten',
    recallEngineTitle: 'Erinnerungs-Engine',
    recallEngineDesc: 'Wählen Sie eine Zielnote. Die Engine startet sofort Ihr zugewiesenes Mnemonic-Lied ab dem genauen Zeitstempel, um Ihr Tonhöhengedächtnis zu aktivieren.',
    readyBadge: 'Bereit',
    noMnemonicsMapped: 'Noch keine Mnemotechniken zugeordnet.',
    goToAssignPrompt: 'Gehen Sie zu "Lieder zuweisen", um Ihre Erinnerungs-Trigger zu konfigurieren.',
    pickAnotherNoteBtn: 'Andere Note wählen',
    targetPitchLabel: 'Zieltonhöhe',
    beginsAtLabel: 'Beginnt bei',
    resetMnemonicModalTitle: 'Mnemotext-Engine zurücksetzen?',
    resetMnemonicModalDesc: 'Warnung: Dadurch werden alle 12 Noten-Mnemotext-Liedzuweisungen gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.',
    confirmResetBtn: 'Zurücksetzen bestätigen',
    songForNoteDefault: 'Lied für Note',

    languageSelection: 'Sprachauswahl',
    languageDesc: 'Wählen Sie Ihre bevorzugte Sprache',
    profile: 'Profil',
    resetSectionProgress: 'Abschnittsfortschritt zurücksetzen',
    resetSectionDesc: 'Stufen und Statistiken zurücksetzen',
    resetAllSections: 'Alle Abschnitte zurücksetzen',
    resetAllDesc: 'Alle Trainingsmodule auf Standard zurücksetzen',
    accountManagement: 'Kontoverwaltung',
    signOut: 'Abmelden',
    signOutDesc: 'Beenden Sie Ihre aktuelle Sitzung',
    deleteAccount: 'Konto löschen',
    deleteAccountDesc: 'Konto und alle gespeicherten Daten dauerhaft löschen',
    deleteConfirmTitle: 'Konto und alle Daten unwiderruflich löschen?',
    deleteConfirmDesc: 'Diese Aktion kann nicht rückgängig gemacht werden. Alle Kontodaten, Trainingsstufen, Bestenlisteneinträge und Mnemotext-Zuordnungen werden dauerhaft gelöscht.',
    confirmDeletion: 'Konto & alle Daten löschen',
    cancel: 'Abbrechen',

    guideHeading: 'Wie man erlangt:',
    guideSubheadingHighlight: 'Absolutes Gehör',
    guideIntervalsTitle: 'INTERVALLE',
    guideIntervalsText: 'Bevor Sie Töne isoliert identifizieren können, müssen Sie die Beziehung zwischen ihnen beherrschen. Das Intervall-Training schult Ihr Gehirn darin, den Abstand zwischen Noten wahrzunehmen. Dies baut die mentale Struktur auf, die nötig ist, um letztlich die spezifische Höhe jedes einzelnen Tons zu erkennen.',
    guidePitchTitle: 'TONHÖHENERKENNUNG',
    guidePitchText: 'Jede Frequenz hat ihre eigene, unique "Farbe". Die Frequenzauswahl zwingt Sie dazu, kleinste Mikroton-Unterschiede zu differenzieren. Indem Sie die tiefere Frequenz zuverlässig erkennen, sensibilisieren Sie Ihren auditiven Kortex für die subtilen Eigenschaften von Schallwellen.',
    guideFreqImitationTitle: 'FREQUENZ-IMITATION',
    guideFreqImitationText: 'Die aktive Tonhöhenanpassung trainiert die feinmotorisch-auditive Koordination. Indem Sie einen Oszillator manuell auf eine Referenzfrequenz einstellen, schließen Sie die Lücke zwischen passivem Hören und aktiver Frequenzabstimmung, was Ihre Tonhöhenauflösung und mikrotonale Sensibilität enorm verfeinert.',
    guideImitationTitle: 'VOKALE IMITATION',
    guideImitationText: 'Die letzte Brücke ist die Vokalisierung. Wenn Sie eine Tonhöhe singen, aktivieren Sie Muskelgedächtnis und körperliche Resonanz. Die Vokalfunktionen verwandeln passives Hören in aktive Tonerzeugung und festigen das Gehör nachhaltig.',
    guideMnemonicTitle: 'MNEMOTEXT-ENGINE',
    guideMnemonicText: 'Verankern Sie Tonhöhen in tief eingeprägten musikalischen Erinnerungen. Indem Sie alle 12 chromatischen Töne mit präzisen Zeitstempeln bekannter Lieder verknüpfen, baut Ihr Gehirn blitzschnelle semantische Trigger auf, die jedes Raten überflüssig machen und den Weg zum echten absoluten Gehör ebnen.',
    guideFooterText: 'Täglich 15 Minuten Training sind effektiver als eine dreistündige wöchentliche Einheit. Regelmäßigkeit ist der Schlüssel zum Erfolg.',
    waveformAsset: 'Wellenform',
    spectrogramAsset: 'Spektrogramm',
    dialAsset: 'Regler / Oszillator',
    singerAsset: 'Sänger-Silhouette',
    memoryAsset: 'Gedächtnis-Trigger',

    syncingWithCloud: 'Mit Cloud synchronisieren...',
    nameColumn: 'Name',
    toleranceColumn: 'Toleranz',
    accuracyColumn: 'Genauigkeit',
    gapColumn: 'Abstand',
    sessionsAveraged: 'Sitzungen gemittelt',
    noScoresRecorded: 'Für diesen Modus wurden noch keine Ergebnisse aufgezeichnet.',
    signInLeaderboardPrompt: 'Melden Sie sich an, um Ihre Ergebnisse zu veröffentlichen und die Rangliste zu erklimmen',
    authenticateNow: 'Jetzt anmelden',

    continueWithApple: 'Mit Apple fortfahren',
    privacyPolicy: 'Datenschutzerklärung',
    termsOfService: 'Nutzungsbedingungen',
    termsAgreementNotice: 'Indem Sie fortfahren, stimmen Sie unseren Nutzungsbedingungen und der Datenschutzerklärung zu. Wir verfolgen eine Null-Toleranz-Politik (zero tolerance) gegenüber anstößigen Inhalten oder missbräuchlichen Nutzern.',
    reportUser: 'Benutzername melden',
    blockUser: 'Benutzer blockieren',
    reportSubmitted: 'Meldung gesendet. Danke für Ihre Unterstützung.',
    userBlockedNotice: 'Benutzer wurde blockiert. Seine Ergebnisse werden nicht mehr auf Ihrer Bestenliste angezeigt.',
    inappropriateUsernameError: 'Dieser Benutzername enthält unangemessene Ausdrücke. Bitte wählen Sie einen anderen.',
    reauthRequiredTitle: 'Identität bestätigen',
    reauthRequiredDesc: 'Aus Sicherheitsgründen bestätigen Sie bitte Ihre Anmeldedaten, bevor Sie das Konto endgültig löschen.',
    enterPasswordToConfirm: 'Passwort eingeben, um Löschung zu bestätigen:',
    confirmReauth: 'Bestätigen und Löschen',
    micPermissionTitle: 'Mikrofonberechtigung erforderlich',
    micPermissionDesc: 'HearEar nutzt Ihr Mikrofon ausschließlich zur Echtzeit-Tonhöhenerkennung auf Ihrem Gerät. Audiodaten werden niemals aufgezeichnet oder hochgeladen.',
    micPermissionDenied: 'Mikrofonzugriff verweigert. Bitte erlauben Sie den Mikrofonzugriff in den Browser- oder Geräteeinstellungen, um das Vokaltraining zu nutzen.',
    micPermissionSettingsHint: 'Prüfen Sie die Datenschutz-Einstellungen im Browser oder Gerät, um den Mikrofonzugriff zu aktivieren.',
    externalDeletionTitle: 'Konto- und Datenlöschungsportal',
    externalDeletionDesc: 'Gemäß den Richtlinien von App Store und Google Play können Sie jederzeit die dauerhafte Löschung Ihres Kontos und aller zugehörigen Trainingsdaten anfordern.',
    requestDeletionBtn: 'Löschantrag stellen',
    deletionRequestSent: 'Ihr Löschantrag wurde registriert und wird unverzüglich verarbeitet.',
    closeDialog: 'Schließen',
  },
};
