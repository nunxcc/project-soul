import { useState, useEffect } from 'react'
import type { Character, Message, GeminiMessage, Campaign, PlayerSoul, PlayerInventory } from './types'
import { useGemini } from './hooks/useGemini'
import { saveCampaign, setActiveCampaignId, buildSystemPrompt } from './utils/campaignStorage'
import { useNotification } from './contexts/NotificationContext'
import { 
  extractAndSaveNPCs, 
  parseAndApplyNPCUpdates, 
  parseAndApplyChronicleUpdates, 
  parseAndApplyWorldUpdates, 
  parseAndApplySystemUpdates, 
  ensureInventoryObjects 
} from './utils/systemParser'

import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import MessageList from './components/MessageList'
import InputArea from './components/InputArea'
import CharacterModal from './components/CharacterModal'
import HomeScreen from './components/HomeScreen'
import CampaignWizard from './components/wizard/CampaignWizard'
import SettingsModal from './components/SettingsModal'
import LoadCampaignModal from './components/LoadCampaignModal'
import HomeSettingsModal from './components/HomeSettingsModal' 
import SystemMenu from './components/SystemMenu' 

export default function App() {
  const { showNotification } = useNotification()

  const [screen,      setScreen]      = useState<'home' | 'wizard' | 'app'>('home')
  const [apiKey,      setApiKey]      = useState<string>(localStorage.getItem('soul_key') || '')
  const [keyInput,    setKeyInput]    = useState('')
  const [campaign,    setCampaign]    = useState<Campaign | null>(null)
  const [messages,    setMessages]    = useState<Message[]>([])
  const [geminiHist,  setGeminiHist]  = useState<GeminiMessage[]>([])
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editingChar, setEditingChar] = useState<Character | null>(null)
  const [editingIdx,  setEditingIdx]  = useState<number | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [loadModalOpen, setLoadModalOpen] = useState(false)
  const [settingsSection, setSettingsSection] = useState<'menu' | 'main-character-menu'>('menu')
  const [homeSettingsOpen, setHomeSettingsOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash-lite') 

  const [theme, setTheme] = useState<string>(localStorage.getItem('soul_theme') || 'destiny')
  const [prologueTriggered, setPrologueTriggered] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [activeSystemTab, setActiveSystemTab] = useState<'soul' | 'inventory' | null>(null)

  const { sendToGemini, loading } = useGemini()

  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('soul_theme', theme)
  }, [theme])

  
  useEffect(() => {
    if (screen === 'app' && campaign && apiKey && messages.length === 0 && prologueTriggered !== campaign.id && !loading) {
      setPrologueTriggered(campaign.id)
      handleStartCampaignPrologue(campaign)
    }
  }, [screen, campaign, apiKey, messages.length, prologueTriggered, loading])

  
  function makeId() { return Math.random().toString(36).slice(2) }

  function addMessage(role: 'user' | 'model', content: string): string {
    const id = makeId()
    setMessages(prev => [...prev, { id, role, content, timestamp: Date.now() }])
    return id
  }

  function removeMessage(id: string) {
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  function updateCampaign(updates: Partial<Campaign>) {
    setCampaign(prev => {
      if (!prev) return prev
      
      const updated = { ...prev, ...updates, updatedAt: Date.now() }
      saveCampaign(updated)
      return updated
    })
  }
 
  function rebuildGeminiHistory(msgs: Message[]): GeminiMessage[] {
    return msgs
      .filter(m => m.content !== '__typing__' && !m.content.startsWith('__system__:') && (m.role === 'user' || m.role === 'model'))
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }))
  }

  function triggerSystemNotifications(oldSoul: PlayerSoul, newSoul: PlayerSoul, oldInv: PlayerInventory, newInv: PlayerInventory) {
    if (newSoul.level > oldSoul.level) showNotification(`👑 LEVEL UP! REACHED LEVEL ${newSoul.level}! All stats increased!`, 'level')
    else if (newSoul.xp > oldSoul.xp) showNotification(`⚡ +${newSoul.xp - oldSoul.xp} XP Obtained`, 'xp')

    if (newInv.credits > oldInv.credits) showNotification(`🪙 +${newInv.credits - oldInv.credits} Credits Received`, 'credits')
    else if (newInv.credits < oldInv.credits) showNotification(`🪙 -${oldInv.credits - newInv.credits} Credits Spent`, 'credits')

    
    const oldItems = ensureInventoryObjects(oldInv.items, false)
    newInv.items.forEach(item => {
      if (!oldItems.some(o => o && o.name && o.name.toLowerCase() === item.name.toLowerCase())) {
        showNotification(`✦ Obtained: ${item.name} (Value: ${item.value} CR)`, 'item')
      }
    })
    
    
    oldItems.forEach(item => {
      if (!newInv.items.some(o => o && o.name && o.name.toLowerCase() === item.name.toLowerCase())) {
        showNotification(`✕ Discarded: ${item.name}`, 'error')
      }
    })

    
    const oldEquipped = ensureInventoryObjects(oldInv.equipped, true)
    newInv.equipped.forEach(item => {
      if (!oldEquipped.some(o => o && o.name && o.name.toLowerCase() === item.name.toLowerCase())) {
        const rankText = item.rank ? ` [${item.rank}-Rank]` : ''
        showNotification(`✦ Equipped:${rankText} ${item.name} (Value: ${item.value} CR)`, 'item')
      }
    })
    
    
    oldEquipped.forEach(item => {
      if (!newInv.equipped.some(o => o && o.name && o.name.toLowerCase() === item.name.toLowerCase())) {
        showNotification(`✕ Unequipped: ${item.name}`, 'info')
      }
    })
    
    
    const oldProperties = ensureInventoryObjects(oldInv.properties, false)
    newInv.properties.forEach(item => {
      if (!oldProperties.some(o => o && o.name && o.name.toLowerCase() === item.name.toLowerCase())) {
        showNotification(`✦ Acquired Asset: ${item.name} (Value: ${item.value} CR)`, 'item')
      }
    })
    
    
    oldProperties.forEach(item => {
      if (!newInv.properties.some(o => o && o.name && o.name.toLowerCase() === item.name.toLowerCase())) {
        showNotification(`✕ Lost Asset: ${item.name}`, 'error')
      }
    })

    
    newSoul.passives.forEach(item => {
      const oldSkill = oldSoul.passives?.find(o => o && o.name && o.name.toLowerCase() === item.name.toLowerCase())
      if (!oldSkill) showNotification(`✦ Unlocked Passive: [${item.rank}-Rank] ${item.name}`, 'skill')
      else if (item.rank !== oldSkill.rank) showNotification(`✨ Evolved Passive: ${item.name} [${oldSkill.rank}-Rank] ➔ [${item.rank}-Rank]`, 'skill')
    })
    
    newSoul.actives.forEach(item => {
      const oldSkill = oldSoul.actives?.find(o => o && o.name && o.name.toLowerCase() === item.name.toLowerCase())
      if (!oldSkill) showNotification(`✦ Unlocked Active Spell: [${item.rank}-Rank] ${item.name}`, 'skill')
      else if (item.rank !== oldSkill.rank) showNotification(`✨ Evolved Active Spell: ${item.name} [${oldSkill.rank}-Rank] ➔ [${item.rank}-Rank]`, 'skill')
    })
    
    newSoul.skills.forEach(item => {
      const oldSkill = oldSoul.skills?.find(o => o && o.name && o.name.toLowerCase() === item.name.toLowerCase())
      if (!oldSkill) showNotification(`✦ Unlocked Capability: [${item.rank}-Rank] ${item.name}`, 'skill')
      else if (item.rank !== oldSkill.rank) showNotification(`✨ Evolved Capability: ${item.name} [${oldSkill.rank}-Rank] ➔ [${item.rank}-Rank]`, 'skill')
    })
  }

  
  async function processTurn(
    promptText: string, 
    historyToUse: GeminiMessage[], 
    streamMessageId: string, 
    camp: Campaign, 
    isPrologue: boolean = false,
    modelToUse: string = selectedModel
  ) {
    const systemPrompt = buildSystemPrompt(camp)

    const { reply, error: geminiError, usage } = await sendToGemini(
      promptText, historyToUse, systemPrompt, apiKey, camp.roster, modelToUse,
      (accumulatedText) => {
        const displayContent = accumulatedText.replace(/<update[\s\S]*/gi, '').trim()
        setMessages(prev => prev.map(m => m.id === streamMessageId ? { ...m, content: displayContent } : m))
      }
    )

    if (reply) {
      const rosterAfterAutoExtraction = extractAndSaveNPCs(reply, camp.roster, camp.player.appearance.name)
      const { cleanReply: cleanAfterNpc, updatedRoster } = parseAndApplyNPCUpdates(reply, rosterAfterAutoExtraction)
      const { cleanReply: cleanAfterTimeline, updatedTimeline = [] } = parseAndApplyChronicleUpdates(cleanAfterNpc, camp.timeline || [])
      const { cleanReply: cleanAfterWorld, updatedWorldChanges } = parseAndApplyWorldUpdates(cleanAfterTimeline, camp.worldChanges || '')

      const currentSoul = camp.soul || {
        condition: 'Healthy', level: 1, xp: 0, xpNeeded: 1000, affinity: 'None',
        attributes: { str: 10, agi: 10, vit: 10, int: 10, mana: 100 }, passives: [], actives: [], skills: [], languages: 'Basic'
      }
      const currentInventory = camp.inventory || { credits: 0, equipped: [], items: [], properties: [] }

      const { cleanReply: finalCleanReply, updatedSoul, updatedInventory } = parseAndApplySystemUpdates(cleanAfterWorld, currentSoul, currentInventory)

      if (!isPrologue) {
        triggerSystemNotifications(currentSoul, updatedSoul, currentInventory, updatedInventory)
      }

      setMessages(prev => prev.map(m => m.id === streamMessageId ? { ...m, content: finalCleanReply } : m))

      const updatedHistory: GeminiMessage[] = isPrologue 
        ? [{ role: 'model', parts: [{ text: finalCleanReply }] }]
        : [...historyToUse, { role: 'user', parts: [{ text: promptText }] }, { role: 'model', parts: [{ text: finalCleanReply }] }]
      
      if (!isPrologue) setGeminiHist(updatedHistory)

      saveCampaign({
        ...camp, roster: updatedRoster, timeline: updatedTimeline, worldChanges: updatedWorldChanges,
        soul: updatedSoul, inventory: updatedInventory, history: updatedHistory, tokenUsage: usage, updatedAt: Date.now()
      })
      setCampaign(prev => prev ? {
        ...prev, roster: updatedRoster, timeline: updatedTimeline, worldChanges: updatedWorldChanges,
        soul: updatedSoul, inventory: updatedInventory, history: updatedHistory, tokenUsage: usage
      } : null)
    } else {
      removeMessage(streamMessageId)
      addMessage('model', `__system__:⚠ ${geminiError || 'Error reaching Gemini.'}`)
    }
  }

  
  async function handleStartCampaignPrologue(camp: Campaign) {
    const streamMessageId = addMessage('model', '__typing__')
    const prologuePrompt = camp.timeline && camp.timeline.length > 0
      ? "The player has imported their campaign to begin a new chapter. Write a cinematic recap of their previous adventures based on the Chronicle Timeline (Story So Far), set the immediate starting scene of this new chapter, and ask the player what they do next. Remain strictly in character as the DM/Narrator."
      : "The player has just started a brand new campaign. Write a vivid, immersive opening sequence / prologue to set the stage based on the Campaign setting, Player Character sheet, and DM instructions. Describe their starting location, their appearance, and establish the immediate atmosphere. If the setting description is very brief or barebones (e.g. only a few words), creatively invent a fitting starting scene and premise to kick off the story. End by prompting the player with their first choice or asking what they do next. Remain strictly in character as the DM/Narrator."
    
    await processTurn(prologuePrompt, [], streamMessageId, camp, true)
  }

  async function handleSend(text: string, model: string) {
    if (!campaign || loading) return
    addMessage('user', text)
    const streamMessageId = addMessage('model', '__typing__')
    await processTurn(text, geminiHist, streamMessageId, campaign, false, model)
  }

  function handleDeleteMessage(msgId: string) {
    if (!campaign) return
    const idx = messages.findIndex(m => m.id === msgId)
    if (idx === -1) return
    if (!confirm('Are you sure you want to rewind history to this point? All messages after this will be deleted.')) return

    const updatedMessages = messages.slice(0, idx)
    const updatedHist = rebuildGeminiHistory(updatedMessages)
    setMessages(updatedMessages)
    setGeminiHist(updatedHist)
    updateCampaign({ history: updatedHist })
  }

  async function handleEditMessage(msgId: string, newContent: string) {
    if (!campaign || loading) return
    const idx = messages.findIndex(m => m.id === msgId)
    if (idx === -1) return

    if (messages[idx].role === 'model') {
      const updatedMessages = messages.map(m => m.id === msgId ? { ...m, content: newContent } : m)
      const updatedHist = rebuildGeminiHistory(updatedMessages)
      setMessages(updatedMessages)
      setGeminiHist(updatedHist)
      updateCampaign({ history: updatedHist })
    } else {
      if (!confirm('Editing your past turn will delete the future and force the AI to write a brand new response. Proceed?')) return
      const truncatedMessages = [...messages.slice(0, idx), { ...messages[idx], content: newContent }]
      const truncatedHist = rebuildGeminiHistory(truncatedMessages.slice(0, idx))
      
      setMessages(truncatedMessages)
      setGeminiHist(truncatedHist)
      const streamMessageId = addMessage('model', '__typing__')
      await processTurn(newContent, truncatedHist, streamMessageId, campaign)
    }
  }

  async function handleRerunTurn() {
    if (!campaign || loading || messages.length < 2) return
    let lastPlayerIdx = -1
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') { lastPlayerIdx = i; break }
    }
    if (lastPlayerIdx === -1) return

    const lastUserText = messages[lastPlayerIdx].content
    const rewoundMessages = messages.slice(0, lastPlayerIdx + 1)
    const rewoundHist = rebuildGeminiHistory(messages.slice(0, lastPlayerIdx))

    setMessages(rewoundMessages)
    setGeminiHist(rewoundHist)
    const streamMessageId = addMessage('model', '__typing__')
    await processTurn(lastUserText, rewoundHist, streamMessageId, campaign)
  }

  
  function handleNewCampaign() { setMessages([]); setGeminiHist([]); setCampaign(null); setScreen('wizard') }
  function handleWizardComplete(newCampaign: Campaign) { setCampaign(newCampaign); setGeminiHist(newCampaign.history); setMessages([]); setScreen('app') }
  function handleLoadCampaign() { setLoadModalOpen(true) }
  function handleSelectCampaign(selected: Campaign) {
    setActiveCampaignId(selected.id); setCampaign(selected); setGeminiHist(selected.history)
    setMessages(selected.history.map((gMsg, idx) => ({
      id: 'loaded_msg_' + idx + '_' + makeId(), role: gMsg.role === 'user' ? 'user' : 'model', content: gMsg.parts[0].text, timestamp: Date.now()
    })))
    setScreen('app'); setLoadModalOpen(false)
  }
  function handleSaveChar(char: Character) {
    if (!campaign) return
    const roster = editingIdx !== null ? campaign.roster.map((c, i) => i === editingIdx ? char : c) : [...campaign.roster, char]
    updateCampaign({ roster }); closeModal()
  }
  function handleEditChar(index: number) { if (!campaign) return; setEditingChar(campaign.roster[index]); setEditingIdx(index); setModalOpen(true) }
  function handleDeleteChar(index: number) {
    if (!campaign) return
    if (!confirm(`Remove ${campaign.roster[index].name}?`)) return
    updateCampaign({ roster: campaign.roster.filter((_, i) => i !== index) })
  }
  function handleSaveApiKey() {
    if (!keyInput.trim()) { showNotification('Please enter your Gemini API key.', 'error'); return }
    localStorage.setItem('soul_key', keyInput.trim()); setApiKey(keyInput.trim())
  }
  function openModal() { setEditingChar(null); setEditingIdx(null); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditingChar(null); setEditingIdx(null) }

  
  if (screen === 'home') {
    return (
      <>
        <HomeScreen onNewCampaign={handleNewCampaign} onLoadCampaign={handleLoadCampaign} onSettings={() => setHomeSettingsOpen(true)} />
        <LoadCampaignModal open={loadModalOpen} onClose={() => setLoadModalOpen(false)} onSelectCampaign={handleSelectCampaign} />
        <HomeSettingsModal open={homeSettingsOpen} onClose={() => setHomeSettingsOpen(false)} onChangeApiKey={() => { setHomeSettingsOpen(false); setKeyInput(apiKey); setApiKey('') }} theme={theme} onThemeChange={setTheme} />
      </>
    )
  }

  if (screen === 'wizard') return <CampaignWizard onComplete={handleWizardComplete} onCancel={() => setScreen('home')} />

  if (!apiKey) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: '14px', padding: '40px 36px', width: '420px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', color: 'var(--gold)', letterSpacing: '4px', marginBottom: '6px' }}>PROJECT SOUL</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '11px', color: 'var(--text3)', letterSpacing: '2px', marginBottom: '28px' }}>✦ RPG CAMPAIGN INTERFACE ✦</div>
          <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '22px', lineHeight: 1.7 }}>Enter your Gemini API key to begin.<br />It is stored only in your browser.</p>
          <input type="password" placeholder="AIza..." value={keyInput} onChange={e => setKeyInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveApiKey()} className="input-base" style={{ marginBottom: '14px', textAlign: 'center' }} />
          <button onClick={handleSaveApiKey} className="btn-primary" style={{ width: '100%', marginBottom: '10px' }}>ENTER THE CAMPAIGN</button>
          <button onClick={() => { setApiKey(localStorage.getItem('soul_key') || ''); setScreen('home') }} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text3)', padding: '12px', borderRadius: 'var(--radius)', fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '1.5px', cursor: 'pointer' }}>← BACK</button>
        </div>
      </div>
    )
  }

  
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar
        campaignName={campaign?.name ?? 'PROJECT SOUL'}
        tokenUsage={campaign?.tokenUsage} 
        onHome={() => setScreen('home')}
        onSettings={() => { setSettingsSection('menu'); setSettingsOpen(true) }}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        sidebarOpen={sidebarOpen}
      />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {sidebarOpen && (
          <Sidebar
            player={campaign?.player ?? null} characters={campaign?.roster ?? []}
            onAddCharacter={openModal} onEditCharacter={handleEditChar} onDeleteCharacter={handleDeleteChar}
            onEditPlayer={() => { setSettingsSection('main-character-menu'); setSettingsOpen(true) }}
          />
        )}
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', background: 'var(--bg)', alignItems: 'center' }}>
          {campaign?.activeBackground && (
            <>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${campaign.activeBackground})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(26,26,29,0.7), rgba(26,26,29,0.95))', zIndex: 0, pointerEvents: 'none' }} />
            </>
          )}

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', width: '100%', maxWidth: '850px' }}>
            <MessageList 
              messages={messages} characters={campaign?.roster ?? []} player={campaign?.player ?? null}
              onDeleteMessage={handleDeleteMessage} onEditMessage={handleEditMessage} onRerunTurn={handleRerunTurn} disabled={loading}
            />
            <InputArea 
              onSend={handleSend} disabled={loading} selectedModel={selectedModel} onModelChange={setSelectedModel} 
              onOpenSoul={() => setActiveSystemTab('soul')} onOpenInventory={() => setActiveSystemTab('inventory')} 
            />
          </div>
        </div>
      </div>
      
      <CharacterModal open={modalOpen} editingCharacter={editingChar} onSave={handleSaveChar} onClose={closeModal} />
      
      {settingsOpen && campaign && (
        <SettingsModal
          campaign={campaign} initialSection={settingsSection} 
          onSave={updated => updateCampaign(updated)} onClose={() => setSettingsOpen(false)}
          theme={theme} onThemeChange={setTheme} 
        />
      )}

      {activeSystemTab && campaign?.soul && campaign?.inventory && (
        <SystemMenu 
          activeTab={activeSystemTab} onChangeTab={setActiveSystemTab} soul={campaign.soul}
          inventory={{
            ...campaign.inventory,
            equipped: ensureInventoryObjects(campaign.inventory.equipped, true),
            items: ensureInventoryObjects(campaign.inventory.items, false),
            properties: ensureInventoryObjects(campaign.inventory.properties, false)
          }}
          playerAppearance={campaign.player.appearance}
          onSaveAppearance={(updatedApp) => updateCampaign({ player: { ...campaign.player, appearance: updatedApp } })}
          onSaveSoul={(updatedSoul: PlayerSoul) => updateCampaign({ soul: updatedSoul })}
          onSaveInventory={(updatedInv: PlayerInventory) => updateCampaign({ inventory: updatedInv })}
          onClose={() => setActiveSystemTab(null)}
        />
      )}
    </div>
  )
}