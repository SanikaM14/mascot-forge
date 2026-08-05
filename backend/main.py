import os
import json
import base64
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from dotenv import load_dotenv
import groq

from models import MascotSpec
from database import init_db, get_db, User, Project
from sqlalchemy.orm import Session
from export_templates import generate_jsx_export, generate_python_export

load_dotenv()

app = FastAPI(title="MascotForge API")

@app.on_event("startup")
def startup_db_client():
    init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client lazily — dotenv must be loaded first
_groq_client = None

TEXT_MODEL = "llama-3.1-8b-instant"
VISION_MODEL = "qwen/qwen3.6-27b"

SHARED_SYSTEM_PROMPT = """You are the mascot design engine for MascotForge. Your only job is to output a single JSON object describing a 3D mascot character, matching the schema below exactly. You never write code, never write prose outside the JSON, and never invent field values outside the allowed options listed.

Output ONLY valid JSON. No markdown fences, no explanation, no text before or after the JSON object.

Schema and allowed values:

{
  "meta": {
    "name": string (a short, friendly, ownable mascot name — not a generic word like "Bot" or "Buddy"),
    "personality_tags": array of 2-3 strings (e.g. "cheerful", "calm", "playful", "professional", "mischievous"),
    "voice_style": string (one sentence describing how it talks)
  },
  "appearance": {
    "body_shape": one of ["blob", "humanoid", "geometric", "creature", "chunky_robot", "flower_pot", "mushroom", "ghost", "star", "cloud", "donut", "ice_cream", "cactus", "bear", "cat", "dragon", "diamond", "rocket", "crown", "jellyfish", "book", "teardrop", "pebble", "bubble", "crystal_shard", "monkey", "giraffe", "tiger", "crow", "custom_assembly"],
    "primary_color": hex string,
    "secondary_color": hex string,
    "accent_color": hex string,
    "face_style": one of ["cute_dot_eyes", "wide_eyes", "minimal_line", "robotic_visor", "sleepy", "heart_eyes", "star_eyes", "crying", "angry", "wink", "shocked"],
    "has_arms": boolean,
    "has_legs": boolean,
    "has_ears_or_antenna": one of ["none", "ears", "horns", "antenna", "wings", "hat", "bow", "leaf_top", "flame_top"],
    "material": one of ["matte", "glossy", "soft_toy", "metallic", "warm_matte", "crystal", "neon", "clay", "glass", "fabric"],
    "size_scale": number between 0.7 and 1.3,
    "custom_parts": array of objects, ONLY needed/used if body_shape is "custom_assembly". Each object represents a 3D primitive part:
      {
        "type": one of ["box", "sphere", "cylinder", "cone", "torus", "capsule"],
        "args": array of numbers (box: [w, h, d], sphere: [r], cylinder: [rTop, rBot, h], cone: [r, h], torus: [r, tube], capsule: [r, len]),
        "position": array of 3 numbers [x, y, z] relative to center,
        "rotation": array of 3 numbers [rx, ry, rz] in radians,
        "color": hex string (optional),
        "use_primary_color": boolean (optional),
        "use_secondary_color": boolean (optional),
        "use_accent_color": boolean (optional)
      }
  },
  "animations": {
    "idle": one of ["gentle_bob", "slow_breathe", "subtle_sway"],
    "greeting": one of ["wave", "head_nod", "bounce_in"],
    "positive_reaction": one of ["happy_bounce", "spin_once", "sparkle_pulse"],
    "negative_reaction": one of ["shrink_and_tilt", "look_away", "slow_shake"],
    "thinking": one of ["head_tilt_loop", "look_up", "tap_foot"]
  },
  "dialogues": {
    "on_load": string,
    "on_scroll_deep": string,
    "on_idle_long": string,
    "on_success_action": string,
    "on_error": string,
    "on_exit_intent": string
  },
  "triggers": array of objects, each { "event": one of ["page_load","scroll_percent","idle_ms","form_submit_success","network_offline","exit_intent"], "animation": (must match a key in animations), "dialogue": (must match a key in dialogues), "face_style": (optional, one of ["cute_dot_eyes", "wide_eyes", "minimal_line", "robotic_visor", "sleepy", "heart_eyes", "star_eyes", "crying", "angry", "wink", "shocked"]), "threshold": number (only for scroll_percent/idle_ms), "delay_ms": number (only for page_load) },
  "ai_suggestion": string (A helpful suggestion for improving the colors, personality, or animations, based on the user's input. e.g. "Since this is a healthcare mascot, I recommend calm blue colors")
}

Design rules:

Colors and personality must genuinely reflect the brand or user description.
Every dialogue line should sound like the same character wrote it, consistent with voice_style, under 12 words each.
Pick body_shape, material, and toppers to match the site or request.
If the requested shape is in the list of pre-coded shapes, select it. Note that animal templates like 'monkey', 'giraffe', 'tiger', and 'crow' are built-in pre-coded shapes and MUST be selected directly. If the user asks for something entirely different that is not in the list (e.g. 'pineapple', 'car', 'house', 'guitar', 'tree', etc.), choose 'custom_assembly' and build a creative 3D composition of primitives in 'custom_parts' (e.g. for a house: a box for the structure, a cone on top for the roof). If the current mascot spec uses 'custom_assembly' to represent an animal or shape that exists in the pre-coded list (such as 'monkey', 'giraffe', 'tiger', or 'crow'), and the user asks to "make it perfect", "fix it", "make it look realistic", "connect limbs", or similar visual refinements, you MUST change 'body_shape' to the corresponding pre-coded shape (e.g. 'monkey') and clear 'custom_parts' to upgrade it to the high-quality built-in template. IMPORTANT: The engine already automatically renders dynamic, animated limbs (Arms and Legs), eyes/mouth (Face), and head accessories (Toppers like 'ears', 'horns', 'wings', 'antenna', 'hat') based on their respective configuration flags. Therefore, you should NEVER generate custom_parts for basic limbs (arms, legs) or eyes, as doing so will create static, overlapping, double limbs/parts. Only generate custom parts for the core body structure, tail, snout/nose, wings, or decorative features. Set has_arms=True, has_legs=True, and has_ears_or_antenna to appropriate options (e.g. 'ears' for a monkey) so the engine renders them animatably. Combine primitives creatively to represent any shape the user requests. If the request matches a pre-coded shape closely (e.g. 'kitten' -> 'cat'), use the pre-coded one.
Always include at least 4 triggers, including one for page_load and one for network_offline. Make sure triggers have appropriate `face_style` values set so the face changes expression dynamically to match the dialogue/action (e.g., 'crying' or 'shocked' face for errors/offline, 'heart_eyes'/'star_eyes'/'wink' for success/happy reactions, 'sleepy' or 'wink' for idle, etc.).
If any input is vague, make a confident creative choice rather than defaulting to something generic."""

def get_groq_client():
    global _groq_client
    if _groq_client is None:
        key = os.getenv("GROQ_API_KEY")
        if not key:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured in backend .env file.")
        _groq_client = groq.Groq(api_key=key)
    return _groq_client

@app.post("/api/analyze-screenshot")
async def analyze_screenshot(image: UploadFile = File(...)):
    g_client = get_groq_client()
    try:
        contents = await image.read()
        base64_image = base64.b64encode(contents).decode("utf-8")
        image_url = f"data:{image.content_type};base64,{base64_image}"

        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Analyze this website screenshot. Extract the dominant colors (primary, secondary, accent), the overall mood (e.g., professional, playful, cozy), the layout density, and formality. Return a JSON object ONLY with the keys: primary_color, secondary_color, accent_color, mood, density, formality."},
                    {"type": "image_url", "image_url": {"url": image_url}}
                ]
            }
        ]

        response = g_client.chat.completions.create(
            model=VISION_MODEL,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        
        extracted_style = json.loads(response.choices[0].message.content)
        return {"extracted_style": extracted_style}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-mascot", response_model=dict)
async def generate_mascot(payload: dict):
    g_client = get_groq_client()
    description = payload.get("description", "")
    extracted_style = payload.get("extracted_style", {})

    user_message = f"Website description: {description}\n"
    if extracted_style:
        user_message += f"Extracted visual style (if a screenshot was analyzed): {json.dumps(extracted_style)}\n"
    user_message += "\nGenerate the mascot spec now."

    def attempt_generation(error_feedback=None):
        messages = [
            {"role": "system", "content": SHARED_SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ]
        if error_feedback:
            messages.append({"role": "user", "content": f"The previous output had this validation error: {error_feedback}. Please fix it and return valid JSON."})

        response = g_client.chat.completions.create(
            model=TEXT_MODEL,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        
        raw_json = response.choices[0].message.content
        return json.loads(raw_json)

    try:
        data = attempt_generation()
        spec = MascotSpec(**data)
        return {"spec": spec.model_dump()}
    except ValidationError as ve:
        # Retry once
        try:
            data = attempt_generation(str(ve))
            spec = MascotSpec(**data)
            return {"spec": spec.model_dump()}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Generation failed after retry: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def deep_merge(dict1, dict2):
    """Deep merge dict2 into dict1. dict2 values overwrite dict1 values."""
    for key, value in dict2.items():
        if isinstance(value, dict) and key in dict1 and isinstance(dict1[key], dict):
            deep_merge(dict1[key], value)
        else:
            dict1[key] = value
    return dict1

@app.post("/api/refine-mascot")
async def refine_mascot(payload: dict):
    g_client = get_groq_client()
    current_spec = payload.get("current_spec")
    instruction = payload.get("instruction")

    prompt = f"""
    Update the following MascotSpec based on the user instruction. Return the COMPLETE updated JSON object matching the schema exactly.
    Keep fields that do not need changes exactly the same, but modify the fields necessary to satisfy the instruction.
    Current Spec: {json.dumps(current_spec, indent=2)}
    Instruction: {instruction}
    """

    def attempt_refinement(error_feedback=None):
        messages = [
            {"role": "system", "content": SHARED_SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        if error_feedback:
            messages.append({"role": "user", "content": f"Your last output had this schema error. Fix it and return valid JSON: {error_feedback}"})
            
        response = g_client.chat.completions.create(
            model=TEXT_MODEL,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        raw_json = response.choices[0].message.content
        return json.loads(raw_json)

    try:
        data = attempt_refinement()
        merged = deep_merge(json.loads(json.dumps(current_spec)), data)
        spec = MascotSpec(**merged)
        return {"spec": spec.model_dump()}
    except ValidationError as ve:
        try:
            data = attempt_refinement(str(ve))
            merged = deep_merge(json.loads(json.dumps(current_spec)), data)
            spec = MascotSpec(**merged)
            return {"spec": spec.model_dump()}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Refinement failed after retry: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/export")
async def export_mascot(payload: dict):
    spec = payload.get("spec", {})
    format_type = payload.get("format", "jsx")
    name = spec.get("meta", {}).get("name", "Mascot")
    safe_name = "".join(c for c in name if c.isalnum())

    if format_type == "jsx":
        code = generate_jsx_export(spec)
        return {"code": code, "filename": f"{safe_name}Mascot.jsx"}
    elif format_type == "python":
        code = generate_python_export(spec)
        return {"code": code, "filename": f"{safe_name.lower()}_mascot.py"}
    else:
        return {"code": "# Unknown format", "filename": "mascot.txt"}


@app.post("/api/generate-prompt")
async def generate_prompt_endpoint(payload: dict):
    """Convert a mascot spec into a human-readable AI prompt to recreate it in any AI agent."""
    spec = payload.get("spec", {})
    meta = spec.get("meta", {})
    appearance = spec.get("appearance", {})
    dialogues = spec.get("dialogues", {})
    triggers = spec.get("triggers", [])

    try:
        g_client = get_groq_client()
        system_prompt = """You are an AI prompt engineer. Given a mascot spec JSON, write a single clear conversational prompt 
that a user could paste into ChatGPT, Claude, Gemini, or any AI model to recreate this exact mascot. 
Describe appearance, personality, voice, dialogues, and behaviors in natural English paragraphs. 
Start with: 'Create a 3D website mascot with these characteristics:'. No JSON, no code blocks."""

        response = g_client.chat.completions.create(
            model=TEXT_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Convert this spec:\n{json.dumps(spec, indent=2)}"}
            ],
            temperature=0.5,
        )
        prompt_text = response.choices[0].message.content
        return {"prompt": prompt_text}
    except Exception:
        # Fallback manual prompt
        tags = ", ".join(meta.get("personality_tags", ["friendly"]))
        trigger_desc = ". ".join([
            f"When {t.get('event','').replace('_',' ')}, perform a {t.get('animation','').replace('_',' ')} gesture"
            for t in triggers
        ])
        fallback = f"""Create a 3D website mascot with these characteristics:

Name: {meta.get('name', 'Mascot')}. Personality: {tags}. Voice style: {meta.get('voice_style', 'friendly')}.

Visual design: {appearance.get('body_shape','blob').replace('_',' ')} body shape. Primary color: {appearance.get('primary_color','#ff0000')}. Secondary color: {appearance.get('secondary_color','#fff')}. Accent color: {appearance.get('accent_color','#ffaaaa')}. Face style: {appearance.get('face_style','cute_dot_eyes').replace('_',' ')}. Material: {appearance.get('material','matte').replace('_',' ')}. {'Has arms. ' if appearance.get('has_arms') else 'No arms. '}{'Has legs. ' if appearance.get('has_legs') else 'No legs. '}{f'Has {appearance.get("has_ears_or_antenna")} on top.' if appearance.get('has_ears_or_antenna') not in ('none', None) else ''}

Dialogues - On load: "{dialogues.get('on_load','')}". On idle: "{dialogues.get('on_idle','')}". On error: "{dialogues.get('on_error','')}". On success: "{dialogues.get('on_success','')}".

Behaviors: {trigger_desc or 'Gently bobs at idle.'}

Render as an animated 3D mascot suitable for embedding on a website."""
        return {"prompt": fallback}


# Database Endpoints

@app.post("/api/auth/register-login")
async def register_login(payload: dict, db: Session = Depends(get_db)):
    username = payload.get("username", "").strip()
    if not username:
        raise HTTPException(status_code=400, detail="Username is required")
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = User(username=username)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return {"id": user.id, "username": user.username}

@app.post("/api/projects")
async def save_project(payload: dict, db: Session = Depends(get_db)):
    user_id = payload.get("user_id")
    name = payload.get("name", "Unnamed Mascot")
    spec_data = payload.get("spec")
    screenshot_url = payload.get("screenshot_url")
    is_public = payload.get("is_public", False)

    if not user_id or not spec_data:
        raise HTTPException(status_code=400, detail="User ID and Mascot Spec are required")

    project = Project(
        user_id=user_id,
        name=name,
        spec=spec_data,
        screenshot_url=screenshot_url,
        is_public=is_public
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return {"status": "success", "project_id": project.id}

@app.get("/api/projects")
async def get_projects(user_id: int, db: Session = Depends(get_db)):
    projects = db.query(Project).filter(Project.user_id == user_id).order_by(Project.created_at.desc()).all()
    return [{"id": p.id, "name": p.name, "spec": p.spec, "screenshot_url": p.screenshot_url, "is_public": p.is_public, "created_at": p.created_at, "likes": p.likes} for p in projects]

@app.get("/api/gallery")
async def get_gallery(db: Session = Depends(get_db)):
    projects = db.query(Project).filter(Project.is_public == True).order_by(Project.likes.desc(), Project.created_at.desc()).all()
    return [{"id": p.id, "name": p.name, "spec": p.spec, "screenshot_url": p.screenshot_url, "owner": p.owner.username, "likes": p.likes} for p in projects]

@app.post("/api/projects/{id}/publish")
async def publish_project(id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project.is_public = True
    db.commit()
    return {"status": "success"}

@app.post("/api/projects/{id}/like")
async def like_project(id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project.likes = (project.likes or 0) + 1
    db.commit()
    return {"likes": project.likes}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
