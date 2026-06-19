import { useState } from 'react'
import WizardShell from './WizardShell'
import type { PlayerPowers } from '../../types'

interface Step5PowersProps {
  initialValue: PlayerPowers
  onNext: (powers: PlayerPowers) => void
  onBack: () => void
}

function Field({ label, hint, value, onChange, placeholder, half = false }: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  half?: boolean
}) {
  return (
    <div style={{ width: half ? 'calc(50% - 8px)' : '100%', marginBottom: '20px' }}>
      <label style={{
        fontFamily: 'Cinzel, serif',
        fontSize: '10px',
        color: 'var(--text2)',
        letterSpacing: '1.5px',
        display: 'block',
        marginBottom: '4px',
      }}>
        {label}
      </label>
      {hint && (
        <div style={{
          fontSize: '12px',
          color: 'var(--text3)',
          fontStyle: 'italic',
          marginBottom: '7px',
          lineHeight: 1.5,
        }}>
          {hint}
        </div>
      )}
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: 'var(--surface2)',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius)',
          padding: '10px 14px',
          color: 'var(--text)',
          fontFamily: 'Crimson Pro, serif',
          fontSize: '15px',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e => e.target.style.borderColor = 'var(--border2)'}
      />
    </div>
  )
}

function TextArea({ label, hint, value, onChange, placeholder, rows = 4 }: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        fontFamily: 'Cinzel, serif',
        fontSize: '10px',
        color: 'var(--text2)',
        letterSpacing: '1.5px',
        display: 'block',
        marginBottom: '4px',
      }}>
        {label}
      </label>
      {hint && (
        <div style={{
          fontSize: '12px',
          color: 'var(--text3)',
          fontStyle: 'italic',
          marginBottom: '7px',
          lineHeight: 1.5,
        }}>
          {hint}
        </div>
      )}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%',
          background: 'var(--surface2)',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius)',
          padding: '10px 14px',
          color: 'var(--text)',
          fontFamily: 'Crimson Pro, serif',
          fontSize: '15px',
          outline: 'none',
          resize: 'vertical',
          lineHeight: 1.65,
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e => e.target.style.borderColor = 'var(--border2)'}
      />
    </div>
  )
}

export default function Step5Powers({ initialValue, onNext, onBack }: Step5PowersProps) {
  const [data, setData] = useState<PlayerPowers>(initialValue)

  function update(field: keyof PlayerPowers, value: string) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <WizardShell
      step={5}
      totalSteps={5}
      title="YOUR POWER"
      subtitle="Define your character's abilities, weapons, and what makes them dangerous."
      onNext={() => onNext(data)}
      onBack={onBack}
      nextLabel="LINK START"
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 16px' }}>
        <Field
          label="CLASS"
          hint="Your character's primary role or archetype."
          value={data.class}
          onChange={v => update('class', v)}
          placeholder="e.g. Sith, Jedi, Bounty Hunter, Mandalorian, Smuggler..."
          half
        />
        <Field
          label="SUBCLASS"
          hint="A specialization within your class."
          value={data.subclass}
          onChange={v => update('subclass', v)}
          placeholder="e.g. Shadow, Sentinel, Assassin..."
          half
        />
      </div>

      <TextArea
        label="WEAPONS"
        hint="List your character's weapons and describe them briefly."
        value={data.weapons}
        onChange={v => update('weapons', v)}
        placeholder="e.g. A red-black crossguard lightsaber with a cracked kyber crystal. A WESTAR-35 blaster pistol worn on the left hip. A vibrodagger hidden in the boot..."
        rows={4}
      />

      <TextArea
        label="POWERS & ABILITIES"
        hint="What can your character do? Force powers, special skills, combat techniques, magic, technology."
        value={data.powers}
        onChange={v => update('powers', v)}
        placeholder="e.g. Force choke, Force lightning (unstable), precognition in combat. Expert in Juyo lightsaber form. Skilled slicer and interrogator. Speaks 6 languages..."
        rows={5}
      />

      <TextArea
        label="SPECIAL ABILITY"
        hint="One unique ability that defines your character — something no one else has. The AI will always remember this."
        value={data.specialAbility}
        onChange={v => update('specialAbility', v)}
        placeholder="e.g. Can briefly enter a battle trance that heightens all senses at the cost of emotional control. Once per encounter, can sense the exact moment before an attack lands..."
        rows={4}
      />

      {}
      <div style={{
        background: 'var(--gold-dim)',
        border: '1px solid rgba(195,7,63,0.3)',
        borderRadius: 'var(--radius)',
        padding: '14px 18px',
        marginTop: '8px',
      }}>
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '11px',
          color: 'var(--gold)',
          letterSpacing: '1.5px',
          marginBottom: '6px',
        }}>
          ⚔ READY TO BEGIN
        </div>
        <div style={{
          fontSize: '13px',
          color: 'var(--text2)',
          fontStyle: 'italic',
          lineHeight: 1.6,
        }}>
          When you press Link Start, your campaign will be saved and the AI will be loaded with your full character sheet, world details, and DM instructions. Your legend begins now.
        </div>
      </div>
    </WizardShell>
  )
}