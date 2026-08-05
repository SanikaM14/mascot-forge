import React, { useState } from 'react';
import { useMascotSpec } from '../../hooks/useMascotSpec';
import { generateMascot, analyzeScreenshot } from '../../lib/api';
import { exampleMascots } from '../../lib/exampleMascots';
import { Upload, Sparkles, Loader2, ChevronRight, LayoutTemplate, Wand2, ImagePlus, PenLine, X, Check } from 'lucide-react';

export default function DescribeOrUpload({ onPreviewChange }) {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { setSpec, setIsGenerating, isGenerating, setError, error } = useMascotSpec();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        if (onPreviewChange) onPreviewChange(reader.result);
      };
      reader.readAsDataURL(selected);
    }
  };

  const clearFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    if (onPreviewChange) onPreviewChange(null);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      let extractedStyle = null;
      if (file) {
        const analyzeRes = await analyzeScreenshot(file);
        extractedStyle = analyzeRes.extracted_style;
      }
      const res = await generateMascot(description, extractedStyle);
      setSpec(res.spec);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectTemplate = (mascot) => {
    setSpec(mascot);
  };

  // Drag & drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('image/')) {
      const syntheticEvent = { target: { files: [dropped] } };
      handleFileChange(syntheticEvent);
    }
  };

  const hasInput = description.trim() || file;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5 fade-in">

      {/* ── Main Input Card ── */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-6 md:p-8 space-y-6 relative overflow-hidden">
        
        {/* Subtle inner glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-[0.04] blur-[80px] pointer-events-none" style={{ background: 'var(--theme-primary)' }} />

        {/* ── Two column: Description + Upload ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Left — Description */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-theme-primary/15 flex items-center justify-center">
                <PenLine className="w-3 h-3 text-theme-primary" />
              </div>
              <span className="text-sm font-semibold text-white">Describe your brand</span>
            </div>
            <textarea
              className="w-full h-[140px] resize-none bg-black/40 border border-white/[0.06] rounded-xl p-4 text-sm text-white placeholder:text-foreground-muted/60 focus:border-theme-primary/40 focus:ring-1 focus:ring-theme-primary/10 outline-none transition-all font-[inherit] leading-relaxed"
              placeholder="e.g. A cozy plant-care blog with warm greens, gentle personality, should wave hello..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {description && (
              <div className="flex items-center gap-1.5 text-[11px] text-green-400/80">
                <Check className="w-3 h-3" />
                <span>Ready to forge</span>
              </div>
            )}
          </div>

          {/* Right — Screenshot Upload */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-theme-primary/15 flex items-center justify-center">
                <ImagePlus className="w-3 h-3 text-theme-primary" />
              </div>
              <span className="text-sm font-semibold text-white">Upload screenshot</span>
              <span className="text-[10px] text-foreground-muted/60 px-2 py-0.5 rounded-full bg-white/5">optional</span>
            </div>
            <div
              className={`relative rounded-xl border-2 border-dashed transition-all duration-300 h-[140px] group cursor-pointer ${
                isDragOver 
                  ? 'border-theme-primary/60 bg-theme-primary/5' 
                  : preview 
                    ? 'border-white/10 bg-black/20' 
                    : 'border-white/[0.06] bg-black/20 hover:border-white/15 hover:bg-white/[0.02]'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="screenshot-upload" />
              <label htmlFor="screenshot-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                {preview ? (
                  <div className="relative w-full h-full">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-[10px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-[10px] flex items-end justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1.5 text-[11px] text-green-400">
                        <Sparkles className="w-3 h-3" />
                        <span>AI will read colors & mood</span>
                      </div>
                      <button
                        onClick={clearFile}
                        className="w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center px-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/[0.06] flex items-center justify-center group-hover:border-theme-primary/30 group-hover:bg-theme-primary/5 transition-all">
                      <Upload className="w-4 h-4 text-foreground-muted group-hover:text-theme-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/80">Click or drag & drop</p>
                      <p className="text-[10px] text-foreground-muted mt-0.5">PNG, JPG, WEBP</p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* ── Error Message ── */}
        {error && (
          <div className="flex items-start gap-3 p-3.5 bg-red-950/30 border border-red-500/20 rounded-xl text-red-300 text-xs leading-relaxed">
            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <X className="w-3 h-3 text-red-400" />
            </div>
            <span>{error}</span>
          </div>
        )}

        {/* ── Generate Button ── */}
        <button
          className={`w-full py-4 flex items-center justify-center gap-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
            isGenerating || !hasInput
              ? 'bg-white/5 border border-white/[0.06] text-foreground-muted cursor-not-allowed'
              : 'bg-gradient-to-r from-[var(--theme-primary)] to-[#ff6090] text-white shadow-[0_8px_32px_rgba(233,30,99,0.25)] hover:shadow-[0_12px_40px_rgba(233,30,99,0.35)] hover:-translate-y-0.5 active:translate-y-0'
          }`}
          onClick={handleGenerate}
          disabled={isGenerating || !hasInput}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
              <span>Forging your mascot...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4.5 h-4.5" />
              <span>Forge with AI</span>
            </>
          )}
        </button>
      </div>

      {/* ── Divider ── */}
      <div className="flex items-center gap-4 px-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        <span className="text-[10px] text-foreground-muted/50 uppercase tracking-[0.2em] font-medium">or start from a template</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </div>

      {/* ── Templates Section ── */}
      <div>
        <button
          className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all group"
          onClick={() => setShowTemplates(!showTemplates)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/[0.06] flex items-center justify-center group-hover:border-theme-primary/30 group-hover:bg-theme-primary/5 transition-all">
              <LayoutTemplate className="w-4 h-4 text-foreground-muted group-hover:text-theme-primary transition-colors" />
            </div>
            <div className="text-left">
              <span className="text-sm font-semibold text-white block">Browse templates</span>
              <span className="text-[10px] text-foreground-muted">{exampleMascots.length} pre-designed mascots</span>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 text-foreground-muted transition-transform duration-300 ${showTemplates ? 'rotate-90' : ''}`} />
        </button>

        {showTemplates && (
          <div className="mt-3 fade-in">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full mb-3 bg-black/40 border border-white/[0.06] rounded-xl p-3 text-sm text-white placeholder:text-foreground-muted/60 focus:border-theme-primary/40 focus:ring-1 focus:ring-theme-primary/10 outline-none transition-all"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {exampleMascots
              .filter(m => m.meta.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.meta.personality_tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
              .map((mascot, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectTemplate(mascot)}
                className="group p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-theme-primary/40 hover:bg-theme-primary/[0.04] transition-all text-left relative overflow-hidden"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                {/* Color swatch preview */}
                <div className="flex gap-1.5 mb-3 relative">
                  {[mascot.appearance.primary_color, mascot.appearance.secondary_color, mascot.appearance.accent_color].map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div className="font-semibold text-sm text-white group-hover:text-theme-primary transition-colors relative">{mascot.meta.name}</div>
                <div className="text-[10px] text-foreground-muted capitalize mt-0.5 relative">{mascot.appearance.body_shape.replace('_', ' ')}</div>
                <div className="flex flex-wrap gap-1 mt-2 relative">
                  {mascot.meta.personality_tags.map(tag => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/[0.04] text-foreground-muted">{tag}</span>
                  ))}
                </div>
              </button>
            ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
