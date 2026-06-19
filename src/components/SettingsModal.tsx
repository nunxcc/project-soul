import { useState, useEffect } from 'react' 
import type { Campaign, PlayerAppearance, PlayerPersonality, PlayerPowers } from '../types'
import Step2Universe from './wizard/Step2Universe'
import Step3Appearance from './wizard/Step3Appearance'
import Step4Personality from './wizard/Step4Personality'
import Step5Powers from './wizard/Step5Powers'
import RosterManager from './RosterManager'

interface SettingsModalProps {
  campaign: Campaign
  onSave: (updated: Campaign) => void
  onClose: () => void
  initialSection?: Section 
  theme: string             
  onThemeChange: (t: string) => void 
}

type Section = 
  | 'menu' 
  | 'main-character-menu' 
  | 'campaign-details' 
  | 'instructions' 
  | 'appearance' 
  | 'personality' 
  | 'powers' 
  | 'roster'
  | 'chronicle'

type Tab = 'world' | 'characters' | 'atmosphere' | 'chronicle'

export default function SettingsModal({ campaign, onSave, onClose, initialSection = 'menu', theme, onThemeChange }: SettingsModalProps) {
  const [section, setSection] = useState<Section>(initialSection) 
  const [activeTab, setActiveTab] = useState<Tab>('world')

  
  const [newLog, setNewLog] = useState('')
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  
  useEffect(() => {
    if (initialSection === 'main-character-menu') {
      setActiveTab('characters')
    }
  }, [initialSection])

  
  const handleSaveCampaign = (setting: string, dmInstructions: string, worldChanges: string) => {
    onSave({ ...campaign, setting, dmInstructions, worldChanges })
    setSection('menu')
  }

  const handleSaveInstructions = (instructions: string) => {
    onSave({ ...campaign, dmInstructions: instructions })
    setSection('menu')
  }

  const handleSaveAppearance = (appearance: PlayerAppearance) => {
    onSave({ ...campaign, player: { ...campaign.player, appearance } })
    setSection('menu') 
  }

  const handleSavePersonality = (personality: PlayerPersonality) => {
    onSave({ ...campaign, player: { ...campaign.player, personality } })
    setSection('menu') 
  }

  const handleSavePowers = (powers: PlayerPowers) => {
    onSave({ ...campaign, player: { ...campaign.player, powers } })
    setSection('menu') 
  }

  
  if (section === 'campaign-details') {
    return (
      <FullScreenWrap onClose={() => setSection('menu')}>
        <Step2Universe 
          initialSetting={campaign.setting} 
          initialInstructions={campaign.dmInstructions} 
          initialWorldChanges={campaign.worldChanges || ''} 
          onNext={handleSaveCampaign} 
          onBack={() => setSection('menu')} 
          hideInstructions={true}
        />
      </FullScreenWrap>
    )
  }

  if (section === 'instructions') {
    return (
      <FullScreenWrap onClose={() => setSection('menu')}>
        <InstructionsEditor initialValue={campaign.dmInstructions} onSave={handleSaveInstructions} onBack={() => setSection('menu')} />
      </FullScreenWrap>
    )
  }

  if (section === 'appearance') {
    return (
      <FullScreenWrap onClose={() => setSection('menu')}>
        <Step3Appearance initialValue={campaign.player.appearance} onNext={handleSaveAppearance} onBack={() => setSection('menu')} />
      </FullScreenWrap>
    )
  }

  if (section === 'personality') {
    return (
      <FullScreenWrap onClose={() => setSection('menu')}>
        <Step4Personality initialValue={campaign.player.personality} onNext={handleSavePersonality} onBack={() => setSection('menu')} />
      </FullScreenWrap>
    )
  }

  if (section === 'powers') {
    return (
      <FullScreenWrap onClose={() => setSection('menu')}>
        <Step5Powers initialValue={campaign.player.powers} onNext={handleSavePowers} onBack={() => setSection('menu')} />
      </FullScreenWrap>
    )
  }

  if (section === 'roster') {
    return (
      <FullScreenWrap onClose={() => setSection('menu')}>
        <div style={{ height: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', padding: '40px 24px' }}>
          <div style={{ width: '100%', maxWidth: '1000px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '36px' }}>
            <RosterManager roster={campaign.roster} onSave={updated => onSave({ ...campaign, roster: updated })} onBack={() => setSection('menu')} />
          </div>
        </div>
      </FullScreenWrap>
    )
  }

  const timeline = campaign.timeline || []
  
  const handleAddTimelineFact = () => {
    if (!newLog.trim()) return
    onSave({ ...campaign, timeline: [...timeline, newLog.trim()] })
    setNewLog('')
  }

  const handleDeleteTimelineFact = (idx: number) => {
    if (!confirm('Are you sure you want to remove this fact from the timeline?')) return
    onSave({ ...campaign, timeline: timeline.filter((_, i) => i !== idx) })
  }

  const handleSaveEditedFact = (idx: number) => {
    if (!editValue.trim()) return
    onSave({ ...campaign, timeline: timeline.map((line, i) => i === idx ? editValue.trim() : line) })
    setEditIndex(null)
  }

  const handleExportCapsule = () => {
    const capsule = {
      capsuleVersion: 'soul_v1',
      campaignName: `${campaign.name} (Season 2)`, 
      setting: campaign.setting,
      dmInstructions: campaign.dmInstructions,
      player: campaign.player,
      roster: campaign.roster,
      timeline: campaign.timeline || [],
      backgrounds: campaign.backgrounds || [],
      activeBackground: campaign.activeBackground || null,
      worldChanges: campaign.worldChanges || '', 
    }
    const blob = new Blob([JSON.stringify(capsule, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `Soul_Capsule_${campaign.name.replace(/\s+/g, '_')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const backgrounds = campaign.backgrounds || []
  const activeBg = campaign.activeBackground

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        const max = 1920
        if (width > height && width > max) { height *= max / width; width = max }
        else if (height > max) { width *= max / height; height = max }
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d')?.drawImage(img, 0, 0, width, height)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6) 
        onSave({ ...campaign, backgrounds: [...backgrounds, compressedBase64], activeBackground: compressedBase64 })
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const tabStyle = (id: Tab): React.CSSProperties => ({
    width: '100%',
    padding: '16px 20px',
    background: activeTab === id ? 'var(--gold-dim)' : 'transparent',
    border: 'none',
    borderLeft: `3px solid ${activeTab === id ? 'var(--gold)' : 'transparent'}`,
    color: activeTab === id ? 'var(--gold)' : 'var(--text3)',
    fontFamily: 'Cinzel, serif',
    fontSize: '12px',
    letterSpacing: '1.5px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textShadow: activeTab === id ? '0 0 10px var(--gold-glow)' : 'none',
  })

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15, 15, 17, 0.95)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px',
    }}>
      
      {}
      <div style={{
        width: '100%', maxWidth: '1200px', height: '100%', maxHeight: '800px',
        background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 30px var(--gold-glow)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        
        {}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 36px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', color: 'var(--gold)', letterSpacing: '3px', fontWeight: 'bold' }}>
              ✦ CHRONICLE SYSTEM MENU ✦
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', fontStyle: 'italic', marginTop: '4px' }}>
              Active Chronicle: <span style={{ color: 'var(--text2)', fontWeight: 'bold' }}>{campaign.name.toUpperCase()}</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
          >✕</button>
        </div>

        {}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {}
          <div style={{ width: '250px', borderRight: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px 0' }}>
            <button style={tabStyle('world')} onClick={() => setActiveTab('world')}>⚔ CORE WORLD</button>
            <button style={tabStyle('characters')} onClick={() => setActiveTab('characters')}>👥 CHARACTERS</button>
            <button style={tabStyle('atmosphere')} onClick={() => setActiveTab('atmosphere')}>🌌 ATMOSPHERE</button>
            <button style={tabStyle('chronicle')} onClick={() => setActiveTab('chronicle')}>📜 CHRONICLE</button>
          </div>

          {}
          <div style={{ flex: 1, padding: '36px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }} className="fading-scrollbar">
            
            {}
            {activeTab === 'world' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: '14px', color: 'var(--gold)', letterSpacing: '1px', fontWeight: 'bold' }}>⚔ WORLD SETTING & LORE</span>
                    <button className="btn-primary" style={{ padding: '6px 14px' }} onClick={() => setSection('campaign-details')}>EDIT WORLD</button>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.6, background: 'var(--surface)', padding: '14px 18px', borderRadius: '8px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap', maxHeight: '180px', overflowY: 'auto' }} className="fading-scrollbar">
                    {campaign.setting}
                  </div>
                </div>

                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: '14px', color: 'var(--gold)', letterSpacing: '1px', fontWeight: 'bold' }}>📜 DUNGEON MASTER PROTOCOLS</span>
                    <button className="btn-primary" style={{ padding: '6px 14px' }} onClick={() => setSection('instructions')}>EDIT MANUAL</button>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.6 }}>
                    This specifies writing styles, combat lethality, and narrative guidelines of the AI Dungeon Master.
                  </div>
                </div>
              </div>
            )}

            {}
            {activeTab === 'characters' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', height: '100%' }}>
                
                {}
                <div style={{ ...cardStyle, justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--surface3)', border: '2px solid var(--blue)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {campaign.player.appearance.avatar ? (
                        <img src={campaign.player.appearance.avatar} alt="portrait" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontFamily: 'Cinzel, serif', color: 'var(--blue)', fontSize: '20px' }}>{campaign.player.appearance.name[0] || 'P'}</span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Cinzel, serif', fontSize: '16px', color: 'var(--text)', fontWeight: 'bold' }}>{campaign.player.appearance.name || 'UNNAMED HERO'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 600, letterSpacing: '0.5px', marginTop: '2px' }}>{campaign.player.powers.class.toUpperCase() || 'PLAYER'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'Cinzel, serif', letterSpacing: '1px' }}>CHARACTER EDITORS</div>
                    <button onClick={() => setSection('appearance')} style={{ background: 'var(--surface3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px 14px', borderRadius: 'var(--radius)', fontSize: '11px', fontFamily: 'Cinzel, serif', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
                      <span>◈ EDIT PORTRAIT & APPEARANCE</span><span>→</span>
                    </button>
                    <button onClick={() => setSection('personality')} style={{ background: 'var(--surface3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px 14px', borderRadius: 'var(--radius)', fontSize: '11px', fontFamily: 'Cinzel, serif', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
                      <span>✦ EDIT ALIGNMENT & PERSONALITY</span><span>→</span>
                    </button>
                    <button onClick={() => setSection('powers')} style={{ background: 'var(--surface3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px 14px', borderRadius: 'var(--radius)', fontSize: '11px', fontFamily: 'Cinzel, serif', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
                      <span>⚡ EDIT CLASS & SPELLS</span><span>→</span>
                    </button>
                  </div>
                </div>

                {}
                <div style={{ ...cardStyle, justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: '14px', color: 'var(--gold)', letterSpacing: '1px', fontWeight: 'bold' }}>👥 COMPANION ROSTER</div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)', fontStyle: 'italic', marginTop: '8px', lineHeight: 1.6 }}>
                      Manage, discover, and edit manual companion cards, active NPC backgrounds, and profiles compiled during your adventure.
                    </div>
                  </div>
                  <button className="btn-primary" style={{ width: '100%' }} onClick={() => setSection('roster')}>OPEN ENCYCLOPEDIA</button>
                </div>

              </div>
            )}

            {}
            {activeTab === 'atmosphere' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                <div style={cardStyle}>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: '11px', color: 'var(--text3)', letterSpacing: '2px', fontWeight: 'bold' }}>SYSTEM HUD COLOR PRESETS</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {[
                      { name: 'destiny', label: 'Destiny' },
                      { name: 'crimson', label: 'Crimson' },
                      { name: 'true-soul', label: 'True Soul' },
                      { name: 'requiem', label: 'Requiem' }
                    ].map(t => (
                      <button
                        key={t.name}
                        onClick={() => onThemeChange(t.name)}
                        style={{
                          padding: '12px 2px',
                          background: theme === t.name ? 'var(--gold-dim)' : 'var(--surface2)',
                          border: `1px solid ${theme === t.name ? 'var(--gold)' : 'var(--border)'}`,
                          borderRadius: 'var(--radius)',
                          color: theme === t.name ? 'var(--gold)' : 'var(--text3)',
                          fontFamily: 'Cinzel, serif',
                          fontSize: '10px',
                          letterSpacing: '0.5px',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          textTransform: 'uppercase',
                          fontWeight: theme === t.name ? 'bold' : 'normal'
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: '11px', color: 'var(--text3)', letterSpacing: '2px' }}>BACKGROUND WALLPAPERS</span>
                    <button className="btn-primary" style={{ padding: '6px 14px' }} onClick={() => document.getElementById('dash-bg-upload')?.click()}>+ UPLOAD BACKGROUND</button>
                    <input type="file" id="dash-bg-upload" accept="image/*" style={{ display: 'none' }} onChange={handleWallpaperUpload} />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginTop: '6px' }}>
                    <div onClick={() => onSave({ ...campaign, activeBackground: null })} style={{ aspectRatio: '16/9', background: 'var(--bg)', border: !activeBg ? '2px solid var(--gold)' : '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cinzel, serif', fontSize: '11px', color: !activeBg ? 'var(--gold)' : 'var(--text2)' }}>
                      DEFAULT BLACK
                    </div>

                    {backgrounds.map((bg, i) => (
                      <div key={i} onClick={() => onSave({ ...campaign, activeBackground: bg })} style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer', border: activeBg === bg ? '2px solid var(--gold)' : '2px solid transparent' }}>
                        <img src={bg} alt="bg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {activeBg === bg && <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'var(--gold)', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '8px', fontFamily: 'Cinzel, serif' }}>ACTIVE</div>}
                        <button onClick={(e) => {
                          e.stopPropagation()
                          const newBgs = backgrounds.filter((_, idx) => idx !== i)
                          onSave({ ...campaign, backgrounds: newBgs, activeBackground: activeBg === bg ? null : activeBg })
                        }} style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text)', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chronicle' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: '14px', color: 'var(--gold)', letterSpacing: '1px', fontWeight: 'bold' }}>📜 CANON TIMELINE LEDGER</span>
                    <button className="btn-primary" style={{ padding: '6px 14px' }} onClick={handleExportCapsule}>🌀 EXPORT CAPSULE</button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <input
                      value={newLog}
                      onChange={e => setNewLog(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddTimelineFact()}
                      placeholder="Manually add a key story fact to canon... (e.g. Barry lost his left arm)"
                      style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: '12px 16px', color: 'var(--text)', fontSize: '14px', outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border2)'}
                    />
                    <button className="btn-primary" onClick={handleAddTimelineFact}>ADD FACT</button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }} className="fading-scrollbar">
                    {timeline.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text3)', fontStyle: 'italic', padding: '20px 0' }}>The chronicle is currently empty.</div>
                    ) : (
                      timeline.map((line, i) => (
                        <div key={i} style={{ background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                          {editIndex === i ? (
                            <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                              <input value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveEditedFact(i)} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: '6px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none' }} autoFocus />
                              <button onClick={() => handleSaveEditedFact(i)} style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold)', color: 'var(--text)', padding: '4px 10px', borderRadius: '4px', fontSize: '10px' }}>SAVE</button>
                              <button onClick={() => setEditIndex(null)} style={{ background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', padding: '6px 14px', borderRadius: '4px', fontSize: '10px' }}>CANCEL</button>
                            </div>
                          ) : (
                            <>
                              <div style={{ flex: 1, fontSize: '13px', color: 'var(--text)', display: 'flex', gap: '10px' }}>
                                <span style={{ color: 'var(--gold)' }}>•</span>
                                <span>{line}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                <button onClick={() => { setEditIndex(i); setEditValue(line) }} style={{ background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer' }}>✏ EDIT</button>
                                <button onClick={() => handleDeleteTimelineFact(i)} style={{ background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text3)', padding: '4px 10px', borderRadius: 'var(--radius)', fontSize: '10px', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--red)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}>✕ REMOVE</button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}



function FullScreenWrap({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'var(--bg)', overflowY: 'auto' }}>
      <button
        onClick={onClose}
        style={{
          position: 'fixed', top: '16px', right: '20px',
          background: 'var(--surface)', border: '1px solid var(--border2)',
          color: 'var(--text2)', width: '36px', height: '36px',
          borderRadius: '50%', fontSize: '14px', cursor: 'pointer',
          zIndex: 3001, fontFamily: 'Cinzel, serif',
        }}
      >✕</button>
      {children}
    </div>
  )
}

function InstructionsEditor({ initialValue, onSave, onBack }: { initialValue: string, onSave: (v: string) => void, onBack: () => void }) {
  const [value, setValue] = useState(initialValue)
  return (
    <div style={{ height: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '640px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '36px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', color: 'var(--gold)', letterSpacing: '2px' }}>DM INSTRUCTIONS</div>
        <div style={{ fontSize: '13px', color: 'var(--text3)', fontStyle: 'italic' }}>How the AI should behave as your Dungeon Master.</div>
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={16}
          style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: '12px 16px', color: 'var(--text)', fontFamily: 'Crimson Pro, serif', fontSize: '15px', resize: 'vertical', outline: 'none', lineHeight: 1.65 }}
          onFocus={e => e.target.style.borderColor = 'var(--gold)'}
          onBlur={e => e.target.style.borderColor = 'var(--border2)'}
        />
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)', padding: '11px 24px', borderRadius: 'var(--radius)', fontFamily: 'Cinzel, serif', fontSize: '11px', cursor: 'pointer' }}>← BACK</button>
          <button onClick={() => onSave(value)} style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold)', color: 'var(--text)', padding: '11px 24px', borderRadius: 'var(--radius)', fontFamily: 'Cinzel, serif', fontSize: '11px', cursor: 'pointer' }}>SAVE →</button>
        </div>
      </div>
    </div>
  )
}