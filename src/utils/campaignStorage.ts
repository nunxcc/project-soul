import { get, set } from 'idb-keyval'
import type { Campaign, PlayerSkill, InventoryItem } from '../types' 

const CAMPAIGNS_KEY = 'soul_campaigns'
const ACTIVE_KEY = 'soul_active_campaign'


export async function getAllCampaigns(): Promise<Campaign[]> {
  try {
    let val = await get<Campaign[]>(CAMPAIGNS_KEY)
    
    
    
    if (!val) {
      const legacyData = localStorage.getItem(CAMPAIGNS_KEY)
      if (legacyData) {
        val = JSON.parse(legacyData)
        await set(CAMPAIGNS_KEY, val) 
        console.log("Successfully migrated saves to IndexedDB!")
      } else {
        val = []
      }
    }
    
    return val || []
  } catch {
    return []
  }
}

export async function saveCampaign(campaign: Campaign): Promise<void> {
  const all = await getAllCampaigns()
  const idx = all.findIndex(c => c.id === campaign.id)
  if (idx !== -1) {
    all[idx] = { ...campaign, updatedAt: Date.now() }
  } else {
    all.push(campaign)
  }
  await set(CAMPAIGNS_KEY, all)
}

export async function deleteCampaign(id: string): Promise<void> {
  const all = await getAllCampaigns()
  const filtered = all.filter(c => c.id !== id)
  await set(CAMPAIGNS_KEY, filtered)
}


export function getActiveCampaignId(): string | null {
  return localStorage.getItem(ACTIVE_KEY)
}

export function setActiveCampaignId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id)
}

export function clearActiveCampaign(): void {
  localStorage.removeItem(ACTIVE_KEY)
}

export function makeCampaignId(): string {
  return 'campaign_' + Date.now() + '_' + Math.random().toString(36).slice(2)
}


export function buildSystemPrompt(campaign: Campaign): string {
  const p = campaign.player
  const a = p.appearance
  const pe = p.personality
  const pw = p.powers

  const timelineBlock = campaign.timeline && campaign.timeline.length > 0
    ? `\n\n═══════════════════════════════════════\nCHRONICLE TIMELINE (STORY SO FAR):\n${campaign.timeline.map(line => `• ${line}`).join('\n')}`
    : ''

  const worldChangesBlock = campaign.worldChanges
    ? `\n\n■ CURRENT WORLD CHANGES & LORE DEVELOPMENTS:\n${campaign.worldChanges}`
    : ''

  const formatSkills = (list: PlayerSkill[]) => 
    list.map(s => `${s.name} [${s.rank}-Rank] (${s.description}${s.manaCost ? `, Cost: ${s.manaCost}` : ''})`).join(', ') || 'None'

  
  const formatInventoryList = (list: InventoryItem[] | undefined) => {
    if (!list || list.length === 0) return 'None'
    return list.map(item => {
      const rankText = item.rank ? ` [${item.rank}-Rank]` : ''
      return `${item.name}${rankText} (${item.description}, Value: ${item.value} CR)`
    }).join(', ')
  }

  const soul = campaign.soul
  const soulBlock = soul
    ? `\n═══════════════════════════════════════\nPLAYER RPG CHARACTER WINDOW (SOUL SYSTEM):\n- Level: ${soul.level}\n- XP Progress: ${soul.xp} / ${soul.xpNeeded}\n- Condition: ${soul.condition}\n- Elemental/Affinity alignment: ${soul.affinity}\n- Attributes: STR:${soul.attributes.str}, AGI:${soul.attributes.agi}, VIT:${soul.attributes.vit}, INT:${soul.attributes.int}, MANA:${soul.attributes.mana}\n- Passive Abilities/Perks: ${formatSkills(soul.passives)}\n- Active Spells/Combat Arts: ${formatSkills(soul.actives)}\n- Other Skills: ${formatSkills(soul.skills)}\n- Languages Known: ${soul.languages}`
    : ''

  const inv = campaign.inventory
  const invBlock = inv
    ? `\n═══════════════════════════════════════\nPLAYER BAG & INVENTORY:\n- Credits Balance: ${inv.credits.toLocaleString()} CR\n- Equipped Weapons/Gear: ${formatInventoryList(inv.equipped)}\n- Backpack Items: ${formatInventoryList(inv.items)}\n- Owned Properties & Vehicles: ${formatInventoryList(inv.properties)}`
    : ''

  return `
${campaign.dmInstructions}

═══════════════════════════════════════
CAMPAIGN: ${campaign.name}
SETTING & WORLD:
${campaign.setting}${worldChangesBlock}${timelineBlock}${soulBlock}${invBlock}

═══════════════════════════════════════
PLAYER CHARACTER SHEET (FLAVOR BIOGRAPHY):

APPEARANCE:
- Name: ${a.name}
- Race: ${a.race}
- Gender: ${a.gender}
- Age: ${a.age}
- Height: ${a.height}
- Weight: ${a.weight}
- Eye Color: ${a.eyeColor}
- Hair: ${a.hairType}, ${a.hairColor}
- Skin: ${a.skinColor}
- Body Type: ${a.bodyType}
- Distinctive Marks: ${a.distinctiveMarks}
- Clothing Style: ${a.clothingStyle}

PERSONALITY:
- Alignment: ${pe.alignment}
- Personality Traits: ${pe.traits}
- Ideals: ${pe.ideals}
- Bonds: ${pe.bonds}
- Flaws: ${pe.flaws}
- Backstory: ${pe.backstory}
- Dark Secret: ${pe.darkSecret}

POWERS & ABILITIES:
- Class: ${pw.class}
- Subclass: ${pw.subclass}
- Weapons: ${pw.weapons}
- Powers/Spells: ${pw.powers}
- Special Ability: ${pw.specialAbility}

═══════════════════════════════════════
Always refer to the player in second person ("you"). Never break character. Never forget these details about the player character.
`.trim()
}