import React, { useRef, useState, useEffect } from 'react'

const MODELS = [
  { label: '2.5 Flash Lite', value: 'gemini-2.5-flash-lite' }, 
  { label: '2.5 Flash', value: 'gemini-2.5-flash' }, 
  { label: '3.5 Flash', value: 'gemini-3.5-flash' }, 
  { label: '3 Flash', value: 'gemini-3-flash' }, 
]

interface InputAreaProps {
  onSend: (text: string, model: string) => void
  disabled: boolean
  selectedModel: string          
  onModelChange: (m: string) => void 
  onOpenSoul?: () => void       
  onOpenInventory?: () => void  
}

export default function InputArea({ onSend, disabled, selectedModel, onModelChange, onOpenSoul, onOpenInventory }: InputAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  const [view, setView] = useState<'menu' | 'input'>('menu')
  const [mode, setMode] = useState<'action' | 'talk'>('action')

  useEffect(() => {
    if (view === 'input' && ref.current) {
      ref.current.focus()
    }
  }, [view])

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const text = ref.current?.value.trim()
    if (!text || disabled) return
    
    const finalizedText = mode === 'talk' ? `"${text}"` : text
    
    onSend(finalizedText, selectedModel)
    if (ref.current) {
      ref.current.value = ''
      ref.current.style.height = 'auto'
    }
    
    setView('menu')
  }

  function autoResize() {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = Math.min(ref.current.scrollHeight, 130) + 'px'
    }
  }

  const currentLabel = MODELS.find(m => m.value === selectedModel)?.label ?? ''

  function mainCommandStyle(isDisabled: boolean): React.CSSProperties {
    return {
      padding: '14px 20px', 
      background: 'var(--surface2)',
      border: '1px solid var(--border2)',
      borderRadius: '10px',
      color: isDisabled ? 'var(--text3)' : 'var(--text)',
      fontFamily: 'Cinzel, serif',
      fontSize: '13px', 
      fontWeight: 600,
      letterSpacing: '1.5px',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s',
      textTransform: 'uppercase',
      boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    }
  }

  return (
    <div style={{ padding: '0 20px 24px 20px', display: 'flex', justifyContent: 'center', width: '100%', flexShrink: 0 }}>
      
      {}
      <div style={{
        width: '100%', maxWidth: '850px', background: 'var(--surface)',
        border: '1px solid var(--border)', borderRadius: '16px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        padding: view === 'menu' ? '24px' : '16px 20px',
        display: 'flex', flexDirection: 'column', gap: '12px',
      }}>

        {}
        {view === 'menu' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '600px', width: '100%', margin: '0 auto' }}>
            <button 
              disabled={disabled} onClick={() => { setMode('action'); setView('input'); }}
              style={mainCommandStyle(disabled)}
              onMouseEnter={e => !disabled && (e.currentTarget.style.borderColor = 'var(--gold)', e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={e => !disabled && (e.currentTarget.style.borderColor = 'var(--border2)', e.currentTarget.style.color = 'var(--text)')}
            >
              ⚔ ACTION
            </button>
            <button 
              disabled={disabled} onClick={() => { setMode('talk'); setView('input'); }}
              style={mainCommandStyle(disabled)}
              onMouseEnter={e => !disabled && (e.currentTarget.style.borderColor = 'var(--gold)', e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={e => !disabled && (e.currentTarget.style.borderColor = 'var(--border2)', e.currentTarget.style.color = 'var(--text)')}
            >
              🗣 TALK
            </button>
            
            <button 
              onClick={onOpenSoul} style={{ ...mainCommandStyle(false), color: 'var(--gold)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.boxShadow = '0 4px 15px var(--gold-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)' }}
            >
              ✦ SOUL
            </button>
            
            <button 
              onClick={onOpenInventory} style={mainCommandStyle(false)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text2)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              ◈ INVENTORY
            </button>
          </div>
        )}

        {}
        {view === 'input' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '11px', color: 'var(--gold)', letterSpacing: '2px', fontWeight: 600 }}>
                {mode === 'talk' ? '🗣 TALK MODE' : '⚔ ACTION MODE'}
              </div>
              <button 
                onClick={() => setView('menu')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text3)', fontFamily: 'Cinzel, serif', fontSize: '10px', letterSpacing: '1px', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
              >
                ✕ CANCEL
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', width: '100%' }}>
              <textarea
                ref={ref}
                rows={1}
                placeholder={mode === 'talk' ? 'What do you say...' : 'What do you do...'} 
                disabled={disabled}
                onKeyDown={handleKey}
                onInput={autoResize}
                className="input-base" 
                style={{
                  flex: 1, resize: 'none', maxHeight: '130px',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' 
                }}
              />

              <div style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={() => setDropdownOpen(p => !p)}
                  style={{
                    background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text2)',
                    padding: '0 16px', borderRadius: '8px', fontFamily: 'Cinzel, serif', fontSize: '11px',
                    letterSpacing: '0.8px', height: '50px', cursor: 'pointer', whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--text3)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
                >
                  {currentLabel} ▾
                </button>

                {dropdownOpen && (
                  <div style={{ position: 'absolute', bottom: '58px', right: 0, background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', overflow: 'hidden', zIndex: 50, minWidth: '160px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                    {MODELS.map(m => (
                      <div
                        key={m.value}
                        onClick={() => { onModelChange(m.value); setDropdownOpen(false) }}
                        style={{
                          padding: '12px 16px', fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '0.8px',
                          color: selectedModel === m.value ? 'var(--gold)' : 'var(--text2)',
                          background: selectedModel === m.value ? 'rgba(195,7,63,0.08)' : 'transparent',
                          cursor: 'pointer', borderBottom: '1px solid var(--border)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = selectedModel === m.value ? 'rgba(195,7,63,0.08)' : 'transparent')}
                      >
                        {m.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={submit}
                disabled={disabled}
                className="btn-primary" 
                style={{ height: '50px', flexShrink: 0 }}
              >
                SEND
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}