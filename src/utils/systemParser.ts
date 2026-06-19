import { parseReply } from './parseReply'
import type { Character, MessageBlock, PlayerSoul, PlayerInventory, PlayerSkill, InventoryItem } from '../types'

export function ensureSkillObjects(list: any[] | undefined): PlayerSkill[] {
  if (!list) return []
  return list.map(item => {
    if (typeof item === 'string') {
      return {
        name: item,
        rank: 'C',
        description: 'A legacy starting capability of your character.'
      }
    }
    return item as PlayerSkill
  })
}

export function ensureInventoryObjects(list: any[] | undefined, isWeapon: boolean = false): InventoryItem[] {
  if (!list) return []
  return list.map(item => {
    if (typeof item === 'string') {
      const isProperty = item.toLowerCase().includes('house') || item.toLowerCase().includes('hut') || 
                         item.toLowerCase().includes('cabin') || item.toLowerCase().includes('home') || 
                         item.toLowerCase().includes('property') || item.toLowerCase().includes('shelter')
      
      return {
        name: item,
        description: isWeapon ? 'A starting weapon of your character.' : 
                     isProperty ? 'A structural asset or property.' : 'An item stored inside your backpack.',
        value: isWeapon ? 250 : isProperty ? 15000 : 15,
        rank: isWeapon ? 'C' : undefined
      }
    }
    return item as InventoryItem
  })
}

export function getKeywordOverlapRatio(str1: string, str2: string): number {
  const stopWords = new Set([
    'and', 'the', 'with', 'for', 'this', 'that', 'from', 'gaze', 'eyes', 
    'wearing', 'wears', 'wore', 'establishment', 'himself', 'herself', 'itself'
  ])
  
  const clean = (s: string) => s
    .toLowerCase()
    .replace(/[•.,\/#!$%\^&\*;:{}=\-_`~()■]/g, "") 
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word)) 

  const w1 = clean(str1)
  const w2 = clean(str2)

  if (w1.length === 0 || w2.length === 0) return 0

  const set1 = new Set(w1)
  const intersection = w2.filter(w => set1.has(w))
  const minLen = Math.min(w1.length, w2.length)
  
  return intersection.length / minLen 
}

export function extractAndSaveNPCs(reply: string, currentRoster: Character[], playerName: string = ''): Character[] {
  const blocks = parseReply(reply)
  const newNpcs: Character[] = []
  const COLORS = ['#C3073F', '#4a7abf', '#5a9a5a', '#9a5abf', '#bf7a3a', '#3abfbf', '#bf7a3a', '#c9a84c']

  blocks.forEach((b: MessageBlock) => {
    if (b.type === 'character' && b.name) {
      const nameClean = b.name.trim()
      const nameLower = nameClean.toLowerCase()
      
      const existsInRoster = currentRoster.some(c => c.name.toLowerCase().trim() === nameLower)
      const isPlayer = playerName.toLowerCase().trim() === nameLower
      const isStaged = newNpcs.some(c => c.name.toLowerCase().trim() === nameLower)

      if (!existsInRoster && !isPlayer && !isStaged) {
        const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)]
        newNpcs.push({
          id: 'char_auto_' + Date.now() + '_' + Math.random().toString(36).slice(2),
          name: nameClean,
          role: 'Discovered NPC',
          color: randomColor,
          avatar: null,
          appearance: '',
          personality: '',
          powers: '',
          backstory: ''
        })
      }
    }
  })

  return [...currentRoster, ...newNpcs]
}

export function parseAndApplyNPCUpdates(reply: string, currentRoster: Character[]): { cleanReply: string; updatedRoster: Character[] } {
  let cleanReply = reply
  let rosterCopy = [...currentRoster]

  const regex = /<update_npc>\s*([^:]+)\s*:\s*([^:]+)\s*:\s*([\s\S]*?)\s*<\/update_npc>/gi
  
  let match
  while ((match = regex.exec(reply)) !== null) {
    const npcName = match[1].trim().toLowerCase()
    const field = match[2].trim().toLowerCase() as 'appearance' | 'personality' | 'powers' | 'backstory'
    const newValue = match[3].trim()

    const npcIdx = rosterCopy.findIndex(c => c.name.toLowerCase().trim() === npcName)
    if (npcIdx !== -1 && ['appearance', 'personality', 'powers', 'backstory'].includes(field)) {
      const currentVal = rosterCopy[npcIdx][field] || ''
      
      const existingLines = currentVal
        .split('\n')
        .map(line => line.replace('•', '').trim())
        .filter(Boolean)
      
      const isDuplicate = existingLines.some(line => {
        const overlap = getKeywordOverlapRatio(line, newValue)
        return overlap >= 0.5 
      })

      if (!isDuplicate && !currentVal.toLowerCase().includes(newValue.toLowerCase())) {
        const joinedVal = currentVal 
          ? `${currentVal}\n• ${newValue}` 
          : `• ${newValue}`
        
        rosterCopy[npcIdx] = {
          ...rosterCopy[npcIdx],
          [field]: joinedVal
        }
      }
    }
  }

  cleanReply = reply.replace(/<update_npc>[\s\S]*?<\/update_npc>/gi, '').trim()

  return { cleanReply, updatedRoster: rosterCopy }
}

export function parseAndApplyChronicleUpdates(reply: string, currentTimeline: string[]): { cleanReply: string; updatedTimeline: string[] } {
  let cleanReply = reply
  const timelineCopy = [...currentTimeline]

  const regex = /<update_chronicle>\s*([\s\S]*?)\s*<\/update_chronicle>/gi
  let match
  while ((match = regex.exec(reply)) !== null) {
    const newValue = match[1].trim()

    const isDuplicate = timelineCopy.some(item => {
      const overlap = getKeywordOverlapRatio(item, newValue)
      return overlap >= 0.75 
    })

    if (!isDuplicate && !timelineCopy.includes(newValue)) {
      timelineCopy.push(newValue)
    }
  }

  cleanReply = reply.replace(/<update_chronicle>[\s\S]*?<\/update_chronicle>/gi, '').trim()

  return { cleanReply, updatedTimeline: timelineCopy }
}

export function parseAndApplyWorldUpdates(reply: string, currentWorldChanges: string): { cleanReply: string; updatedWorldChanges: string } {
  let cleanReply = reply
  let worldChangesCopy = currentWorldChanges

  const regex = /<update_world>\s*([\s\S]*?)\s*<\/update_world>/gi
  let match
  while ((match = regex.exec(reply)) !== null) {
    const newValue = match[1].trim()

    const existingLines = worldChangesCopy.split('\n').map(line => line.replace(/[•■]/g, '').trim()).filter(Boolean)
    const isDuplicate = existingLines.some(line => {
      const overlap = getKeywordOverlapRatio(line, newValue)
      return overlap >= 0.75
    })

    if (!isDuplicate && !worldChangesCopy.toLowerCase().includes(newValue.toLowerCase())) {
      if (worldChangesCopy) {
        worldChangesCopy += `\n• ${newValue}`
      } else {
        worldChangesCopy = `• ${newValue}`
      }
    }
  }

  cleanReply = reply.replace(/<update_world>[\s\S]*?<\/update_world>/gi, '').trim()
  return { cleanReply, updatedWorldChanges: worldChangesCopy }
  }

export function parseAndApplySystemUpdates(
  reply: string,
  currentSoul: PlayerSoul,
  currentInventory: PlayerInventory
): { cleanReply: string; updatedSoul: PlayerSoul; updatedInventory: PlayerInventory } {
  let cleanReply = reply
  
  const soul = { 
    ...currentSoul, 
    attributes: { ...currentSoul.attributes }, 
    passives: ensureSkillObjects(currentSoul.passives), 
    actives: ensureSkillObjects(currentSoul.actives), 
    skills: ensureSkillObjects(currentSoul.skills) 
  }
  const inv = { 
    ...currentInventory, 
    equipped: ensureInventoryObjects(currentInventory.equipped, true), 
    items: ensureInventoryObjects(currentInventory.items, false), 
    properties: ensureInventoryObjects(currentInventory.properties, false) 
  }

  function modifyInventoryList(list: InventoryItem[], text: string, isWeapon: boolean = false) {
    let clean = text.trim()
    let isRemove = false

    if (clean.startsWith('+')) {
      clean = clean.slice(1).trim()
    } else if (clean.startsWith('-')) {
      isRemove = true
      clean = clean.slice(1).trim()
    }

    clean = clean.replace(/^['"]|['"]$/g, '')
    clean = clean.replace(/\.$/, '')
    clean = clean.trim()

    if (!clean) return

    const parts = clean.split(':')
    const rawName = parts[0]?.trim() || 'Unknown Item'
    if (!rawName) return

    let cleanName = rawName
    let rankOverride: string | null = null
    
    if (isWeapon) {
      const rankRegex = /[\s[((]+([SABCDEF])[- ]?Rank[\]\)]*/i
      const rankMatch = cleanName.match(rankRegex)
      if (rankMatch) {
        rankOverride = rankMatch[1].toUpperCase()
        cleanName = cleanName.replace(rankRegex, '').trim()
      }
    }

    const nameLower = cleanName.toLowerCase()
    const existingIdx = list.findIndex(item => item && item.name && item.name.toLowerCase() === nameLower)

    if (isRemove) {
      if (existingIdx !== -1) {
        list.splice(existingIdx, 1)
      }
    } else {
      let item: InventoryItem;

      if (isWeapon) {
        const rankVal = rankOverride || parts[1]?.trim().toUpperCase() || 'C'
        const rank = ['F','E','D','C','B','A','S'].includes(rankVal) ? (rankVal as InventoryItem['rank']) : 'C'
        const description = parts[2]?.trim().replace(/^['"]|['"]$/g, '').trim() || 
                            (existingIdx !== -1 ? list[existingIdx].description : 'A weapon acquired during your adventures.')
        const value = parseInt(parts[3]?.trim() || '250', 10) || (existingIdx !== -1 ? list[existingIdx].value : 250)

        item = { name: cleanName, rank, description, value }
      } else {
        const description = parts[1]?.trim().replace(/^['"]|['"]$/g, '').trim() || 
                            (existingIdx !== -1 ? list[existingIdx].description : 'An item acquired during your adventures.')
        const value = parseInt(parts[2]?.trim() || '15', 10) || (existingIdx !== -1 ? list[existingIdx].value : 15)

        item = { name: cleanName, description, value }
      }

      if (existingIdx === -1) {
        list.push(item)
      } else {
        list[existingIdx] = item
      }
    }
  }

  function modifySkillList(list: PlayerSkill[], text: string) {
    let clean = text.trim()
    let isRemove = false

    if (clean.startsWith('+')) {
      clean = clean.slice(1).trim()
    } else if (clean.startsWith('-')) {
      isRemove = true
      clean = clean.slice(1).trim()
    }

    clean = clean.replace(/^['"]|['"]$/g, '')
    clean = clean.replace(/\.$/, '')
    clean = clean.trim()

    if (!clean) return

    const parts = clean.split(':')
    const rawName = parts[0]?.trim() || 'Unknown Skill'
    if (!rawName) return

    let cleanName = rawName
    let rankOverride: string | null = null
    
    const rankRegex = /\s*[\[\(]?([SABCDEF])[- ]?Rank[\]\)]*/i
    const rankMatch = cleanName.match(rankRegex)
    
    if (rankMatch) {
      rankOverride = rankMatch[1].toUpperCase()
      cleanName = cleanName.replace(rankRegex, '').trim()
    }

    const nameLower = cleanName.toLowerCase()
    const existingIdx = list.findIndex(item => item && item.name && item.name.toLowerCase() === nameLower)

    if (isRemove) {
      if (existingIdx !== -1) {
        list.splice(existingIdx, 1)
      }
    } else {
      const rankVal = rankOverride || parts[1]?.trim().toUpperCase() || 'C'
      const rank = ['F','E','D','C','B','A','S'].includes(rankVal) ? (rankVal as PlayerSkill['rank']) : 'C'
      const description = parts[2]?.trim().replace(/^['"]|['"]$/g, '').trim() || 
                          (existingIdx !== -1 ? list[existingIdx].description : 'An ability discovered during your adventures.')
      const manaCost = parts[3]?.trim() || (existingIdx !== -1 ? list[existingIdx].manaCost : undefined)

      const newSkill: PlayerSkill = { name: cleanName, rank, description, manaCost }

      if (existingIdx === -1) {
        list.push(newSkill)
      } else {
        list[existingIdx] = newSkill
      }
    }
  }

  
  const xpRegex = /<update_xp>\s*([+-]\d+)\s*<\/update_xp>/gi
  let match
  while ((match = xpRegex.exec(reply)) !== null) {
    const amount = parseInt(match[1], 10)
    if (!isNaN(amount)) {
      let newXp = soul.xp + amount
      let newLevel = soul.level
      let newXpNeeded = soul.xpNeeded
      
      while (newXp >= newXpNeeded) {
        newXp -= newXpNeeded
        newLevel += 1
        newXpNeeded = Math.floor(newXpNeeded * 1.35) 
        
        soul.attributes.str += 2
        soul.attributes.agi += 2
        soul.attributes.vit += 2
        soul.attributes.int += 2
        soul.attributes.mana += 10
      }
      soul.xp = Math.max(0, newXp)
      soul.level = newLevel
      soul.xpNeeded = newXpNeeded
    }
  }

  
  const creditsRegex = /<update_credits>\s*([+-]?\d+)\s*<\/update_credits>/gi
  while ((match = creditsRegex.exec(reply)) !== null) {
    const amount = parseInt(match[1], 10)
    if (!isNaN(amount)) {
      inv.credits = Math.max(0, inv.credits + amount)
    }
  }

  
  const condRegex = /<update_condition>\s*(Healthy|Injured|Critical|Exhausted|Unconscious)\s*<\/update_condition>/gi
  while ((match = condRegex.exec(reply)) !== null) {
    soul.condition = match[1].trim()
  }

  
  const itemsRegex = /<update_items>\s*([\s\S]*?)\s*<\/update_items>/gi
  while ((match = itemsRegex.exec(reply)) !== null) {
    
    const subParts = match[1].split('\n').map(x => x.trim()).filter(Boolean)
    subParts.forEach(part => modifyInventoryList(inv.items, part, false))
  }

  
  const equippedRegex = /<update_equipped>\s*([\s\S]*?)\s*<\/update_equipped>/gi
  while ((match = equippedRegex.exec(reply)) !== null) {
    
    const subParts = match[1].split('\n').map(x => x.trim()).filter(Boolean)
    subParts.forEach(part => modifyInventoryList(inv.equipped, part, true))
  }

  
  const propRegex = /<update_properties>\s*([\s\S]*?)\s*<\/update_properties>/gi
  while ((match = propRegex.exec(reply)) !== null) {
    
    const subParts = match[1].split('\n').map(x => x.trim()).filter(Boolean)
    subParts.forEach(part => modifyInventoryList(inv.properties, part, false))
  }

  
  const passivesRegex = /<update_passives>\s*([\s\S]*?)\s*<\/update_passives>/gi
  while ((match = passivesRegex.exec(reply)) !== null) {
    const subParts = match[1].split('\n').map(x => x.trim()).filter(Boolean)
    subParts.forEach(part => modifySkillList(soul.passives, part))
  }

  
  const activesRegex = /<update_actives>\s*([\s\S]*?)\s*<\/update_actives>/gi
  while ((match = activesRegex.exec(reply)) !== null) {
    const subParts = match[1].split('\n').map(x => x.trim()).filter(Boolean)
    subParts.forEach(part => modifySkillList(soul.actives, part))
  }

  
  const skillsRegex = /<update_skills>\s*([\s\S]*?)\s*<\/update_skills>/gi
  while ((match = skillsRegex.exec(reply)) !== null) {
    const subParts = match[1].split('\n').map(x => x.trim()).filter(Boolean)
    subParts.forEach(part => modifySkillList(soul.skills, part))
  }

  cleanReply = reply
    .replace(/<update_xp>[\s\S]*?<\/update_xp>/gi, '')
    .replace(/<update_credits>[\s\S]*?<\/update_credits>/gi, '')
    .replace(/<update_condition>[\s\S]*?<\/update_condition>/gi, '')
    .replace(/<update_items>[\s\S]*?<\/update_items>/gi, '')
    .replace(/<update_equipped>[\s\S]*?<\/update_equipped>/gi, '')
    .replace(/<update_properties>[\s\S]*?<\/update_properties>/gi, '')
    .replace(/<update_passives>[\s\S]*?<\/update_passives>/gi, '')
    .replace(/<update_actives>[\s\S]*?<\/update_actives>/gi, '')
    .replace(/<update_skills>[\s\S]*?<\/update_skills>/gi, '')
    .trim()

  return { cleanReply, updatedSoul: soul, updatedInventory: inv }
}