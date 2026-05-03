import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, ArrowRight, MessageSquare, Headphones, Award, Globe, User } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <div className="logo-icon">
            <MessageSquare size={16} color="white" />
          </div>
          Speak With Me
        </div>
        
        <div className="nav-links">
          <a onClick={() => alert("Practice section coming soon!")}>Practice</a>
          <a onClick={() => alert("Tools section coming soon!")}>Tools</a>
          <a onClick={() => alert("Blog section coming soon!")}>Blog</a>
          <a onClick={() => alert("Resources section coming soon!")}>Resources</a>
          <a onClick={() => alert("About section coming soon!")}>About</a>
        </div>
        
        <div className="nav-actions">
          <select className="lang-select">
            <option>EN</option>
          </select>
          <button className="nav-signin-btn" onClick={() => navigate('/login')}>
            Sign in
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="promo-badge">
          #1 | <span>Speak With Me Free - No Download!</span>
        </div>
        
        <h1 className="hero-title">
          Speak With Me - Start<br />
          <span className="hero-title-highlight">Speaking English Right Now!</span>
        </h1>
        
        <p className="hero-subtitle">
          Gamified English speaking practice. Choose your language, start speaking, get instant feedback. No app download needed! 🚀
        </p>

        {/* The complex spider web graph representation */}
        <div className="spider-web-container">
          <div className="center-node">
            <h3>Speak<br/>English</h3>
            <div className="center-mic">
              <Mic size={20} />
            </div>
          </div>
          
          {/* Orbit Nodes (Simulated for aesthetics) */}
          <div className="orbit-node" style={{ top: '10%', left: '10%' }}>
            <div className="orbit-node-text">
              <strong>मैं हिंदी बोलता हूं</strong>
              <span>I speak Hindi.</span>
            </div>
          </div>
          <div className="orbit-node" style={{ top: '40%', left: '-5%' }}>
            <div className="orbit-node-text">
              <strong>আমি বাংলা বলি</strong>
              <span>I speak Bengali.</span>
            </div>
          </div>
          <div className="orbit-node" style={{ bottom: '15%', left: '5%' }}>
            <div className="orbit-node-text">
              <strong>நான் தமிழ் பேசுவேன்</strong>
              <span>I speak Tamil.</span>
            </div>
          </div>
          <div className="orbit-node" style={{ top: '15%', right: '5%' }}>
            <div className="orbit-node-text">
              <strong>म नेपाली बोल्छु</strong>
              <span>I speak Nepali.</span>
            </div>
          </div>
          <div className="orbit-node" style={{ top: '45%', right: '-5%' }}>
            <div className="orbit-node-text">
              <strong>日本語を話します</strong>
              <span>I speak Japanese.</span>
            </div>
          </div>
          <div className="orbit-node" style={{ bottom: '20%', right: '10%' }}>
            <div className="orbit-node-text">
              <strong>Je parle français</strong>
              <span>I speak French.</span>
            </div>
          </div>

          <svg className="connection-line" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
             {/* Lines would normally be drawn dynamically connecting nodes. We use a decorative SVG or leave it abstract based on CSS above */}
             <path d="M400,250 L100,100" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4"/>
             <path d="M400,250 L50,250" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4"/>
             <path d="M400,250 L100,400" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4"/>
             <path d="M400,250 L700,120" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4"/>
             <path d="M400,250 L750,280" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4"/>
             <path d="M400,250 L650,420" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4"/>
          </svg>
        </div>

        <div className="hero-actions">
          <button className="primary-btn large" onClick={() => navigate('/login')}>
            Start Speaking Now <ArrowRight size={20} />
          </button>
          
          <div className="social-proof">
            <div className="avatar-group">
              <div style={{width: 30, height: 30, borderRadius: '50%', background: '#e2e8f0', border: '2px solid white'}}></div>
              <div style={{width: 30, height: 30, borderRadius: '50%', background: '#cbd5e1', border: '2px solid white', marginLeft: -10}}></div>
              <div style={{width: 30, height: 30, borderRadius: '50%', background: '#94a3b8', border: '2px solid white', marginLeft: -10}}></div>
              <div style={{width: 30, height: 30, borderRadius: '50%', background: '#64748b', border: '2px solid white', marginLeft: -10}}></div>
            </div>
            <p>Join <span>50,000+ learners</span> from around the world</p>
          </div>
          
          <div className="stats-container">
            <div className="stat-item">
              <h4>130K+</h4>
              <p>Active Learners</p>
            </div>
            <div className="stat-item">
              <h4>50+</h4>
              <p>Languages</p>
            </div>
            <div className="stat-item">
              <h4>1M+</h4>
              <p>Practice Sessions</p>
            </div>
            <div className="stat-item">
              <h4>4.9★</h4>
              <p>App Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-badge">Premium Learning System</div>
        <h2 className="section-title">
          Why <span className="hero-title-highlight">Speak With Me</span><br/>is Your Key to Fluency
        </h2>
        <p className="section-subtitle">
          We've built a comprehensive learning experience that targets the most critical aspects of language acquisition.
        </p>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-image-wrapper">
               <div className="feature-image-placeholder">
                  <MessageSquare size={48} opacity={0.5} />
               </div>
            </div>
            <h3>AI Conversation Partner</h3>
            <p>Practice speaking anytime, anywhere. Our AI tutor understands context, asks follow-up questions, and never gets tired.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-image-wrapper">
               <div className="feature-image-placeholder">
                  <Headphones size={48} opacity={0.5} />
               </div>
            </div>
            <h3>Instant Pronunciation Feedback</h3>
            <p>Receive real-time, color-coded feedback on your pronunciation and intonation to sound like a native speaker.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-image-wrapper">
               <div className="feature-image-placeholder">
                  <Award size={48} opacity={0.5} />
               </div>
            </div>
            <h3>Personalized Learning Paths</h3>
            <p>From business meetings to casual chats, choose scenarios that match your goals and track your progress over time.</p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="steps-section">
        <div className="steps-left">
          <div className="section-badge" style={{marginBottom: 10}}>Guided Flow</div>
          <h2 className="section-title" style={{textAlign: 'left', marginBottom: 20}}>
            Start Speaking in 3<br/><span className="hero-title-highlight">Simple Steps</span>
          </h2>
          <p className="section-subtitle" style={{textAlign: 'left', margin: '0 0 30px 0'}}>
            No download, no signup required. Just choose your language and start speaking English right now!
          </p>
          
          <div className="steps-image-wrapper">
             <div className="feature-image-placeholder">
                <User size={64} opacity={0.4} />
             </div>
          </div>
        </div>
        
        <div className="steps-right">
          <div className="step-card">
            <div className="step-icon"><Globe size={24} /></div>
            <div className="step-content">
              <span className="step-badge">Step 1</span>
              <h4>Choose Your Language</h4>
              <p>Select your native language from 50+ options. Our AI will help you learn English based on your language background.</p>
            </div>
          </div>
          
          <div className="step-card">
            <div className="step-icon"><Mic size={24} /></div>
            <div className="step-content">
              <span className="step-badge">Step 2</span>
              <h4>Start Speaking</h4>
              <p>Click the microphone button and speak the English phrase shown. Practice pronunciation, intonation, and fluency in real-time.</p>
            </div>
          </div>
          
          <div className="step-card">
            <div className="step-icon"><Award size={24} /></div>
            <div className="step-content">
              <span className="step-badge">Step 3</span>
              <h4>Get Instant Feedback & Level Up</h4>
              <p>Get instant AI-powered feedback on your pronunciation, earn XP points, level up, and track your progress. Make learning fun and gamified!</p>
            </div>
          </div>
          
          <button className="primary-btn" style={{alignSelf: 'flex-start', marginTop: 20}} onClick={() => navigate('/login')}>
            Start Speaking Now <ArrowRight size={20} />
          </button>
        </div>
      </section>
      
      {/* Spacer for bottom */}
      <div style={{ height: '100px' }}></div>
    </div>
  );
}
