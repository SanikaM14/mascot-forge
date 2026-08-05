import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';

export default function MascotEngine({ spec, currentAnimation, currentFaceStyle }) {
  const group = useRef();

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    // Reset each frame
    group.current.position.y = 0;
    group.current.rotation.y = 0;
    group.current.rotation.z = 0;

    switch (currentAnimation) {
      case 'gentle_bob': group.current.position.y = Math.sin(t * 2) * 0.1; break;
      case 'float':      group.current.position.y = Math.sin(t * 1.5) * 0.15; break;
      case 'wave':       group.current.rotation.z = Math.sin(t * 4) * 0.25; break;
      case 'bounce':     group.current.position.y = Math.abs(Math.sin(t * 4)) * 0.2; break;
      case 'spin':       group.current.rotation.y += 0.04; break;
      case 'dance':      group.current.position.y = Math.sin(t * 3) * 0.12; group.current.rotation.y = Math.sin(t * 2) * 0.3; break;
      case 'happy_jump': group.current.position.y = Math.abs(Math.sin(t * 5)) * 0.25; break;
      case 'nod':        group.current.rotation.x = Math.sin(t * 3) * 0.2; break;
      case 'shake':      group.current.rotation.z = Math.sin(t * 8) * 0.15; break;
      case 'pulse':      { const s = 1 + Math.sin(t * 3) * 0.08; group.current.scale.set(s, s, s); break; }
      case 'wiggle':     group.current.rotation.z = Math.sin(t * 6) * 0.1; group.current.position.y = Math.sin(t * 3) * 0.05; break;
      case 'blink':      group.current.position.y = Math.sin(t * 1) * 0.04; break;
      case 'idle_look':  group.current.rotation.y = Math.sin(t * 1.5) * 0.2; break;
      default:           group.current.position.y = Math.sin(t * 2) * 0.08;
    }
  });

  if (!spec) return null;

  const {
    body_shape, primary_color, secondary_color, accent_color,
    face_style: base_face_style, material, has_arms, has_legs,
    has_ears_or_antenna, size_scale = 1
  } = spec.appearance;

  const face_style = currentFaceStyle || base_face_style || 'cute_dot_eyes';

  const matR = {
    matte:      { roughness: 0.90, metalness: 0.0 },
    glossy:     { roughness: 0.05, metalness: 0.0 },
    soft_toy:   { roughness: 0.75, metalness: 0.0 },
    metallic:   { roughness: 0.30, metalness: 0.80 },
    warm_matte: { roughness: 0.95, metalness: 0.0 },
    crystal:    { roughness: 0.05, metalness: 0.3 },
    neon:       { roughness: 0.20, metalness: 0.0, emissive: primary_color, emissiveIntensity: 0.6 },
    clay:       { roughness: 0.85, metalness: 0.0 },
    glass:      { roughness: 0.0,  metalness: 0.0, transparent: true, opacity: 0.7 },
    fabric:     { roughness: 0.95, metalness: 0.0 },
  }[material] || { roughness: 0.8, metalness: 0.0 };

  const mp  = { color: primary_color,   ...matR };
  const ms  = { color: secondary_color, roughness: matR.roughness, metalness: matR.metalness };
  const ma  = { color: accent_color,    roughness: matR.roughness, metalness: matR.metalness };
  const face_dark = material === 'warm_matte' ? '#4a2f20' : '#111111';

  // ── High Quality Cute Eye helper with reflection ─────────────────────────
  const CuteEye = ({ x, y, z, scale = 1 }) => (
    <group position={[x, y, z]} scale={[scale, scale, scale]}>
      <mesh>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshStandardMaterial color={face_dark} roughness={0.15} metalness={0.1} />
      </mesh>
      {/* Glare Reflection Dot */}
      <mesh position={[0.03, 0.03, 0.07]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );

  // ── Cute Pink/Peach Blush Cheeks ──────────────────────────────────────────
  const Blush = ({ x, y, z, scale = 1 }) => (
    <group position={[0, y, z]}>
      {[-x, x].map((cx, i) => (
        <mesh key={i} position={[cx, 0, 0]}>
          <sphereGeometry args={[0.055 * scale, 16, 16]} />
          <meshBasicMaterial color="#ff8fab" transparent opacity={0.65} />
        </mesh>
      ))}
    </group>
  );

  // ── Face helper ───────────────────────────────────────────────────────────
  const Face = ({ z = 0.62, scale = 1, yOffset = 0.08 }) => {
    if (spec.appearance.hide_default_face) return null;
    const s = scale;
    switch (face_style) {
      case 'wide_eyes': return (
        <group position={[0, yOffset * s, z]}>
          {/* Eyes */}
          <CuteEye x={-0.2 * s} y={0} z={0} scale={1.4 * s} />
          <CuteEye x={0.2 * s} y={0} z={0} scale={1.4 * s} />
          {/* Blush */}
          <Blush x={0.32 * s} y={-0.08 * s} z={-0.02} scale={s} />
          {/* Open happy mouth */}
          <mesh position={[0, -0.12 * s, 0.01]}>
            <sphereGeometry args={[0.08 * s, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshBasicMaterial color={face_dark} />
          </mesh>
        </group>
      );
      case 'robotic_visor': return (
        <group position={[0, yOffset, z]}>
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[0.55 * s, 0.18 * s, 0.04]} />
            <meshStandardMaterial color={accent_color} emissive={accent_color} emissiveIntensity={0.8} />
          </mesh>
          {/* Glowing visor dots */}
          <mesh position={[-0.15 * s, 0, 0.045]}><sphereGeometry args={[0.04 * s, 12, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>
          <mesh position={[0.15 * s, 0, 0.045]}><sphereGeometry args={[0.04 * s, 12, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>
          {/* Soft robot cheeks */}
          <Blush x={0.3 * s} y={-0.12 * s} z={0} scale={0.7 * s} />
        </group>
      );
      case 'minimal_line': return (
        <group position={[0, yOffset * s, z]}>
          <CuteEye x={-0.15 * s} y={0} z={0} scale={0.8 * s} />
          <CuteEye x={0.15 * s} y={0} z={0} scale={0.8 * s} />
          <Blush x={0.25 * s} y={-0.08 * s} z={-0.02} scale={0.8 * s} />
          <mesh position={[0, -0.06 * s, 0]}><boxGeometry args={[0.22 * s, 0.02 * s, 0.02]} /><meshBasicMaterial color={face_dark} /></mesh>
        </group>
      );
      case 'sleepy': return (
        <group position={[0, yOffset * s, z]}>
          {[[-0.18 * s, 0], [0.18 * s, 0]].map(([x], i) => (
            <mesh key={i} position={[x, 0, 0]}>
              <torusGeometry args={[0.07 * s, 0.02 * s, 8, 16, Math.PI]} />
              <meshBasicMaterial color={face_dark} />
            </mesh>
          ))}
          <Blush x={0.28 * s} y={-0.06 * s} z={-0.02} scale={s} />
          <mesh position={[0, -0.1 * s, 0.01]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.07 * s, 0.018 * s, 8, 16, Math.PI]} /><meshBasicMaterial color={face_dark} /></mesh>
        </group>
      );
      case 'heart_eyes': return (
        <group position={[0, yOffset * s, z]}>
          {[[-0.18 * s, 0], [0.18 * s, 0]].map(([x], i) => (
            <group key={i} position={[x, 0, 0]} scale={[0.32 * s, 0.32 * s, 0.32 * s]}>
              <mesh position={[-0.25, 0.25, 0]} rotation={[0, 0, -Math.PI/4]}><cylinderGeometry args={[0.3, 0.3, 0.15, 16]} /><meshBasicMaterial color="#ff4466" /></mesh>
              <mesh position={[0.25, 0.25, 0]} rotation={[0, 0, Math.PI/4]}><cylinderGeometry args={[0.3, 0.3, 0.15, 16]} /><meshBasicMaterial color="#ff4466" /></mesh>
              <mesh position={[0, -0.1, 0]} rotation={[0, 0, Math.PI/4]}><boxGeometry args={[0.6, 0.6, 0.15]} /><meshBasicMaterial color="#ff4466" /></mesh>
            </group>
          ))}
          <Blush x={0.3 * s} y={-0.1 * s} z={-0.02} scale={s} />
          <mesh position={[0, -0.12 * s, 0.02]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.09 * s, 0.02 * s, 8, 16, Math.PI]} /><meshBasicMaterial color={face_dark} /></mesh>
        </group>
      );
      case 'star_eyes': return (
        <group position={[0, yOffset * s, z]}>
          {[[-0.18 * s, 0], [0.18 * s, 0]].map(([x], i) => (
            <mesh key={i} position={[x, 0, 0]}>
              <torusGeometry args={[0.08 * s, 0.03 * s, 5, 5]} />
              <meshBasicMaterial color="#FFD700" />
            </mesh>
          ))}
          <Blush x={0.28 * s} y={-0.08 * s} z={-0.02} scale={s} />
          <mesh position={[0, -0.1 * s, 0.02]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.09 * s, 0.025 * s, 8, 16, Math.PI]} /><meshBasicMaterial color={face_dark} /></mesh>
        </group>
      );
      case 'happy_arc': return (
        <group position={[0, yOffset * s, z]}>
          <CuteEye x={-0.16 * s} y={0.04 * s} z={0} scale={0.95 * s} />
          <CuteEye x={0.16 * s} y={0.04 * s} z={0} scale={0.95 * s} />
          <Blush x={0.28 * s} y={-0.05 * s} z={-0.02} scale={s} />
          <mesh position={[0, -0.06 * s, 0.02]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.14 * s, 0.028 * s, 8, 20, Math.PI]} /><meshBasicMaterial color={face_dark} /></mesh>
        </group>
      );
      case 'crying': return (
        <group position={[0, yOffset * s, z]}>
          <CuteEye x={-0.16 * s} y={0} z={0} scale={s} />
          <CuteEye x={0.16 * s} y={0} z={0} scale={s} />
          <Blush x={0.28 * s} y={-0.08 * s} z={-0.02} scale={s} />
          {/* Tears */}
          <mesh position={[-0.16 * s, -0.12 * s, 0.03]}><sphereGeometry args={[0.035 * s, 16, 16]} /><meshBasicMaterial color="#33b5e5" transparent opacity={0.8} /></mesh>
          <mesh position={[0.16 * s, -0.12 * s, 0.03]}><sphereGeometry args={[0.035 * s, 16, 16]} /><meshBasicMaterial color="#33b5e5" transparent opacity={0.8} /></mesh>
          {/* Sad frowning mouth */}
          <mesh position={[0, -0.14 * s, 0.01]}><torusGeometry args={[0.07 * s, 0.02 * s, 8, 20, Math.PI]} /><meshBasicMaterial color={face_dark} /></mesh>
        </group>
      );
      case 'angry': return (
        <group position={[0, yOffset * s, z]}>
          <CuteEye x={-0.16 * s} y={0} z={0} scale={s} />
          <CuteEye x={0.16 * s} y={0} z={0} scale={s} />
          <Blush x={0.28 * s} y={-0.08 * s} z={-0.02} scale={s} />
          {/* Slanted angry eyebrows */}
          <mesh position={[-0.15 * s, 0.08 * s, 0.02]} rotation={[0, 0, 0.35]}><boxGeometry args={[0.12 * s, 0.02 * s, 0.02]} /><meshBasicMaterial color={face_dark} /></mesh>
          <mesh position={[0.15 * s, 0.08 * s, 0.02]} rotation={[0, 0, -0.35]}><boxGeometry args={[0.12 * s, 0.02 * s, 0.02]} /><meshBasicMaterial color={face_dark} /></mesh>
          {/* Straight line mouth */}
          <mesh position={[0, -0.12 * s, 0.01]}><boxGeometry args={[0.16 * s, 0.02 * s, 0.02]} /><meshBasicMaterial color={face_dark} /></mesh>
        </group>
      );
      case 'wink': return (
        <group position={[0, yOffset * s, z]}>
          <CuteEye x={-0.16 * s} y={0} z={0} scale={s} />
          {/* Winking right eye */}
          <mesh position={[0.16 * s, 0, 0.02]}><torusGeometry args={[0.06 * s, 0.015 * s, 8, 16, Math.PI]} /><meshBasicMaterial color={face_dark} /></mesh>
          <Blush x={0.28 * s} y={-0.08 * s} z={-0.02} scale={s} />
          <mesh position={[0, -0.12 * s, 0.01]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.09 * s, 0.025 * s, 8, 20, Math.PI]} /><meshBasicMaterial color={face_dark} /></mesh>
        </group>
      );
      case 'shocked': return (
        <group position={[0, yOffset * s, z]}>
          <CuteEye x={-0.16 * s} y={0} z={0} scale={1.35 * s} />
          <CuteEye x={0.16 * s} y={0} z={0} scale={1.35 * s} />
          <Blush x={0.28 * s} y={-0.08 * s} z={-0.02} scale={s} />
          {/* Circular open mouth */}
          <mesh position={[0, -0.14 * s, 0.01]}><torusGeometry args={[0.045 * s, 0.02 * s, 8, 16]} /><meshBasicMaterial color={face_dark} /></mesh>
        </group>
      );
      case 'cute_dot_eyes':
      default: return (
        <group position={[0, yOffset * s, z]}>
          <CuteEye x={-0.16 * s} y={0} z={0} scale={s} />
          <CuteEye x={0.16 * s} y={0} z={0} scale={s} />
          <Blush x={0.28 * s} y={-0.08 * s} z={-0.02} scale={s} />
          <mesh position={[0, -0.12 * s, 0.01]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.09 * s, 0.025 * s, 8, 20, Math.PI]} /><meshBasicMaterial color={face_dark} /></mesh>
        </group>
      );
    }
  };

  // ── Arms helper (Shoulder pivot point with custom animations) ────────────
  const Arms = ({ y = 0, xOffset = 0.55 }) => {
    const leftArmRef = useRef();
    const rightArmRef = useRef();
    const armLength = 0.45;
    const armRadius = 0.085;

    useFrame((state) => {
      if (!has_arms) return;
      const t = state.clock.elapsedTime;
      
      let leftRot = -0.15;
      let rightRot = 0.15;
      let leftRotY = 0;
      let rightRotY = 0;

      if (currentAnimation === 'wave') {
        // Natural outward wave (negative Z rotates left arm away from body)
        leftRot = -2.4 - Math.sin(t * 8) * 0.4;
        leftRotY = -0.2 - Math.cos(t * 8) * 0.2;
      } else if (currentAnimation === 'dance') {
        leftRot = -0.15 + Math.sin(t * 6) * 0.45;
        rightRot = 0.15 - Math.cos(t * 6) * 0.45;
      } else if (currentAnimation === 'shake') {
        leftRot = -0.15 + Math.sin(t * 12) * 0.15;
        rightRot = 0.15 + Math.sin(t * 12) * 0.15;
      } else if (currentAnimation === 'bounce') {
        leftRot = -0.15 + Math.abs(Math.sin(t * 4)) * 0.2;
        rightRot = 0.15 - Math.abs(Math.sin(t * 4)) * 0.2;
      }

      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = leftRot;
        leftArmRef.current.rotation.y = leftRotY;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = rightRot;
        rightArmRef.current.rotation.y = rightRotY;
      }
    });

    if (!has_arms) return null;

    return (
      <>
        <group ref={leftArmRef} position={[-xOffset, y, 0]}>
          <mesh castShadow position={[0, -armLength / 2, 0]}>
            <capsuleGeometry args={[armRadius, armLength, 8, 12]} />
            <meshStandardMaterial {...ms} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[xOffset, y, 0]}>
          <mesh castShadow position={[0, -armLength / 2, 0]}>
            <capsuleGeometry args={[armRadius, armLength, 8, 12]} />
            <meshStandardMaterial {...ms} />
          </mesh>
        </group>
      </>
    );
  };

  // ── Legs helper (Hip pivot point with custom animations) ─────────────────
  const Legs = ({ y = -0.8 }) => {
    const leftLegRef = useRef();
    const rightLegRef = useRef();
    const legLength = 0.35;
    const legRadius = 0.09;

    useFrame((state) => {
      if (!has_legs) return;
      const t = state.clock.elapsedTime;
      
      let leftRot = 0;
      let rightRot = 0;

      if (currentAnimation === 'dance') {
        leftRot = Math.sin(t * 6) * 0.25;
        rightRot = -Math.sin(t * 6) * 0.25;
      } else if (currentAnimation === 'happy_jump') {
        leftRot = 0.2;
        rightRot = 0.2;
      } else if (currentAnimation === 'bounce') {
        leftRot = Math.sin(t * 4) * 0.1;
        rightRot = -Math.sin(t * 4) * 0.1;
      } else if (currentAnimation === 'wave') {
        // Subtle shift in weight on the waving (left) leg
        leftRot = 0.08 + Math.sin(t * 8) * 0.04;
      }

      if (leftLegRef.current) leftLegRef.current.rotation.x = leftRot;
      if (rightLegRef.current) rightLegRef.current.rotation.x = rightRot;
    });

    if (!has_legs) return null;

    return (
      <>
        <group ref={leftLegRef} position={[-0.22, y, 0]}>
          <mesh castShadow position={[0, -legLength / 2, 0]}>
            <capsuleGeometry args={[legRadius, legLength, 8, 12]} />
            <meshStandardMaterial {...ms} />
          </mesh>
        </group>
        <group ref={rightLegRef} position={[0.22, y, 0]}>
          <mesh castShadow position={[0, -legLength / 2, 0]}>
            <capsuleGeometry args={[legRadius, legLength, 8, 12]} />
            <meshStandardMaterial {...ms} />
          </mesh>
        </group>
      </>
    );
  };

  // ── Topper helper (ears/antenna/etc) ─────────────────────────────────────
  const Topper = ({ y = 0.8 }) => {
    switch (has_ears_or_antenna) {
      case 'ears': return (
        <>
          <mesh position={[-0.45, y, 0]}><sphereGeometry args={[0.2, 12, 12]} /><meshStandardMaterial {...mp} /></mesh>
          <mesh position={[0.45, y, 0]}><sphereGeometry args={[0.2, 12, 12]} /><meshStandardMaterial {...mp} /></mesh>
        </>
      );
      case 'horns': return (
        <>
          <mesh position={[-0.3, y, 0]} rotation={[0, 0, -0.3]}><coneGeometry args={[0.1, 0.4, 12]} /><meshStandardMaterial {...ma} /></mesh>
          <mesh position={[0.3, y, 0]} rotation={[0, 0, 0.3]}><coneGeometry args={[0.1, 0.4, 12]} /><meshStandardMaterial {...ma} /></mesh>
        </>
      );
      case 'antenna': return (
        <group position={[0, y, 0]}>
          <mesh><cylinderGeometry args={[0.025, 0.025, 0.4, 8]} /><meshStandardMaterial color={secondary_color} /></mesh>
          <mesh position={[0, 0.25, 0]}><sphereGeometry args={[0.08, 12, 12]} /><meshStandardMaterial color={accent_color} emissive={accent_color} emissiveIntensity={0.5} /></mesh>
        </group>
      );
      case 'wings': return (
        <>
          <mesh position={[-0.7, 0.1, -0.1]} rotation={[0.2, 0, 0.4]}><ellipsoidGeometry /><meshStandardMaterial {...ma} /></mesh>
          <mesh position={[0.7, 0.1, -0.1]} rotation={[0.2, 0, -0.4]}><ellipsoidGeometry /><meshStandardMaterial {...ma} /></mesh>
        </>
      );
      case 'hat': return (
        <group position={[0, y, 0]}>
          <mesh><cylinderGeometry args={[0.35, 0.35, 0.08, 20]} /><meshStandardMaterial {...ms} /></mesh>
          <mesh position={[0, 0.22, 0]}><cylinderGeometry args={[0.18, 0.2, 0.38, 16]} /><meshStandardMaterial {...ms} /></mesh>
        </group>
      );
      case 'bow': return (
        <group position={[0.4, y, 0]} rotation={[0, 0, 0.3]}>
          <mesh position={[-0.1, 0, 0]} rotation={[0, 0, 0.5]}><torusGeometry args={[0.1, 0.04, 8, 16, Math.PI * 1.5]} /><meshStandardMaterial color="#ff6699" /></mesh>
          <mesh position={[0.1, 0, 0]} rotation={[0, 0, -0.5]}><torusGeometry args={[0.1, 0.04, 8, 16, Math.PI * 1.5]} /><meshStandardMaterial color="#ff6699" /></mesh>
          <mesh><sphereGeometry args={[0.05, 8, 8]} /><meshStandardMaterial color="#ff3366" /></mesh>
        </group>
      );
      case 'leaf_top': return (
        <group position={[0, y, 0]}>
          <mesh rotation={[0.3, 0, 0.2]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#22c55e" roughness={0.8} />
          </mesh>
          <mesh rotation={[0.3, 0, -0.4]} position={[0.12, 0.05, 0]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#16a34a" roughness={0.8} />
          </mesh>
        </group>
      );
      case 'flame_top': return (
        <group position={[0, y, 0]}>
          <mesh><coneGeometry args={[0.12, 0.4, 8]} /><meshStandardMaterial color="#ff6600" emissive="#ff3300" emissiveIntensity={0.7} /></mesh>
          <mesh position={[0, 0.15, 0]} scale={[0.6, 0.6, 0.6]}><coneGeometry args={[0.1, 0.3, 8]} /><meshStandardMaterial color="#ffcc00" emissive="#ff9900" emissiveIntensity={0.5} /></mesh>
        </group>
      );
      default: return null;
    }
  };

  // ── Ground shadow ─────────────────────────────────────────────────────────
  const Shadow = () => (
    <mesh position={[0, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.55, 32]} />
      <meshBasicMaterial color="#000000" transparent opacity={0.15} />
    </mesh>
  );

  // ── Shape renderer ────────────────────────────────────────────────────────
  const renderShape = () => {
    switch (body_shape) {

      // ── BLOB (round, soft) ──────────────────────────────────────────────
      case 'blob': return (
        <group>
          <mesh castShadow><sphereGeometry args={[0.65, 32, 32]} /><meshStandardMaterial {...mp} /></mesh>
          <Face z={0.63} />
          <Arms y={0} xOffset={0.65} />
          <Legs y={-0.65} />
          <Topper y={0.6} />
        </group>
      );

      // ── HUMANOID (capsule body) ──────────────────────────────────────────
      case 'humanoid': return (
        <group>
          <mesh castShadow position={[0, -0.15, 0]}><capsuleGeometry args={[0.32, 0.5, 8, 16]} /><meshStandardMaterial {...mp} /></mesh>
          <mesh castShadow position={[0, 0.58, 0]}><sphereGeometry args={[0.36, 32, 32]} /><meshStandardMaterial {...mp} /></mesh>
          <Face z={0.34} scale={0.95} yOffset={0.58} />
          <Arms y={-0.1} xOffset={0.34} />
          <Legs y={-0.65} />
          <Topper y={0.88} />
        </group>
      );

      // ── GEOMETRIC (rounded cube) ──────────────────────────────────────────
      case 'geometric': return (
        <group>
          <RoundedBox castShadow radius={0.12} smoothness={5} args={[0.9, 0.9, 0.9]}>
            <meshStandardMaterial {...mp} />
          </RoundedBox>
          <Face z={0.46} scale={0.95} yOffset={0} />
          <Arms y={0} xOffset={0.5} />
          <Legs y={-0.6} />
          <Topper y={0.45} />
        </group>
      );

      // ── CREATURE (organic torus) ─────────────────────────────────────────
      case 'creature': return (
        <group>
          <mesh castShadow position={[0, 0.05, 0]}><torusGeometry args={[0.55, 0.28, 16, 40]} /><meshStandardMaterial {...mp} /></mesh>
          <mesh castShadow position={[0, 0.25, 0]}><sphereGeometry args={[0.35, 24, 24]} /><meshStandardMaterial {...mp} /></mesh>
          <Face z={0.34} scale={0.85} yOffset={0.25} />
          <Arms y={0.1} xOffset={0.88} />
          <Legs y={-0.25} />
          <Topper y={0.58} />
        </group>
      );

      // ── CHUNKY ROBOT (Cute pink robot reference style) ────────────────────
      case 'chunky_robot': return (
        <group>
          {/* Main Torso */}
          <RoundedBox castShadow position={[0, -0.22, 0]} radius={0.15} smoothness={4} args={[0.78, 0.72, 0.62]}>
            <meshStandardMaterial {...mp} />
          </RoundedBox>
          
          {/* Head - rounded cube */}
          <RoundedBox castShadow position={[0, 0.44, 0]} radius={0.14} smoothness={5} args={[0.82, 0.62, 0.65]}>
            <meshStandardMaterial {...mp} />
          </RoundedBox>
          
          {/* Neck */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.14, 0.16, 0.12, 16]} />
            <meshStandardMaterial color={secondary_color} roughness={matR.roughness} />
          </mesh>

          {/* Faceplate (Flat off-white panel matching reference) */}
          <RoundedBox position={[0, 0.44, 0.315]} radius={0.06} smoothness={4} args={[0.62, 0.44, 0.03]}>
            <meshStandardMaterial color="#fdfbf7" roughness={0.2} metalness={0.05} />
          </RoundedBox>

          {/* Eyes & Cheek Blush on Faceplate */}
          <Face z={0.332} scale={0.8} yOffset={0.44} />

          <Arms y={-0.12} xOffset={0.44} />
          <Legs y={-0.55} />
          <Topper y={0.78} />
        </group>
      );

      // ── FLOWER POT ───────────────────────────────────────────────────────
      case 'flower_pot': return (
        <group>
          {/* Pot body */}
          <mesh castShadow position={[0, -0.25, 0]}><cylinderGeometry args={[0.48, 0.35, 0.65, 24]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Rim */}
          <mesh position={[0, 0.1, 0]}><torusGeometry args={[0.48, 0.05, 8, 24]} /><meshStandardMaterial {...ms} /></mesh>
          {/* Soil top */}
          <mesh position={[0, 0.14, 0]}><cylinderGeometry args={[0.44, 0.44, 0.06, 24]} /><meshStandardMaterial color="#553311" roughness={0.95} /></mesh>
          {/* Stem */}
          <mesh castShadow position={[0, 0.48, 0]}><cylinderGeometry args={[0.05, 0.05, 0.5, 12]} /><meshStandardMaterial color="#22c55e" roughness={0.7} /></mesh>
          {/* Flower head */}
          <mesh castShadow position={[0, 0.85, 0]}><sphereGeometry args={[0.28, 20, 20]} /><meshStandardMaterial {...ma} /></mesh>
          <Face z={0.27} scale={0.75} yOffset={0.85} />
          {/* Leaves */}
          <mesh position={[-0.22, 0.42, 0]} rotation={[0, 0, -0.6]}><sphereGeometry args={[0.12, 8, 8]} /><meshStandardMaterial color="#16a34a" roughness={0.7} /></mesh>
          <mesh position={[0.22, 0.36, 0]} rotation={[0, 0, 0.6]}><sphereGeometry args={[0.1, 8, 8]} /><meshStandardMaterial color="#15803d" roughness={0.7} /></mesh>
          <Arms y={-0.15} xOffset={0.46} />
          <Legs y={-0.58} />
        </group>
      );

      // ── MUSHROOM (Centered face, no eyeball spots, arms on stem) ──────────
      case 'mushroom': return (
        <group>
          {/* Stem / Body */}
          <mesh castShadow position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.25, 0.28, 0.65, 24]} />
            <meshStandardMaterial color="#fcf8f2" roughness={0.75} />
          </mesh>

          {/* Cap (Huge dome shifted up to prevent overlapping) */}
          <mesh castShadow position={[0, 0.32, 0]}>
            <sphereGeometry args={[0.62, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
            <meshStandardMaterial {...mp} />
          </mesh>

          {/* Decorative spots on the cap (rotated up, avoiding eye placement) */}
          {[[0.3, 0.55, 0.38], [-0.35, 0.5, 0.32], [0.0, 0.72, 0.22], [0.45, 0.4, -0.2]].map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.078, 12, 12]} />
              <meshStandardMaterial color="#ffffff" roughness={0.85} />
            </mesh>
          ))}

          {/* Face centered perfectly on the stem below the cap rim */}
          <Face z={0.28} scale={0.78} yOffset={-0.22} />

          {/* Arms attach to the stem body */}
          <Arms y={-0.22} xOffset={0.25} />
          <Legs y={-0.55} />
          <Topper y={0.88} />
        </group>
      );

      // ── GHOST ────────────────────────────────────────────────────────────
      case 'ghost': return (
        <group>
          <mesh castShadow position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.58, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
            <meshStandardMaterial {...mp} />
          </mesh>
          {/* Wavy bottom skirt */}
          {[-0.35, -0.12, 0.12, 0.35].map((x, i) => (
            <mesh key={i} position={[x, -0.3, 0]}>
              <sphereGeometry args={[0.18, 12, 12]} />
              <meshStandardMaterial {...mp} />
            </mesh>
          ))}
          <Face z={0.55} scale={0.9} />
          <Arms y={0.15} xOffset={0.75} />
          <Legs y={-0.45} />
        </group>
      );

      // ── STAR ─────────────────────────────────────────────────────────────
      case 'star': return (
        <group>
          {/* Central sphere */}
          <mesh castShadow><sphereGeometry args={[0.42, 20, 20]} /><meshStandardMaterial {...mp} /></mesh>
          {/* 5 points */}
          {[0, 72, 144, 216, 288].map((deg, i) => {
            const angle = (deg * Math.PI) / 180;
            return (
              <mesh key={i} position={[Math.cos(angle) * 0.65, Math.sin(angle) * 0.65, 0]} castShadow>
                <coneGeometry args={[0.16, 0.35, 6]} />
                <meshStandardMaterial {...mp} />
              </mesh>
            );
          })}
          <Face z={0.44} scale={0.85} />
          <Arms y={0} xOffset={0.52} />
          <Legs y={-0.52} />
          <Topper y={1.0} />
        </group>
      );

      // ── CLOUD ────────────────────────────────────────────────────────────
      case 'cloud': return (
        <group>
          {[
            [0, 0, 0, 0.55], [-0.48, -0.08, 0, 0.38], [0.48, -0.08, 0, 0.38],
            [-0.24, 0.22, 0, 0.38], [0.24, 0.22, 0, 0.38],
          ].map(([x, y, z, r], i) => (
            <mesh key={i} position={[x, y, z]} castShadow>
              <sphereGeometry args={[r, 18, 18]} />
              <meshStandardMaterial {...mp} />
            </mesh>
          ))}
          <Face z={0.54} scale={0.85} />
          <Arms y={-0.12} xOffset={0.98} />
          <Legs y={-0.45} />
          <Topper y={0.78} />
        </group>
      );

      // ── DONUT ────────────────────────────────────────────────────────────
      case 'donut': return (
        <group>
          <mesh castShadow position={[0, 0, 0]} rotation={[Math.PI / 2.5, 0, 0]}>
            <torusGeometry args={[0.52, 0.28, 20, 40]} />
            <meshStandardMaterial {...mp} />
          </mesh>
          {/* Icing on top */}
          <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2.5, 0, 0]}>
            <torusGeometry args={[0.52, 0.14, 8, 40]} />
            <meshStandardMaterial color={accent_color} roughness={0.3} />
          </mesh>
          <Face z={0.7} scale={0.8} />
          <Arms y={0} xOffset={0.82} />
          <Legs y={-0.75} />
        </group>
      );

      // ── ICE CREAM ────────────────────────────────────────────────────────
      case 'ice_cream': return (
        <group>
          {/* Cone */}
          <mesh castShadow position={[0, -0.4, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.38, 0.75, 24]} />
            <meshStandardMaterial color="#DEB887" roughness={0.85} />
          </mesh>
          {/* Scoop */}
          <mesh castShadow position={[0, 0.18, 0]}><sphereGeometry args={[0.48, 24, 24]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Second mini scoop */}
          <mesh castShadow position={[0.18, 0.5, 0]}><sphereGeometry args={[0.3, 20, 20]} /><meshStandardMaterial {...ms} /></mesh>
          {/* Cherry on top */}
          <mesh position={[0.18, 0.82, 0]}><sphereGeometry args={[0.1, 12, 12]} /><meshStandardMaterial color="#cc2244" roughness={0.2} /></mesh>
          <Face z={0.47} scale={0.9} />
          <Arms y={0.15} xOffset={0.65} />
          <Legs y={-0.75} />
        </group>
      );

      // ── CACTUS ───────────────────────────────────────────────────────────
      case 'cactus': return (
        <group>
          {/* Main trunk */}
          <mesh castShadow position={[0, 0, 0]}><capsuleGeometry args={[0.28, 0.9, 8, 16]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Left arm */}
          <mesh castShadow position={[-0.45, 0.18, 0]} rotation={[0, 0, -Math.PI / 3]}>
            <capsuleGeometry args={[0.16, 0.4, 8, 12]} />
            <meshStandardMaterial {...mp} />
          </mesh>
          <mesh castShadow position={[-0.62, 0.46, 0]}><capsuleGeometry args={[0.16, 0.25, 8, 12]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Right arm */}
          <mesh castShadow position={[0.45, 0.08, 0]} rotation={[0, 0, Math.PI / 3]}>
            <capsuleGeometry args={[0.16, 0.38, 8, 12]} />
            <meshStandardMaterial {...mp} />
          </mesh>
          <mesh castShadow position={[0.62, 0.35, 0]}><capsuleGeometry args={[0.16, 0.22, 8, 12]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Spines */}
          {[[0, 0.38, 0.29], [0.2, 0.05, 0.29], [-0.2, 0.05, 0.29]].map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z]} rotation={[0, 0, 0]}><coneGeometry args={[0.02, 0.12, 6]} /><meshStandardMaterial color="#d1a878" /></mesh>
          ))}
          {/* Flower on top */}
          <mesh position={[0, 0.72, 0]}><sphereGeometry args={[0.18, 12, 12]} /><meshStandardMaterial {...ma} /></mesh>
          <Face z={0.29} scale={0.85} />
          <Legs y={-0.71} />
        </group>
      );

      // ── BEAR ─────────────────────────────────────────────────────────────
      case 'bear': return (
        <group>
          <mesh castShadow position={[0, -0.08, 0]}><sphereGeometry args={[0.52, 24, 24]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Head */}
          <mesh castShadow position={[0, 0.62, 0]}><sphereGeometry args={[0.46, 24, 24]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Ears */}
          <mesh position={[-0.35, 0.98, 0]}><sphereGeometry args={[0.17, 12, 12]} /><meshStandardMaterial {...mp} /></mesh>
          <mesh position={[0.35, 0.98, 0]}><sphereGeometry args={[0.17, 12, 12]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Inner ears */}
          <mesh position={[-0.35, 0.98, 0.08]}><sphereGeometry args={[0.1, 12, 12]} /><meshStandardMaterial color="#ffaaaa" roughness={0.8} /></mesh>
          <mesh position={[0.35, 0.98, 0.08]}><sphereGeometry args={[0.1, 12, 12]} /><meshStandardMaterial color="#ffaaaa" roughness={0.8} /></mesh>
          {/* Snout */}
          <mesh position={[0, 0.55, 0.4]}><sphereGeometry args={[0.2, 16, 16]} /><meshStandardMaterial color={secondary_color} roughness={0.85} /></mesh>
          <Face z={0.64} yOffset={0.62} scale={0.8} />
          <Arms y={-0.08} xOffset={0.57} />
          <Legs y={-0.58} />
        </group>
      );

      // ── CAT ───────────────────────────────────────────────────────────────
      case 'cat': return (
        <group>
          <mesh castShadow position={[0, -0.08, 0]}><sphereGeometry args={[0.5, 24, 24]} /><meshStandardMaterial {...mp} /></mesh>
          <mesh castShadow position={[0, 0.6, 0]}><sphereGeometry args={[0.44, 24, 24]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Pointy cat ears */}
          <mesh position={[-0.3, 0.98, 0]} rotation={[0, 0, -0.2]}><coneGeometry args={[0.15, 0.35, 8]} /><meshStandardMaterial {...mp} /></mesh>
          <mesh position={[0.3, 0.98, 0]} rotation={[0, 0, 0.2]}><coneGeometry args={[0.15, 0.35, 8]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Inner ear */}
          <mesh position={[-0.3, 1.0, 0.06]} rotation={[0, 0, -0.2]}><coneGeometry args={[0.08, 0.22, 8]} /><meshStandardMaterial color="#ffb3ba" /></mesh>
          <mesh position={[0.3, 1.0, 0.06]} rotation={[0, 0, 0.2]}><coneGeometry args={[0.08, 0.22, 8]} /><meshStandardMaterial color="#ffb3ba" /></mesh>
          <Face z={0.43} yOffset={0.6} scale={0.85} />
          <Arms y={-0.08} xOffset={0.55} />
          <Legs y={-0.56} />
        </group>
      );

      // ── DRAGON ───────────────────────────────────────────────────────────
      case 'dragon': return (
        <group>
          <mesh castShadow position={[0, -0.05, 0]}><sphereGeometry args={[0.54, 24, 24]} /><meshStandardMaterial {...mp} /></mesh>
          <mesh castShadow position={[0, 0.65, 0]}><sphereGeometry args={[0.44, 24, 24]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Horns */}
          <mesh position={[-0.22, 1.01, 0]} rotation={[0, 0, -0.3]}><coneGeometry args={[0.08, 0.42, 8]} /><meshStandardMaterial {...ma} /></mesh>
          <mesh position={[0.22, 1.01, 0]} rotation={[0, 0, 0.3]}><coneGeometry args={[0.08, 0.42, 8]} /><meshStandardMaterial {...ma} /></mesh>
          {/* Wings */}
          <mesh position={[-0.72, 0.2, -0.1]} rotation={[0.3, 0.2, 0.5]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial {...ma} transparent opacity={0.75} />
          </mesh>
          <mesh position={[0.72, 0.2, -0.1]} rotation={[0.3, -0.2, -0.5]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial {...ma} transparent opacity={0.75} />
          </mesh>
          {/* Spiny back ridge */}
          {[0, 0.18, 0.36].map((offset, i) => (
            <mesh key={i} position={[0, 0.2 + offset, -0.48]} rotation={[0.5, 0, 0]}>
               <coneGeometry args={[0.06, 0.22, 6]} />
              <meshStandardMaterial {...ma} />
            </mesh>
          ))}
          <Face z={0.43} yOffset={0.65} scale={0.85} />
          <Arms y={-0.05} xOffset={0.59} />
          <Legs y={-0.57} />
        </group>
      );

      // ── MONKEY ────────────────────────────────────────────────────────────
      case 'monkey': return (
        <group>
          {/* Torso */}
          <mesh castShadow position={[0, -0.08, 0]}><sphereGeometry args={[0.52, 24, 24]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Head */}
          <mesh castShadow position={[0, 0.62, 0]}><sphereGeometry args={[0.46, 24, 24]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Round Ears */}
          <mesh position={[-0.45, 0.72, 0.02]}><sphereGeometry args={[0.18, 16, 16]} /><meshStandardMaterial {...mp} /></mesh>
          <mesh position={[0.45, 0.72, 0.02]}><sphereGeometry args={[0.18, 16, 16]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Inner ears */}
          <mesh position={[-0.45, 0.72, 0.08]}><sphereGeometry args={[0.11, 12, 12]} /><meshStandardMaterial color="#ffa07a" roughness={0.9} /></mesh>
          <mesh position={[0.45, 0.72, 0.08]}><sphereGeometry args={[0.11, 12, 12]} /><meshStandardMaterial color="#ffa07a" roughness={0.9} /></mesh>
          {/* Snout */}
          <mesh position={[0, 0.52, 0.38]}><sphereGeometry args={[0.22, 16, 16]} /><meshStandardMaterial color={secondary_color} roughness={0.8} /></mesh>
          {/* Monkey tail */}
          <mesh position={[0, -0.22, -0.58]} rotation={[0.4, 0, 0]}><capsuleGeometry args={[0.07, 0.52, 8, 8]} /><meshStandardMaterial {...mp} /></mesh>
          <Face z={0.61} yOffset={0.62} scale={0.78} />
          <Arms y={-0.08} xOffset={0.57} />
          <Legs y={-0.58} />
        </group>
      );

      // ── GIRAFFE ───────────────────────────────────────────────────────────
      case 'giraffe': return (
        <group>
          {/* Torso */}
          <mesh castShadow position={[0, -0.15, 0]}><sphereGeometry args={[0.54, 24, 24]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Long neck */}
          <mesh castShadow position={[0, 0.42, 0.08]} rotation={[0.08, 0, 0]}><cylinderGeometry args={[0.11, 0.16, 0.85, 16]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Head */}
          <mesh castShadow position={[0, 0.88, 0.15]}><sphereGeometry args={[0.3, 24, 24]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Snout */}
          <mesh position={[0, 0.82, 0.38]}><sphereGeometry args={[0.16, 16, 16]} /><meshStandardMaterial color={secondary_color} /></mesh>
          {/* Ossicones (horns) */}
          <mesh position={[-0.08, 1.2, 0.15]}><cylinderGeometry args={[0.02, 0.02, 0.18]} /><meshStandardMaterial {...ma} /></mesh>
          <mesh position={[0.08, 1.2, 0.15]}><cylinderGeometry args={[0.02, 0.02, 0.18]} /><meshStandardMaterial {...ma} /></mesh>
          <mesh position={[-0.08, 1.3, 0.15]}><sphereGeometry args={[0.045, 12, 12]} /><meshStandardMaterial {...ma} /></mesh>
          <mesh position={[0.08, 1.3, 0.15]}><sphereGeometry args={[0.045, 12, 12]} /><meshStandardMaterial {...ma} /></mesh>
          {/* Giraffe spots */}
          <mesh position={[-0.2, 0.58, 0.15]} scale={[0.15, 0.18, 0.05]}><sphereGeometry /><meshStandardMaterial color={secondary_color} /></mesh>
          <mesh position={[0.2, 0.48, 0.12]} scale={[0.15, 0.15, 0.05]}><sphereGeometry /><meshStandardMaterial color={secondary_color} /></mesh>
          <mesh position={[0, 0.02, 0.38]} scale={[0.2, 0.2, 0.05]}><sphereGeometry /><meshStandardMaterial color={secondary_color} /></mesh>
          <mesh position={[-0.2, -0.22, 0.28]} scale={[0.18, 0.2, 0.05]}><sphereGeometry /><meshStandardMaterial color={secondary_color} /></mesh>
          <mesh position={[0.2, -0.15, -0.32]} scale={[0.2, 0.22, 0.05]}><sphereGeometry /><meshStandardMaterial color={secondary_color} /></mesh>
          <Face z={0.52} yOffset={0.88} scale={0.65} />
          <Arms y={-0.05} xOffset={0.59} />
          <Legs y={-0.67} />
        </group>
      );

      // ── TIGER ─────────────────────────────────────────────────────────────
      case 'tiger': return (
        <group>
          {/* Torso */}
          <mesh castShadow position={[0, -0.08, 0]}><sphereGeometry args={[0.54, 24, 24]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Head */}
          <mesh castShadow position={[0, 0.62, 0]}><sphereGeometry args={[0.46, 24, 24]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Ears */}
          <mesh position={[-0.32, 0.96, 0]} rotation={[0, 0, -0.2]}><coneGeometry args={[0.14, 0.3, 8]} /><meshStandardMaterial {...mp} /></mesh>
          <mesh position={[0.32, 0.96, 0]} rotation={[0, 0, 0.2]}><coneGeometry args={[0.14, 0.3, 8]} /><meshStandardMaterial {...mp} /></mesh>
          <mesh position={[-0.32, 0.98, 0.05]} rotation={[0, 0, -0.2]}><coneGeometry args={[0.07, 0.18, 8]} /><meshStandardMaterial color="#fff" /></mesh>
          <mesh position={[0.32, 0.98, 0.05]} rotation={[0, 0, 0.2]}><coneGeometry args={[0.07, 0.18, 8]} /><meshStandardMaterial color="#fff" /></mesh>
          {/* Snout */}
          <mesh position={[0, 0.52, 0.38]}><sphereGeometry args={[0.2, 16, 16]} /><meshStandardMaterial color="#ffffff" /></mesh>
          {/* Tiger stripes (boxes on sides) */}
          <mesh position={[-0.45, 0.62, 0.15]} rotation={[0, 0, -0.15]} scale={[0.16, 0.04, 0.04]}><boxGeometry /><meshStandardMaterial color="#000000" roughness={0.9} /></mesh>
          <mesh position={[0.45, 0.62, 0.15]} rotation={[0, 0, 0.15]} scale={[0.16, 0.04, 0.04]}><boxGeometry /><meshStandardMaterial color="#000000" roughness={0.9} /></mesh>
          <mesh position={[-0.52, -0.05, 0]} rotation={[0, 0, -0.2]} scale={[0.2, 0.05, 0.05]}><boxGeometry /><meshStandardMaterial color="#000000" roughness={0.9} /></mesh>
          <mesh position={[0.52, -0.05, 0]} rotation={[0, 0, 0.2]} scale={[0.2, 0.05, 0.05]}><boxGeometry /><meshStandardMaterial color="#000000" roughness={0.9} /></mesh>
          <mesh position={[-0.52, -0.2, 0]} rotation={[0, 0, -0.15]} scale={[0.2, 0.05, 0.05]}><boxGeometry /><meshStandardMaterial color="#000000" roughness={0.9} /></mesh>
          <mesh position={[0.52, -0.2, 0]} rotation={[0, 0, 0.15]} scale={[0.2, 0.05, 0.05]}><boxGeometry /><meshStandardMaterial color="#000000" roughness={0.9} /></mesh>
          {/* Tail */}
          <mesh position={[0, -0.25, -0.56]} rotation={[0.3, 0, 0]}><capsuleGeometry args={[0.07, 0.5, 8, 8]} /><meshStandardMaterial {...mp} /></mesh>
          <Face z={0.59} yOffset={0.62} scale={0.78} />
          <Arms y={-0.08} xOffset={0.59} />
          <Legs y={-0.60} />
        </group>
      );

      // ── CROW ──────────────────────────────────────────────────────────────
      case 'crow': return (
        <group>
          {/* Torso */}
          <mesh castShadow position={[0, -0.1, 0]}><sphereGeometry args={[0.52, 24, 24]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Head */}
          <mesh castShadow position={[0, 0.52, 0.05]}><sphereGeometry args={[0.38, 24, 24]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Beak */}
          <mesh position={[0, 0.52, 0.44]} rotation={[Math.PI / 2, 0, 0]} castShadow><coneGeometry args={[0.09, 0.38, 4]} /><meshStandardMaterial {...ma} /></mesh>
          {/* Wings */}
          <mesh position={[-0.56, -0.05, 0]} rotation={[0.1, 0, 0.45]} scale={[0.12, 0.42, 0.32]}><sphereGeometry /><meshStandardMaterial {...mp} /></mesh>
          <mesh position={[0.56, -0.05, 0]} rotation={[0.1, 0, -0.45]} scale={[0.12, 0.42, 0.32]}><sphereGeometry /><meshStandardMaterial {...mp} /></mesh>
          {/* Tail feathers */}
          <mesh position={[0, -0.32, -0.58]} rotation={[0.4, 0, 0]} scale={[0.26, 0.08, 0.35]}><boxGeometry /><meshStandardMaterial {...mp} /></mesh>
          <Face z={0.42} yOffset={0.52} scale={0.75} />
          <Legs y={-0.60} />
        </group>
      );

      // ── DIAMOND ──────────────────────────────────────────────────────────
      case 'diamond': return (
        <group>
          <mesh castShadow rotation={[Math.PI, 0, 0.4]}>
            <octahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial {...mp} />
          </mesh>
          <Face z={0.68} scale={0.8} />
          <Arms y={0.1} xOffset={0.65} />
          <Legs y={-0.68} />
          <Topper y={0.85} />
        </group>
      );

      // ── ROCKET ──────────────────────────────────────────────────────────
      case 'rocket': return (
        <group>
          {/* Body */}
          <mesh castShadow position={[0, 0, 0]}><capsuleGeometry args={[0.3, 0.85, 8, 16]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Nose cone */}
          <mesh castShadow position={[0, 0.72, 0]}><coneGeometry args={[0.3, 0.45, 16]} /><meshStandardMaterial {...ms} /></mesh>
          {/* Window */}
          <mesh position={[0, 0.12, 0.31]}><sphereGeometry args={[0.18, 16, 16]} /><meshStandardMaterial color="#88ccff" roughness={0.05} metalness={0.2} /></mesh>
          <Face z={0.31} scale={0.65} />
          {/* Fins */}
          {[0, 120, 240].map((deg, i) => {
            const a = (deg * Math.PI) / 180;
            return (
              <mesh key={i} position={[Math.sin(a) * 0.4, -0.62, Math.cos(a) * 0.4]} rotation={[0, a, 0]}>
                <boxGeometry args={[0.06, 0.35, 0.3]} />
                <meshStandardMaterial {...ms} />
              </mesh>
            );
          })}
          {/* Flame exhaust */}
          <mesh position={[0, -0.95, 0]}><coneGeometry args={[0.2, 0.4, 12]} /><meshStandardMaterial color="#ff6600" emissive="#ff3300" emissiveIntensity={0.8} /></mesh>
        </group>
      );

      // ── CROWN ────────────────────────────────────────────────────────────
      case 'crown': return (
        <group>
          {/* Base band */}
          <mesh castShadow position={[0, -0.1, 0]}><cylinderGeometry args={[0.6, 0.58, 0.4, 24]} /><meshStandardMaterial {...mp} /></mesh>
          {/* Points */}
          {[0, 72, 144, 216, 288].map((deg, i) => {
            const a = (deg * Math.PI) / 180;
            return (
              <mesh key={i} position={[Math.sin(a) * 0.58, 0.22, Math.cos(a) * 0.58]} castShadow>
                <coneGeometry args={[0.1, 0.45, 8]} />
                <meshStandardMaterial {...mp} />
              </mesh>
            );
          })}
          {/* Jewels */}
          {[0, 120, 240].map((deg, i) => {
            const a = (deg * Math.PI) / 180;
            return (
              <mesh key={i} position={[Math.sin(a) * 0.59, -0.02, Math.cos(a) * 0.59]}>
                <sphereGeometry args={[0.09, 12, 12]} />
                <meshStandardMaterial color={accent_color} emissive={accent_color} emissiveIntensity={0.5} />
              </mesh>
            );
          })}
          <Face z={0.6} scale={0.85} />
          <Arms y={-0.05} xOffset={0.78} />
          <Legs y={-0.4} />
        </group>
      );

      // ── JELLYFISH ────────────────────────────────────────────────────────
      case 'jellyfish': return (
        <group>
          {/* Bell */}
          <mesh castShadow position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.58, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial {...mp} transparent opacity={0.8} />
          </mesh>
          {/* Tentacles */}
          {[-0.3, -0.15, 0, 0.15, 0.3].map((x, i) => (
            <mesh key={i} position={[x, -0.28, i * 0.05 - 0.1]}>
              <cylinderGeometry args={[0.03, 0.01, 0.7 + i * 0.1, 6]} />
              <meshStandardMaterial {...ms} transparent opacity={0.7} />
            </mesh>
          ))}
          <Face z={0.5} scale={0.85} />
          <Arms y={0.15} xOffset={0.7} />
          <Legs y={-0.45} />
          <Topper y={0.72} />
        </group>
      );

      // ── BOOK ─────────────────────────────────────────────────────────────
      case 'book': return (
        <group>
          <mesh castShadow position={[0, 0, 0]}><boxGeometry args={[0.9, 1.1, 0.2]} /><meshStandardMaterial {...mp} /></mesh>
          <mesh position={[-0.42, 0, 0.02]}><boxGeometry args={[0.06, 1.08, 0.22]} /><meshStandardMaterial {...ms} /></mesh>
          {/* Lines on cover */}
          {[-0.2, 0, 0.2].map((y, i) => (
            <mesh key={i} position={[0.04, y, 0.11]}><boxGeometry args={[0.5, 0.04, 0.02]} /><meshStandardMaterial color={accent_color} /></mesh>
          ))}
          <Face z={0.12} scale={0.85} />
          <Arms y={0} xOffset={0.65} />
          <Legs y={-0.65} />
          <Topper y={0.75} />
        </group>
      );

      // ── TEARDROP ────────────────────────────────────────────────────────
      case 'teardrop': return (
        <group>
          <mesh castShadow><sphereGeometry args={[0.55, 24, 24]} /><meshStandardMaterial {...mp} /></mesh>
          <mesh castShadow position={[0, 0.7, 0]}><coneGeometry args={[0.3, 0.6, 16]} /><meshStandardMaterial {...mp} /></mesh>
          <Face z={0.54} scale={0.9} />
          <Arms y={0} xOffset={0.60} />
          <Legs y={-0.53} />
        </group>
      );

      // ── PEBBLE (rounded squashed) ────────────────────────────────────────
      case 'pebble': return (
        <group>
          <mesh castShadow scale={[1.2, 0.82, 1.1]}><sphereGeometry args={[0.58, 24, 24]} /><meshStandardMaterial {...mp} /></mesh>
          <Face z={0.63} scale={0.9} />
          <Arms y={-0.05} xOffset={0.8} />
          <Legs y={-0.5} />
          <Topper y={0.62} />
        </group>
      );

      // ── BUBBLE ───────────────────────────────────────────────────────────
      case 'bubble': return (
        <group>
          <mesh castShadow><sphereGeometry args={[0.65, 32, 32]} /><meshStandardMaterial color={primary_color} roughness={0.0} metalness={0.1} transparent opacity={0.75} /></mesh>
          {/* Highlight shine */}
          <mesh position={[-0.2, 0.28, 0.55]}><sphereGeometry args={[0.12, 12, 12]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.6} /></mesh>
          <Face z={0.64} scale={0.9} />
          <Arms y={0} xOffset={0.82} />
          <Legs y={-0.65} />
          <Topper y={0.78} />
        </group>
      );

      // ── CRYSTAL SHARD ────────────────────────────────────────────────────
      case 'crystal_shard': return (
        <group>
          <mesh castShadow><octahedronGeometry args={[0.65, 0]} /><meshStandardMaterial color={primary_color} roughness={0.05} metalness={0.3} transparent opacity={0.85} /></mesh>
          <mesh castShadow position={[0.25, 0.4, 0.1]} rotation={[0.3, 0.5, 0.1]} scale={[0.55, 0.55, 0.55]}>
            <octahedronGeometry args={[0.65, 0]} />
            <meshStandardMaterial color={secondary_color} roughness={0.05} metalness={0.3} transparent opacity={0.7} />
          </mesh>
          <mesh castShadow position={[-0.2, 0.3, -0.1]} rotation={[-0.3, -0.4, 0.2]} scale={[0.4, 0.4, 0.4]}>
            <octahedronGeometry args={[0.65, 0]} />
            <meshStandardMaterial color={accent_color} roughness={0.05} metalness={0.3} transparent opacity={0.65} />
          </mesh>
          <Face z={0.65} scale={0.8} />
          <Arms y={0.1} xOffset={0.7} />
          <Legs y={-0.65} />
        </group>
      );

      // ── CUSTOM ASSEMBLY ──────────────────────────────────────────────────
      case 'custom_assembly': {
        const parts = spec.appearance.custom_parts || [];
        
        // Find head part (highest sphere, box, or capsule)
        let headPart = null;
        let maxHeadY = -999;
        parts.forEach(part => {
          if ((part.type === 'sphere' || part.type === 'box' || part.type === 'capsule') && part.position) {
            const y = part.position[1] || 0;
            if (y > maxHeadY) {
              maxHeadY = y;
              headPart = part;
            }
          }
        });

        // Fallback head params
        let headY = 0.5;
        let headZ = 0;
        let headRadius = 0.45;
        if (headPart) {
          headY = headPart.position[1] || 0;
          headZ = headPart.position[2] || 0;
          if (headPart.type === 'sphere') {
            headRadius = headPart.args?.[0] || 0.45;
          } else if (headPart.type === 'box') {
            headRadius = (headPart.args?.[1] || 0.8) / 2;
          } else if (headPart.type === 'capsule') {
            headRadius = headPart.args?.[0] || 0.3;
          }
        }

        // Find body part (lowest/torso sphere or box, but above legs)
        let bodyPart = null;
        let minBodyY = 999;
        parts.forEach(part => {
          if (part !== headPart && (part.type === 'sphere' || part.type === 'box' || part.type === 'cylinder') && part.position) {
            const y = part.position[1] || 0;
            if (y < minBodyY) {
              minBodyY = y;
              bodyPart = part;
            }
          }
        });

        // Fallback body params
        let bodyY = 0;
        let bodyRadius = 0.5;
        if (bodyPart) {
          bodyY = bodyPart.position[1] || 0;
          if (bodyPart.type === 'sphere') {
            bodyRadius = bodyPart.args?.[0] || 0.5;
          } else if (bodyPart.type === 'box') {
            bodyRadius = (bodyPart.args?.[1] || 0.8) / 2;
          } else if (bodyPart.type === 'cylinder') {
            bodyRadius = (bodyPart.args?.[2] || 0.8) / 2;
          }
        }

        // Compute alignment positions
        const faceZ = headZ + headRadius * 0.92;
        const faceY = headY;
        const topperY = headY + headRadius * 0.95;
        const armsY = bodyY + bodyRadius * 0.25;
        const armsXOffset = Math.max(0.4, bodyRadius + 0.12);
        const legsY = bodyY - bodyRadius * 0.85;
        
        return (
          <group>
            {parts.map((part, idx) => {
              const PartMaterial = part.use_primary_color 
                ? mp 
                : part.use_secondary_color 
                  ? ms 
                  : part.use_accent_color 
                    ? ma 
                    : { color: part.color || primary_color, ...matR };
              return (
                <mesh 
                  key={idx} 
                  position={part.position || [0, 0, 0]} 
                  rotation={part.rotation || [0, 0, 0]} 
                  castShadow 
                  receiveShadow
                >
                  {part.type === 'box' && <boxGeometry args={part.args || [0.5, 0.5, 0.5]} />}
                  {part.type === 'sphere' && <sphereGeometry args={part.args || [0.3, 24, 24]} />}
                  {part.type === 'cylinder' && <cylinderGeometry args={part.args || [0.2, 0.2, 0.5, 24]} />}
                  {part.type === 'cone' && <coneGeometry args={part.args || [0.2, 0.5, 24]} />}
                  {part.type === 'torus' && <torusGeometry args={part.args || [0.3, 0.1, 8, 24]} />}
                  {part.type === 'capsule' && <capsuleGeometry args={part.args || [0.15, 0.3, 8, 12]} />}
                  <meshStandardMaterial {...PartMaterial} />
                </mesh>
              );
            })}
            <Face z={faceZ} yOffset={faceY} scale={headRadius / 0.45} />
            <Arms y={armsY} xOffset={armsXOffset} />
            <Legs y={legsY} />
            <Topper y={topperY} />
          </group>
        );
      }

      // ── DEFAULT fallback (blob) ──────────────────────────────────────────
      default: return (
        <group>
          <mesh castShadow><sphereGeometry args={[0.65, 32, 32]} /><meshStandardMaterial {...mp} /></mesh>
          <Face z={0.63} />
          <Arms y={0} xOffset={0.82} />
          <Legs y={-0.65} />
          <Topper y={0.75} />
        </group>
      );
    }
  };

  return (
    <group ref={group} scale={[size_scale, size_scale, size_scale]}>
      {renderShape()}
      <Shadow />
    </group>
  );
}
