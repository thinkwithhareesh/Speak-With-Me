import React, { useState, useEffect, useRef } from 'react';

const EMOJIS = ['✨', '💡', '🎯', '📚', '🌟', '💪', '🎉', '👏', '🚀', '💫', '🔥', '⭐'];

function stripMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/`{1,3}(.*?)`{1,3}/gs, '$1')
    .replace(/^>\s/gm, '')
    .trim();
}

function splitSentences(text) {
  const clean = stripMarkdown(text);
  const matches = clean.match(/[^.!?\n]+[.!?]+/g);
  if (!matches || matches.length === 0) {
    const lines = clean.split(/\n+/).map(l => l.trim()).filter(l => l.length > 2);
    return lines.length > 0 ? lines : [clean];
  }
  return matches.map(s => s.trim()).filter(s => s.length > 2);
}

export default function SentenceStreamer({ text, speed = 28, onComplete }) {
  const [currentText, setCurrentText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState('');
  const [visible, setVisible] = useState(true);
  const abortRef = useRef({ cancelled: false });

  useEffect(() => {
    abortRef.current.cancelled = true;
    const abort = { cancelled: false };
    abortRef.current = abort;

    if (!text) return;

    const sentences = splitSentences(text);

    const animateSentence = (idx) => {
      if (abort.cancelled) return;
      if (idx >= sentences.length) {
        if (onComplete) onComplete();
        return;
      }

      const sentence = sentences[idx];
      const emoji = EMOJIS[idx % EMOJIS.length];
      const isLast = idx === sentences.length - 1;

      setCurrentText('');
      setShowEmoji(false);
      setVisible(true);

      let charIdx = 0;
      const typeNext = () => {
        if (abort.cancelled) return;
        if (charIdx <= sentence.length) {
          setCurrentText(sentence.slice(0, charIdx));
          charIdx++;
          setTimeout(typeNext, speed);
        } else {
          // Sentence fully typed — pop the emoji
          setCurrentEmoji(emoji);
          setShowEmoji(true);

          if (isLast) {
            if (onComplete) onComplete();
          } else {
            // Hold so user can read, then fade, then next sentence
            setTimeout(() => {
              if (abort.cancelled) return;
              setVisible(false);
              setTimeout(() => {
                if (abort.cancelled) return;
                animateSentence(idx + 1);
              }, 480);
            }, 1000);
          }
        }
      };

      typeNext();
    };

    animateSentence(0);

    return () => {
      abort.cancelled = true;
    };
  }, [text]);

  return (
    <span
      style={{
        display: 'block',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.48s ease-out',
        minHeight: '1.6em',
      }}
    >
      {currentText}
      {showEmoji && (
        <span className="sentence-emoji">{currentEmoji}</span>
      )}
    </span>
  );
}
