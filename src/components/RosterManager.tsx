import { useState } from 'react'
import type { Character } from '../types'
import { useNotification } from '../contexts/NotificationContext'

const COLORS = [
  '#C3073F', '#4a7abf', '#5a9a5a', '#9a5abf',
  '#bf7a3a', '#3abfbf', '#bf3a7a', '#c9a84c',
]

interface RosterManagerProps {
  roster: Character[]
  onSave: (roster: Character[]) => void
  onBack: () => void
}

interface CharacterSheetProps {
  character: Character
  onSave: (char: Character) => void
  onBack: () => void
  isNew?: boolean
}



function CharacterSheet({ character, onSave, onBack, isNew = false }: CharacterSheetProps) {
  const { showNotification } = useNotification()
  const [data, setData] = useState<Character>({
    appearance: '',
    personality: '',
    powers: '',
    backstory: '',
    ...character 
  })
  const [activeTab, setActiveTab] = useState<'info' | 'sheet'>('info')

  
  const [customColors, setCustomColors] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('soul_custom_colors')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  function update(field: keyof Character, value: string) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => update('avatar', ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  
  function saveCurrentCustomColor() {
    if (customColors.includes(data.color)) return
    const updated = [...customColors, data.color].slice(-8) 
    setCustomColors(updated)
    localStorage.setItem('soul_custom_colors', JSON.stringify(updated))
  }

  function removeCustomColor(colorToRemove: string) {
    const updated = customColors.filter(c => c !== colorToRemove)
    setCustomColors(updated)
    localStorage.setItem('soul_custom_colors', JSON.stringify(updated))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px' }}>

      {}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'transparent', border: '1px solid var(--border2)',
              color: 'var(--text2)', padding: '6px 12px',
              borderRadius: 'var(--radius)', fontFamily: 'Cinzel, serif',
              fontSize: '11px', letterSpacing: '1px', cursor: 'pointer',
            }}
          >
            ← BACK
          </button>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '16px', color: 'var(--gold)', letterSpacing: '2px' }}>
            {isNew ? 'NEW CHARACTER' : 'EDIT CHARACTER'}
          </div>
        </div>

        {}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--surface2)', padding: '3px', borderRadius: 'var(--radius)' }}>
          <button
            onClick={() => setActiveTab('info')}
            style={{
              padding: '6px 14px', borderRadius: '4px', border: 'none',
              background: activeTab === 'info' ? 'var(--gold-dim)' : 'transparent',
              color: activeTab === 'info' ? 'var(--gold)' : 'var(--text3)',
              fontFamily: 'Cinzel, serif', fontSize: '10px', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            GENERAL INFO
          </button>
          <button
            onClick={() => setActiveTab('sheet')}
            style={{
              padding: '6px 14px', borderRadius: '4px', border: 'none',
              background: activeTab === 'sheet' ? 'var(--gold-dim)' : 'transparent',
              color: activeTab === 'sheet' ? 'var(--gold)' : 'var(--text3)',
              fontFamily: 'Cinzel, serif', fontSize: '10px', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            CHARACTER SHEET
          </button>
        </div>
      </div>

      {}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', marginBottom: '20px' }}>
        
        {}
        {activeTab === 'info' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              <div
                onClick={() => document.getElementById('roster-avatar')?.click()}
                style={{
                  width: '90px', height: '90px', borderRadius: '50%',
                  background: data.avatar ? 'transparent' : 'var(--surface3)',
                  border: `2px ${data.avatar ? 'solid' : 'dashed'} var(--border2)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0, overflow: 'hidden',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
              >
                {data.avatar
                  ? <img src={data.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '26px', color: 'var(--text3)' }}>+</span>
                }
              </div>
              <input type="file" id="roster-avatar" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
              <div style={{ flex: 1 }}>
                <FieldInput label="NAME" value={data.name} onChange={v => update('name', v)} placeholder="Character name" />
              </div>
            </div>

            <FieldInput label="ROLE / DESCRIPTION" value={data.role} onChange={v => update('role', v)} placeholder="e.g. Tavern Keep, Sith Lord, Companion..." />

            {}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: 'var(--text2)', letterSpacing: '1.5px', display: 'block', marginBottom: '8px' }}>
                ACCENT COLOR
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                {}
                {COLORS.map(c => (
                  <div
                    key={c}
                    onClick={() => update('color', c)}
                    style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: c, cursor: 'pointer',
                      border: data.color === c ? '2px solid white' : '2px solid transparent',
                      transform: data.color === c ? 'scale(1.18)' : 'scale(1)',
                      transition: 'all 0.15s',
                    }}
                  />
                ))}

                {}
                <div style={{ position: 'relative', width: '28px', height: '28px' }}>
                  <div
                    onClick={() => document.getElementById('custom-color-picker')?.click()}
                    style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: 'linear-gradient(45deg, #ff3b6f, #ff3b3b, #ffb33b, #3bff5e, #3b9aff, #b33bff)',
                      cursor: 'pointer',
                      border: !COLORS.includes(data.color) && !customColors.includes(data.color) ? '2px solid white' : '2px solid transparent',
                      transform: !COLORS.includes(data.color) && !customColors.includes(data.color) ? 'scale(1.18)' : 'scale(1)',
                      transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    }}
                    title="Choose custom color"
                  >
                    🎨
                  </div>
                  <input
                    id="custom-color-picker"
                    type="color"
                    value={COLORS.includes(data.color) ? '#c9a84c' : data.color}
                    onChange={e => update('color', e.target.value)}
                    style={{
                      position: 'absolute', opacity: 0, width: 1, height: 1, pointerEvents: 'none'
                    }}
                  />
                </div>

                {}
                {!COLORS.includes(data.color) && (
                  <span style={{
                    fontFamily: 'monospace', fontSize: '11px', color: 'var(--text3)',
                    background: 'var(--surface3)', padding: '3px 8px', borderRadius: '4px',
                    border: '1px solid var(--border)', letterSpacing: '0.5px'
                  }}>
                    {data.color.toUpperCase()}
                  </span>
                )}

                {}
                {!COLORS.includes(data.color) && !customColors.includes(data.color) && (
                  <button
                    onClick={saveCurrentCustomColor}
                    style={{
                      background: 'transparent', border: '1px dashed var(--border2)',
                      color: 'var(--text2)', borderRadius: 'var(--radius)',
                      padding: '4px 10px', fontSize: '10px', fontFamily: 'Cinzel, serif',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                      transition: 'border-color 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                  >
                    + ADD TO PALETTE
                  </button>
                )}
              </div>

              {}
              {customColors.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', color: 'var(--text3)', letterSpacing: '1.5px', marginBottom: '8px' }}>
                    CREATED COLORS
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {customColors.map(c => (
                      <div
                        key={c}
                        onClick={() => update('color', c)}
                        style={{
                          width: '24px', height: '24px', borderRadius: '50%', 
                          background: c, cursor: 'pointer',
                          border: data.color === c ? '2px solid white' : '2px solid transparent',
                          transform: data.color === c ? 'scale(1.18)' : 'scale(1)',
                          transition: 'all 0.15s',
                          position: 'relative'
                        }}
                        title={c.toUpperCase()}
                      >
                        {}
                        <div
                          onClick={(e) => {
                            e.stopPropagation() 
                            removeCustomColor(c)
                          }}
                          style={{
                            position: 'absolute', top: '-4px', right: '-4px',
                            background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'var(--text3)', width: '12px', height: '12px', borderRadius: '50%',
                            fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', opacity: 0.8, transition: 'color 0.1s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                        >
                          ✕
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {}
        {activeTab === 'sheet' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FieldTextArea label="PHYSICAL APPEARANCE" value={data.appearance || ''} onChange={v => update('appearance', v)} placeholder="Describe their looks, clothing style, scars, and details..." />
            <FieldTextArea label="CORE PERSONALITY & TRAITS" value={data.personality || ''} onChange={v => update('personality', v)} placeholder="How do they behave? alignment, flaws, values..." />
            <FieldTextArea label="ABILITIES, WEAPONS & POWERS" value={data.powers || ''} onChange={v => update('powers', v)} placeholder="What can they do? Weapons equipped, spells, magic..." />
            <FieldTextArea label="BACKSTORY & BIOGRAPHY" value={data.backstory || ''} onChange={v => update('backstory', v)} placeholder="Where did they come from? History with the main character..." />
          </div>
        )}
      </div>

      {}
      {}
      <button
        onClick={() => {
          if (!data.name.trim()) { 
            showNotification('Name is required.', 'error') 
            return 
          }
          onSave(data)
        }}
        style={{
          width: '100%', background: 'var(--gold-dim)',
          border: '1px solid var(--gold)', color: 'var(--text)',
          padding: '12px', borderRadius: 'var(--radius)',
          fontFamily: 'Cinzel, serif', fontSize: '11px',
          letterSpacing: '1.5px', cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        SAVE CHARACTER
      </button>
    </div>
  )
}

function FieldInput({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: 'var(--text2)', letterSpacing: '1.5px', display: 'block', marginBottom: '6px' }}>
        {label}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', background: 'var(--surface2)',
          border: '1px solid var(--border2)', borderRadius: 'var(--radius)',
          padding: '10px 14px', color: 'var(--text)',
          fontFamily: 'Crimson Pro, serif', fontSize: '15px',
          outline: 'none', transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e => e.target.style.borderColor = 'var(--border2)'}
      />
    </div>
  )
}

function FieldTextArea({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div>
      <label style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: 'var(--text2)', letterSpacing: '1.5px', display: 'block', marginBottom: '6px' }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        style={{
          width: '100%', background: 'var(--surface2)',
          border: '1px solid var(--border2)', borderRadius: 'var(--radius)',
          padding: '10px 14px', color: 'var(--text)',
          fontFamily: 'Crimson Pro, serif', fontSize: '15px',
          outline: 'none', transition: 'border-color 0.2s',
          resize: 'vertical', lineHeight: 1.6
        }}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e => e.target.style.borderColor = 'var(--border2)'}
      />
    </div>
  )
}



export default function RosterManager({ roster, onSave, onBack }: RosterManagerProps) {
  const [chars, setChars] = useState<Character[]>(roster)
  const [editing, setEditing] = useState<{ char: Character; index: number | null } | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  function handleSaveChar(char: Character) {
    let updated: Character[]
    if (editing!.index !== null) {
      updated = chars.map((c, i) => i === editing!.index ? char : c)
    } else {
      updated = [...chars, { ...char, id: 'char_' + Date.now() }]
    }
    setChars(updated)
    onSave(updated)
    setEditing(null)
  }

  function handleDelete(e: React.MouseEvent, index: number) {
    e.stopPropagation() 
    if (!confirm(`Remove ${chars[index].name}?`)) return
    const updated = chars.filter((_, i) => i !== index)
    setChars(updated)
    onSave(updated)
  }

  function newCharacter(): Character {
    return { id: '', name: '', role: '', color: COLORS[0], avatar: null, appearance: '', personality: '', powers: '', backstory: '' }
  }

  if (editing) {
    return (
      <CharacterSheet
        character={editing.char}
        onSave={handleSaveChar}
        onBack={() => setEditing(null)}
        isNew={editing.index === null}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px' }}>

      {}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'transparent', border: '1px solid var(--border2)',
              color: 'var(--text2)', padding: '6px 12px',
              borderRadius: 'var(--radius)', fontFamily: 'Cinzel, serif',
              fontSize: '11px', letterSpacing: '1px', cursor: 'pointer',
            }}
          >
            ← BACK
          </button>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '16px', color: 'var(--gold)', letterSpacing: '2px' }}>
            ROSTER ENCYCLOPEDIA
          </div>
        </div>
        <button
          onClick={() => setEditing({ char: newCharacter(), index: null })}
          style={{
            background: 'var(--gold-dim)', border: '1px solid var(--gold)',
            color: 'var(--text)', padding: '8px 16px',
            borderRadius: 'var(--radius)', fontFamily: 'Cinzel, serif',
            fontSize: '11px', letterSpacing: '1px', cursor: 'pointer',
          }}
        >
          + ADD NPC
        </button>
      </div>

      {}
      {chars.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text3)', fontStyle: 'italic', fontSize: '14px', marginTop: '40px' }}>
          No characters discovered yet. Add your first manual NPC, or meet them naturally in the campaign story!
        </div>
      ) : (
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          display: 'grid', 
          
          
          gridTemplateColumns: 'repeat(auto-fit, 130px)', 
          justifyContent: 'center',                       
          gap: '20px',                                    
          
          paddingRight: '6px',
          paddingBottom: '10px'
        }}>
          {chars.map((char, i) => (
            <div
              key={char.id || i}
              onMouseEnter={() => setHovered(char.id || String(i))}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setEditing({ char, index: i })}
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '2 / 3',           
                background: 'var(--surface3)',
                
                
                borderTop: `1px solid ${hovered === (char.id || String(i)) ? 'var(--gold)' : 'var(--border)'}`,
                borderLeft: `1px solid ${hovered === (char.id || String(i)) ? 'var(--gold)' : 'var(--border)'}`,
                borderRight: `1px solid ${hovered === (char.id || String(i)) ? 'var(--gold)' : 'var(--border)'}`,
                borderBottom: `4px solid ${char.color}`, 
                
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                transition: 'all 0.15s ease-in-out',
                cursor: 'pointer',
              }}
            >
              {char.avatar ? (
                <img src={char.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ 
                  height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '36px', fontFamily: 'Cinzel, serif', color: char.color, opacity: 0.35 
                }}>
                  {char.name[0] || '?'}
                </div>
              )}

              {}
              <div style={{
                position: 'absolute', bottom: 0, insetInline: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
                padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '11px', color: 'var(--text)', letterSpacing: '0.5px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {char.name}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text3)', fontStyle: 'italic', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {char.role || 'Discovered NPC'}
                </div>
              </div>

              {}
              {hovered === (char.id || String(i)) && (
                <button
                  onClick={e => handleDelete(e, i)}
                  style={{
                    position: 'absolute', top: '6px', right: '6px',
                    background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)',
                    color: 'var(--text3)', fontSize: '10px', cursor: 'pointer',
                    width: '20px', height: '20px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}