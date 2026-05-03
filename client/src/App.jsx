import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Send, Plus, User, Square, Volume2, LogOut, MessageSquare, Trash2, X } from 'lucide-react';
import { supabase } from './supabaseClient';
import RobotAvatar from './RobotAvatar';
import SentenceStreamer from './SentenceStreamer';

const CustomVoiceIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11v2" />
    <path d="M8 8v8" />
    <path d="M12 4v16" />
    <path d="M16 8v8" />
    <path d="M20 11v2" />
  </svg>
);

const CustomSendIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
  </svg>
);

export default function App() {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  // Voice Mode states
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceText, setVoiceText] = useState("Listening...");
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');

  const isVoiceModeRef = useRef(false);
  const isThinkingRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isLoadingRef = useRef(false);
  const isRecordingRef = useRef(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Derived state for current messages
  const currentChat = chats.find(c => c.id === currentChatId);
  const messages = currentChat ? currentChat.messages : [];

  const scrollToBottom = useCallback(() => {
    if (!isVoiceMode) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isVoiceMode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isVoiceMode]);

  // Load chats on mount
  useEffect(() => {
    const savedChats = localStorage.getItem('speakWithMeChats');
    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats);
        setChats(parsed);
        if (parsed.length > 0) {
          setCurrentChatId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse saved chats", e);
      }
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email);
      }
    });

    // Initialize native browser Speech Recognition (STT)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (isVoiceModeRef.current) {
          setVoiceText(transcript);
        }
        handleSend(transcript);
        setIsRecording(false);
        isRecordingRef.current = false;
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        isRecordingRef.current = false;
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        isRecordingRef.current = false;
        if (isVoiceModeRef.current && !isThinkingRef.current && !isSpeakingRef.current) {
           startListening();
        }
      };
    }
  }, []);

  // Load and track available voices for the dropdown
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        
        // Only auto-select if one isn't chosen yet
        if (!selectedVoiceURI) {
          const femaleVoice = voices.find(v => 
            v.lang.includes('en') && (
              v.name.includes('Zira') || 
              v.name.includes('Samantha') || 
              v.name.includes('Google US English') ||
              v.name.includes('Female')
            )
          );
          if (femaleVoice) {
            setSelectedVoiceURI(femaleVoice.voiceURI);
          } else {
            setSelectedVoiceURI(voices[0].voiceURI);
          }
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [selectedVoiceURI]);

  useEffect(() => {
    isVoiceModeRef.current = isVoiceMode;
  }, [isVoiceMode]);

  const saveChatsToStorage = (updatedChats) => {
    localStorage.setItem('speakWithMeChats', JSON.stringify(updatedChats));
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
  };

  const handleDeleteChat = (idToDelete) => {
    setChats(prevChats => {
      const updatedChats = prevChats.filter(c => c.id !== idToDelete);
      saveChatsToStorage(updatedChats);
      return updatedChats;
    });
    if (currentChatId === idToDelete) {
      setCurrentChatId(null);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isRecordingRef.current && !isSpeakingRef.current && !isThinkingRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        isRecordingRef.current = true;
        if (isVoiceModeRef.current) setVoiceText("Listening...");
      } catch (e) {
        console.error("Could not start recognition:", e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isRecordingRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopListening();
    } else {
      startListening();
    }
  };

  const enterVoiceMode = () => {
    setIsVoiceMode(true);
    setVoiceText("Listening...");
    startListening();
  };

  const exitVoiceMode = () => {
    setIsVoiceMode(false);
    stopListening();
    window.speechSynthesis.cancel();
  };

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim()) return;
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    let activeId = currentChatId;
    let newChats = [...chats];

    if (!activeId) {
      activeId = Date.now().toString();
      setCurrentChatId(activeId);
      const newChat = {
        id: activeId,
        title: textToSend.slice(0, 30) + (textToSend.length > 30 ? '...' : ''),
        messages: [{ role: 'user', content: textToSend }]
      };
      newChats = [newChat, ...newChats];
    } else {
      const chatIndex = newChats.findIndex(c => c.id === activeId);
      if (chatIndex >= 0) {
        const updatedChat = { ...newChats[chatIndex] };
        updatedChat.messages = [...updatedChat.messages, { role: 'user', content: textToSend }];
        newChats[chatIndex] = updatedChat;
      }
    }

    setChats(newChats);
    saveChatsToStorage(newChats);
    setInput('');
    setIsLoading(true);
    if (isVoiceModeRef.current) {
      setVoiceText("Thinking...");
      setIsThinking(true);
      isThinkingRef.current = true;
    }

    try {
      // Get the current session token securely
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error("Not authenticated");

      // We need to send the full message history to the API for context
      const currentChatMessages = newChats.find(c => c.id === activeId)?.messages || [];

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          messages: currentChatMessages
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          await supabase.auth.signOut();
          return;
        }
        throw new Error(data.error || "Server responded with an error");
      }
      
      if (data.reply) {
        setChats(prevChats => {
          const updated = [...prevChats];
          const idx = updated.findIndex(c => c.id === activeId);
          if (idx >= 0) {
            const updatedChat = { ...updated[idx] };
            updatedChat.messages = [...updatedChat.messages, { role: 'assistant', content: data.reply, isNew: true }];
            updated[idx] = updatedChat;
          }
          saveChatsToStorage(updated);
          return updated;
        });
        
        if (isVoiceModeRef.current) {
          setVoiceText(data.reply);
        }
        playTTS(data.reply);
      } else {
        throw new Error("No reply received from server");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMsg = error?.message?.includes('fetch')
        ? "⚠️ Cannot reach the server. Please check your connection."
        : `⚠️ ${error.message || "Something went wrong. Please try again."}`;

      setChats(prevChats => {
        const updated = [...prevChats];
        const idx = updated.findIndex(c => c.id === activeId);
        if (idx >= 0) {
          const updatedChat = { ...updated[idx] };
          updatedChat.messages = [...updatedChat.messages, { role: 'assistant', content: errorMsg }];
          updated[idx] = updatedChat;
        }
        saveChatsToStorage(updated);
        return updated;
      });
      if (isVoiceModeRef.current) {
        setVoiceText(errorMsg);
        playTTS(errorMsg);
      }
    } finally {
      setIsLoading(false);
      setIsThinking(false);
      isThinkingRef.current = false;
      isLoadingRef.current = false;
    }
  };

  const playTTS = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      // Strip markdown characters and emojis so it sounds natural
      const cleanText = text
        .replace(/[*_#`~]/g, '') 
        .replace(/[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}]/gu, ''); 

      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      const voices = window.speechSynthesis.getVoices();
      if (selectedVoiceURI) {
        const chosenVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
        if (chosenVoice) {
          utterance.voice = chosenVoice;
        } else {
          utterance.lang = 'en-US';
        }
      } else {
        utterance.lang = 'en-US';
      }
      
      utterance.rate = 1.0;
      
      setIsSpeaking(true);
      isSpeakingRef.current = true;

      // When TTS finishes, start listening again if in Voice Mode
      utterance.onend = () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        // Increased delay to 800ms to prevent bluetooth/hardware audio buffer feedback loops
        setTimeout(() => {
          if (isVoiceModeRef.current) {
            startListening();
          }
        }, 800);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        setTimeout(() => {
          if (isVoiceModeRef.current) {
            startListening();
          }
        }, 800);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Text-to-speech not supported in this browser.");
      if (isVoiceModeRef.current) {
        startListening();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="app-layout">
      {/* Voice Mode Overlay */}
      {isVoiceMode && (
        <div className="voice-mode-overlay">
          <div className="voice-mode-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', width: '100%' }}>
            
            <div className="voice-selector" style={{ zIndex: 100 }}>
               <select 
                 value={selectedVoiceURI} 
                 onChange={(e) => setSelectedVoiceURI(e.target.value)}
                 style={{ 
                   padding: '8px 12px', 
                   borderRadius: '20px', 
                   backgroundColor: 'rgba(255,255,255,0.1)', 
                   color: 'white', 
                   border: '1px solid rgba(255,255,255,0.3)',
                   outline: 'none',
                   cursor: 'pointer',
                   fontSize: '14px',
                   fontFamily: 'inherit'
                 }}
               >
                 {availableVoices.map(v => (
                   <option key={v.voiceURI} value={v.voiceURI} style={{ color: 'black' }}>
                     {v.name}
                   </option>
                 ))}
               </select>
            </div>

            <button className="voice-mode-close" onClick={exitVoiceMode}>
              <X size={24} />
            </button>
          </div>
          
          <div className="voice-mode-content">
            <div className="voice-mode-text">
              {(voiceText === "Listening..." || voiceText === "Thinking...") ? (
                <span className="voice-status-label">{voiceText}</span>
              ) : (
                <SentenceStreamer
                  text={voiceText}
                  speed={22}
                />
              )}
            </div>
            
            <RobotAvatar 
               isListening={isRecording} 
               isThinking={isThinking} 
               isSpeaking={isSpeaking} 
            />
          </div>
          
          {/* Empty spacer to balance the close button */}
          <div style={{ height: '44px' }}></div>
        </div>
      )}

      {/* Sidebar */}
      <div className="sidebar">
        <button className="new-chat-btn" onClick={handleNewChat}>
          <Plus size={16} /> New chat
        </button>
        
        <div className="chat-history">
          {chats.length === 0 ? (
            <div style={{ padding: '10px', color: '#9b9b9b', fontSize: '12px', textAlign: 'center' }}>
              No previous chats
            </div>
          ) : (
            chats.map((chat) => (
              <div 
                key={chat.id} 
                className={`history-item ${currentChatId === chat.id ? 'active' : ''}`}
                onClick={() => setCurrentChatId(chat.id)}
                style={{ 
                  backgroundColor: currentChatId === chat.id ? 'var(--input-bg)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  paddingRight: '5px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <MessageSquare size={14} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chat.title}
                  </span>
                </div>
                <button 
                  className="icon-btn" 
                  style={{ padding: '4px', opacity: 0.6 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(chat.id);
                  }}
                  title="Delete Chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="sidebar-footer">
          <div className="user-profile" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="avatar">{userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}</div>
              <span style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px' }}>
                {userEmail || 'User Profile'}
              </span>
            </div>
            <button className="icon-btn" onClick={() => supabase.auth.signOut()} title="Log Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat */}
      <div className="main-chat">
        {/* Top Header for Voice Mode Button */}
        <div style={{ position: 'absolute', top: '15px', right: '20px', zIndex: 10 }}>
          <button 
            onClick={enterVoiceMode}
            style={{
              backgroundColor: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}
          >
            <CustomVoiceIcon size={16} />
            Voice Mode
          </button>
        </div>

        {messages.length === 0 ? (
          <div className="empty-state">
            <h1>How can i help you</h1>
          </div>
        ) : (
          <div className="messages-container">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.role === 'user' ? 'user' : 'ai'}`}>
                <div className="message-content">
                  <div className={`message-avatar ${msg.role === 'user' ? 'user' : 'ai'}`}>
                    {msg.role === 'user' ? <User size={18} color="white" /> : 'AI'}
                  </div>
                  <div className={`message-text ${msg.role === 'user' ? 'user' : 'ai'}`}>
                    {msg.role === 'assistant' && msg.isNew ? (
                      <SentenceStreamer
                        text={msg.content}
                        speed={26}
                        onComplete={() => { msg.isNew = false; }}
                      />
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msg.role === 'assistant' && (
                    <button className="icon-btn" onClick={() => playTTS(msg.content)} title="Replay Audio">
                      <Volume2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && !isVoiceMode && (
              <div className="message-wrapper ai">
                 <div className="message-content">
                    <div className="message-avatar ai">AI</div>
                    <div className="message-text ai">
                       <div className="loader">
                         <div className="loader-dot"></div>
                         <div className="loader-dot"></div>
                         <div className="loader-dot"></div>
                       </div>
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className="input-area">
          <div className="input-container">
            <textarea 
              className="input-field" 
              placeholder="Message your English Tutor..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            
            <button 
              className={`icon-btn voice-btn ${isRecording && !isVoiceMode ? 'recording' : ''}`}
              onClick={toggleRecording}
              disabled={isLoading}
              title="Click to Speak"
            >
              {isRecording && !isVoiceMode ? <Square size={16} fill="currentColor" /> : <Mic size={16} />}
            </button>
            
            <button 
              className="icon-btn" 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
            >
              <CustomSendIcon size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
