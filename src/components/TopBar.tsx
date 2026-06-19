import React, { useState } from 'react'
import type { TokenUsage } from '../types'

interface TopBarProps {
  campaignName: string
  tokenUsage?: TokenUsage
  onHome: () => void
  onSettings: () => void
  onToggleSidebar: () => void 
  sidebarOpen: boolean        
}

const styles: Record<string, React.CSSProperties> = {
  topbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 20px', background: 'var(--surface)',
    borderBottom: '1px solid var(--border)', flexShrink: 0,
  },
  title: {
    fontFamily: 'Cinzel, serif', fontSize: '16px', color: 'var(--text)',
    letterSpacing: '2px', fontWeight: 600,
  },
  actions: { display: 'flex', gap: '16px', alignItems: 'center' },
}

function btnStyle(active = false): React.CSSProperties {
  return {
    background: active ? 'rgba(195,7,63,0.08)' : 'transparent',
    border: `1px solid ${active ? 'var(--gold)' : 'var(--border2)'}`,
    color: active ? 'var(--gold)' : 'var(--text2)', padding: '6px 14px',
    borderRadius: 'var(--radius)', fontFamily: 'Cinzel, serif',
    fontSize: '11px', letterSpacing: '1px', transition: 'all 0.2s', cursor: 'pointer',
  }
}

export default function TopBar({ campaignName, tokenUsage, onHome, onSettings, onToggleSidebar, sidebarOpen }: TopBarProps) {
  const [homeHovered, setHomeHovered] = useState(false)
  const [tokenHovered, setTokenHovered] = useState(false)
  const [toggleHovered, setToggleHovered] = useState(false)

  
  const INPUT_PRICE_PER_M = 0.075
  const OUTPUT_PRICE_PER_M = 0.30

  const inputCost = tokenUsage ? (tokenUsage.promptTokens / 1000000) * INPUT_PRICE_PER_M : 0
  const outputCost = tokenUsage ? (tokenUsage.completionTokens / 1000000) * OUTPUT_PRICE_PER_M : 0
  const totalCost = inputCost + outputCost

  return (
    <div style={styles.topbar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onHome} onMouseEnter={() => setHomeHovered(true)} onMouseLeave={() => setHomeHovered(false)}
          style={{ background: 'transparent', border: 'none', color: homeHovered ? 'var(--gold)' : 'var(--text3)', fontFamily: 'Cinzel, serif', fontSize: '18px', cursor: 'pointer', transition: 'color 0.2s' }}
          title="Return to Home"
        >⚔</button>
        
        {}
        <button
          onClick={onToggleSidebar}
          onMouseEnter={() => setToggleHovered(true)}
          onMouseLeave={() => setToggleHovered(false)}
          style={{
            background: 'transparent', border: 'none',
            color: toggleHovered ? 'var(--gold)' : 'var(--text3)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '4px', transition: 'color 0.2s'
          }}
          title={sidebarOpen ? "Collapse Roster" : "Expand Roster"}
        >
          {}
          <svg 
            width="20" height="20" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" 
            style={{ 
              transition: 'transform 0.3s ease-in-out', 
              transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)' 
            }}
          >
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="4" y1="18" x2="20" y2="18"></line>
            <polyline points="9 17 4 12 9 7"></polyline>
          </svg>
        </button>

        <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />
        <div style={styles.title}>{campaignName}</div>
      </div>

      <div style={styles.actions}>
        {tokenUsage && (
          <div 
            onMouseEnter={() => setTokenHovered(true)} 
            onMouseLeave={() => setTokenHovered(false)}
            style={{ position: 'relative', cursor: 'default' }}
          >
            <div style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--text3)' }}>{tokenUsage.totalTokens.toLocaleString()} tokens</span>
            </div>

            {tokenHovered && (
              <div style={{
                position: 'absolute', top: '100%', right: '0', marginTop: '12px',
                background: '#202124', border: '1px solid #3c4043', borderRadius: '8px',
                padding: '20px', width: '300px', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                fontFamily: 'sans-serif'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontWeight: 'bold', color: '#e8eaed', fontSize: '14px' }}>
                  <span>Token Usage:</span>
                  <span>{tokenUsage.totalTokens.toLocaleString()} / 1,048,576</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e8eaed', fontSize: '13px', marginBottom: '4px' }}>
                  <span>Input tokens:</span><span>{tokenUsage.promptTokens.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e8eaed', fontSize: '13px', marginBottom: '4px' }}>
                  <span>Output tokens:</span><span>{tokenUsage.completionTokens.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e8eaed', fontSize: '13px', marginBottom: '20px', fontWeight: 'bold' }}>
                  <span>Total tokens:</span><span>{tokenUsage.totalTokens.toLocaleString()}</span>
                </div>

                <div style={{ borderBottom: '1px solid #3c4043', marginBottom: '16px' }} />

                <div style={{ fontWeight: 'bold', color: '#e8eaed', fontSize: '14px', marginBottom: '16px' }}>
                  Cost Estimation *
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e8eaed', fontSize: '13px', marginBottom: '4px' }}>
                  <span>Input token cost:</span><span>${inputCost.toFixed(6)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e8eaed', fontSize: '13px', marginBottom: '4px' }}>
                  <span>Output token cost:</span><span>${outputCost.toFixed(6)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e8eaed', fontSize: '13px', marginBottom: '20px', fontWeight: 'bold' }}>
                  <span>Total cost:</span><span>${totalCost.toFixed(6)}</span>
                </div>

                <div style={{ color: '#9aa0a6', fontSize: '12px', lineHeight: 1.5 }}>
                  *: This is an estimated cost if you make the same request via API. Usage on AI Studio is free when no API key is selected.
                </div>
              </div>
            )}
          </div>
        )}

        <button style={btnStyle()} onClick={onSettings}>⚙ SETTINGS</button>
      </div>
    </div>
  )
}