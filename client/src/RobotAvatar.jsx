import React from 'react';

export default function RobotAvatar({ isListening, isThinking, isSpeaking }) {
  let stateClass = '';
  if (isSpeaking) stateClass = 'is-speaking';
  else if (isThinking) stateClass = 'is-thinking';
  else if (isListening) stateClass = 'is-listening';

  return (
    <div className={`robot-wrapper ${stateClass}`}>
      <div className={`voice-glow ${isThinking ? 'thinking' : ''} ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}></div>
      <div className="robot">
        <div className="robot-head">
          <div className="robot-ears">
            <div className="robot-ear left"></div>
            <div className="robot-ear right"></div>
          </div>
          <div className="robot-face">
             <div className="robot-eyes">
               <div className="robot-eye left"></div>
               <div className="robot-eye right"></div>
             </div>
             <div className="robot-mouth"></div>
          </div>
        </div>
        <div className="robot-body-container">
          <div className="robot-arm left"></div>
          <div className="robot-body">
             <div className="robot-chest-line"></div>
          </div>
          <div className="robot-arm right"></div>
        </div>
        <div className="robot-shadow"></div>
      </div>
    </div>
  );
}
