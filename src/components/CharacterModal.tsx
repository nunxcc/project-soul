import React, { useState, useEffect } from 'react'
import { useNotification } from '../contexts/NotificationContext'
import type { Character } from '../types'

const COLORS = [
  '#c9a84c', '#4a7abf', '#cc3333', '#5a9a5a',
  '#9a5abf', '#bf7a3a', '#3abfbf', '#bf3a7a',
]

interface CharacterModalProps {
  open: boolean
  editingCharacter: Character | null
  onSave: (character: Character) => void
  onClose: () => void
}

export default function CharacterModal({ open, editingCharacter, onSave, onClose }: CharacterModalProps) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [avatar, setAvatar] = useState<string | null>(null)
  const { showNotification } = useNotification()

  useEffect(() => {
    if (editingCharacter) {
      setName(editingCharacter.name)
      setRole(editingCharacter.role)
      setColor(editingCharacter.color)
      setAvatar(editingCharacter.avatar)
    } else {
      setName('')
      setRole('')
      setColor(COLORS[0])
      setAvatar(null)
    }
  }, [editingCharacter, open])

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setAvatar(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function handleSave() {
    if (!name.trim()) { showNotification('Character name is required.', 'error'); return }
    onSave({
      id: editingCharacter?.id ?? 'char_' + Date.now(),
      name: name.trim(),
      role: role.trim(),
      color,
      avatar,
    })
  }

  if (!open) return null

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.82)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100,
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border2)',
        borderRadius: '12px',
        padding: '26px',
        width: '380px',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '14px',
          color: 'var(--gold)',
          letterSpacing: '1.5px',
          marginBottom: '20px',
        }}>
          {editingCharacter ? 'EDIT CHARACTER' : 'ADD CHARACTER'}
        </div>

        {}
        <div
          onClick={() => document.getElementById('avatar-upload')?.click()}
          style={{ textAlign: 'center', marginBottom: '14px', cursor: 'pointer' }}
        >
          {avatar ? (
            <img src={avatar} alt="avatar" style={{
              width: '74px', height: '74px', borderRadius: '50%',
              objectFit: 'cover', border: '2px solid var(--border2)',
              display: 'block', margin: '0 auto',
            }} />
          ) : (
            <div style={{
              width: '74px', height: '74px', borderRadius: '50%',
              background: 'var(--surface3)', border: '2px dashed var(--border2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto', color: 'var(--text3)', fontSize: '30px',
            }}>+</div>
          )}
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '8px', fontStyle: 'italic' }}>
            Click to upload image
          </p>
        </div>
        <input id="avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />

        {}
        <label style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: 'var(--text2)', letterSpacing: '1.2px', display: 'block', marginBottom: '7px' }}>
          CHARACTER NAME
        </label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Ezra Bridger"
          style={{
            width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)',
            borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)',
            fontSize: '15px', marginBottom: '16px', outline: 'none',
          }}
        />

        {}
        <label style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: 'var(--text2)', letterSpacing: '1.2px', display: 'block', marginBottom: '7px' }}>
          ROLE / DESCRIPTION
        </label>
        <input
          value={role}
          onChange={e => setRole(e.target.value)}
          placeholder="e.g. Jedi, ally"
          style={{
            width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)',
            borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--text)',
            fontSize: '15px', marginBottom: '16px', outline: 'none',
          }}
        />

        {}
        <label style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: 'var(--text2)', letterSpacing: '1.2px', display: 'block', marginBottom: '10px' }}>
          ACCENT COLOR
        </label>
        <div style={{ display: 'flex', gap: '9px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {COLORS.map(c => (
            <div
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: c, cursor: 'pointer',
                border: color === c ? '2px solid white' : '2px solid transparent',
                transform: color === c ? 'scale(1.18)' : 'scale(1)',
                transition: 'all 0.15s',
              }}
            />
          ))}
        </div>

        {}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '10px', borderRadius: 'var(--radius)',
              border: '1px solid var(--border2)', background: 'transparent',
              color: 'var(--text2)', fontFamily: 'Cinzel, serif',
              fontSize: '11px', letterSpacing: '1px',
            }}
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 1, padding: '10px', borderRadius: 'var(--radius)',
              border: '1px solid var(--gold)', background: 'rgba(201,168,76,0.1)',
              
              
              color: 'var(--text)', 
              
              fontFamily: 'Cinzel, serif',
              fontSize: '11px', letterSpacing: '1px',
            }}
          >
            SAVE CHARACTER
          </button>
        </div>
      </div>
    </div>
  )
}