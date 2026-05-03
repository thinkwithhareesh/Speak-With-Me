import React, { useState, useEffect } from 'react';

export default function TypewriterText({ text, speed = 25, onComplete }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText(""); 
    let i = 0;
    
    if (!text) return;

    const timer = setInterval(() => {
      if (i < text.length) {
        // Use text.charAt to correctly append characters one by one
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]); // Omitting onComplete to prevent unnecessary re-runs

  return <span>{displayedText}</span>;
}
