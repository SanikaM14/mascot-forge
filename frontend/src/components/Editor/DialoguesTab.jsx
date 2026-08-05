import React, { useState } from 'react';
import { useMascotSpec } from '../../hooks/useMascotSpec';
import { Trash2, Plus } from 'lucide-react';

export default function DialoguesTab() {
  const { spec, setSpec } = useMascotSpec();
  const { dialogues } = spec;

  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newText, setNewText] = useState('');

  const handleChange = (key, value) => {
    setSpec({
      ...spec,
      dialogues: { ...spec.dialogues, [key]: value }
    });
  };

  const handleDelete = (keyToDelete) => {
    const updatedDialogues = { ...dialogues };
    delete updatedDialogues[keyToDelete];
    setSpec({
      ...spec,
      dialogues: updatedDialogues
    });
  };

  const handleAdd = () => {
    if (!newKey || !newText) return;
    
    // Normalize key: lowercase, replace spaces with underscores
    const safeKey = newKey.toLowerCase().replace(/[^a-z0-9_]/g, '_').trim();
    
    setSpec({
      ...spec,
      dialogues: { ...spec.dialogues, [safeKey]: newText }
    });
    
    setNewKey('');
    setNewText('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-foreground-muted">Define the phrases your mascot can say.</p>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 text-xs font-semibold text-theme-primary hover:opacity-80 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          Add phrase
        </button>
      </div>

      {showAddForm && (
        <div className="p-4 border border-theme-primary/30 bg-white/3 rounded-xl space-y-3 fade-in">
          <div className="text-xs font-semibold text-theme-primary uppercase tracking-wider mb-2">New Phrase</div>
          
          <div>
            <label className="text-xs text-foreground-muted block mb-1">Key / Event Name</label>
            <input 
              type="text" 
              className="input-field w-full text-sm" 
              placeholder="e.g. on_click_button" 
              value={newKey} 
              onChange={(e) => setNewKey(e.target.value)} 
            />
          </div>

          <div>
            <label className="text-xs text-foreground-muted block mb-1">Text</label>
            <input 
              type="text" 
              className="input-field w-full text-sm" 
              placeholder="What should the mascot say?" 
              value={newText} 
              onChange={(e) => setNewText(e.target.value)} 
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAdd}
              disabled={!newKey || !newText}
              className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {Object.keys(dialogues).length === 0 ? (
        <div className="text-center py-8 text-foreground-muted text-xs italic border border-dashed border-white/10 rounded-xl">
          No phrases yet. Add one above!
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(dialogues).map(([key, text]) => (
            <div key={key} className="relative group">
              <label className="block text-xs mb-1 text-foreground-muted capitalize">
                {key.replace(/_/g, ' ')}
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  className="input-field w-full text-sm" 
                  value={text} 
                  onChange={(e) => handleChange(key, e.target.value)} 
                />
                <button 
                  onClick={() => handleDelete(key)}
                  className="p-2 text-foreground-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-white/5"
                  title="Delete phrase"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
