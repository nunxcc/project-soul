import { useState } from 'react'
import type { Campaign, PlayerAppearance, PlayerPersonality, PlayerPowers, PlayerSkill, InventoryItem } from '../../types'
import { makeCampaignId, saveCampaign, setActiveCampaignId } from '../../utils/campaignStorage'
import Step1Name from './Step1Name'
import Step2Universe from './Step2Universe'
import Step3Appearance from './Step3Appearance'
import Step4Personality from './Step4Personality'
import Step5Powers from './Step5Powers'
import { useNotification } from '../../contexts/NotificationContext'

interface CampaignWizardProps {
  onComplete: (campaign: Campaign) => void
  onCancel?: () => void 
}

const defaultAppearance: PlayerAppearance = {
  avatar: null,
  statusPortrait: null,
  name: '',
  race: '',
  gender: '',
  age: '',
  height: '',
  weight: '',
  eyeColor: '',
  hairType: '',
  hairColor: '',
  skinColor: '',
  bodyType: '',
  distinctiveMarks: '',
  clothingStyle: '',
}

const defaultPersonality: PlayerPersonality = {
  alignment: '', traits: '', ideals: '',
  bonds: '', flaws: '', backstory: '', darkSecret: '',
}

const defaultPowers: PlayerPowers = {
  class: '', subclass: '', weapons: '',
  powers: '', specialAbility: '',
}

export default function CampaignWizard({ onComplete, onCancel }: CampaignWizardProps) {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(0)
  const { showNotification } = useNotification()
  const [name, setName] = useState('')
  const [setting, setSetting] = useState('')
  const [dmInstructions, setDmInstructions] = useState('')
  const [appearance, setAppearance] = useState<PlayerAppearance>(defaultAppearance)
  const [personality, setPersonality] = useState<PlayerPersonality>(defaultPersonality)
  const [powers, setPowers] = useState<PlayerPowers>(defaultPowers)

  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null)

  function handleStep1(n: string) {
    setName(n)
    setStep(2)
  }

  function handleStep2(s: string, dm: string, _wc: string) {
    setSetting(s)
    setDmInstructions(dm)
    setStep(3)
  }

  function handleStep3(a: PlayerAppearance) {
    setAppearance(a)
    setStep(4)
  }

  function handleStep4(p: PlayerPersonality) {
    setPersonality(p)
    setStep(5)
  }

  function handleStep5(pw: PlayerPowers) {
    setPowers(pw)

    
    function parseInputToSkills(text: string): PlayerSkill[] {
      if (!text.trim()) return []
      const lines = text.split(/[\n,]/).map(line => line.trim()).filter(Boolean)
      
      return lines.map(line => {
        const parts = line.split(':')
        const name = parts[0]?.trim() || 'Unknown Skill'
        const rankVal = parts[1]?.trim().toUpperCase() || 'C'
        const rank = ['F','E','D','C','B','A','S'].includes(rankVal) ? (rankVal as PlayerSkill['rank']) : 'C'
        const description = parts[2]?.trim() || 'A starting skill selected during character creation.'
        const manaCost = parts[3]?.trim() || undefined
        
        return { name, rank, description, manaCost }
      })
    }

    
    function parseInputToInventory(text: string, isWeapon: boolean = false): InventoryItem[] {
      if (!text.trim()) return []
      const lines = text.split(/[\n,]/).map(line => line.trim()).filter(Boolean)
      
      return lines.map(line => {
        const parts = line.split(':')
        const name = parts[0]?.trim() || 'Unknown Item'
        
        if (isWeapon) {
          const rankVal = parts[1]?.trim().toUpperCase() || 'C'
          const rank = ['F','E','D','C','B','A','S'].includes(rankVal) ? (rankVal as InventoryItem['rank']) : 'C'
          const description = parts[2]?.trim() || 'A starting weapon chosen during character creation.'
          const value = parseInt(parts[3]?.trim() || '250', 10) || 250
          
          return { name, rank, description, value }
        } else {
          const description = parts[1]?.trim() || 'A starting item stored in your backpack.'
          const value = parseInt(parts[2]?.trim() || '15', 10) || 15
          
          return { name, description, value }
        }
      })
    }

    const campaign: Campaign = {
      id: makeCampaignId(),
      name,
      setting,
      dmInstructions,
      worldChanges: '', 
      timeline: [],
      player: { appearance, personality, powers: pw },
      
      
      soul: {
        condition: 'Healthy',
        level: 1,
        xp: 0,
        xpNeeded: 1000,
        affinity: appearance.race || 'None', 
        attributes: { str: 10, agi: 10, vit: 10, int: 10, mana: 100 },
        passives: parseInputToSkills(pw.specialAbility), 
        actives: parseInputToSkills(pw.powers),       
        skills: [],
        languages: 'Basic'
      },
      inventory: {
        credits: 100, 
        equipped: parseInputToInventory(pw.weapons, true), 
        items: [],
        properties: []
      },
      
      roster: [],
      history: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    saveCampaign(campaign)
    setActiveCampaignId(campaign.id)
    onComplete(campaign)
  }

  function handleImportCapsule(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string)
        
        if (!imported.player || !imported.setting) {
          showNotification('Invalid Soul Capsule file. Please upload a valid JSON exported from Project Soul.', 'error') 
          return
        }

        const newCampaign: Campaign = {
          id: makeCampaignId(),
          name: imported.campaignName || imported.name || 'Imported Chronicle',
          setting: imported.setting,
          dmInstructions: imported.dmInstructions,
          timeline: imported.timeline || [], 
          worldChanges: imported.worldChanges || '', 
          player: imported.player,
          soul: imported.soul,           
          inventory: imported.inventory, 
          roster: imported.roster || [],
          history: [], 
          backgrounds: imported.backgrounds || [],
          activeBackground: imported.activeBackground || null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        saveCampaign(newCampaign)
        setActiveCampaignId(newCampaign.id)
        onComplete(newCampaign)
      } catch (err) {
        showNotification('Failed to parse file. Make sure it is a valid JSON.', 'error') 
      }
    }
    reader.readAsText(file) 
  }

  if (step === 0) {
    return (
      <div style={{
        height: '100vh', background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          width: '100%', maxWidth: '520px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '40px', textAlign: 'center'
        }}>
          <div style={{
            fontFamily: 'Cinzel, serif', fontSize: '18px',
            color: 'var(--gold)', letterSpacing: '3px', marginBottom: '8px'
          }}>
            CHOOSE YOUR BEGINNING
          </div>
          <div style={{
            fontSize: '13px', color: 'var(--text3)',
            fontStyle: 'italic', marginBottom: '32px'
          }}>
            How shall this chronicle take form?
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
            <button
              onClick={() => setStep(1)}
              onMouseEnter={() => setHoveredBtn('fresh')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                width: '100%', padding: '16px',
                background: hoveredBtn === 'fresh' ? 'var(--gold-dim-hover)' : 'transparent', 
                border: `1px solid ${hoveredBtn === 'fresh' ? 'var(--gold)' : 'var(--border2)'}`,
                color: 'var(--text)', borderRadius: 'var(--radius)',
                fontFamily: 'Cinzel, serif', fontSize: '12px', letterSpacing: '2px',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              ⚔ START A FRESH LEGEND
            </button>

            <button
              onClick={() => document.getElementById('capsule-file-upload')?.click()}
              onMouseEnter={() => setHoveredBtn('import')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                width: '100%', padding: '16px',
                background: hoveredBtn === 'import' ? 'var(--gold-dim-hover)' : 'transparent', 
                border: `1px solid ${hoveredBtn === 'import' ? 'var(--gold)' : 'var(--border2)'}`,
                color: 'var(--text)', borderRadius: 'var(--radius)',
                fontFamily: 'Cinzel, serif', fontSize: '12px', letterSpacing: '2px',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              🌀 IMPORT SOUL CAPSULE
            </button>
            <input 
              id="capsule-file-upload" 
              type="file" 
              accept=".json" 
              style={{ display: 'none' }} 
              onChange={handleImportCapsule} 
            />

            <button
              onClick={onCancel}
              style={{
                marginTop: '16px', background: 'transparent', border: 'none',
                color: 'var(--text3)', fontFamily: 'Cinzel, serif', fontSize: '10px',
                letterSpacing: '1.5px', cursor: 'pointer', transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text2)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
            >
              ← RETURN TO MAIN MENU
            </button>
          </div>
        </div>
      </div>
    )
  }

  switch (step) {
    case 1: return (
      <Step1Name
        initialValue={name}
        onNext={handleStep1}
        onBack={() => setStep(0)} 
      />
    )
    case 2: return (
      <Step2Universe
        initialSetting={setting}
        initialInstructions={dmInstructions}
        onNext={handleStep2}
        onBack={() => setStep(1)}
      />
    )
    case 3: return (
      <Step3Appearance
        initialValue={appearance}
        onNext={handleStep3}
        onBack={() => setStep(2)}
      />
    )
    case 4: return (
      <Step4Personality
        initialValue={personality}
        onNext={handleStep4}
        onBack={() => setStep(3)}
      />
    )
    case 5: return (
      <Step5Powers
        initialValue={powers}
        onNext={handleStep5}
        onBack={() => setStep(4)}
      />
    )
    default: return null
  }
}