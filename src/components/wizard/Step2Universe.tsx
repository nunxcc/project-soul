import { useState } from 'react'
import WizardShell from './WizardShell'

interface Step2UniverseProps {
  initialSetting: string
  initialInstructions: string
  initialWorldChanges?: string 
  onNext: (setting: string, instructions: string, worldChanges: string) => void 
  onBack: () => void
  hideInstructions?: boolean
}

function Field({ label, hint, value, onChange, placeholder, rows = 4 }: {
  label: string
  hint: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  rows?: number
}) {
  return (
    <div style={{ marginBottom: '24px' }}>
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
      <div style={{
        fontSize: '12px',
        color: 'var(--text3)',
        fontStyle: 'italic',
        marginBottom: '8px',
        lineHeight: 1.5,
      }}>
        {hint}
      </div>
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
          padding: '12px 16px',
          color: 'var(--text)',
          fontFamily: 'Crimson Pro, serif',
          fontSize: '15px',
          resize: 'vertical',
          outline: 'none',
          lineHeight: 1.65,
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--gold)'}
        onBlur={e => e.target.style.borderColor = 'var(--border2)'}
      />
    </div>
  )
}

export default function Step2Universe({ 
  initialSetting, 
  initialInstructions, 
  initialWorldChanges = '', 
  onNext, 
  onBack,
  hideInstructions = false
}: Step2UniverseProps) {
  const [setting, setSetting] = useState(initialSetting)
  const [instructions, setInstructions] = useState(initialInstructions)
  const [worldChanges, setWorldChanges] = useState(initialWorldChanges) 

  return (
    <WizardShell
      step={2}
      totalSteps={5}
      title={hideInstructions ? "WORLD DETAILS" : "THE UNIVERSE"}
      subtitle={hideInstructions ? "Review or edit the description of your campaign world settings and developments." : "Describe the world your campaign takes place in, and how you want the AI to run it."}
      onNext={() => onNext(setting.trim(), hideInstructions ? initialInstructions : instructions.trim(), worldChanges.trim())}
      onBack={onBack}
      nextDisabled={setting.trim().length === 0}
    >
      <Field
        label="WORLD & SETTING"
        hint="Describe the world, era, tone, and genre. The more detail you give, the richer the AI's responses will be."
        value={setting}
        onChange={setSetting}
        placeholder="e.g. A galaxy far, far away. Set 9 ABY during the New Republic era. The Empire has fallen but remnants still lurk. The tone is cinematic, mature, and morally complex..."
        rows={hideInstructions ? 6 : 6} 
      />
      
      {}
      {hideInstructions ? (
        <Field
          label="WORLD CHANGES & LORE DEVELOPMENTS"
          hint="This box contains the list of active global shifts, new structures, and environmental lore updates."
          value={worldChanges}
          onChange={setWorldChanges}
          placeholder="No world developments logged yet..."
          rows={6}
        />
      ) : (
        <Field
          label="DM INSTRUCTIONS"
          hint="Tell the AI how to behave as your Dungeon Master. Writing style, rules, what to avoid, pacing, how to handle combat, death, romance, etc."
          value={instructions}
          onChange={setInstructions}
          placeholder="e.g. Always write in second person present tense. Never make decisions for the player. Describe scenes vividly. Keep combat tactical and lethal. Allow consequences for every action..."
          rows={6}
        />
      )}
    </WizardShell>
  )
}