import React, { useState } from 'react';
import AppearanceTab from './AppearanceTab';
import DialoguesTab from './DialoguesTab';
import BehaviorsTab from './BehaviorsTab';
import MetaTab from './MetaTab';
import ChatRefine from './ChatRefine';
import { useMascotSpec } from '../../hooks/useMascotSpec';
import { Palette, MessageSquare, Activity, Sparkles, User } from 'lucide-react';

export default function EditorPanel() {
  const [activeTab, setActiveTab] = useState('appearance');
  const { spec } = useMascotSpec();

  if (!spec) return null;

  const tabs = [
    { id: 'meta', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'dialogues', label: 'Dialogues', icon: MessageSquare },
    { id: 'behaviors', label: 'Behaviors', icon: Activity },
    { id: 'refine', label: 'AI Refine', icon: Sparkles },
  ];

  return (
    <div className="flex flex-col glass-panel border border-white/10 rounded-2xl w-full h-[45vh] max-h-[450px] mb-4 overflow-hidden fade-in shadow-2xl">
      <div className="p-3 border-b border-white/10 bg-black/40">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Sparkles className="w-4 h-4 text-theme-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted">Customize Mascot</span>
        </div>
        
        {spec.ai_suggestion && (
          <div className="mx-1 mb-3 p-2.5 rounded-lg border border-theme-primary/30 bg-theme-primary/10 flex items-start gap-2 animate-pulse-subtle">
            <Sparkles className="w-4 h-4 text-theme-primary shrink-0 mt-0.5" />
            <div className="text-xs text-theme-primary/90 leading-snug">
              <span className="font-bold block mb-0.5">AI Suggestion</span>
              {spec.ai_suggestion}
            </div>
          </div>
        )}
        <div className="flex space-x-1 overflow-x-auto scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[70px] p-2 rounded-xl flex flex-col items-center justify-center gap-1.5 text-[10px] font-semibold transition-all duration-300 ${
                  isActive 
                    ? 'bg-theme-primary text-black shadow-[0_2px_10px_rgba(255,255,255,0.1)] scale-105' 
                    : 'bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-white'
                }`}
                title={tab.label}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-black/20">
        {activeTab === 'meta' && <MetaTab />}
        {activeTab === 'appearance' && <AppearanceTab />}
        {activeTab === 'dialogues' && <DialoguesTab />}
        {activeTab === 'behaviors' && <BehaviorsTab />}
        {activeTab === 'refine' && <ChatRefine />}
      </div>
    </div>
  );
}

