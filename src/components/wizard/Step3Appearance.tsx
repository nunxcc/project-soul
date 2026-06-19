import { useState } from 'react'
import WizardShell from './WizardShell'
import type { PlayerAppearance } from '../../types'

interface Step3AppearanceProps {
  initialValue: PlayerAppearance
  onNext: (appearance: PlayerAppearance) => void
  onBack: () => void
}

function Field({ label, value, onChange, placeholder, half = false }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  half?: boolean
}) {
  return (
    <div style={{ width: half ? 'calc(50% - 8px)' : '100%', marginBottom: '16px' }}>
      <label style={{
        fontFamily: 'Cinzel, serif',
        fontSize: '10px',
        color: 'var(--text2)',
        letterSpacing: '1.5px',
        display: 'block',
        marginBottom: '6px',
      }}>
        {label}
      </label>
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

function TextArea({ label, value, onChange, placeholder }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div style={{ width: '100%', marginBottom: '16px' }}>
      <label style={{
        fontFamily: 'Cinzel, serif',
        fontSize: '10px',
        color: 'var(--text2)',
        letterSpacing: '1.5px',
        display: 'block',
        marginBottom: '6px',
      }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
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
          lineHeight: 1.6,
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e => e.target.style.borderColor = 'var(--border2)'}
      />
    </div>
  )
}

export default function Step3Appearance({ initialValue, onNext, onBack }: Step3AppearanceProps) {
  const [data, setData] = useState<PlayerAppearance>(initialValue)

  function update(field: keyof PlayerAppearance, value: string) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => update('avatar', ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <WizardShell
      step={3}
      totalSteps={5}
      title="YOUR APPEARANCE"
      subtitle="Describe how your character looks. The AI will use this to describe you in scenes."
      onNext={() => onNext(data)}
      onBack={onBack}
      nextDisabled={data.name.trim().length === 0}
    >
      {}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
        <div
          onClick={() => document.getElementById('player-avatar')?.click()}
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: data.avatar ? 'transparent' : 'var(--surface2)',
            border: `2px ${data.avatar ? 'solid' : 'dashed'} var(--border2)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            overflow: 'hidden',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
        >
          {data.avatar ? (
            <img src={data.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '28px', color: 'var(--text3)' }}>+</span>
          )}
        </div>
        <input type="file" id="player-avatar" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '11px', color: 'var(--text2)', letterSpacing: '1px', marginBottom: '4px' }}>
            CHARACTER PORTRAIT
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.5 }}>
            Upload an image of your character.<br />This will appear in the chat sidebar.
          </div>
        </div>
      </div>

      {}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 16px' }}>
        <Field label="CHARACTER NAME" value={data.name} onChange={v => update('name', v)} placeholder="Your character's name" />
        <Field label="RACE / SPECIES" value={data.race} onChange={v => update('race', v)} placeholder="e.g. Human, Elf, Twi'lek..." half />
        <Field label="GENDER" value={data.gender} onChange={v => update('gender', v)} placeholder="e.g. Male, Female, Non-binary..." half />
        <Field label="AGE" value={data.age} onChange={v => update('age', v)} placeholder="e.g. 28" half />
        <Field label="HEIGHT" value={data.height} onChange={v => update('height', v)} placeholder="e.g. 6'1 / 185cm" half />
        <Field label="WEIGHT" value={data.weight} onChange={v => update('weight', v)} placeholder="e.g. 180lbs / 82kg" half />
        <Field label="BODY TYPE" value={data.bodyType} onChange={v => update('bodyType', v)} placeholder="e.g. Athletic, Slim, Muscular..." half />
        <Field label="EYE COLOR" value={data.eyeColor} onChange={v => update('eyeColor', v)} placeholder="e.g. Deep amber" half />
        <Field label="HAIR TYPE" value={data.hairType} onChange={v => update('hairType', v)} placeholder="e.g. Straight, Curly, Braided..." half />
        <Field label="HAIR COLOR" value={data.hairColor} onChange={v => update('hairColor', v)} placeholder="e.g. Jet black with silver streaks" half />
        <Field label="SKIN COLOR" value={data.skinColor} onChange={v => update('skinColor', v)} placeholder="e.g. Olive, Dark brown, Pale..." half />
        <TextArea label="DISTINCTIVE MARKS" value={data.distinctiveMarks} onChange={v => update('distinctiveMarks', v)} placeholder="Scars, tattoos, birthmarks, cybernetic implants, anything that makes your character visually unique..." />
        <TextArea label="CLOTHING & STYLE" value={data.clothingStyle} onChange={v => update('clothingStyle', v)} placeholder="What do they typically wear? Armor, robes, casual, elegant? Describe their usual look..." />
      </div>
    </WizardShell>
  )
}