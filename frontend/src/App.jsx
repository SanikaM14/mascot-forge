import React, { useState, useEffect } from 'react';
import DescribeOrUpload from './components/InputStep/DescribeOrUpload';
import MascotCanvas from './components/Preview/MascotCanvas';
import EditorPanel from './components/Editor/EditorPanel';
import ExportModal from './components/Export/ExportModal';
import InlineExport from './components/Export/InlineExport';
import { useMascotSpec } from './hooks/useMascotSpec';
import { useMascotEvents } from './hooks/useMascotEvents';
import { exampleMascots } from './lib/exampleMascots';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { saveProject, getProjects } from './lib/api';
import { Download, Sparkles, ChevronRight, Copy, Share2, Sliders, X, ArrowLeft, Home, Compass, FolderOpen, ArrowRight, Heart, Save, UploadCloud, Bot, Smile, Check, FolderDown, RotateCcw, Sun, Moon } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showExport, setShowExport] = useState(false);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const { spec, setSpec, updateAppearance } = useMascotSpec();
  const { currentAnimation, currentDialogue, currentFaceStyle, setCurrentAnimation, setCurrentDialogue, setCurrentFaceStyle } = useMascotEvents(spec);

  const [showArchModal, setShowArchModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Project History & Database States
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  // Library States
  const [libraryProjects, setLibraryProjects] = useState([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  // Auto cycle example mascots in landing page
  useEffect(() => {
    if (currentView !== 'landing') return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % exampleMascots.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [currentView]);

  // Sync spec with history for pagination dots
  useEffect(() => {
    if (spec) {
      setHistory(prev => {
        const alreadyExists = prev.some(h => JSON.stringify(h) === JSON.stringify(spec));
        if (alreadyExists) return prev;
        const nextHistory = [...prev, spec];
        setHistoryIndex(nextHistory.length - 1);
        return nextHistory;
      });
    }
  }, [spec]);

  // Fetch Library Projects
  const loadLibrary = async () => {
    setIsLoadingLibrary(true);
    try {
      const res = await getProjects();
      setLibraryProjects((res || []).slice(-5).reverse());
    } catch (err) {
      showToast("Failed to load library", "error");
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  useEffect(() => {
    if (currentView === 'library') loadLibrary();
  }, [currentView]);

  const activeMascot = currentView === 'landing' ? exampleMascots[carouselIndex] : spec;

  const themeStyles = activeMascot ? {
    '--theme-primary': activeMascot.appearance.primary_color,
    '--theme-secondary': activeMascot.appearance.secondary_color,
    '--theme-accent': activeMascot.appearance.accent_color,
  } : {};

  const handleSaveProject = async () => {
    if (!spec) return;
    try {
      const res = await saveProject(spec.meta.name || "My Mascot", spec);
      setCurrentProjectId(res?.project_id);
      showToast("Project saved to your library!", "success");
      loadLibrary();
    } catch (err) { 
      showToast("Failed to save project.", "error"); 
    }
  };

  const handleDownloadProjectZip = async (project) => {
    try {
      const zip = new JSZip();
      
      // JSON Spec
      zip.file("MascotSpec.json", JSON.stringify(project.spec, null, 2));
      
      // JSX Component
      const jsxContent = `import React from 'react';
import { useMascotSpec } from './hooks/useMascotSpec';
// Use the downloaded JSON spec
import spec from './MascotSpec.json';

export default function Mascot() {
  return <div>Mascot Component Ready!</div>;
}
`;
      zip.file("Mascot.jsx", jsxContent);
      
      // Python Dict
      const pyContent = `mascot_spec = ${JSON.stringify(project.spec, null, 4)}
`;
      zip.file("mascot.py", pyContent);

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, (project.name || "Mascot") + '.zip');
      showToast("Downloaded zip successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to download zip.", "error");
    }
  };

  const handleLoadProject = (projectSpec, projectId) => {
    setSpec(projectSpec);
    setCurrentProjectId(projectId);
    setCurrentView('create');
  };

  // Nav links based on context
  const landingNavLinks = [
    { label: 'Home', view: 'landing' },
    { label: 'Create', view: 'create' },
    { label: 'Under the Hood', action: () => setShowArchModal(true) },
  ];

  const createNavLinks = [
    { label: 'Create', view: 'create' },
    { label: 'Under the Hood', action: () => setShowArchModal(true) },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans overflow-hidden transition-all duration-500 pb-28 ${!isDarkMode ? 'light-mode bg-white text-black' : 'bg-background text-foreground'}`}
      style={themeStyles}
    >
      {/* ─────────────────────────────────────────────── */}
      {/* HEADER — Flower Street ref: logo-left, links-right, avatar-right */}
      {/* ─────────────────────────────────────────────── */}
      <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-md z-20 shrink-0 w-full flex justify-center">
        <div className="w-full h-full max-w-7xl px-8 md:px-16 flex items-center justify-between">
        {/* Logo left */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('landing')}>
          <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight logo-serif">MascotForge</span>
        </div>

        {/* Nav Links RIGHT — Flower Street reference */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
          {(currentView === 'create' && spec ? createNavLinks : landingNavLinks).map(link => (
            <button
              key={link.label}
              onClick={() => link.action ? link.action() : (link.view && setCurrentView(link.view))}
              className={`transition-colors ${
                link.view === currentView && !link.action
                  ? 'text-white border-b border-theme-primary pb-0.5'
                  : 'text-foreground-muted hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Avatar / Auth — right of nav (Blob Sofa ref: top-right emoji circle) */}
        <div className="flex items-center gap-3">
          {spec && (
            <button
              onClick={() => setSpec(null)}
              className="text-xs font-medium text-foreground-muted hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
              title="Reset to Default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors group"
            title="Toggle Theme"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-foreground-muted group-hover:text-white transition-colors" />
            ) : (
              <Moon className="w-5 h-5 text-foreground-muted group-hover:text-black transition-colors" />
            )}
          </button>

          {/* Top-right avatar circle — Blob Sofa reference */}
          <div
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors group"
            title="Account"
          >
            <Smile className="w-5 h-5 text-foreground-muted group-hover:text-white transition-colors" />
          </div>
        </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────── */}
      {/* MAIN */}
      {/* ─────────────────────────────────────────────── */}
      <main className="flex-1 relative flex overflow-hidden">

        {/* ── LANDING PAGE ── Flower Street reference ── */}
        {currentView === 'landing' && (
          <div className="w-full h-full flex flex-col md:flex-row items-center justify-between px-8 md:px-16 max-w-7xl mx-auto py-12 md:py-0 fade-in">

            {/* Left: headline, sub, CTA, dots */}
            <div className="flex-1 text-left z-10">
              {/* Italic script accent line — Flower Street "This Valentine's Day" */}
              <div className="logo-serif text-foreground-muted text-xl mb-3 italic">
                Your site deserves a face
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-xl mb-5">
                Give your website a{' '}
                <span className="text-gradient">personality</span>.
              </h2>
              <p className="text-base md:text-lg text-foreground-muted leading-relaxed font-normal max-w-md mb-2">
                Create dynamic, customizable 3D mascots that react, converse, and breathe life into your web application in seconds.
              </p>
              {/* Fine-print — Flower Street "T&C applied" */}
              <p className="text-[11px] text-foreground-muted/40 mb-8">
                No account needed to start. Free tier includes 3 exports.
              </p>

              {/* Solid pill CTA — Flower Street "Explore more" */}
              <button
                className="btn-primary py-4 px-10 text-base font-bold inline-flex items-center gap-2 mb-10"
                onClick={() => setCurrentView('create')}
              >
                Create your mascot <ChevronRight className="w-4 h-4" />
              </button>

              {/* Carousel dot indicators — Flower Street bottom dots */}
              <div className="flex items-center gap-3">
                {exampleMascots.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCarouselIndex(idx)}
                    className={`rounded-full transition-all duration-400 ${
                      carouselIndex === idx
                        ? 'w-6 h-2.5 bg-theme-primary'
                        : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right: 3D mascot — Flower Street "flower photo right side" */}
            <div className="flex-1 w-full h-[320px] md:h-[65vh] mascot-glow-container flex items-center justify-center relative mt-10 md:mt-0">
              <div className="w-full h-full transition-transform duration-700 hover:scale-[1.02]">
                <MascotCanvas spec={exampleMascots[carouselIndex]} currentAnimation="gentle_bob" currentFaceStyle={exampleMascots[carouselIndex].appearance.face_style} />
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE / PREVIEW / CODE PAGE ── Flora reference ── */}
        {currentView === 'create' && (
          <div className="w-full h-full relative flex flex-col p-6 md:p-10 fade-in overflow-y-auto">
            {!spec ? (
              /* Input step — premium redesign */
              <div className="w-full flex-1 flex items-center justify-center relative overflow-hidden">
                {/* Decorative background orbs */}
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none create-bg-orb" style={{ background: 'var(--theme-primary)' }} />
                <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none create-bg-orb" style={{ background: 'var(--theme-accent, #FCE4EC)', animationDelay: '3s' }} />

                <div className="w-full max-w-3xl mx-auto px-4 relative z-10">
                  {/* Hero header */}
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/8 text-xs text-foreground-muted mb-5">
                      <Sparkles className="w-3 h-3 text-theme-primary" />
                      <span>AI-Powered Mascot Generation</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-[1.1]">
                      Bring your app to <span className="text-gradient">life</span>
                    </h2>
                    <p className="text-foreground-muted text-sm md:text-base max-w-md mx-auto leading-relaxed">
                      Describe your brand or drop a screenshot — our AI will craft a unique 3D mascot that matches your vibe.
                    </p>
                  </div>

                  <DescribeOrUpload onPreviewChange={(img) => setUploadedPreview(img)} />
                </div>
              </div>
            ) : (
              /* Flora-style layout: mascot center-right hero, left info, right panel */
              <div className="relative flex-1 min-h-0">

                {/* Top bar: action links right */}
                <div className="flex justify-end items-center mb-6">
                  <div className="flex items-center gap-4 text-sm text-foreground-muted">
                    <button onClick={() => setShowExport(true)} className="hover:text-white transition-colors">Export code</button>
                  </div>
                </div>

                {/* Main Flora layout grid */}
                <div className="grid grid-cols-12 gap-4 h-[calc(100vh-14rem)]">

                  {/* LEFT info panel — Flora: category label, big name, description, Origin/Family row */}
                  <div className="col-span-12 md:col-span-4 flex flex-col justify-center space-y-5 z-10">
                    <EditorPanel />
                    {/* Category tag — Flora "Asteraceae" */}
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--theme-primary)' }} />
                      <span className="text-xs text-foreground-muted uppercase tracking-widest">{spec.appearance.material.replace('_',' ')}</span>
                    </div>

                    {/* Large name — Flora "Dahlia" */}
                    <div>
                      <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-2 leading-[1.05]">{spec.meta.name}</h1>
                      {spec.meta.personality_tags?.[0] && (
                        <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-theme-primary font-semibold capitalize">
                          {spec.meta.personality_tags[0]}
                        </span>
                      )}
                    </div>

                    {/* Description — Flora paragraph */}
                    <p className="text-sm text-foreground-muted leading-relaxed max-w-xs">
                      {spec.meta.voice_style} personality. A {spec.meta.personality_tags.join(', ')} companion built to engage users and react to their browsing behavior.
                    </p>

                    {/* Origin / Family row — Flora "Origin: Mexico / Family: Asteraceae" */}
                    <div className="grid grid-cols-2 gap-x-8 pt-3 border-t border-white/5">
                      <div>
                        <span className="text-[10px] text-foreground-muted uppercase tracking-widest block mb-0.5">Style</span>
                        <span className="text-sm font-semibold capitalize">{spec.appearance.body_shape.replace('_',' ')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-foreground-muted uppercase tracking-widest block mb-0.5">Material</span>
                        <span className="text-sm font-semibold capitalize">{spec.appearance.material.replace('_',' ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* CENTER — Flora: large flower photo dominates center */}
                  <div className="col-span-12 md:col-span-5 relative flex flex-col items-center justify-between mascot-glow-container min-h-[50vh] md:min-h-full py-4 bg-black/10 rounded-2xl border border-white/5">
                    {/* Floating dialogue bubble */}
                    {currentDialogue && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 fade-in-up max-w-xs">
                        <div className="bg-white text-black font-semibold px-5 py-3 rounded-2xl rounded-bl-none shadow-2xl text-xs text-center">
                          {currentDialogue}
                        </div>
                      </div>
                    )}

                    <div className="w-full flex-1 min-h-0">
                      <MascotCanvas 
                        spec={spec} 
                        currentAnimation={currentAnimation === 'idle' ? (spec?.animations?.idle || 'gentle_bob') : currentAnimation} 
                        currentFaceStyle={currentFaceStyle} 
                      />
                    </div>

                    {/* Quick Preview Action Bar */}
                    <div className="w-full max-w-sm px-3 py-2 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 z-10 flex flex-col gap-1.5 mt-2">
                      <div className="flex items-center justify-between text-[10px] text-foreground-muted uppercase tracking-wider font-semibold border-b border-white/5 pb-1">
                        <span>Preview Action</span>
                        <span>Expression</span>
                      </div>
                      
                      <div className="flex items-center justify-between gap-3">
                        {/* Animations */}
                        <div className="flex gap-1 overflow-x-auto py-0.5 max-w-[50%] scrollbar-none">
                          {[
                            { id: 'wave', icon: 'bi-hand-wave', label: 'Wave', msg: 'on_load', face: 'wide_eyes' },
                            { id: 'dance', icon: 'bi-music-note-beamed', label: 'Dance', msg: 'on_success_action', face: 'star_eyes' },
                            { id: 'happy_jump', icon: 'bi-rocket-takeoff', label: 'Jump', msg: 'on_success_action', face: 'wink' },
                            { id: 'shake', icon: 'bi-activity', label: 'Shake', msg: 'on_error', face: 'crying' },
                          ].map(act => (
                            <button
                              key={act.id}
                              onClick={() => {
                                setCurrentAnimation(act.id);
                                if (act.face) setCurrentFaceStyle(act.face);
                                if (spec.dialogues && act.msg in spec.dialogues) {
                                  setCurrentDialogue(spec.dialogues[act.msg]);
                                } else {
                                  setCurrentDialogue("Look at me!");
                                }
                                setTimeout(() => {
                                  setCurrentAnimation('idle');
                                  setCurrentDialogue(null);
                                  setCurrentFaceStyle(null);
                                }, 3000);
                              }}
                              className="px-2 py-1 bg-white/5 border border-white/10 hover:bg-white/12 text-white rounded-md text-xs transition-all shrink-0 active:scale-95 flex items-center gap-1"
                            >
                              <i className={`bi ${act.icon}`}></i>
                              <span>{act.label}</span>
                            </button>
                          ))}
                        </div>

                        {/* Divider */}
                        <div className="h-5 w-px bg-white/10 shrink-0" />

                        {/* Expressions */}
                        <div className="flex gap-1 overflow-x-auto py-0.5 max-w-[45%] scrollbar-none">
                          {[
                            { id: 'cute_dot_eyes', icon: 'bi-emoji-smile' },
                            { id: 'wide_eyes', icon: 'bi-emoji-surprise' },
                            { id: 'sleepy', icon: 'bi-moon-stars' },
                            { id: 'heart_eyes', icon: 'bi-emoji-heart-eyes' },
                            { id: 'star_eyes', icon: 'bi-star-fill' },
                          ].map(exp => (
                            <button
                              key={exp.id}
                              onClick={() => {
                                updateAppearance('face_style', exp.id);
                              }}
                              className={`w-6 h-6 flex items-center justify-center rounded-md text-xs transition-all active:scale-95 ${
                                spec.appearance.face_style === exp.id 
                                  ? 'bg-theme-primary text-black border border-theme-primary font-bold' 
                                  : 'bg-white/5 border border-white/10 hover:bg-white/12 text-white'
                              }`}
                              title={exp.id.replace(/_/g, ' ')}
                            >
                              <i className={`bi ${exp.icon}`}></i>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>


                  {/* RIGHT panel — Enhanced with interactive colors, stats, quick actions */}
                  <div className="col-span-12 md:col-span-3 flex flex-col space-y-3 z-10 overflow-y-auto custom-scrollbar pr-1">

                    {/* Uploaded preview or color circles */}
                    {uploadedPreview && (
                      <div className="h-20 rounded-xl overflow-hidden border border-white/5 bg-gradient-to-br from-white/5 to-black/20">
                        <img src={uploadedPreview} className="w-full h-full object-cover" alt="Reference screenshot" />
                      </div>
                    )}

                    {/* Interactive Color Pickers — visible, real-time */}
                    <div className="rounded-xl border border-white/5 bg-white/3 p-3 space-y-2.5">
                      <span className="text-[10px] text-foreground-muted uppercase tracking-widest font-semibold">Color Palette</span>
                      <div className="space-y-2">
                        {[
                          { key: 'primary_color', label: 'Primary' },
                          { key: 'secondary_color', label: 'Secondary' },
                          { key: 'accent_color', label: 'Accent' },
                        ].map(({ key, label }) => (
                          <div key={key} className="flex items-center gap-2.5">
                            <div className="color-swatch-interactive" style={{ backgroundColor: spec.appearance[key] }}>
                              <input
                                type="color"
                                value={spec.appearance[key]}
                                onChange={(e) => updateAppearance(key, e.target.value)}
                                aria-label={`Change ${label} color`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] text-foreground-muted block leading-none">{label}</span>
                              <span className="text-[11px] font-mono text-white/70">{spec.appearance[key]}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Preset palette row */}
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-[9px] text-foreground-muted uppercase tracking-wider block mb-1.5">Presets</span>
                        <div className="preset-palette-row">
                          {['#E91E63','#FF5722','#FF9800','#4CAF50','#00BCD4','#2196F3','#673AB7','#9C27B0','#F44336','#607D8B'].map(color => (
                            <button
                              key={color}
                              className={`preset-swatch ${spec.appearance.primary_color === color ? 'active' : ''}`}
                              style={{ backgroundColor: color }}
                              onClick={() => updateAppearance('primary_color', color)}
                              aria-label={`Set primary color to ${color}`}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Mascot Stats Card */}
                    <div className="rounded-xl border border-white/5 bg-white/3 p-3 space-y-2">
                      <span className="text-[10px] text-foreground-muted uppercase tracking-widest font-semibold">Mascot Details</span>
                      <div className="mascot-stats-grid">
                        <div className="mascot-stat-item">
                          <div className="stat-label">Shape</div>
                          <div className="stat-value">{spec.appearance.body_shape.replace(/_/g, ' ')}</div>
                        </div>
                        <div className="mascot-stat-item">
                          <div className="stat-label">Material</div>
                          <div className="stat-value">{spec.appearance.material.replace(/_/g, ' ')}</div>
                        </div>
                        <div className="mascot-stat-item">
                          <div className="stat-label">Expression</div>
                          <div className="stat-value">{spec.appearance.face_style.replace(/_/g, ' ')}</div>
                        </div>
                        <div className="mascot-stat-item">
                          <div className="stat-label">Accessory</div>
                          <div className="stat-value">{spec.appearance.has_ears_or_antenna === 'none' ? '—' : spec.appearance.has_ears_or_antenna}</div>
                        </div>
                      </div>
                      {/* Personality tags */}
                      {spec.meta.personality_tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {spec.meta.personality_tags.map((tag, i) => (
                            <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-foreground-muted capitalize">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Voice & Tip Card */}
                    <div className="glass-panel p-3.5 space-y-1.5">
                      <p className="text-[11px] font-semibold text-foreground">"{spec.meta.voice_style}"</p>
                      <p className="text-[10px] text-foreground-muted leading-relaxed">
                        Use the Edit panel to adjust colors, animations, and triggers. The AI Refine chat can reshape your mascot with plain English.
                      </p>
                      <p className="text-[9px] text-foreground-muted/50 italic">— MascotForge</p>
                    </div>

                    {/* Share row removed */}

                    {/* Inline Export Component */}
                    <InlineExport />
                  </div>
                </div>

                {/* Bottom row — pagination dots left + action icons right — Flora bottom strip */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  {/* Pagination dots — Flora bottom-left */}
                  <div className="flex items-center gap-2">
                    {history.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setSpec(history[idx]); setHistoryIndex(idx); }}
                        className={`rounded-full transition-all duration-300 ${
                          historyIndex === idx ? 'w-5 h-2 bg-theme-primary' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                        }`}
                      />
                    ))}
                    {history.length === 0 && (
                      <div className="flex gap-1.5">
                        {[0,1,2].map(i => <div key={i} className={`rounded-full ${i===0?'w-5 h-2 bg-white/40':'w-2 h-2 bg-white/15'}`}/>)}
                      </div>
                    )}
                  </div>

                  {/* Action buttons row — right */}
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-foreground-muted hover:text-white transition-colors"
                      onClick={handleSaveProject}
                      title="Save to Library"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── LIBRARY VIEW ── */}
        {currentView === 'library' && (
          <div className="w-full h-full overflow-y-auto p-8 fade-in max-w-6xl mx-auto pb-32">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <FolderOpen className="w-7 h-7 text-theme-primary" />
                <h2 className="text-3xl font-bold tracking-tight">Recent History</h2>
              </div>
              {spec && (
                <button onClick={handleSaveProject} className="btn-primary py-2 px-5 text-sm font-semibold flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save current
                </button>
              )}
            </div>
            {isLoadingLibrary ? (
              <div className="text-center py-20 text-foreground-muted">Loading...</div>
            ) : libraryProjects.length === 0 ? (
              <div className="text-center py-20 text-foreground-muted italic bg-white/3 border border-white/5 rounded-2xl">
                No saved projects yet. Create a mascot and hit Save!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {libraryProjects.map((p) => (
                  <div key={p.id} className="glass-panel p-5 cursor-pointer hover:border-theme-primary/40 hover:scale-[1.01] transition-all flex flex-col justify-between" onClick={() => handleLoadProject(p.spec, p.id)}>
                    <div className="w-full h-40 rounded-lg bg-black/40 mb-4 border border-white/5 overflow-hidden">
                      <MascotCanvas spec={p.spec} currentAnimation="gentle_bob" />
                    </div>
                    <h3 className="text-base font-bold capitalize mb-1">{p.name}</h3>
                    <p className="text-xs text-foreground-muted mb-3">Saved {new Date(p.created_at || Date.now()).toLocaleDateString()}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-[10px] uppercase text-theme-primary font-bold px-2 py-0.5 bg-white/5 rounded border border-white/5">
                        {p.spec?.appearance?.body_shape || 'unknown'}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadProjectZip(p);
                        }}
                        className="btn-primary py-1 px-3 text-xs flex items-center gap-1 bg-white/10 hover:bg-white/20 border-0"
                      >
                        <FolderDown className="w-3.5 h-3.5" /> Zip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────── */}
      {/* FLOATING BOTTOM NAV DOCK — Blob Sofa reference */}
      {/* Centered pill + dark filled circular arrow button */}
      {/* ─────────────────────────────────────────────── */}
      <nav className="bottom-nav-dock" role="navigation" aria-label="Main navigation">
        <button onClick={() => setCurrentView('landing')} className={`bottom-nav-btn ${currentView === 'landing' ? 'active' : ''}`} title="Home" aria-label="Go to home page" aria-current={currentView === 'landing' ? 'page' : undefined}>
          <Home className="w-5 h-5" />
        </button>
        <button onClick={() => setCurrentView('library')} className={`bottom-nav-btn ${currentView === 'library' ? 'active' : ''}`} title="Recent History" aria-label="Open your recent history" aria-current={currentView === 'library' ? 'page' : undefined}>
          <FolderOpen className="w-5 h-5" />
        </button>
        <button onClick={() => setCurrentView('create')} className="bottom-nav-highlight" title="Create" aria-label="Create a new mascot">
          <ArrowRight className="w-5 h-5" />
        </button>
      </nav>

      {/* Export Modal */}
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}

      {/* Architecture Modal */}
      {showArchModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[100] fade-in px-4">
          <div className="glass-panel p-8 w-full max-w-lg relative space-y-6">
            <button type="button" onClick={() => setShowArchModal(false)} className="absolute top-4 right-4 text-foreground-muted hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-full bg-theme-primary/20 flex items-center justify-center border border-theme-primary/30">
                <Bot className="w-5 h-5 text-theme-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Under the Hood</h2>
                <p className="text-xs text-foreground-muted">Architecture & Tech Stack</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Frontend
                </h3>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  <strong className="text-white/80">React + Vite + React Three Fiber.</strong> Declarative 3D rigging and rendering in the browser. High-performance styling with Tailwind CSS.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  AI Core
                </h3>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  <strong className="text-white/80">Llama 3.1 70B via Groq.</strong> Sub-second JSON generation with strict schema enforcement. Handles natural language to 3D mapping effortlessly.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  Backend
                </h3>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  <strong className="text-white/80">FastAPI (Python).</strong> Lightning-fast API orchestration, prompt management, and seamless integration with community databases.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button onClick={() => setShowArchModal(false)} className="btn-primary py-2 px-6 text-sm font-bold rounded-full">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] fade-in shadow-2xl">
          <div className={`flex items-center gap-2 px-5 py-3 rounded-full border backdrop-blur-md ${
            toast.type === 'error' 
              ? 'bg-red-950/80 border-red-500/30 text-red-100' 
              : toast.type === 'success'
                ? 'bg-green-950/80 border-green-500/30 text-green-100'
                : 'bg-black/80 border-white/10 text-white'
          }`}>
            {toast.type === 'error' && <X className="w-4 h-4 text-red-400" />}
            {toast.type === 'success' && <Check className="w-4 h-4 text-green-400" />}
            <span className="text-sm font-medium tracking-wide">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
