import React, { useState } from 'react';
import { useMascotSpec } from '../../hooks/useMascotSpec';
import { Trash2, Plus, ChevronDown, ChevronUp, Layers, Move, RefreshCw, Eye } from 'lucide-react';

const PRIMITIVE_TYPES = [
  { value: 'box', label: 'Box' },
  { value: 'sphere', label: 'Sphere' },
  { value: 'cylinder', label: 'Cylinder' },
  { value: 'cone', label: 'Cone' },
  { value: 'torus', label: 'Torus' },
  { value: 'capsule', label: 'Capsule' }
];

const getDefaultArgs = (type) => {
  switch (type) {
    case 'box': return [0.5, 0.5, 0.5];
    case 'sphere': return [0.3];
    case 'cylinder': return [0.2, 0.2, 0.6];
    case 'cone': return [0.2, 0.6];
    case 'torus': return [0.3, 0.1];
    case 'capsule': return [0.2, 0.4];
    default: return [0.5, 0.5, 0.5];
  }
};

const getArgLabels = (type) => {
  switch (type) {
    case 'box': return ['Width', 'Height', 'Depth'];
    case 'sphere': return ['Radius'];
    case 'cylinder': return ['Top Radius', 'Bottom Radius', 'Height'];
    case 'cone': return ['Radius', 'Height'];
    case 'torus': return ['Radius', 'Tube Thickness'];
    case 'capsule': return ['Radius', 'Length'];
    default: return ['Size X', 'Size Y', 'Size Z'];
  }
};

export default function AppearanceTab() {
  const { spec, updateAppearance } = useMascotSpec();
  const { appearance } = spec;
  const [expandedPartIdx, setExpandedPartIdx] = useState(null);

  const handleChange = (key, value) => updateAppearance(key, value);

  // Custom Assembly Part Handlers
  const parts = appearance.custom_parts || [];

  const addPart = () => {
    const newPart = {
      type: 'box',
      args: [0.5, 0.5, 0.5],
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      color: '#E91E63',
      use_primary_color: true,
      use_secondary_color: false,
      use_accent_color: false
    };
    const updated = [...parts, newPart];
    handleChange('custom_parts', updated);
    setExpandedPartIdx(updated.length - 1);
  };

  const removePart = (idx, e) => {
    e.stopPropagation();
    const updated = parts.filter((_, i) => i !== idx);
    handleChange('custom_parts', updated);
    if (expandedPartIdx === idx) {
      setExpandedPartIdx(null);
    } else if (expandedPartIdx > idx) {
      setExpandedPartIdx(expandedPartIdx - 1);
    }
  };

  const updatePart = (idx, field, value) => {
    const updated = parts.map((part, i) => {
      if (i !== idx) return part;
      
      const newPart = { ...part };
      if (field === 'type') {
        newPart.type = value;
        newPart.args = getDefaultArgs(value);
      } else {
        newPart[field] = value;
      }
      return newPart;
    });
    handleChange('custom_parts', updated);
  };

  const handleArgChange = (partIdx, argIdx, val) => {
    const part = parts[partIdx];
    const newArgs = [...(part.args || [])];
    newArgs[argIdx] = parseFloat(val) || 0;
    updatePart(partIdx, 'args', newArgs);
  };

  const handleCoordChange = (partIdx, coord, axisIdx, val) => {
    const part = parts[partIdx];
    const coords = [...(part[coord] || [0, 0, 0])];
    coords[axisIdx] = parseFloat(val) || 0;
    updatePart(partIdx, coord, coords);
  };

  // Convert radian to deg and back
  const radToDeg = (rad) => Math.round((rad * 180) / Math.PI);
  const degToRad = (deg) => (deg * Math.PI) / 180;

  return (
    <div className="space-y-6">
      {/* Body Shape Select */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">Body Shape</label>
        <select className="input-field w-full text-sm" value={appearance.body_shape} onChange={(e) => handleChange('body_shape', e.target.value)}>
          <option value="blob">Blob</option>
          <option value="humanoid">Humanoid</option>
          <option value="geometric">Geometric</option>
          <option value="creature">Creature</option>
          <option value="chunky_robot">Chunky Robot</option>
          <option value="flower_pot">Flower Pot</option>
          <option value="mushroom">Mushroom</option>
          <option value="ghost">Ghost</option>
          <option value="star">Star</option>
          <option value="cloud">Cloud</option>
          <option value="donut">Donut</option>
          <option value="ice_cream">Ice Cream</option>
          <option value="cactus">Cactus</option>
          <option value="bear">Bear</option>
          <option value="cat">Cat</option>
          <option value="dragon">Dragon</option>
          <option value="diamond">Diamond</option>
          <option value="rocket">Rocket</option>
          <option value="crown">Crown</option>
          <option value="jellyfish">Jellyfish</option>
          <option value="book">Book</option>
          <option value="teardrop">Teardrop</option>
          <option value="pebble">Pebble</option>
          <option value="bubble">Bubble</option>
          <option value="crystal_shard">Crystal Shard</option>
          <option value="monkey">Monkey</option>
          <option value="giraffe">Giraffe</option>
          <option value="tiger">Tiger</option>
          <option value="crow">Crow</option>
          <option value="custom_assembly">Custom Assembly (Advanced)</option>
        </select>
      </div>

      {/* Custom Assembly List Editor (Active only when custom_assembly is selected) */}
      {appearance.body_shape === 'custom_assembly' && (
        <div className="space-y-4 pt-4 border-t-2 border-theme-primary/20 fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-theme-primary flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Custom Parts Assembly
              </h4>
              <p className="text-[10px] text-foreground-muted">Build custom shapes using 3D primitives.</p>
            </div>
            <button
              onClick={addPart}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-theme-primary/15 hover:bg-theme-primary/25 border border-theme-primary/30 text-white font-semibold transition-all"
            >
              <Plus className="w-3 h-3" /> Add Part
            </button>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input type="checkbox" checked={appearance.hide_default_face || false} onChange={(e) => handleChange('hide_default_face', e.target.checked)} id="hide_default_face" className="rounded bg-black/40 border-white/10 text-primary focus:ring-primary" />
            <label htmlFor="hide_default_face" className="text-xs font-medium cursor-pointer select-none text-foreground-muted">Hide Default Face</label>
          </div>

          {parts.length === 0 ? (
            <div className="p-6 text-center text-xs text-foreground-muted italic bg-black/20 rounded-xl border border-white/5">
              No parts added. Click "Add Part" to start building your shape.
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {parts.map((part, idx) => {
                const isExpanded = expandedPartIdx === idx;
                const argLabels = getArgLabels(part.type);
                
                return (
                  <div key={idx} className="border border-white/5 rounded-xl bg-black/20 overflow-hidden transition-all duration-300">
                    {/* Header */}
                    <div
                      onClick={() => setExpandedPartIdx(isExpanded ? null : idx)}
                      className="flex items-center justify-between p-3 cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] w-5 h-5 rounded-full bg-white/5 border border-white/5 flex items-center justify-center font-bold text-foreground-muted">{idx + 1}</span>
                        <span className="text-xs font-semibold capitalize text-white">{part.type}</span>
                        {/* Dot swatch */}
                        <div
                          className="w-2.5 h-2.5 rounded-full border border-white/10"
                          style={{
                            backgroundColor: part.use_primary_color
                              ? appearance.primary_color
                              : part.use_secondary_color
                                ? appearance.secondary_color
                                : part.use_accent_color
                                  ? appearance.accent_color
                                  : part.color || '#fff'
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => removePart(idx, e)}
                          className="p-1 text-foreground-muted hover:text-red-400 hover:bg-white/5 rounded transition-all"
                          title="Delete part"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-foreground-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-foreground-muted" />}
                      </div>
                    </div>

                    {/* Content */}
                    {isExpanded && (
                      <div className="p-3.5 border-t border-white/5 bg-white/[0.01] space-y-3.5 fade-in text-xs">
                        {/* Type selection */}
                        <div>
                          <span className="text-[10px] text-foreground-muted block mb-1">Primitive Type</span>
                          <select
                            className="input-field w-full text-xs py-1 px-2 bg-black/40"
                            value={part.type}
                            onChange={(e) => updatePart(idx, 'type', e.target.value)}
                          >
                            {PRIMITIVE_TYPES.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Dimensions / Args */}
                        <div>
                          <span className="text-[10px] text-foreground-muted block mb-1.5 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 text-theme-primary animate-pulse" /> Dimensions / Size
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            {argLabels.map((label, argIdx) => (
                              <div key={argIdx}>
                                <label className="text-[9px] text-foreground-muted block mb-0.5">{label}</label>
                                <input
                                  type="number"
                                  step="0.05"
                                  min="0.01"
                                  className="input-field w-full text-center text-xs py-1 px-1.5 bg-black/40"
                                  value={part.args?.[argIdx] ?? 0.5}
                                  onChange={(e) => handleArgChange(idx, argIdx, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Coordinates (Position) */}
                        <div>
                          <span className="text-[10px] text-foreground-muted block mb-1.5 flex items-center gap-1">
                            <Move className="w-3 h-3 text-theme-primary" /> Position Offset (X, Y, Z)
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            {['X', 'Y', 'Z'].map((axis, axisIdx) => (
                              <div key={axis}>
                                <label className="text-[9px] text-foreground-muted block mb-0.5">Offset {axis}</label>
                                <input
                                  type="number"
                                  step="0.05"
                                  min="-2"
                                  max="2"
                                  className="input-field w-full text-center text-xs py-1 px-1.5 bg-black/40"
                                  value={part.position?.[axisIdx] ?? 0}
                                  onChange={(e) => handleCoordChange(idx, 'position', axisIdx, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Coordinates (Rotation) */}
                        <div>
                          <span className="text-[10px] text-foreground-muted block mb-1.5 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 text-theme-primary" /> Rotation (Degrees)
                          </span>
                          <div className="grid grid-cols-3 gap-2">
                            {['Pitch (X)', 'Yaw (Y)', 'Roll (Z)'].map((axis, axisIdx) => (
                              <div key={axis}>
                                <label className="text-[9px] text-foreground-muted block mb-0.5">{axis}</label>
                                <input
                                  type="number"
                                  step="15"
                                  min="-180"
                                  max="180"
                                  className="input-field w-full text-center text-xs py-1 px-1.5 bg-black/40"
                                  value={part.rotation ? radToDeg(part.rotation[axisIdx]) : 0}
                                  onChange={(e) => handleCoordChange(idx, 'rotation', axisIdx, degToRad(parseFloat(e.target.value) || 0))}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Part Color link */}
                        <div>
                          <span className="text-[10px] text-foreground-muted block mb-1.5">Color Material Binding</span>
                          <div className="grid grid-cols-2 gap-1.5 mb-2">
                            <button
                              onClick={() => {
                                updatePart(idx, 'use_primary_color', true);
                                updatePart(idx, 'use_secondary_color', false);
                                updatePart(idx, 'use_accent_color', false);
                              }}
                              className={`py-1 px-1 text-[9px] font-semibold rounded-lg border transition-all ${
                                part.use_primary_color
                                  ? 'bg-theme-primary/10 border-theme-primary text-white'
                                  : 'bg-black/30 border-white/5 text-foreground-muted'
                              }`}
                            >
                              Theme Primary
                            </button>
                            <button
                              onClick={() => {
                                updatePart(idx, 'use_primary_color', false);
                                updatePart(idx, 'use_secondary_color', false);
                                updatePart(idx, 'use_accent_color', true);
                              }}
                              className={`py-1 px-1 text-[9px] font-semibold rounded-lg border transition-all ${
                                part.use_accent_color
                                  ? 'bg-theme-primary/10 border-theme-primary text-white'
                                  : 'bg-black/30 border-white/5 text-foreground-muted'
                              }`}
                            >
                              Theme Accent
                            </button>
                          </div>
                          <div className="flex items-center gap-2 bg-black/35 p-2 rounded-lg border border-white/5">
                            <input
                              type="checkbox"
                              checked={!part.use_primary_color && !part.use_secondary_color && !part.use_accent_color}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  updatePart(idx, 'use_primary_color', false);
                                  updatePart(idx, 'use_secondary_color', false);
                                  updatePart(idx, 'use_accent_color', false);
                                  if (!part.color) updatePart(idx, 'color', appearance.primary_color);
                                } else {
                                  updatePart(idx, 'use_primary_color', true);
                                }
                              }}
                              className="rounded bg-black/40 border-white/10 text-primary"
                              id={`custom-color-part-${idx}`}
                            />
                            <label htmlFor={`custom-color-part-${idx}`} className="text-[10px] text-foreground-muted select-none cursor-pointer flex-1">Use Custom Color</label>
                            {!part.use_primary_color && !part.use_secondary_color && !part.use_accent_color && (
                              <input
                                type="color"
                                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                                value={part.color || '#ffffff'}
                                onChange={(e) => updatePart(idx, 'color', e.target.value)}
                              />
                            )}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Colors Section */}
      <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">Primary</label>
          <div className="flex items-center gap-2">
            <input type="color" className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/10 p-0" value={appearance.primary_color} onChange={(e) => handleChange('primary_color', e.target.value)} />
            <input type="text" className="input-field flex-1 text-xs py-1.5 px-2 bg-black/40" value={appearance.primary_color} onChange={(e) => handleChange('primary_color', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">Secondary</label>
          <div className="flex items-center gap-2">
            <input type="color" className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/10 p-0" value={appearance.secondary_color || '#ffffff'} onChange={(e) => handleChange('secondary_color', e.target.value)} />
            <input type="text" className="input-field flex-1 text-xs py-1.5 px-2 bg-black/40" value={appearance.secondary_color || '#ffffff'} onChange={(e) => handleChange('secondary_color', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">Accent</label>
          <div className="flex items-center gap-2">
            <input type="color" className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/10 p-0" value={appearance.accent_color} onChange={(e) => handleChange('accent_color', e.target.value)} />
            <input type="text" className="input-field flex-1 text-xs py-1.5 px-2 bg-black/40" value={appearance.accent_color} onChange={(e) => handleChange('accent_color', e.target.value)} />
          </div>
        </div>
      </div>
      
      {/* Size Scale */}
      <div className="pt-2 border-t border-white/5">
        <label className="flex justify-between text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">
          <span>Size Scale</span>
          <span>{appearance.size_scale || 1.0}</span>
        </label>
        <input 
          type="range" 
          min="0.1" max="3.0" step="0.1" 
          value={appearance.size_scale || 1.0} 
          onChange={(e) => handleChange('size_scale', parseFloat(e.target.value))}
          className="w-full accent-theme-primary"
        />
      </div>

      {/* Face & Material */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">Face Style</label>
          <select className="input-field w-full text-xs" value={appearance.face_style} onChange={(e) => handleChange('face_style', e.target.value)}>
            <option value="cute_dot_eyes">Cute Dot Eyes</option>
            <option value="wide_eyes">Wide Eyes</option>
            <option value="minimal_line">Minimal Line</option>
            <option value="robotic_visor">Robotic Visor</option>
            <option value="sleepy">Sleepy</option>
            <option value="heart_eyes">Heart Eyes</option>
            <option value="star_eyes">Star Eyes</option>
            <option value="crying">Crying</option>
            <option value="angry">Angry</option>
            <option value="wink">Wink</option>
            <option value="shocked">Shocked</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">Material</label>
          <select className="input-field w-full text-xs" value={appearance.material} onChange={(e) => handleChange('material', e.target.value)}>
            <option value="matte">Matte</option>
            <option value="glossy">Glossy</option>
            <option value="soft_toy">Soft Toy</option>
            <option value="metallic">Metallic</option>
            <option value="warm_matte">Warm Matte</option>
            <option value="crystal">Crystal</option>
            <option value="neon">Neon</option>
            <option value="clay">Clay</option>
            <option value="glass">Glass</option>
            <option value="fabric">Fabric</option>
          </select>
        </div>
      </div>

      {/* Limbs & Accessories */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
            <input type="checkbox" checked={appearance.has_arms} onChange={(e) => handleChange('has_arms', e.target.checked)} className="rounded bg-black/40 border-white/10 text-primary focus:ring-primary" />
            <span>Has Arms</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
            <input type="checkbox" checked={appearance.has_legs} onChange={(e) => handleChange('has_legs', e.target.checked)} className="rounded bg-black/40 border-white/10 text-primary focus:ring-primary" />
            <span>Has Legs</span>
          </label>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">Ears / Antenna / Accessory</label>
          <select className="input-field w-full text-xs" value={appearance.has_ears_or_antenna} onChange={(e) => handleChange('has_ears_or_antenna', e.target.value)}>
            <option value="none">None</option>
            <option value="ears">Ears</option>
            <option value="horns">Horns</option>
            <option value="antenna">Antenna</option>
            <option value="wings">Wings</option>
            <option value="hat">Hat</option>
            <option value="bow">Bow</option>
            <option value="leaf_top">Leaf Top</option>
            <option value="flame_top">Flame Top</option>
          </select>
        </div>
      </div>

    </div>
  );
}
