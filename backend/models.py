from pydantic import BaseModel, Field
from typing import List, Optional

class MascotMeta(BaseModel):
    name: str = "Mascot"
    personality_tags: List[str] = Field(default_factory=list)
    voice_style: str = "friendly"

class CustomPart(BaseModel):
    type: str  # "box", "sphere", "cylinder", "cone", "torus", "capsule"
    args: List[float] = Field(default_factory=list)
    position: List[float] = Field(default_factory=list)
    rotation: List[float] = Field(default_factory=list)
    color: Optional[str] = None
    use_primary_color: Optional[bool] = False
    use_secondary_color: Optional[bool] = False
    use_accent_color: Optional[bool] = False

class MascotAppearance(BaseModel):
    body_shape: str = "blob"
    primary_color: str = "#ff0000"
    secondary_color: str = "#00ff00"
    accent_color: str = "#0000ff"
    face_style: str = "cute_dot_eyes"
    has_arms: bool = True
    has_legs: bool = True
    has_ears_or_antenna: str = "none"
    material: str = "matte"
    size_scale: float = 1.0
    custom_parts: List[CustomPart] = Field(default_factory=list)

class MascotAnimations(BaseModel):
    idle: str = "gentle_bob"
    greeting: str = "wave"
    positive_reaction: str = "happy_bounce"
    negative_reaction: str = "look_away"
    thinking: str = "look_up"

class MascotDialogues(BaseModel):
    on_load: str = "Hello!"
    on_scroll_deep: str = "Look at all this content!"
    on_idle_long: str = "Are you still there?"
    on_success_action: str = "Awesome!"
    on_error: str = "Oops, something went wrong."
    on_exit_intent: str = "Wait, don't go!"

class MascotTrigger(BaseModel):
    event: str
    animation: str
    dialogue: str
    face_style: Optional[str] = None
    threshold: Optional[int] = None
    delay_ms: Optional[int] = None

class MascotSpec(BaseModel):
    meta: MascotMeta = Field(default_factory=MascotMeta)
    appearance: MascotAppearance = Field(default_factory=MascotAppearance)
    animations: MascotAnimations = Field(default_factory=MascotAnimations)
    dialogues: MascotDialogues = Field(default_factory=MascotDialogues)
    triggers: List[MascotTrigger] = Field(default_factory=list)
    ai_suggestion: Optional[str] = None


