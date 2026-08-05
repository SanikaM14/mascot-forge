import React, { useState } from 'react';
import { useMascotSpec } from '../../hooks/useMascotSpec';
import { Download, Code, X, Copy, Check, FileCode, Bot, Terminal } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function ExportModal({ onClose }) {
  const { spec } = useMascotSpec();
  const [activeTab, setActiveTab] = useState('react');
  const [reactCode, setReactCode] = useState(null);
  const [pythonCode, setPythonCode] = useState(null);
  const [aiPrompt, setAiPrompt] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (code, filename, mimeType = 'text/javascript') => {
    const blob = new Blob([code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Generate React / Three.js component
  const generateReact = async () => {
    if (reactCode) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec, format: 'jsx' }),
      });
      const data = await res.json();
      setReactCode(data.code);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Generate Python script
  const generatePython = async () => {
    if (pythonCode) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec, format: 'python' }),
      });
      const data = await res.json();
      setPythonCode(data.code);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Generate AI Prompt
  const generateAIPrompt = async () => {
    if (aiPrompt) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/generate-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec }),
      });
      const data = await res.json();
      setAiPrompt(data.prompt);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const tabs = [
    { id: 'react', label: 'React + Three.js', icon: FileCode, description: 'Drop-in React component with full Three.js rendering', action: generateReact, code: reactCode, filename: `${spec?.meta?.name || 'Mascot'}.jsx`, mimeType: 'text/javascript' },
    { id: 'python', label: 'Python', icon: Terminal, description: 'Python script with mascot spec — use with your 3D engine of choice', action: generatePython, code: pythonCode, filename: `${spec?.meta?.name || 'mascot'}_spec.py`, mimeType: 'text/x-python' },
    { id: 'prompt', label: 'AI Prompt', icon: Bot, description: 'Copy this exact prompt into ChatGPT, Claude, or any other agent to recreate this mascot', action: generateAIPrompt, code: aiPrompt, filename: null },
  ];

  const activeTabData = tabs.find(t => t.id === activeTab);

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    tab.action();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 fade-in p-4">
      <div className="glass-panel w-full max-w-4xl relative flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="p-6 border-b border-white/5 shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Code className="w-5 h-5 text-theme-primary" />
              Export "{spec?.meta?.name}"
            </h2>
            <p className="text-xs text-foreground-muted mt-1">Choose your export format below</p>
          </div>
          <button onClick={onClose} className="p-2 text-foreground-muted hover:text-white transition-colors hover:bg-white/5 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 shrink-0 px-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === tab.id
                    ? 'border-theme-primary text-white'
                    : 'border-transparent text-foreground-muted hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <p className="text-sm text-foreground-muted mb-4">{activeTabData?.description}</p>

          {/* Generating state */}
          {isGenerating && !activeTabData?.code && (
            <div className="text-center py-16 space-y-3">
              <div className="w-10 h-10 border-2 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-foreground-muted text-sm">Generating {activeTabData?.label} code...</p>
            </div>
          )}

          {/* Not yet generated */}
          {!isGenerating && !activeTabData?.code && (
            <div className="text-center py-16">
              <button
                className="btn-primary py-3 px-8 text-base inline-flex items-center gap-2"
                onClick={activeTabData?.action}
              >
                <activeTabData.icon className="w-5 h-5" />
                Generate {activeTabData?.label}
              </button>
            </div>
          )}

          {/* Code display */}
          {activeTabData?.code && (
            <div>
              {/* AI Prompt gets a special design */}
              {activeTab === 'prompt' ? (
                <div className="space-y-4">
                  <div className="p-5 bg-white/3 border border-white/8 rounded-2xl text-sm leading-relaxed text-foreground whitespace-pre-wrap font-mono">
                    {activeTabData.code}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCopy(activeTabData.code)}
                      className="btn-primary py-2.5 px-6 text-sm inline-flex items-center gap-2"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy to clipboard'}
                    </button>
                    <p className="text-xs text-foreground-muted">Paste this into ChatGPT, Claude, Gemini, or any other AI agent to recreate this exact mascot.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-black/60 border border-white/8 rounded-2xl overflow-hidden">
                    {/* Code header bar */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-white/3 border-b border-white/5">
                      <span className="text-xs text-foreground-muted font-mono">{activeTabData.filename}</span>
                      <button
                        onClick={() => handleCopy(activeTabData.code)}
                        className="flex items-center gap-1.5 text-xs text-foreground-muted hover:text-white transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="overflow-y-auto max-h-[45vh] custom-scrollbar">
                      <pre className="p-4 text-xs font-mono text-green-300/90 leading-relaxed whitespace-pre-wrap">
                        {activeTabData.code}
                      </pre>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDownload(activeTabData.code, activeTabData.filename, activeTabData.mimeType)}
                      className="btn-primary py-2.5 px-6 text-sm inline-flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download {activeTabData.filename}
                    </button>
                    <button
                      onClick={() => handleCopy(activeTabData.code)}
                      className="py-2.5 px-6 text-sm border border-white/10 rounded-full text-foreground-muted hover:text-white hover:bg-white/5 transition-colors inline-flex items-center gap-2"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy code'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer: Spec preview */}
        <div className="shrink-0 border-t border-white/5 px-6 py-3 flex items-center gap-4">
          <div className="flex gap-1.5">
            {['primary_color', 'secondary_color', 'accent_color'].map(k => (
              <div key={k} className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: spec?.appearance?.[k] }} />
            ))}
          </div>
          <span className="text-xs text-foreground-muted">
            {spec?.appearance?.body_shape?.replace('_', ' ')} · {spec?.appearance?.material?.replace('_', ' ')} · {spec?.triggers?.length || 0} trigger{spec?.triggers?.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
