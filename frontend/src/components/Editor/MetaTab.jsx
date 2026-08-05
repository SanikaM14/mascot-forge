import React from 'react';
import { useMascotSpec } from '../../hooks/useMascotSpec';

export default function MetaTab() {
  const { spec, updateMeta } = useMascotSpec();
  const { meta } = spec;

  const handleChange = (key, value) => {
    updateMeta(key, value);
  };

  const handleTagsChange = (e) => {
    const value = e.target.value;
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    handleChange('personality_tags', tags);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">Mascot Name</label>
        <input
          type="text"
          className="input-field w-full text-sm"
          value={meta.name || ''}
          placeholder="e.g. Sparky"
          onChange={(e) => handleChange('name', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">Voice Style</label>
        <input
          type="text"
          className="input-field w-full text-sm"
          value={meta.voice_style || ''}
          placeholder="e.g. Cheerful, formal, robotic"
          onChange={(e) => handleChange('voice_style', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">Personality Tags (Comma separated)</label>
        <input
          type="text"
          className="input-field w-full text-sm"
          value={(meta.personality_tags || []).join(', ')}
          placeholder="e.g. helpful, funny, energetic"
          onChange={handleTagsChange}
        />
      </div>
    </div>
  );
}
