import { useState } from 'react'
import WizardShell from './WizardShell'

interface Step1NameProps {
  initialValue: string
  onNext: (name: string) => void
  onBack?: () => void 
}

export default function Step1Name({ initialValue, onNext, onBack }: Step1NameProps) {
  const [name, setName] = useState(initialValue)

  return (
    <WizardShell
      step={1}
      totalSteps={5}
      title="THE CAMPAIGN"
      subtitle="Every legend begins with a name. What shall this campaign be called?"
      onNext={() => onNext(name.trim())}
      onBack={onBack} 
      nextDisabled={name.trim().length === 0}
    >
      <div>
        <label style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '10px',
          color: 'var(--text2)',
          letterSpacing: '1.5px',
          display: 'block',
          marginBottom: '10px',
        }}>
          CAMPAIGN NAME
        </label>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name.trim() && onNext(name.trim())}
          placeholder="e.g. Eternus, The Shattered Crown, Ashes of the Empire..."
          style={{
            width: '100%',
            background: 'var(--surface2)',
            border: '1px solid var(--border2)',
            borderRadius: 'var(--radius)',
            padding: '14px 18px',
            color: 'var(--text)',
            fontFamily: 'Cinzel, serif',
            fontSize: '18px',
            letterSpacing: '2px',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--gold)'}
          onBlur={e => e.target.style.borderColor = 'var(--border2)'}
        />
        <div style={{
          fontSize: '12px',
          color: 'var(--text3)',
          fontStyle: 'italic',
          marginTop: '10px',
        }}>
          This will be the title of your campaign save file.
        </div>
      </div>
    </WizardShell>
  )
}