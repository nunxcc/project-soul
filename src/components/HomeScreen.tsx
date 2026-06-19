import { useState } from 'react'

interface HomeScreenProps {
  onNewCampaign: () => void
  onLoadCampaign: () => void
  onSettings: () => void
}

export default function HomeScreen({ onNewCampaign, onLoadCampaign, onSettings }: HomeScreenProps) {
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)

  function btnStyle(id: string, primary = false): React.CSSProperties {
    const hovered = hoveredBtn === id
    return {
      width: '280px',
      padding: '16px',
      background: hovered
        ? primary ? 'var(--gold-dim-hover)' : 'rgba(255,255,255,0.05)'
        : primary ? 'var(--gold-dim)' : 'transparent',
      border: `1px solid ${hovered ? 'var(--gold)' : 'var(--border2)'}`,
      color: primary ? 'var(--text)' : 'var(--text2)', 
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      letterSpacing: '2px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textAlign: 'center',
    }
  }

  return (
    <div style={{
      height: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0',
    }}>

      {}
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '52px',
          fontWeight: 700,
          color: 'var(--gold)',
          letterSpacing: '12px',
          lineHeight: 1,
          marginBottom: '12px',
          textShadow: '0 0 40px var(--gold-glow)', 
        }}>
          PROJECT
        </div>
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '52px',
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '12px',
          lineHeight: 1,
          marginBottom: '20px',
        }}>
          SOUL
        </div>
        <div style={{
          width: '120px',
          height: '1px',
          background: 'linear-gradient(to right, transparent, var(--gold), transparent)',
          margin: '0 auto 16px',
        }} />
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '11px',
          color: 'var(--text3)',
          letterSpacing: '3px',
        }}>
          RPG CAMPAIGN INTERFACE
        </div>
      </div>

      {}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        <button
          style={btnStyle('new', true)}
          onMouseEnter={() => setHoveredBtn('new')}
          onMouseLeave={() => setHoveredBtn(null)}
          onClick={onNewCampaign}
        >
          ⚔ NEW CAMPAIGN
        </button>
        <button
          style={btnStyle('load')}
          onMouseEnter={() => setHoveredBtn('load')}
          onMouseLeave={() => setHoveredBtn(null)}
          onClick={onLoadCampaign}
        >
          ◈ LOAD CAMPAIGN
        </button>
        <button
          style={btnStyle('settings')}
          onMouseEnter={() => setHoveredBtn('settings')}
          onMouseLeave={() => setHoveredBtn(null)}
          onClick={onSettings}
        >
          ✦ SETTINGS
        </button>
      </div>

      {}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        fontFamily: 'Cinzel, serif',
        fontSize: '10px',
        color: 'var(--text3)',
        letterSpacing: '2px',
      }}>
        VERSION 1.0
      </div>
    </div>
  )
}