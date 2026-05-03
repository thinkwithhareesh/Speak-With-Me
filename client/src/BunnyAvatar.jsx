import React from 'react';

export default function BunnyAvatar({ isListening, isThinking, isSpeaking }) {
  let stateClass = '';
  if (isSpeaking) stateClass = 'is-speaking';
  else if (isThinking) stateClass = 'is-thinking';
  else if (isListening) stateClass = 'is-listening';

  return (
    <div className={`bunny-wrapper ${stateClass}`}>
      <div className={`voice-glow ${isThinking ? 'thinking' : ''} ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}></div>
      <div className="bunny">
        <div className="ears">
          <div className="ear left"></div>
          <div className="ear right"></div>
        </div>
        <div className="head">
          <div className="eyes">
            <div className="eye left"><div className="pupil"></div></div>
            <div className="eye right"><div className="pupil"></div></div>
          </div>
          <div className="nose"></div>
          <div className="mouth"></div>
        </div>
      </div>
    </div>
  );
}
