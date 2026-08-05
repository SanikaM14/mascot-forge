import { useEffect, useState } from 'react';

export function useMascotEvents(spec) {
  const [currentAnimation, setCurrentAnimation] = useState(spec?.animations?.idle || 'idle');
  const [currentDialogue, setCurrentDialogue] = useState(null);
  const [currentFaceStyle, setCurrentFaceStyle] = useState(spec?.appearance?.face_style || 'cute_dot_eyes');

  useEffect(() => {
    if (!spec) return;

    setCurrentAnimation(spec.animations.idle);
    setCurrentFaceStyle(spec.appearance.face_style || 'cute_dot_eyes');
    
    // Simple event handling based on triggers
    const handleTrigger = (eventKey, value) => {
      const trigger = spec.triggers.find(t => t.event === eventKey);
      if (trigger) {
        if (trigger.threshold && value < trigger.threshold) return;
        
        const triggerAction = () => {
          setCurrentAnimation(spec.animations[trigger.animation] || trigger.animation);
          setCurrentDialogue(spec.dialogues[trigger.dialogue]);
          if (trigger.face_style) {
            setCurrentFaceStyle(trigger.face_style);
          }
          
          // Reset to idle after 3 seconds
          setTimeout(() => {
            setCurrentAnimation(spec.animations.idle);
            setCurrentDialogue(null);
            setCurrentFaceStyle(spec.appearance.face_style || 'cute_dot_eyes');
          }, 3000);
        };

        if (trigger.delay_ms) {
          setTimeout(triggerAction, trigger.delay_ms);
        } else {
          triggerAction();
        }
      }
    };

    // Simulate page load trigger
    handleTrigger('page_load');
    
    // --- 1. Scroll Percentage ---
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      handleTrigger('scroll_percent', scrolled);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // --- 2. Network Offline ---
    const handleOffline = () => handleTrigger('network_offline');
    window.addEventListener('offline', handleOffline);

    // --- 3. Exit Intent ---
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0) {
        handleTrigger('exit_intent');
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);

    // --- 4. Idle Timer ---
    let idleTimer;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      // Find the idle trigger in the spec to get its threshold
      const idleTrigger = spec.triggers?.find(t => t.event === 'idle_ms');
      if (idleTrigger && idleTrigger.threshold) {
        idleTimer = setTimeout(() => {
          handleTrigger('idle_ms', idleTrigger.threshold);
        }, idleTrigger.threshold);
      }
    };
    
    const activityEvents = ['mousemove', 'mousedown', 'keypress', 'DOMMouseScroll', 'mousewheel', 'touchmove', 'MSPointerMove'];
    activityEvents.forEach(evt => document.addEventListener(evt, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('mouseleave', handleMouseLeave);
      activityEvents.forEach(evt => document.removeEventListener(evt, resetIdleTimer));
      clearTimeout(idleTimer);
    };

  }, [spec]);

  return { 
    currentAnimation, 
    currentDialogue, 
    currentFaceStyle, 
    setCurrentAnimation, 
    setCurrentDialogue, 
    setCurrentFaceStyle 
  };
}
