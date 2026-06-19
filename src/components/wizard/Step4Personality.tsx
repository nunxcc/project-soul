import { useState } from 'react'
import WizardShell from './WizardShell'
import type { PlayerPersonality } from '../../types'

interface Step4PersonalityProps {
  initialValue: PlayerPersonality
  onNext: (personality: PlayerPersonality) => void
  onBack: () => void
}

const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
]

function Field({ label, hint, value, onChange, placeholder, rows = 3 }: {
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

export default function Step4Personality({ initialValue, onNext, onBack }: Step4PersonalityProps) {
  const [data, setData] = useState<PlayerPersonality>(initialValue)

  function update(field: keyof PlayerPersonality, value: string) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <WizardShell
      step={4}
      totalSteps={5}
      title="YOUR SOUL"
      subtitle="Who is your character at their core? The AI will use this to shape how the world reacts to you."
      onNext={() => onNext(data)}
      onBack={onBack}
    >
      {}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '10px',
          color: 'var(--text2)',
          letterSpacing: '1.5px',
          display: 'block',
          marginBottom: '6px',
        }}>
          ALIGNMENT
        </label>
        <div style={{
          fontSize: '12px',
          color: 'var(--text3)',
          fontStyle: 'italic',
          marginBottom: '10px',
        }}>
          Your character's moral and ethical outlook.
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}>
          {ALIGNMENTS.map(a => (
            <button
              key={a}
              onClick={() => update('alignment', a)}
              style={{
                padding: '10px 8px',
                background: data.alignment === a ? 'var(--gold-dim)' : 'var(--surface2)',
                border: `1px solid ${data.alignment === a ? 'var(--gold)' : 'var(--border2)'}`,
                borderRadius: 'var(--radius)',
                color: data.alignment === a ? 'var(--gold)' : 'var(--text2)',
                fontFamily: 'Cinzel, serif',
                fontSize: '10px',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <Field
        label="PERSONALITY TRAITS"
        hint="How does your character generally behave and present themselves to the world?"
        value={data.traits}
        onChange={v => update('traits', v)}
        placeholder="e.g. Sarcastic on the surface but fiercely loyal beneath. Tends to deflect serious moments with humor. Observes before speaking in unfamiliar situations..."
        rows={3}
      />
      <Field
        label="IDEALS"
        hint="What principles does your character believe in and strive toward?"
        value={data.ideals}
        onChange={v => update('ideals', v)}
        placeholder="e.g. Freedom above all else. No one should be enslaved to a system, a person, or a destiny they didn't choose..."
        rows={3}
      />
      <Field
        label="BONDS"
        hint="Who or what does your character care about most? What ties them to the world?"
        value={data.bonds}
        onChange={v => update('bonds', v)}
        placeholder="e.g. A younger sibling left behind. A debt owed to someone who saved their life. A destroyed home they swore to rebuild..."
        rows={3}
      />
      <Field
        label="FLAWS"
        hint="What weaknesses, vices, or blind spots does your character have?"
        value={data.flaws}
        onChange={v => update('flaws', v)}
        placeholder="e.g. Cannot walk away from someone in danger even when it's tactically suicidal. Struggles to trust authority figures. Prone to rage when betrayed..."
        rows={3}
      />
      <Field
        label="BACKSTORY"
        hint="Where did your character come from? What shaped them into who they are today?"
        value={data.backstory}
        onChange={v => update('backstory', v)}
        placeholder="Write as much or as little as you want. The AI will reference this throughout the campaign..."
        rows={6}
      />
      <Field
        label="DARK SECRET"
        hint="Something your character hides from the world. The AI may use this to create dramatic moments."
        value={data.darkSecret}
        onChange={v => update('darkSecret', v)}
        placeholder="e.g. They were responsible for the death of someone they loved. They once served the enemy. They are not who they claim to be..."
        rows={3}
      />
    </WizardShell>
  )
}