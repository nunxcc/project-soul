import { useState } from 'react'

interface SetupPanelProps {
  systemPrompt: string
  onSave: (prompt: string) => void
}

export default function SetupPanel({ systemPrompt, onSave }: SetupPanelProps) {
  const [value, setValue] = useState(systemPrompt)

  function handleSave() {
    onSave(value)
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '32px 24px',
      overflowY: 'auto',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '28px',
        width: '100%',
        maxWidth: '620px',
      }}>
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '15px',
          color: 'var(--gold)',
          letterSpacing: '2px',
          marginBottom: '18px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border)',
        }}>
          SYSTEM PROMPT
        </div>

        <div style={{
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: 'var(--radius)',
          padding: '12px 16px',
          marginBottom: '18px',
          fontSize: '14px',
          color: 'var(--text2)',
          lineHeight: 1.65,
          fontStyle: 'italic',
        }}>
          <span style={{
            color: 'var(--gold)',
            fontStyle: 'normal',
            fontFamily: 'Cinzel, serif',
            fontSize: '11px',
            letterSpacing: '1px',
            display: 'block',
            marginBottom: '6px',
          }}>
            HOW IT WORKS
          </span>
          Paste your full DM instructions below. The app automatically appends the character
          tagging rule — you don't need to add anything. When Gemini writes{' '}
          <span style={{ color: 'var(--gold)', fontFamily: 'monospace', fontStyle: 'normal' }}>
            [Ezra]: "dialogue"
          </span>
          , the app detects it and shows Ezra's avatar and bubble automatically.
        </div>

        <label style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '10px',
          color: 'var(--text2)',
          letterSpacing: '1.2px',
          display: 'block',
          marginBottom: '8px',
        }}>
          YOUR DM INSTRUCTIONS
        </label>

        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={'V2.0\nDARTH ETERNUS — DM MASTER INSTRUCTIONS MANUAL...'}
          style={{
            width: '100%',
            background: 'var(--surface2)',
            border: '1px solid var(--border2)',
            borderRadius: 'var(--radius)',
            padding: '11px 15px',
            color: 'var(--text)',
            fontFamily: 'Crimson Pro, serif',
            fontSize: '14px',
            marginBottom: '16px',
            resize: 'vertical',
            minHeight: '320px',
            lineHeight: 1.65,
            outline: 'none',
          }}
        />

        <button
          onClick={handleSave}
          style={{
            width: '100%',
            background: 'rgba(201,168,76,0.12)',
            border: '1px solid var(--gold)',
            
            
            color: 'var(--text)', 
            
            padding: '11px 22px',
            borderRadius: 'var(--radius)',
            fontFamily: 'Cinzel, serif',
            fontSize: '11px',
            letterSpacing: '1.5px',
            transition: 'all 0.2s',
          }}
        >
          SAVE & RETURN TO CAMPAIGN
        </button>

        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--text3)',
          marginTop: '12px',
        }}>
          Changes take effect on the next message
        </div>
      </div>
    </div>
  )
}