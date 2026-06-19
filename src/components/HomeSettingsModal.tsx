import { useState } from 'react'

interface HomeSettingsModalProps {
  open: boolean
  onClose: () => void
  onChangeApiKey: () => void
  theme: string             
  onThemeChange: (t: string) => void 
}

export default function HomeSettingsModal({ open, onClose, onChangeApiKey, theme, onThemeChange }: HomeSettingsModalProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)

  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 150 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: '14px', padding: '32px', width: '450px' }}>
        
        {}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', color: 'var(--gold)', letterSpacing: '2px' }}>SETTINGS</div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', fontStyle: 'italic', marginTop: '4px' }}>Configure credentials and interface behaviors</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', width: '32px', height: '32px', borderRadius: '50%', fontSize: '14px', cursor: 'pointer', transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
          >✕</button>
        </div>

        {}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: 'var(--text3)', letterSpacing: '2px', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
            QUALITY OF LIFE
          </div>
          
          {}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--surface3)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '11px', color: 'var(--text)', letterSpacing: '0.5px' }}>Immersive Animations</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', fontStyle: 'italic', marginTop: '2px' }}>Toggle text fade and pulse effects</div>
            </div>
            <input 
              type="checkbox" 
              checked={animationsEnabled} 
              onChange={() => setAnimationsEnabled(!animationsEnabled)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--gold)', cursor: 'pointer' }}
            />
          </div>

          {}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--surface3)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginTop: '12px' }}>
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '11px', color: 'var(--text)', letterSpacing: '0.5px' }}>System HUD Color Theme</div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', fontStyle: 'italic', marginTop: '2px' }}>Choose your visual color theme</div>
            </div>
            
            {}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '6px' }}>
              {[
                { name: 'destiny', label: 'Destiny' },
                { name: 'crimson', label: 'Crimson' },
                { name: 'true-soul', label: 'True Soul' },
                { name: 'requiem', label: 'Requiem' }
              ].map(t => (
                <button
                  key={t.name}
                  onClick={() => onThemeChange(t.name)}
                  style={{
                    padding: '8px 2px',
                    background: theme === t.name ? 'var(--gold-dim)' : 'var(--surface2)',
                    border: `1px solid ${theme === t.name ? 'var(--gold)' : 'var(--border)'}`,
                    borderRadius: '6px',
                    color: theme === t.name ? 'var(--gold)' : 'var(--text3)',
                    fontFamily: 'Cinzel, serif',
                    fontSize: '9px',
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textTransform: 'uppercase',
                    fontWeight: theme === t.name ? 'bold' : 'normal'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: 'var(--text3)', letterSpacing: '2px', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
            CONNECTIONS
          </div>
          <button
            onClick={onChangeApiKey}
            onMouseEnter={() => setHovered('api')}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '14px 18px',
              background: hovered === 'api' ? 'var(--surface2)' : 'transparent',
              border: `1px solid ${hovered === 'api' ? 'var(--border2)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
            }}
          >
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '12px', color: 'var(--text)', letterSpacing: '1px' }}>🔑 Change API Key</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', fontStyle: 'italic', marginTop: '3px' }}>Modify your saved Google Gemini credentials</div>
            </div>
            <div style={{ color: 'var(--text3)', fontSize: '14px' }}>→</div>
          </button>
        </div>
      </div>
    </div>
  )
}