import React, { useState, useEffect } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { UserRole, PROPERTIES, PERMITS, LEGISLATIVE_ITEMS } from '../mockData';
import { ChartTabItem } from './ChartingSystem';

interface AiPanelProps {
  currentRole: UserRole;
  activeChartTab: ChartTabItem | null;
  addNotification: (message: string) => void;
  activeProduct: string;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
}

export const AiPanel: React.FC<AiPanelProps> = ({ currentRole, activeChartTab, addNotification, activeProduct }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const getAgentName = () => {
    switch (activeProduct) {
      case 'core': return 'Mayor AI Assistant';
      case 'civic': return 'Clerk AI Assistant';
      case 'safe': return 'Safe & Inspector AI';
      case 'sentinel': return 'Sentinel AI Auditor';
      case 'gis': return 'GIS Engine Spatial AI';
      case 'operations': return 'Public Works AI';
      case 'finance': return 'Finance Auditor AI';
      case 'council': return 'Council Clerk AI';
      case 'hr': return 'HR Roster AI';
      case 'insight': return 'Insight Analytics AI';
      case 'marketplace': return 'Marketplace Assistant AI';
      default: return 'Munevo AI Companion';
    }
  };

  // Generate dynamic system suggestions based on active chart
  const getSuggestions = () => {
    if (!activeChartTab) {
      if (currentRole.id === 'mayor') return ['Brief me on budget variances', 'Check critical open violations'];
      if (currentRole.id === 'inspector') return ['Optimize my transit route', 'Draft structural fail report'];
      return ['Check status of my building permit', 'Report illegal trash pile'];
    }

    if (activeChartTab.type === 'property') {
      return ['Synthesize property violations', 'Check outstanding water bills'];
    }
    if (activeChartTab.type === 'permit') {
      return ['Audit plan review status', 'Schedule final structural review'];
    }
    return ['List related developers', 'Summarize resolution impact'];
  };

  // Trigger default greeting when active tab changes
  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => {
      let initialMsg = '';
      if (!activeChartTab) {
        initialMsg = `Hello Naeem. As **${getAgentName()}**, I have loaded the context for **${currentRole.name}**. I can compile daily briefings, cross-reference properties, or generate field notes. How can I help you today?`;
      } else {
        const type = activeChartTab.type;
        const name = activeChartTab.label;
        initialMsg = `Hello. As **${getAgentName()}**, I have loaded the context for **${type.toUpperCase()}: ${name}**. I am scanning all related permits, code cases, and billing metrics to support your workflow.`;
      }

      setMessages([{ sender: 'ai', text: initialMsg }]);
      setIsTyping(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [activeChartTab, currentRole, activeProduct]);

  // Handle sending user input
  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const newMsgs = [...messages, { sender: 'user' as const, text }];
    setMessages(newMsgs);
    setInputVal('');
    setIsTyping(true);

    // Mock AI response delay
    setTimeout(() => {
      let responseText = '';
      const lowercaseText = text.toLowerCase();

      if (lowercaseText.includes('violation') || lowercaseText.includes('synthesize')) {
        responseText = `**${getAgentName()} Violation Report:** Scanning CE records. Property **15 Washington St** has 1 active masonry violation (fine: $500). Scaffolding netting is incomplete. Property **105 Market St** has 2 active safety violations, showing weather rot and sagging awing structures. Direct enforcement action is recommended.`;
      } else if (lowercaseText.includes('draft') || lowercaseText.includes('report')) {
        responseText = `**${getAgentName()} Draft Report:** "Based on field site inspection at 15 Washington St on July 7, 2026, facade restoration work was reviewed. Mortar thickness on structural brick joints has been verified and corrected. Safety mesh netting successfully anchored. Recommendation: PASS structural phase."`;
      } else if (lowercaseText.includes('optimize') || lowercaseText.includes('route')) {
        responseText = `**${getAgentName()} Route Optimizer:** Your optimal path starting from Newark City Hall (920 Broad St) is: 
1. **15 Washington St** (Structural Re-Inspection) - 6m transit time.
2. **105 Market St** (Awnings complaint visit) - 4m transit time.
3. **42 Ferry St** (Café clearance checks) - 8m transit time.
*Total estimated travel window: 18 minutes.*`;
      } else if (lowercaseText.includes('budget') || lowercaseText.includes('variance')) {
        responseText = `**${getAgentName()} Budget Briefing:** Overall city balance is positive. Capital Improvements budget shows a favorable variance of **$1.2M (Under)** due to delayed procurement for the Newark library system facade study. Water reserves are standard.`;
      } else {
        responseText = `I have processed your query: "${text}". As **${getAgentName()}**, I can confirm that the Munevo Government Database has updated and linked these details across all corresponding charts. Let me know if you would like me to draft an official notice or schedule an inspection.`;
      }

      setMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
      setIsTyping(false);
      addNotification(`${getAgentName()} generated a new insights briefing.`);
    }, 1000);
  };

  return (
    <div className="pane-right">
      <div className="ai-panel-header">
        <div className="ai-avatar" style={{ background: 'var(--primary-color)' }}>AI</div>
        <div className="ai-panel-title">{getAgentName()}</div>
      </div>

      {/* Sentinel Risk Telemetry Card */}
      <div style={{ padding: '10px 20px', background: 'rgba(139, 92, 246, 0.08)', borderBottom: '1px solid rgba(139, 92, 246, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.65rem', color: '#8b5cf6', fontWeight: 800, textTransform: 'uppercase' }}>
            Sentinel Proactive Risk Score
          </span>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
            18 / 100 <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>(Low Operational Risk)</span>
          </div>
        </div>
        <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
          Telemetry Normal
        </span>
      </div>

      <div className="ai-panel-content">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`ai-chat-bubble ${msg.sender === 'ai' ? 'ai-bubble-munevo' : 'ai-bubble-user'}`}
            style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}
          >
            {/* Markdown styling for mock response */}
            <div style={{ whiteSpace: 'pre-line' }}>
              {msg.text.split('**').map((chunk, idx) => {
                if (idx % 2 === 1) return <strong key={idx} style={{ color: 'var(--accent-color)' }}>{chunk}</strong>;
                return chunk;
              })}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="ai-chat-bubble ai-bubble-munevo" style={{ alignSelf: 'flex-start', fontStyle: 'italic' }}>
            Munevo AI is analyzing context...
          </div>
        )}
      </div>

      {/* Disclaimer Tag */}
      <div style={{ padding: '4px 20px', fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        AI Analysis generated from UDM Knowledge Graph • Verified system facts demarcated separately.
      </div>

      {/* Suggestion Chips */}
      <div style={{ padding: '8px 20px 10px 20px' }}>
        {getSuggestions().map((sug, i) => (
          <button 
            key={i} 
            className="ai-suggestion-chip"
            onClick={() => handleSend(sug)}
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input panel */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(inputVal); }}
        className="ai-input-container"
      >
        <input 
          type="text" 
          className="ai-input" 
          placeholder="Ask Munevo AI..." 
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
        />
        <button type="submit" className="ai-btn-send">
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};
