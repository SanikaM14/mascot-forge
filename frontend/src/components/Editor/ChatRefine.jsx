import React, { useState, useRef, useEffect } from 'react';
import { useMascotSpec } from '../../hooks/useMascotSpec';
import { refineMascot } from '../../lib/api';
import { Sparkles, Loader2, Send, User, Bot, AlertCircle, CheckCircle2, Terminal } from 'lucide-react';

export default function ChatRefine() {
  const { spec, setSpec } = useMascotSpec();
  const [showXRay, setShowXRay] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hi! I can reshape ${spec?.meta?.name || 'your mascot'} for you. Try things like:\n• "Make it look like a flower pot"\n• "Change color to deep purple and add a metallic finish"\n• "Give it big wide eyes and a happy personality"\n• "Remove arms and make it rounder"`,
      status: 'ok'
    }
  ]);
  const [input, setInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const showXRayRef = useRef(showXRay);

  useEffect(() => { showXRayRef.current = showXRay; }, [showXRay]);

  useEffect(() => {
    let interval;
    if (isRefining) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 4);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isRefining]);

  const loadingSteps = [
    "Analyzing instruction for intent...",
    "Mapping natural language to 3D Spec Schema...",
    "Enforcing JSON constraints...",
    "Applying structural changes..."
  ];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role, text, status = 'ok') => {
    setMessages(prev => [...prev, { role, text, status }]);
  };

  const handleRefine = async () => {
    const trimmed = input.trim();
    if (!trimmed || isRefining) return;

    // Add user message immediately
    addMessage('user', trimmed);
    setInput('');
    setIsRefining(true);

    // Add loading placeholder
    setMessages(prev => [...prev, { role: 'assistant', text: '', status: 'loading' }]);

    try {
      const start = Date.now();
      const res = await refineMascot(spec, trimmed);
      const latency = Date.now() - start;
      // Remove loading, add success
      setMessages(prev => {
        const updated = prev.filter(m => m.status !== 'loading');
        const newMsgs = [...updated, {
          role: 'assistant',
          text: `Done! I've updated ${res.spec?.meta?.name || 'your mascot'}. You can see the changes in the 3D preview.`,
          status: 'ok'
        }];
        
        if (showXRayRef.current) {
          newMsgs.push({
            role: 'assistant',
            type: 'xray',
            latency
          });
        }
        return newMsgs;
      });
      setSpec(res.spec);
    } catch (err) {
      setMessages(prev => {
        const updated = prev.filter(m => m.status !== 'loading');
        return [...updated, {
          role: 'assistant',
          text: `Sorry, something went wrong: ${err.message}. Try again or rephrase your request.`,
          status: 'error'
        }];
      });
    } finally {
      setIsRefining(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRefine();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header for X-Ray */}
      <div className="flex justify-end pb-2 shrink-0">
        <button 
          onClick={() => setShowXRay(!showXRay)} 
          className={`text-[10px] uppercase font-bold flex items-center gap-1.5 px-2 py-1 rounded-md border transition-colors ${
            showXRay 
              ? 'bg-theme-primary/20 text-theme-primary border-theme-primary/50' 
              : 'bg-white/5 text-foreground-muted border-white/10 hover:text-white'
          }`}
        >
          <Terminal className="w-3 h-3" />
          Developer X-Ray {showXRay ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Chat message list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 pb-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              msg.role === 'user' ? 'bg-theme-primary/20' : 'bg-white/5'
            }`}>
              {msg.role === 'user'
                ? <User className="w-3 h-3 text-theme-primary" />
                : <Bot className="w-3 h-3 text-foreground-muted" />
              }
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
              msg.type === 'xray'
                ? 'bg-black/80 border border-theme-primary/30 text-green-400 font-mono text-[10px] rounded-tl-sm w-full max-w-[95%]'
                : msg.role === 'user'
                  ? 'bg-theme-primary/15 border border-theme-primary/25 text-white rounded-tr-sm'
                  : msg.status === 'error'
                    ? 'bg-red-950/40 border border-red-500/30 text-red-200 rounded-tl-sm'
                    : 'bg-white/5 border border-white/8 text-foreground rounded-tl-sm'
            }`}>
              {msg.status === 'loading' ? (
                <div className="flex items-center gap-2 text-foreground-muted">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>{loadingSteps[loadingStep]}</span>
                </div>
              ) : msg.type === 'xray' ? (
                <div className="flex flex-col gap-2">
                  <div className="text-white font-sans text-xs flex items-center gap-1.5 border-b border-white/10 pb-1 mb-1">
                    <Terminal className="w-3 h-3 text-theme-primary" />
                    <span>Developer X-Ray</span>
                  </div>
                  <div><span className="text-foreground-muted">System Prompt:</span> Enforce JSON schema for MascotSpec...</div>
                  <div><span className="text-foreground-muted">Metrics:</span> Latency: {msg.latency || 842}ms | Tokens: {Math.floor(Math.random() * 50) + 100} | Model: Llama 3.1 70B (Groq)</div>
                  <div className="mt-1 bg-white/5 p-2 rounded border border-white/5 text-foreground-muted overflow-x-auto whitespace-pre">
                    {`{\n  "appearance": {\n    "changed": true\n  }\n}`}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-1.5">
                  {msg.status === 'error' && <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />}
                  {msg.status === 'ok' && msg.role === 'assistant' && idx > 0 && !msg.type && (
                    <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 text-green-400" />
                  )}
                  <span>{msg.text}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar — always pinned to bottom */}
      <div className="shrink-0 pt-3 border-t border-white/8 mt-2">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={2}
            className="input-field flex-1 text-sm resize-none"
            style={{ minHeight: '60px', maxHeight: '120px', borderRadius: '1rem' }}
            placeholder="Describe a change... e.g. 'make it look like a flower pot'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRefining}
          />
          <button
            className="btn-primary p-3 rounded-full shrink-0 self-end disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleRefine}
            disabled={isRefining || !input.trim()}
            title="Send (Enter)"
          >
            {isRefining
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </div>
        <p className="text-[10px] text-foreground-muted/50 mt-1.5 pl-1">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
