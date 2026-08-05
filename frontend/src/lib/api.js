const API_BASE = 'http://localhost:8000/api';

export const analyzeScreenshot = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const res = await fetch(`${API_BASE}/analyze-screenshot`, {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) throw new Error('Failed to analyze screenshot');
  return res.json();
};

export const generateMascot = async (description, extracted_style) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(`${API_BASE}/generate-mascot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, extracted_style }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error("AI couldn't generate the mascot. Please try again.");
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error("The AI is taking longer than expected. Please try again.");
    throw new Error("AI couldn't generate the mascot. Please try again.");
  }
};

export const refineMascot = async (current_spec, instruction) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(`${API_BASE}/refine-mascot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_spec, instruction }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error("AI couldn't generate the mascot. Please try again.");
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error("The AI is taking longer than expected. Please try again.");
    throw new Error("AI couldn't generate the mascot. Please try again.");
  }
};

// ── Pure Local Storage Saving ──

export const saveProject = async (name, spec, screenshot_url = null) => {
  const projects = JSON.parse(localStorage.getItem('mascot_projects') || '[]');
  const id = Date.now().toString();
  const newProject = { 
    id, name, spec, screenshot_url,
    created_at: new Date().toISOString()
  };
  projects.push(newProject);
  localStorage.setItem('mascot_projects', JSON.stringify(projects));
  return { message: "Saved locally", project_id: id };
};

export const getProjects = async () => {
  return JSON.parse(localStorage.getItem('mascot_projects') || '[]');
};

export const deleteProject = async (id) => {
  let projects = JSON.parse(localStorage.getItem('mascot_projects') || '[]');
  projects = projects.filter(p => p.id !== id);
  localStorage.setItem('mascot_projects', JSON.stringify(projects));
  return { message: "Deleted locally" };
};

export const generatePrompt = async (spec) => {
  try {
    const res = await fetch(`${API_BASE}/generate-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spec }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    throw new Error('Failed to generate prompt');
  }
};
