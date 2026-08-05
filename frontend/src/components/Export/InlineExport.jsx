import React, { useState } from 'react';
import { useMascotSpec } from '../../hooks/useMascotSpec';
import { Download, Code, X, Copy, Check, FileCode, Bot, Terminal } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

export default function InlineExport() {
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
      const mascotName = spec?.meta?.name || 'CustomMascot';
      const cleanName = mascotName.replace(/[^a-zA-Z0-9]/g, '');
      const code = `/**
 * @file ${cleanName}.jsx
 * @description Automatically generated 3D Mascot Component for ${mascotName}.
 * 
 * Dependencies:
 * - react
 * - @react-three/fiber
 * - @react-three/drei
 * 
 * Usage:
 * import ${cleanName} from './${cleanName}';
 * <div style={{ height: "400px" }}><${cleanName} /></div>
 */

import React from 'react';
import MascotEngine from './MascotEngine'; // Ensure MascotEngine is in your codebase

// ── Mascot Specification ──
const mascotSpec = ${JSON.stringify(spec, null, 2)};

export default function ${cleanName}(props) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
      <MascotEngine 
        spec={mascotSpec} 
        currentAnimation="idle" 
        {...props} 
      />
    </div>
  );
}
`;
      setReactCode(code);
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
      const code = `"""
Python Dictionary Specification for ${spec?.meta?.name || 'Custom Mascot'}
"""

MASCOT_SPEC = ${JSON.stringify(spec, null, 4)}

def get_mascot():
    return MASCOT_SPEC
`;
      setPythonCode(code);
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
      const prompt = `You are an expert Frontend Developer and 3D UI/UX Designer.
Here is the exact JSON specification for my interactive web mascot named "${spec?.meta?.name || 'Custom Mascot'}".

\`\`\`json
${JSON.stringify(spec, null, 2)}
\`\`\`

Based on its personality tags (${(spec?.meta?.personality_tags || []).join(', ') || 'friendly'}) and its body shape (${spec?.appearance?.body_shape}), I want you to act as this mascot.

Task 1: Write a short, engaging welcome message that I can put on my landing page, spoken in the mascot's unique voice style (${spec?.meta?.voice_style || 'upbeat'}).
Task 2: Suggest 3 new creative event triggers (e.g., when the user clicks a specific button, or stays idle too long) and write the exact JSON objects for the \`triggers\` array to implement them.
Task 3: Suggest how I can adjust the \`appearance\` properties to make it look slightly more professional. Provide the exact JSON modifications.`;
      
      setAiPrompt(prompt);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const tabs = [
    { id: 'react', label: 'React', icon: FileCode, description: 'React + Three.js component', action: generateReact, code: reactCode, filename: `${spec?.meta?.name || 'Mascot'}.jsx`, mimeType: 'text/javascript' },
    { id: 'python', label: 'Python', icon: Terminal, description: 'Python mascot spec script', action: generatePython, code: pythonCode, filename: `${spec?.meta?.name || 'mascot'}_spec.py`, mimeType: 'text/x-python' },
    { id: 'prompt', label: 'AI', icon: Bot, description: 'AI generation prompt text', action: generateAIPrompt, code: aiPrompt, filename: null },
  ];

  const activeTabData = tabs.find(t => t.id === activeTab);

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    tab.action();
  };

  return (
    <div className="mt-5 pt-5 border-t border-white/5 space-y-5 fade-in">
      {/* Header */}
      <div>
        <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
          <Code className="w-4 h-4 text-theme-primary" />
          Export "{spec?.meta?.name}"
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`flex-1 flex items-center justify-center gap-2 pb-3 text-xs font-medium border-b-2 transition-colors -mb-px ${
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
      <div className="pt-2">
        <p className="text-xs text-foreground-muted mb-4">{activeTabData?.description}</p>

        {/* Generating state */}
        {isGenerating && !activeTabData?.code && (
          <div className="text-center py-8 space-y-3">
            <div className="w-8 h-8 border-2 border-theme-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-foreground-muted text-xs">Generating...</p>
          </div>
        )}

        {/* Not yet generated */}
        {!isGenerating && !activeTabData?.code && (
          <div className="text-center py-4">
            <button
              className="btn-primary py-3 px-6 text-sm font-bold inline-flex items-center gap-2 w-full justify-center rounded-xl"
              onClick={activeTabData?.action}
            >
              <activeTabData.icon className="w-5 h-5" />
              Generate {activeTabData?.label}
            </button>
          </div>
        )}

        {/* Code display */}
        {activeTabData?.code && (
          <div className="space-y-4">
            {/* AI Prompt gets a special design */}
            {activeTab === 'prompt' ? (
              <div className="space-y-3">
                <div className="p-4 bg-white/3 border border-white/8 rounded-xl text-xs leading-relaxed text-foreground whitespace-pre-wrap font-mono max-h-56 overflow-y-auto custom-scrollbar">
                  {activeTabData.code}
                </div>
                <button
                  onClick={() => handleCopy(activeTabData.code)}
                  className="btn-primary py-3 px-4 text-sm font-bold inline-flex items-center justify-center gap-2 w-full rounded-xl"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy to clipboard'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-black/60 border border-white/8 rounded-xl overflow-hidden">
                  {/* Code header bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-white/3 border-b border-white/5">
                    <span className="text-xs text-foreground-muted font-mono">{activeTabData.filename}</span>
                    <button
                      onClick={() => handleCopy(activeTabData.code)}
                      className="flex items-center gap-1.5 text-xs text-foreground-muted hover:text-white transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="overflow-y-auto max-h-56 custom-scrollbar">
                    <pre className="p-4 text-xs font-mono text-green-300/90 leading-relaxed whitespace-pre-wrap">
                      {activeTabData.code}
                    </pre>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownload(activeTabData.code, activeTabData.filename, activeTabData.mimeType)}
                    className="btn-primary flex-1 py-3 text-sm font-bold inline-flex items-center justify-center gap-2 rounded-xl"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => handleCopy(activeTabData.code)}
                    className="flex-1 py-3 text-sm font-bold border border-white/10 rounded-xl text-foreground hover:text-white hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
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
    </div>
  );
}
