import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const AiTutorPanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Provided D-ID Agent Share link
  const agentUrl = "https://studio.d-id.com/agents/share?id=v2_agt_Wol27-gY&utm_source=copy&key=WjI5dloyeGxMVzloZFhSb01ud3hNVFU0TVRVMk56UTFOVFEyTXpZM05EVXpNRE02UjJaSGFEUnNZMGt3YWtaSVRHSmtNM296U0ZBNQ==";

  return (
    <motion.div 
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="tutor-panel"
      style={{
        position: 'fixed',
        right: '25px',
        bottom: '25px',
        width: '450px',
        height: '700px',
        backgroundColor: '#0f172a',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.2)',
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 2000,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ 
        padding: '12px 20px', 
        background: '#1e293b', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #334155'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 8px #22c55e' }}></div>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', letterSpacing: '0.02em' }}>AI Learning Tutor</span>
        </div>
        
        <button 
          onClick={onClose}
          style={{ 
            background: 'rgba(51, 65, 85, 0.5)', 
            border: 'none', 
            borderRadius: '10px', 
            padding: '6px', 
            color: '#94a3b8', 
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#f1f5f9'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          <X size={20} />
        </button>
      </div>

      {/* D-ID Agent Iframe */}
      <div style={{ flex: 1, backgroundColor: '#000' }}>
        <iframe
          src={agentUrl}
          title="D-ID AI Tutor"
          width="100%"
          height="100%"
          frameBorder="0"
          allow="microphone; camera; clipboard-write;"
          style={{ border: 'none' }}
        ></iframe>
      </div>
    </motion.div>
  );
};

export default AiTutorPanel;
