import { useState } from 'react'
import type { PlayerSoul, PlayerInventory, PlayerSkill, PlayerAppearance, InventoryItem } from '../types'
import { useNotification } from '../contexts/NotificationContext'

interface SystemMenuProps {
  activeTab: 'soul' | 'inventory'
  onChangeTab: (tab: 'soul' | 'inventory') => void
  soul: PlayerSoul
  inventory: PlayerInventory
  playerAppearance: PlayerAppearance 
  onSaveSoul: (updated: PlayerSoul) => void
  onSaveInventory: (updated: PlayerInventory) => void
  onSaveAppearance: (updated: PlayerAppearance) => void 
  onClose: () => void
}

function getItemIcon(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('helmet') || n.includes('hood') || n.includes('cap')) return '🪖'
  if (n.includes('armor') || n.includes('chest') || n.includes('shirt') || n.includes('robe') || n.includes('vest')) return '👕'
  if (n.includes('bracer') || n.includes('glove') || n.includes('hand') || n.includes('sleeve')) return '🧤'
  if (n.includes('boot') || n.includes('greave') || n.includes('shoe') || n.includes('foot')) return '🥾'
  if (n.includes('water') || n.includes('drink') || n.includes('potion') || n.includes('skin') || n.includes('flask')) return '💧'
  if (n.includes('knife') || n.includes('dagger') || n.includes('sword') || n.includes('blade') || n.includes('rapier')) return '⚔'
  if (n.includes('bow') || n.includes('quiver') || n.includes('arrow')) return '🏹'
  if (n.includes('food') || n.includes('jerky') || n.includes('meat') || n.includes('ration') || n.includes('snack')) return '🍖'
  if (n.includes('castle') || n.includes('tower') || n.includes('demacia')) return '🏰'
  if (n.includes('house') || n.includes('hut') || n.includes('cabin') || n.includes('home') || n.includes('property') || n.includes('shelter') || n.includes('deed') || n.includes('estate')) return '🏠'
  if (n.includes('scroll') || n.includes('map') || n.includes('contract') || n.includes('license')) return '📜'
  return '◈' 
}

export default function SystemMenu({ 
  activeTab, 
  onChangeTab, 
  soul, 
  inventory, 
  playerAppearance,
  onSaveSoul, 
  onSaveInventory, 
  onSaveAppearance,
  onClose 
}: SystemMenuProps) {
  const { showNotification } = useNotification() 
  const [isEditing, setIsEditing] = useState(false)
  const [soulData, setSoulData] = useState<PlayerSoul>(soul)
  const [invData, setInvData] = useState<PlayerInventory>(inventory)

  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)

  const [editingItem, setEditingItem] = useState<{
    listType: 'equipped' | 'items' | 'properties'
    index: number | null 
    name: string
    description: string
    value: number
    rank?: 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S'
    image?: string | null 
  } | null>(null)

  function updateAttr(field: keyof PlayerSoul['attributes'], val: number) {
    setSoulData(prev => ({ ...prev, attributes: { ...prev.attributes, [field]: val } }))
  }

  function handleSave() {
    onSaveSoul(soulData)
    onSaveInventory(invData)
    setIsEditing(false)
  }

  function toggleAccordion(listType: string, index: number) {
    const key = `${listType}_${index}`
    setExpandedSkill(prev => (prev === key ? null : key))
  }

  function handlePortraitUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        const max = 1200 
        if (width > height && width > max) { height *= max / width; width = max }
        else if (height > max) { width *= max / height; height = max }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6)
        onSaveAppearance({ ...playerAppearance, statusPortrait: compressedBase64 })
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  function handleItemImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        const max = 300 
        if (width > height && width > max) { height *= max / width; width = max }
        else if (height > max) { width *= max / height; height = max }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6)
        setEditingItem(prev => prev ? { ...prev, image: compressedBase64 } : null)
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  function handleSaveEditedItem() {
    if (!editingItem) return
    const { listType, index, name, description, value, rank, image } = editingItem
    if (!name.trim()) { 
      showNotification('Item name is required.', 'error') 
      return 
    }

    const updatedList = [...invData[listType]]
    const newItem: InventoryItem = {
      name: name.trim(),
      description: description.trim(),
      value: value || 0,
      image: image || null, 
      ...(rank ? { rank } : {})
    }

    if (index !== null) {
      updatedList[index] = newItem
    } else {
      updatedList.push(newItem)
    }

    const updatedInventory = { ...invData, [listType]: updatedList }
    setInvData(updatedInventory)
    onSaveInventory(updatedInventory) 
    setEditingItem(null)
  }

  function handleDeleteItem(listType: 'equipped' | 'items' | 'properties', index: number) {
    if (!confirm('Are you sure you want to permanently discard this item?')) return
    const updatedList = invData[listType].filter((_, idx) => idx !== index)
    const updatedInventory = { ...invData, [listType]: updatedList }
    setInvData(updatedInventory)
    onSaveInventory(updatedInventory)
  }

  function getRankBadgeStyle(rank: PlayerSkill['rank']): React.CSSProperties {
    let color = '#888888' 
    let glow = 'transparent'

    switch (rank) {
      case 'S':
        color = 'var(--gold)' 
        glow = '0 0 10px var(--gold)'
        break
      case 'A':
        color = '#9B80E0' 
        glow = '0 0 10px rgba(155, 128, 224, 0.4)'
        break
      case 'B':
        color = '#00D2FF' 
        glow = '0 0 10px rgba(0, 210, 255, 0.4)'
        break
      case 'C':
        color = '#10B981' 
        glow = '0 0 10px rgba(16, 185, 129, 0.4)'
        break
      case 'D':
        color = '#CCCCCC' 
        break
      case 'E':
        color = '#A88C28' 
        break
    }

    return {
      color,
      border: `1px solid ${color}`,
      boxShadow: glow,
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      fontFamily: 'monospace',
      fontWeight: 'bold',
      letterSpacing: '0.5px'
    }
  }

  function handleTextareaChange(listType: 'passives' | 'actives' | 'skills', val: string) {
    const lines = val.split('\n').filter(Boolean)
    const parsedSkills: PlayerSkill[] = lines.map(line => {
      const parts = line.split(':')
      const name = parts[0]?.trim() || 'Unknown Skill'
      const rankVal = parts[1]?.trim().toUpperCase() || 'C'
      const rank = ['F','E','D','C','B','A','S'].includes(rankVal) ? (rankVal as PlayerSkill['rank']) : 'C'
      const description = parts[2]?.trim() || 'A custom skill edited inside your character system window.'
      const manaCost = parts[3]?.trim() || undefined
      
      return { name, rank, description, manaCost }
    })
    setSoulData(prev => ({ ...prev, [listType]: parsedSkills }))
  }

  const formatSkillsToText = (list: PlayerSkill[]) =>
    list.map(s => `${s.name} : ${s.rank} : ${s.description}${s.manaCost ? ` : ${s.manaCost}` : ''}`).join('\n')

  const xpPercent = Math.min(100, Math.max(0, (soulData.xp / soulData.xpNeeded) * 100))

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(3px)',
    }}>
      {}
      <div style={{
        width: '1000px', height: '80vh',
        background: 'rgba(26, 26, 29, 0.88)', 
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        boxShadow: '0 15px 50px rgba(0,0,0,0.6), 0 0 30px var(--gold-glow)',
        padding: '36px',
        display: 'flex', flexDirection: 'column', gap: '28px',
        position: 'relative', overflow: 'hidden'
      }}>
        
        {}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => { onChangeTab('soul'); setIsEditing(false); }}
              style={{
                background: activeTab === 'soul' ? 'var(--gold-dim)' : 'transparent',
                border: `1px solid ${activeTab === 'soul' ? 'var(--gold)' : 'transparent'}`,
                color: activeTab === 'soul' ? 'var(--gold)' : 'var(--text3)',
                padding: '8px 24px', borderRadius: '20px', fontFamily: 'Cinzel, serif',
                fontSize: '12px', letterSpacing: '2px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              ✦ STATUS
            </button>
            <button 
              onClick={() => { onChangeTab('inventory'); setIsEditing(false); }}
              style={{
                background: activeTab === 'inventory' ? 'var(--gold-dim)' : 'transparent',
                border: `1px solid ${activeTab === 'inventory' ? 'var(--gold)' : 'transparent'}`,
                color: activeTab === 'inventory' ? 'var(--gold)' : 'var(--text3)',
                padding: '8px 24px', borderRadius: '20px', fontFamily: 'Cinzel, serif',
                fontSize: '12px', letterSpacing: '2px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              ◈ INVENTORY
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {activeTab === 'inventory' && (
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                alignItems: 'center', 
                fontFamily: 'Cinzel, serif', fontSize: '11px', color: 'var(--text3)', 
                letterSpacing: '1px', marginRight: '12px',
                transform: 'translateY(3.5px)', 
                height: '34px'
              }}>
                <span>CREDITS:</span>
                {!isEditing ? (
                  <span style={{ fontFamily: 'monospace', fontSize: '18px', color: '#A7F3D0', fontWeight: 'bold', textShadow: '0 0 10px rgba(16,185,129,0.3)', lineHeight: 1 }}>
                    {invData.credits.toLocaleString()} CR
                  </span>
                ) : (
                  <input 
                    type="number" 
                    value={invData.credits} 
                    onChange={e => setInvData({...invData, credits: Number(e.target.value)})}
                    style={{ width: '90px', background: 'var(--surface)', border: '1px solid var(--border)', color: '#A7F3D0', textAlign: 'right', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace', outline: 'none' }}
                  />
                )}
              </div>
            )}

            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              style={{ background: isEditing ? 'var(--gold)' : 'transparent', border: '1px solid var(--gold)', color: isEditing ? '#fff' : 'var(--gold)', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '1px' }}
            >
              {isEditing ? 'SAVE CHANGES' : '✏ EDIT MODE'}
            </button>
            <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', width: '34px', height: '34px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        </div>

        {}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }} className="fading-scrollbar">
          
          {}
          {activeTab === 'soul' && (
            <div style={{ display: 'flex', gap: '28px', height: '100%', alignItems: 'flex-start' }}>
              
              {}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: 'var(--text3)', letterSpacing: '2px' }}>CHARACTER STATUS</div>
                
                {}
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontFamily: 'Cinzel, serif' }}>
                    <div style={{ fontSize: '15px', color: 'var(--text)', fontWeight: 'bold' }}>
                      LV. {!isEditing ? soulData.level : <input type="number" value={soulData.level} onChange={e => setSoulData({...soulData, level: Number(e.target.value)})} style={{ width: '50px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--gold)', padding: '2px 4px' }} />}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', alignSelf: 'flex-end' }}>
                      XP: {!isEditing ? `${soulData.xp} / ${soulData.xpNeeded}` : (
                        <><input type="number" value={soulData.xp} onChange={e => setSoulData({...soulData, xp: Number(e.target.value)})} style={{ width: '50px' }} /> / <input type="number" value={soulData.xpNeeded} onChange={e => setSoulData({...soulData, xpNeeded: Number(e.target.value)})} style={{ width: '50px' }} /></>
                      )}
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--surface)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${xpPercent}%`, height: '100%', background: 'var(--gold)', boxShadow: '0 0 10px var(--gold)', transition: 'width 0.3s ease' }} />
                  </div>
                </div>

                {}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '11px', color: 'var(--text2)', letterSpacing: '1px' }}>CONDITION</span>
                  {!isEditing ? (
                    <span style={{ 
                      fontFamily: 'monospace', fontWeight: 'bold', fontSize: '13px',
                      color: soulData.condition.toLowerCase() === 'healthy' ? '#5a9a5a' : 
                             soulData.condition.toLowerCase() === 'critical' ? 'var(--red)' : 'var(--gold)' 
                    }}>{soulData.condition.toUpperCase()}</span>
                  ) : (
                    <input 
                      value={soulData.condition} onChange={e => setSoulData({...soulData, condition: e.target.value})}
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px', padding: '2px 6px', borderRadius: '4px', width: '90px', textAlign: 'right' }}
                    />
                  )}
                </div>

                {}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '11px', color: 'var(--text2)', letterSpacing: '1px' }}>AFFINITY</span>
                  {!isEditing ? (
                    <span style={{ fontFamily: 'monospace', color: 'var(--blue)', fontWeight: 'bold', fontSize: '13px' }}>{soulData.affinity.toUpperCase()}</span>
                  ) : (
                    <input value={soulData.affinity} onChange={e => setSoulData({...soulData, affinity: e.target.value})} style={{ width: '90px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', textAlign: 'right', padding: '2px 6px', borderRadius: '4px' }} />
                  )}
                </div>

                {}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: 'var(--text3)', letterSpacing: '2px', marginBottom: '4px' }}>CORE ATTRIBUTES</div>
                  {(['str', 'agi', 'vit', 'int', 'mana'] as const).map(attr => (
                    <div key={attr} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontFamily: 'Cinzel, serif', fontSize: '12px', color: 'var(--text2)' }}>{attr === 'mana' ? 'MANA CAPACITY' : attr.toUpperCase()}</span>
                      {!isEditing ? (
                        <span style={{ fontFamily: 'monospace', color: 'var(--gold)', fontWeight: 'bold', fontSize: '14px' }}>{soulData.attributes[attr]}</span>
                      ) : (
                        <input type="number" value={soulData.attributes[attr]} onChange={e => updateAttr(attr, Number(e.target.value))} style={{ width: '50px', background: 'var(--surface)', border: 'none', color: 'var(--text)', textAlign: 'right', fontFamily: 'monospace', padding: '2px 6px', borderRadius: '4px' }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {}
              <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px', alignSelf: 'stretch' }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: 'var(--text3)', letterSpacing: '2px', textAlign: 'center' }}>STATUS PORTRAIT</div>
                <div 
                  onClick={() => isEditing && document.getElementById('soul-portrait-upload')?.click()}
                  style={{
                    flex: 1, position: 'relative', overflow: 'hidden',
                    borderRadius: '16px', border: '1px solid var(--gold-dim)',
                    boxShadow: '0 0 20px var(--gold-glow)', cursor: isEditing ? 'pointer' : 'default',
                    background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  onMouseEnter={e => isEditing && (e.currentTarget.style.borderColor = 'var(--gold)', e.currentTarget.style.boxShadow = '0 0 30px var(--gold-glow)')}
                  onMouseLeave={e => isEditing && (e.currentTarget.style.borderColor = 'var(--gold-dim)', e.currentTarget.style.boxShadow = '0 0 20px var(--gold-glow)')}
                >
                  {playerAppearance.statusPortrait ? (
                    <img src={playerAppearance.statusPortrait} alt="portrait" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text3)', padding: '20px', textAlign: 'center' }}>
                      <span style={{ fontSize: '30px' }}>✦</span>
                      <span style={{ fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '1px' }}>STATUS PORTRAIT</span>
                      <span style={{ fontSize: '10px', color: 'var(--text3)', fontStyle: 'italic', marginTop: '4px', lineHeight: 1.4 }}>
                        Click in Edit Mode to upload a detailed full-scale artwork
                      </span>
                    </div>
                  )}

                  {isEditing && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--gold)', fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '1px'
                    }}>
                      ✦ CHANGE PHOTO ✦
                    </div>
                  )}
                  <input type="file" id="soul-portrait-upload" accept="image/*" style={{ display: 'none' }} onChange={handlePortraitUpload} />
                </div>
              </div>

              {}
              <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {(['passives', 'actives', 'skills'] as const).map(listType => {
                  const title = listType === 'passives' ? 'PASSIVE ABILITIES' : 
                                listType === 'actives' ? 'ACTIVE SPELLS & ARTS' : 'EVERYDAY CAPABILITIES'
                  
                  return (
                    <div key={listType}>
                      <div style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: 'var(--text3)', letterSpacing: '2px', marginBottom: '8px' }}>{title}</div>
                      {!isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {soulData[listType].length === 0 && <div style={{ fontSize: '12px', color: 'var(--text3)', fontStyle: 'italic' }}>None</div>}
                          {soulData[listType].map((item, i) => {
                            const isExpanded = expandedSkill === `${listType}_${i}`
                            
                            return (
                              <div 
                                key={i} 
                                onClick={() => toggleAccordion(listType, i)}
                                style={{ 
                                  cursor: 'pointer',
                                  background: 'rgba(255,255,255,0.02)', 
                                  border: '1px solid rgba(255,255,255,0.04)',
                                  borderLeft: `3px solid ${getRankBadgeStyle(item.rank).color}`, 
                                  borderRadius: '0 6px 6px 0',
                                  padding: '10px 14px',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{item.name}</span>
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span style={getRankBadgeStyle(item.rank)}>{item.rank}-RANK</span>
                                    <span style={{ fontSize: '10px', color: 'var(--text3)' }}>{isExpanded ? '▲' : '▼'}</span>
                                  </div>
                                </div>

                                {isExpanded && (
                                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text2)', fontStyle: 'italic', lineHeight: 1.5 }}>
                                      {item.description}
                                    </div>
                                    {item.manaCost && (
                                      <div style={{ fontSize: '11px', color: 'var(--blue)', fontFamily: 'monospace' }}>
                                        TRIGGER COST: {item.manaCost}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <textarea 
                          value={formatSkillsToText(soulData[listType])} 
                          onChange={e => handleTextareaChange(listType, e.target.value)}
                          placeholder={`Syntax: Name : Rank : Description : Cost (One per line)\ne.g. Force Speed : C : Run blindingly fast : 50 Mana`}
                          rows={4}
                          style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px', fontSize: '13px', borderRadius: '6px', outline: 'none', lineHeight: 1.5, resize: 'vertical' }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>

            </div>
          )}

          {}
          {activeTab === 'inventory' && (
            <div style={{ display: 'flex', gap: '28px', height: '100%', alignItems: 'stretch' }}>
              
              {}
              <div style={{ width: '290px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: 'var(--text3)', letterSpacing: '2px', height: '24px', display: 'flex', alignItems: 'center' }}>EQUIPPED</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }} className="fading-scrollbar">
                  {invData.equipped.map((item, i) => {
                    const isExpanded = expandedSkill === `eq_${i}`
                    
                    return (
                      <div 
                        key={i}
                        onClick={() => isEditing 
                          ? setEditingItem({ listType: 'equipped', index: i, name: item.name, description: item.description, value: item.value, rank: item.rank, image: item.image }) 
                          : toggleAccordion('eq', i)
                        }
                        style={{
                          background: 'var(--surface2)',
                          border: `1px solid ${isExpanded ? 'var(--gold)' : 'var(--border2)'}`,
                          borderRadius: '12px', padding: '14px', cursor: 'pointer',
                          transition: 'all 0.15s ease', position: 'relative'
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                        onMouseLeave={e => !isExpanded && (e.currentTarget.style.borderColor = 'var(--border2)')}
                      >
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                          <div style={{ width: '42px', height: '42px', background: 'var(--surface3)', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                            {item.image ? (
                              <img src={item.image} alt="custom" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                            ) : (
                              getItemIcon(item.name)
                            )}
                          </div>
                          
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                              <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                              {item.rank && <span style={getRankBadgeStyle(item.rank)}>{item.rank}</span>}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'monospace' }}>
                              <span style={{ color: 'var(--text3)' }}>MARKET VALUE:</span>
                              <span style={{ color: '#A7F3D0', fontWeight: 'bold' }}>{item.value.toLocaleString()} CR</span>
                            </div>
                          </div>
                        </div>

                        {}
                        {isExpanded && (
                          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', color: 'var(--text2)', fontStyle: 'italic', lineHeight: 1.5 }}>
                            {item.description}
                          </div>
                        )}

                        {}
                        {isEditing && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteItem('equipped', i); }}
                            style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--red)', border: 'none', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >✕</button>
                        )}
                      </div>
                    )
                  })}

                  {}
                  {isEditing && (
                    <div 
                      onClick={() => setEditingItem({ listType: 'equipped', index: null, name: '', description: '', value: 250, rank: 'C', image: null })}
                      style={{ padding: '16px', background: 'transparent', border: '2px dashed var(--border)', borderRadius: '12px', color: 'var(--text3)', textAlign: 'center', cursor: 'pointer', fontSize: '12px', fontFamily: 'Cinzel, serif' }}
                    >
                      + EQUIP NEW GEAR
                    </div>
                  )}
                </div>
              </div>

              {}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', alignSelf: 'stretch', minWidth: 0 }}>
                
                {}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}> {}
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: 'var(--text3)', letterSpacing: '2px', height: '24px', display: 'flex', alignItems: 'center' }}>BACKPACK</div>

                  {}
                  <div 
                    className="fading-scrollbar"
                    style={{ 
                      overflowY: 'auto', 
                      paddingRight: '8px', 
                      maxHeight: '260px' 
                    }} 
                  >
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: '12px',
                    }}>
                      {invData.items.map((item, i) => {
                        const isExpanded = expandedSkill === `item_${i}`
                        
                        return (
                          <div 
                            key={i}
                            onClick={() => isEditing 
                              ? setEditingItem({ listType: 'items', index: i, name: item.name, description: item.description, value: item.value, image: item.image }) 
                              : toggleAccordion('item', i)
                            }
                            style={{
                              aspectRatio: '2 / 3', background: 'var(--surface2)', 
                              border: `1px solid ${isExpanded ? 'var(--gold)' : 'var(--border2)'}`,
                              borderRadius: '10px', padding: '10px', cursor: 'pointer',
                              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                              alignItems: 'center', transition: 'all 0.15s ease', position: 'relative'
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                            onMouseLeave={e => !isExpanded && (e.currentTarget.style.borderColor = 'var(--border2)')}
                            title={`${item.name}\n${item.description}\nValue: ${item.value} CR`}
                          >
                            <div style={{ fontSize: '36px', marginTop: '10px', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {item.image ? (
                                <img src={item.image} alt="custom" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                              ) : (
                                getItemIcon(item.name)
                              )}
                            </div>
                            
                            <div style={{ width: '100%', textAlign: 'center', overflow: 'hidden' }}>
                              <div style={{ fontSize: '11px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                              <div style={{ fontSize: '9px', color: '#A7F3D0', fontFamily: 'monospace', marginTop: '2px', fontWeight: 'bold' }}>{item.value} CR</div>
                            </div>

                            {isEditing && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteItem('items', i); }}
                                style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--red)', border: 'none', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >✕</button>
                            )}
                          </div>
                        )
                      })}

                      {isEditing && (
                        <div 
                          onClick={() => setEditingItem({ listType: 'items', index: null, name: '', description: '', value: 15, image: null })}
                          style={{
                            aspectRatio: '2 / 3', border: '2px dashed var(--border)',
                            borderRadius: '10px', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '24px'
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                          +
                        </div>
                      )}

                      {Array.from({ length: Math.max(0, 10 - invData.items.length - (isEditing ? 1 : 0)) }).map((_, idx) => (
                        <div key={idx} style={{ aspectRatio: '2 / 3', border: '1px dashed rgba(255,255,255,0.03)', borderRadius: '10px', background: 'rgba(255,255,255,0.005)' }} />
                      ))}
                    </div>
                  </div>
                </div>

                {}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 }}> 
                  {}
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: 'var(--text3)', letterSpacing: '2px', height: '24px', display: 'flex', alignItems: 'center' }}>PROPERTIES & ASSETS</div>
                  
                  {}
                  <div 
                    className="fading-scrollbar"
                    style={{ 
                      overflowY: 'auto', 
                      paddingRight: '8px', 
                      maxHeight: '260px' 
                    }} 
                  >
                    {}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: '12px'
                    }}>
                      {invData.properties.map((item, i) => {
                        const isExpanded = expandedSkill === `prop_${i}`
                        
                        return (
                          <div 
                            key={i}
                            onClick={() => isEditing 
                              ? setEditingItem({ listType: 'properties', index: i, name: item.name, description: item.description, value: item.value, image: item.image }) 
                              : toggleAccordion('prop', i)
                            }
                            style={{
                              aspectRatio: '2 / 3', background: 'var(--surface2)',
                              border: `1px solid ${isExpanded ? 'var(--gold)' : 'var(--border2)'}`,
                              borderRadius: '10px', padding: '10px', cursor: 'pointer',
                              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                              alignItems: 'center', transition: 'all 0.15s ease', position: 'relative'
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                            onMouseLeave={e => !isExpanded && (e.currentTarget.style.borderColor = 'var(--border2)')}
                            title={`${item.name}\n${item.description}\nValue: ${item.value} CR`}
                          >
                            <div style={{ fontSize: '36px', marginTop: '10px', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {item.image ? (
                                <img src={item.image} alt="custom" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                              ) : (
                                getItemIcon(item.name)
                              )}
                            </div>
                            
                            <div style={{ width: '100%', textAlign: 'center', overflow: 'hidden' }}>
                              <div style={{ fontSize: '11px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                              <div style={{ fontSize: '9px', color: '#A7F3D0', fontFamily: 'monospace', marginTop: '2px', fontWeight: 'bold' }}>{item.value.toLocaleString()} CR</div>
                            </div>

                            {isEditing && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteItem('properties', i); }}
                                style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--red)', border: 'none', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >✕</button>
                            )}
                          </div>
                        )
                      })}

                      {isEditing && (
                        <div 
                          onClick={() => setEditingItem({ listType: 'properties', index: null, name: '', description: '', value: 12000, image: null })}
                          style={{
                            aspectRatio: '2 / 3', border: '2px dashed var(--border)',
                            borderRadius: '10px', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '24px'
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                          +
                        </div>
                      )}

                      {}
                      {Array.from({ length: Math.max(0, 10 - invData.properties.length - (isEditing ? 1 : 0)) }).map((_, idx) => (
                        <div key={idx} style={{ aspectRatio: '2 / 3', border: '1px dashed rgba(255,255,255,0.03)', borderRadius: '10px', background: 'rgba(255,255,255,0.005)' }} />
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      {}
      {editingItem && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border2)',
            borderRadius: '14px', padding: '26px', width: '380px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '14px', color: 'var(--gold)', letterSpacing: '1.5px', marginBottom: '16px' }}>
              {editingItem.index !== null ? 'CUSTOMIZE ITEM' : 'ADD TO SYSTEM DIRECTORY'}
            </div>

            {}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <div 
                onClick={() => document.getElementById('item-image-upload')?.click()}
                style={{
                  width: '60px', height: '60px', borderRadius: '8px',
                  background: editingItem.image ? 'transparent' : 'var(--surface2)',
                  border: '1px dashed var(--border2)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', position: 'relative'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
              >
                {editingItem.image ? (
                  <img src={editingItem.image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '18px', color: 'var(--text3)' }}>+</span>
                )}
              </div>
              <input type="file" id="item-image-upload" accept="image/*" style={{ display: 'none' }} onChange={handleItemImageUpload} />
              <div>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', color: 'var(--text2)', letterSpacing: '1px', display: 'block' }}>ITEM ARTWORK</span>
                <span style={{ fontSize: '10px', color: 'var(--text3)', fontStyle: 'italic', marginTop: '2px', display: 'block' }}>Upload a custom image for this item</span>
              </div>
            </div>

            {}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', color: 'var(--text3)', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>ITEM NAME</label>
              <input 
                value={editingItem.name} 
                onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                placeholder="e.g. Leather Helmet"
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px', color: 'var(--text)', outline: 'none' }}
              />
            </div>

            {}
            {editingItem.listType === 'equipped' && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', color: 'var(--text3)', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>ITEM RANK</label>
                <select 
                  value={editingItem.rank || 'C'}
                  onChange={e => setEditingItem({...editingItem, rank: e.target.value as PlayerSkill['rank']})}
                  style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px', color: 'var(--text)', outline: 'none', cursor: 'pointer' }}
                >
                  {['F','E','D','C','B','A','S'].map(r => <option key={r} value={r}>{r}-Rank</option>)}
                </select>
              </div>
            )}

            {}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', color: 'var(--text3)', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>LORE / DESCRIPTION</label>
              <textarea 
                value={editingItem.description} 
                onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                placeholder="Write item flavor lore..."
                rows={3}
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px', color: 'var(--text)', outline: 'none', lineHeight: 1.4, resize: 'vertical' }}
              />
            </div>

            {}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', color: 'var(--text3)', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>MARKET VALUE (CREDITS)</label>
              <input 
                type="number"
                value={editingItem.value} 
                onChange={e => setEditingItem({...editingItem, value: Number(e.target.value)})}
                placeholder="150"
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px', color: '#A7F3D0', fontFamily: 'monospace', outline: 'none' }}
              />
            </div>

            {}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setEditingItem(null)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text3)', borderRadius: '6px', fontSize: '11px', fontFamily: 'Cinzel, serif' }}>CANCEL</button>
              <button onClick={handleSaveEditedItem} style={{ flex: 1, padding: '10px', background: 'var(--gold-dim)', border: '1px solid var(--gold)', color: 'var(--text)', borderRadius: '6px', fontSize: '11px', fontFamily: 'Cinzel, serif' }}>SAVE TO SYSTEM</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}