import React from 'react';

export default function GirlAvatar({ isListening, isThinking, isSpeaking }) {
  let stateClass = '';
  if (isSpeaking) stateClass = 'is-speaking';
  else if (isThinking) stateClass = 'is-thinking';
  else if (isListening) stateClass = 'is-listening';

  return (
    <div className={`girl-wrapper ${stateClass}`}>
      <div className={`voice-glow ${isThinking ? 'thinking' : ''} ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}></div>
      <div className="girl">
        <div className="hair-back"></div>
        <div className="head">
          <div className="hair-bangs"></div>
          <div className="eyes">
            <div className="eye left"><div className="pupil"></div><div className="eyelash"></div></div>
            <div className="eye right"><div className="pupil"></div><div className="eyelash"></div></div>
          </div>
          <div className="cheeks">
             <div className="cheek left"></div>
             <div className="cheek right"></div>
          </div>
          <div className="nose"></div>
          <div className="mouth"></div>
        </div>
      </div>
    </div>
  );
}
