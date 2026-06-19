import React from 'react'

interface WizardShellProps {
  step: number
  totalSteps: number
  title: string
  subtitle?: string
  children: React.ReactNode
  onNext: () => void
  onBack?: () => void
  nextLabel?: string
  nextDisabled?: boolean
}

export default function WizardShell({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel = 'CONTINUE',
  nextDisabled = false,
}: WizardShellProps) {
  return (
    <div style={{
      height: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflowY: 'auto',
      padding: '40px 24px',
    }}>

      {}
      <div style={{ width: '100%', maxWidth: '640px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '2px',
                background: i < step ? 'var(--gold)' : 'var(--border)',
                marginRight: i < totalSteps - 1 ? '4px' : '0',
                transition: 'background 0.3s',
                borderRadius: '2px',
              }}
            />
          ))}
        </div>
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '10px',
          color: 'var(--text3)',
          letterSpacing: '2px',
          textAlign: 'right',
        }}>
          STEP {step} OF {totalSteps}
        </div>
      </div>

      {}
      <div style={{
        width: '100%',
        maxWidth: '640px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '36px',
        marginBottom: '24px',
      }}>
        {}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '22px',
            color: 'var(--gold)',
            letterSpacing: '3px',
            marginBottom: '8px',
          }}>
            {title}
          </div>
          {subtitle && (
            <div style={{
              fontSize: '14px',
              color: 'var(--text2)',
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}>
              {subtitle}
            </div>
          )}
          <div style={{
            width: '60px',
            height: '1px',
            background: 'linear-gradient(to right, var(--gold), transparent)',
            marginTop: '14px',
          }} />
        </div>

        {}
        {children}
      </div>

      {}
      <div style={{
        width: '100%',
        maxWidth: '640px',
        display: 'flex',
        gap: '12px',
        justifyContent: onBack ? 'space-between' : 'flex-end',
      }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: '1px solid var(--border2)',
              color: 'var(--text2)',
              padding: '12px 28px',
              borderRadius: 'var(--radius)',
              fontFamily: 'Cinzel, serif',
              fontSize: '11px',
              letterSpacing: '1.5px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ← BACK
          </button>
        )}
      <button
          onClick={onNext}
          disabled={nextDisabled}
          style={{
            background: nextDisabled ? 'transparent' : 'var(--gold-dim)',
            border: `1px solid ${nextDisabled ? 'var(--border)' : 'var(--gold)'}`,
            
            
            color: nextDisabled ? 'var(--text3)' : 'var(--text)', 
            
            padding: '12px 28px',
            borderRadius: 'var(--radius)',
            fontFamily: 'Cinzel, serif',
            fontSize: '11px',
            letterSpacing: '1.5px',
            cursor: nextDisabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {nextLabel} →
        </button>
      </div>
    </div>
  )
}