import React, { useState } from 'react';
import { useMascotSpec } from '../../hooks/useMascotSpec';
import { Trash2, Plus, ChevronDown } from 'lucide-react';

const ANIMATION_OPTIONS = [
  'gentle_bob', 'wave', 'dance', 'bounce', 'spin',
  'blink', 'happy_jump', 'nod', 'shake', 'idle_look'
];

const FACE_STYLE_OPTIONS = [
  { value: '', label: 'Default (no change)' },
  { value: 'cute_dot_eyes', label: 'Cute Dot Eyes' },
  { value: 'wide_eyes', label: 'Wide Eyes' },
  { value: 'minimal_line', label: 'Minimal Line' },
  { value: 'robotic_visor', label: 'Robotic Visor' },
  { value: 'sleepy', label: 'Sleepy' },
  { value: 'heart_eyes', label: 'Heart Eyes' },
  { value: 'star_eyes', label: 'Star Eyes' },
  { value: 'crying', label: 'Crying' },
  { value: 'angry', label: 'Angry' },
  { value: 'wink', label: 'Wink' },
  { value: 'shocked', label: 'Shocked' },
];

const EVENT_OPTIONS = [
  { value: 'page_load', label: 'Page Load' },
  { value: 'scroll_percent', label: 'Scroll Percentage' },
  { value: 'idle_ms', label: 'Idle Time' },
  { value: 'form_submit_success', label: 'Form Success' },
  { value: 'network_offline', label: 'Network Offline' },
  { value: 'exit_intent', label: 'Exit Intent' },
];

const DIALOGUE_KEY_OPTIONS = [
  'on_load',
  'on_scroll_deep',
  'on_idle_long',
  'on_success_action',
  'on_error',
  'on_exit_intent'
];

export default function BehaviorsTab() {
  const { spec, setSpec, setPreviewAnimation } = useMascotSpec();
  const { triggers } = spec;

  // Add-trigger form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTrigger, setNewTrigger] = useState({
    event: 'page_load',
    animation: 'wave',
    dialogue: 'on_load',
    face_style: '',
    delay_ms: '',
    threshold: '',
  });

  const handlePreview = (anim) => {
    if (setPreviewAnimation) {
      setPreviewAnimation(anim);
      setTimeout(() => setPreviewAnimation(null), 2500);
    }
  };

  const removeTrigger = (index) => {
    const updated = [...triggers];
    updated.splice(index, 1);
    setSpec({ ...spec, triggers: updated });
  };

  const updateTrigger = (index, field, value) => {
    const updated = [...triggers];
    
    if (field === 'delay_ms' || field === 'threshold') {
      if (value === '') {
        delete updated[index][field];
      } else {
        updated[index][field] = parseInt(value, 10);
      }
    } else {
      updated[index][field] = value;
    }
    
    setSpec({ ...spec, triggers: updated });
    
    // Preview if animation or face changed
    if (field === 'animation') handlePreview(value);
  };

  const handleAddTrigger = () => {
    const trigger = { ...newTrigger };
    if (!trigger.delay_ms) delete trigger.delay_ms;
    else trigger.delay_ms = parseInt(trigger.delay_ms);
    if (!trigger.threshold) delete trigger.threshold;
    if (!trigger.face_style) delete trigger.face_style;
    setSpec({ ...spec, triggers: [...triggers, trigger] });
    setShowAddForm(false);
    handlePreview(trigger.animation);
    setNewTrigger({ event: 'page_load', animation: 'wave', dialogue: 'on_load', face_style: '', delay_ms: '', threshold: '' });
  };

  const handleNewTriggerChange = (key, value) => {
    setNewTrigger(prev => ({ ...prev, [key]: value }));
  };

  const handleDefaultAnimationChange = (role, value) => {
    setSpec({ ...spec, animations: { ...spec.animations, [role]: value }});
    handlePreview(value);
  };

  return (
    <div className="space-y-4">
      {/* Default Role Animations Section */}
      <div className="p-4 border border-white/10 bg-black/20 rounded-xl space-y-3 fade-in mb-4">
        <div className="text-xs font-semibold text-theme-primary uppercase tracking-wider mb-2">Default Role Animations</div>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-foreground-muted block mb-1">Idle</span>
            <select
              className="input-field w-full text-xs py-1.5 px-2 bg-black/40"
              value={spec.animations?.idle || ''}
              onChange={(e) => handleDefaultAnimationChange('idle', e.target.value)}
            >
              <option value="">Default</option>
              {ANIMATION_OPTIONS.map(anim => <option key={anim} value={anim}>{anim.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <span className="text-foreground-muted block mb-1">Greeting</span>
            <select
              className="input-field w-full text-xs py-1.5 px-2 bg-black/40"
              value={spec.animations?.greeting || ''}
              onChange={(e) => handleDefaultAnimationChange('greeting', e.target.value)}
            >
              <option value="">Default</option>
              {ANIMATION_OPTIONS.map(anim => <option key={anim} value={anim}>{anim.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <span className="text-foreground-muted block mb-1">Positive Reaction</span>
            <select
              className="input-field w-full text-xs py-1.5 px-2 bg-black/40"
              value={spec.animations?.positive_reaction || ''}
              onChange={(e) => handleDefaultAnimationChange('positive_reaction', e.target.value)}
            >
              <option value="">Default</option>
              {ANIMATION_OPTIONS.map(anim => <option key={anim} value={anim}>{anim.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <span className="text-foreground-muted block mb-1">Negative Reaction</span>
            <select
              className="input-field w-full text-xs py-1.5 px-2 bg-black/40"
              value={spec.animations?.negative_reaction || ''}
              onChange={(e) => handleDefaultAnimationChange('negative_reaction', e.target.value)}
            >
              <option value="">Default</option>
              {ANIMATION_OPTIONS.map(anim => <option key={anim} value={anim}>{anim.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <span className="text-foreground-muted block mb-1">Thinking</span>
            <select
              className="input-field w-full text-xs py-1.5 px-2 bg-black/40"
              value={spec.animations?.thinking || ''}
              onChange={(e) => handleDefaultAnimationChange('thinking', e.target.value)}
            >
              <option value="">Default</option>
              {ANIMATION_OPTIONS.map(anim => <option key={anim} value={anim}>{anim.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-foreground-muted">Triggers define when your mascot reacts and what it does.</p>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 text-xs font-semibold text-theme-primary hover:opacity-80 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          Add trigger
        </button>
      </div>

      {/* Add trigger form */}
      {showAddForm && (
        <div className="p-4 border border-theme-primary/30 bg-white/3 rounded-xl space-y-3 fade-in">
          <div className="text-xs font-semibold text-theme-primary uppercase tracking-wider mb-2">New Trigger</div>

          <div>
            <label className="text-xs text-foreground-muted block mb-1">Event</label>
            <select
              className="input-field w-full text-sm"
              value={newTrigger.event}
              onChange={(e) => handleNewTriggerChange('event', e.target.value)}
            >
              {EVENT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-foreground-muted block mb-1">Animation / Gesture</label>
            <select
              className="input-field w-full text-sm"
              value={newTrigger.animation}
              onChange={(e) => handleNewTriggerChange('animation', e.target.value)}
            >
              {ANIMATION_OPTIONS.map(anim => (
                <option key={anim} value={anim}>{anim.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-foreground-muted block mb-1">Dialogue to show</label>
            <select
              className="input-field w-full text-sm"
              value={newTrigger.dialogue}
              onChange={(e) => handleNewTriggerChange('dialogue', e.target.value)}
            >
              {DIALOGUE_KEY_OPTIONS.map(key => (
                <option key={key} value={key}>{key.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-foreground-muted block mb-1">Expression (face change)</label>
            <select
              className="input-field w-full text-sm"
              value={newTrigger.face_style}
              onChange={(e) => handleNewTriggerChange('face_style', e.target.value)}
            >
              {FACE_STYLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-foreground-muted block mb-1">Delay (ms) optional</label>
              <input
                type="number"
                className="input-field w-full text-sm"
                placeholder="e.g. 2000"
                value={newTrigger.delay_ms}
                onChange={(e) => handleNewTriggerChange('delay_ms', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-foreground-muted block mb-1">Threshold optional</label>
              <input
                type="text"
                className="input-field w-full text-sm"
                placeholder="e.g. 0.5"
                value={newTrigger.threshold}
                onChange={(e) => handleNewTriggerChange('threshold', e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAddTrigger}
              className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="py-2 px-4 text-sm border border-white/10 rounded-full text-foreground-muted hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing triggers */}
      {triggers.length === 0 ? (
        <div className="text-center py-8 text-foreground-muted text-xs italic border border-dashed border-white/10 rounded-xl">
          No triggers yet. Add one above to give your mascot reactive gestures!
        </div>
      ) : (
        <div className="space-y-3">
          {triggers.map((trigger, idx) => (
            <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl relative group">
              <button
                onClick={() => removeTrigger(idx)}
                className="absolute top-2 right-2 p-1.5 bg-black/40 rounded-full text-foreground-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all z-10"
                title="Remove trigger"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="text-[10px] font-bold text-theme-primary mb-3 uppercase tracking-widest pl-1">
                {trigger.event.replace(/_/g, ' ')}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-foreground-muted block mb-1">Gesture</span>
                  <select
                    className="input-field w-full text-xs py-1.5 px-2 bg-black/40"
                    value={trigger.animation || ''}
                    onChange={(e) => updateTrigger(idx, 'animation', e.target.value)}
                  >
                    <option value="">None</option>
                    {ANIMATION_OPTIONS.map(anim => (
                      <option key={anim} value={anim}>{anim.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-foreground-muted block mb-1">Dialogue</span>
                  <select
                    className="input-field w-full text-xs py-1.5 px-2 bg-black/40"
                    value={trigger.dialogue || ''}
                    onChange={(e) => updateTrigger(idx, 'dialogue', e.target.value)}
                  >
                    <option value="">None</option>
                    {DIALOGUE_KEY_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-foreground-muted block mb-1">Expression</span>
                  <select
                    className="input-field w-full text-xs py-1.5 px-2 bg-black/40"
                    value={trigger.face_style || ''}
                    onChange={(e) => updateTrigger(idx, 'face_style', e.target.value || undefined)}
                  >
                    {FACE_STYLE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                {(trigger.event === 'on_idle' || trigger.delay_ms !== undefined) && (
                  <div>
                    <span className="text-foreground-muted block mb-1">Delay (ms)</span>
                    <input
                      type="number"
                      className="input-field w-full text-xs py-1.5 px-2 bg-black/40"
                      value={trigger.delay_ms || ''}
                      placeholder="e.g. 5000"
                      onChange={(e) => updateTrigger(idx, 'delay_ms', e.target.value)}
                    />
                  </div>
                )}
                {(trigger.event === 'on_scroll' || trigger.threshold !== undefined) && (
                  <div>
                    <span className="text-foreground-muted block mb-1">Threshold (%)</span>
                    <input
                      type="number"
                      className="input-field w-full text-xs py-1.5 px-2 bg-black/40"
                      value={trigger.threshold || ''}
                      placeholder="e.g. 75"
                      onChange={(e) => updateTrigger(idx, 'threshold', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
