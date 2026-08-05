export const exampleMascots = [
  {
    meta: {
      name: "Pip",
      personality_tags: ["cheerful", "energetic"],
      voice_style: "upbeat"
    },
    appearance: {
      body_shape: "blob",
      primary_color: "#E91E63",
      secondary_color: "#FFFFFF",
      accent_color: "#FCE4EC",
      face_style: "wide_eyes",
      has_arms: true,
      has_legs: true,
      has_ears_or_antenna: "antenna",
      material: "glossy",
      size_scale: 1.2
    },
    dialogues: {
      on_load: "Hi there! Ready to make something awesome?",
      on_idle: "I'm always here when you need me!",
      on_error: "Oops! Let's fix that together.",
      on_success: "Yes! You nailed it!"
    },
    triggers: [
      { event: "on_scroll", animation: "wave", dialogue: "on_idle" }
    ],
    animations: { idle: "gentle_bob" }
  },
  {
    meta: {
      name: "Rusty",
      personality_tags: ["quirky", "helpful"],
      voice_style: "robotic"
    },
    appearance: {
      body_shape: "chunky_robot",
      primary_color: "#FF6F00",
      secondary_color: "#E65100",
      accent_color: "#FFD54F",
      face_style: "robotic_visor",
      has_arms: true,
      has_legs: true,
      has_ears_or_antenna: "antenna",
      material: "metallic",
      size_scale: 1.1
    },
    dialogues: {
      on_load: "BEEP BOOP. Systems online. How can I assist?",
      on_idle: "Processing... standing by.",
      on_error: "ERROR DETECTED. Initiating repair sequence.",
      on_success: "TASK COMPLETE. Efficiency: 100%."
    },
    triggers: [
      { event: "on_error", animation: "bounce", dialogue: "on_error" },
      { event: "on_success", animation: "happy_jump", dialogue: "on_success" }
    ],
    animations: { idle: "gentle_bob" }
  },
  {
    meta: {
      name: "Gloop",
      personality_tags: ["calm", "gentle"],
      voice_style: "soft"
    },
    appearance: {
      body_shape: "creature",
      primary_color: "#00E676",
      secondary_color: "#ffffff",
      accent_color: "#B9F6CA",
      face_style: "sleepy",
      has_arms: false,
      has_legs: true,
      has_ears_or_antenna: "ears",
      material: "soft_toy",
      size_scale: 1.0
    },
    dialogues: {
      on_load: "Hello, friend. I'm glad you're here.",
      on_idle: "Take your time. I'll be right here.",
      on_error: "It's okay. Every mistake is a lesson.",
      on_success: "Wonderful. You did beautifully."
    },
    triggers: [
      { event: "on_idle", animation: "gentle_bob", dialogue: "on_idle", delay_ms: 3000 }
    ],
    animations: { idle: "gentle_bob" }
  },
  {
    meta: {
      name: "Byte",
      personality_tags: ["techy", "precise"],
      voice_style: "formal"
    },
    appearance: {
      body_shape: "geometric",
      primary_color: "#00B0FF",
      secondary_color: "#001F3F",
      accent_color: "#40C4FF",
      face_style: "robotic_visor",
      has_arms: true,
      has_legs: false,
      has_ears_or_antenna: "antenna",
      material: "metallic",
      size_scale: 1.0
    },
    dialogues: {
      on_load: "Initializing interface. Welcome, user.",
      on_idle: "Awaiting your input.",
      on_error: "Anomaly detected. Please review your input.",
      on_success: "Operation successful. Data committed."
    },
    triggers: [
      { event: "on_click", animation: "spin", dialogue: "on_load" }
    ],
    animations: { idle: "gentle_bob" }
  },
  {
    meta: {
      name: "Nova",
      personality_tags: ["inspiring", "bold"],
      voice_style: "confident"
    },
    appearance: {
      body_shape: "star",
      primary_color: "#7C4DFF",
      secondary_color: "#B388FF",
      accent_color: "#FFD740",
      face_style: "star_eyes",
      has_arms: true,
      has_legs: true,
      has_ears_or_antenna: "none",
      material: "neon",
      size_scale: 1.15
    },
    dialogues: {
      on_load: "The universe is within your reach. Let's build!",
      on_idle: "Stars don't wait — neither should you.",
      on_error: "Every supernova starts with a collapse. Try again!",
      on_success: "You're shining like a star right now."
    },
    triggers: [
      { event: "on_success", animation: "dance", dialogue: "on_success" }
    ],
    animations: { idle: "gentle_bob" }
  },
  {
    meta: {
      name: "Pebble",
      personality_tags: ["cozy", "reliable"],
      voice_style: "warm"
    },
    appearance: {
      body_shape: "bear",
      primary_color: "#FF8A65",
      secondary_color: "#FFCCBC",
      accent_color: "#BF360C",
      face_style: "cute_dot_eyes",
      has_arms: true,
      has_legs: true,
      has_ears_or_antenna: "ears",
      material: "soft_toy",
      size_scale: 1.0
    },
    dialogues: {
      on_load: "Cozy up! I'm Pebble and I'm here to help.",
      on_idle: "Just hanging out here... like a warm rock.",
      on_error: "Oof! Let's shake it off and try again.",
      on_success: "Warm and fuzzy feeling unlocked!"
    },
    triggers: [
      { event: "on_scroll", animation: "wave", dialogue: "on_idle" }
    ],
    animations: { idle: "gentle_bob" }
  },
  {
    meta: {
      name: "Zyx",
      personality_tags: ["mysterious", "playful"],
      voice_style: "cryptic"
    },
    appearance: {
      body_shape: "dragon",
      primary_color: "#AA00FF",
      secondary_color: "#12005E",
      accent_color: "#EA80FC",
      face_style: "minimal_line",
      has_arms: true,
      has_legs: true,
      has_ears_or_antenna: "horns",
      material: "crystal",
      size_scale: 0.95
    },
    dialogues: {
      on_load: "You called? I sensed your curiosity.",
      on_idle: "The code flows through everything...",
      on_error: "The path forks here. Choose wisely.",
      on_success: "The pattern emerges. Well played."
    },
    triggers: [
      { event: "on_idle", animation: "spin", dialogue: "on_idle", delay_ms: 5000 }
    ],
    animations: { idle: "gentle_bob" }
  },
  {
    meta: {
      name: "Coral",
      personality_tags: ["friendly", "bubbly"],
      voice_style: "playful"
    },
    appearance: {
      body_shape: "cat",
      primary_color: "#FF4081",
      secondary_color: "#FF80AB",
      accent_color: "#F50057",
      face_style: "heart_eyes",
      has_arms: true,
      has_legs: true,
      has_ears_or_antenna: "ears",
      material: "glossy",
      size_scale: 1.05
    },
    dialogues: {
      on_load: "Heyyyy! Let's get this party started 🎉",
      on_idle: "Psst... click something! It'll be fun.",
      on_error: "Whoopsie! Nobody's perfect — let's retry!",
      on_success: "WOOOO! Look at you go!"
    },
    triggers: [
      { event: "on_success", animation: "happy_jump", dialogue: "on_success" },
      { event: "on_click", animation: "bounce", dialogue: "on_load" }
    ],
    animations: { idle: "gentle_bob" }
  }
];
