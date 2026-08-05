import { create } from 'zustand';

const DEFAULT_SPEC = {
  meta: {
    name: "Mascot",
    personality_tags: [],
    voice_style: "friendly"
  },
  appearance: {
    body_shape: "blob",
    primary_color: "#ff0000",
    secondary_color: "#00ff00",
    accent_color: "#0000ff",
    face_style: "cute_dot_eyes",
    has_arms: true,
    has_legs: true,
    has_ears_or_antenna: "none",
    material: "matte",
    size_scale: 1.0
  },
  animations: {
    idle: "gentle_bob",
    greeting: "wave",
    positive_reaction: "happy_bounce",
    negative_reaction: "look_away",
    thinking: "look_up"
  },
  dialogues: {
    on_load: "Hello!",
    on_scroll_deep: "Look at all this content!",
    on_idle_long: "Are you still there?",
    on_success_action: "Awesome!",
    on_error: "Oops, something went wrong.",
    on_exit_intent: "Wait, don't go!"
  },
  triggers: []
};

function deepMerge(target, source) {
  if (!source) return target;
  const output = { ...target };
  
  Object.keys(source).forEach(key => {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  });
  
  return output;
}

function normalizeSpec(spec) {
  if (!spec) return null;
  
  // First merge with defaults
  let merged = deepMerge(DEFAULT_SPEC, spec);
  
  // Normalize triggers event types & dialogue references
  if (Array.isArray(merged.triggers)) {
    merged.triggers = merged.triggers.map(t => {
      let event = t.event;
      if (event === 'on_scroll') event = 'scroll_percent';
      if (event === 'on_load' || event === 'on_click') event = 'page_load';
      if (event === 'on_idle') event = 'idle_ms';
      if (event === 'on_success') event = 'form_submit_success';
      if (event === 'on_error') event = 'network_offline';
      
      let dialogue = t.dialogue;
      if (dialogue === 'on_success') dialogue = 'on_success_action';
      if (dialogue === 'on_idle') dialogue = 'on_idle_long';
      if (dialogue === 'on_error') dialogue = 'on_error';
      
      let animation = t.animation;
      // map legacy animations if any
      if (animation === 'bounce') animation = 'positive_reaction';
      if (animation === 'happy_jump') animation = 'positive_reaction';
      if (animation === 'spin') animation = 'positive_reaction';
      if (animation === 'dance') animation = 'positive_reaction';
      if (animation === 'shake') animation = 'negative_reaction';
      
      return {
        ...t,
        event,
        dialogue,
        animation
      };
    });
  }
  
  return merged;
}

export const useMascotSpec = create((set) => ({
  spec: null,
  isGenerating: false,
  error: null,
  setSpec: (newSpec) => set({ spec: normalizeSpec(newSpec) }),
  updateAppearance: (key, value) => 
    set((state) => ({
      spec: {
        ...state.spec,
        appearance: { ...state.spec.appearance, [key]: value }
      }
    })),
  updateMeta: (key, value) =>
    set((state) => ({
      spec: {
        ...state.spec,
        meta: { ...state.spec.meta, [key]: value }
      }
    })),
  setIsGenerating: (status) => set({ isGenerating: status }),
  setError: (err) => set({ error: err })
}));
