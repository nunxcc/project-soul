import { useState } from 'react'
import type { GeminiMessage } from '../types'

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

function getUrl(model: string): string {
  return `${GEMINI_BASE}/${model}:streamGenerateContent`
}

const FORMAT_RULE = `

---
ADDITIONAL FORMAT INSTRUCTIONS: 
1. DIALOGUE FORMAT: When you write dialogue spoken by a named character, prefix that line with [CHARACTER_NAME]: before their words. For example: [Ezra]: "I have a bad feeling about this." This applies only to direct character dialogue. Everything else — narration, descriptions, actions, answers to questions, DM responses — should be written normally with no prefix.

2. AUTOMATIC CODEX UPDATES: Whenever an NPC character's details (physical appearance, core personality traits, powers/weapons, or backstory/biography) are introduced, changed, or revealed in the story, you must append a hidden update block at the absolute end of your response on a new line using this exact format:
<update_npc>NPC_NAME:FIELD:NEW_CONCISE_DETAIL</update_npc>
The field must be exactly one of these: "appearance", "personality", "powers", or "backstory".
The detail must be extremely concise and factual (under 12 words). You can write multiple tags if multiple details are revealed. For example:
<update_npc>Barry:powers:Equipped with a heavy blaster.</update_npc>
<update_npc>Barry:personality:Exhibits paranoid anxiety.</update_npc>
CRITICAL: Only output an update if the fact is BRAND NEW and has never been mentioned or established before in the story. Do not repeat visual descriptions or personality traits.

3. AUTOMATIC CHRONICLE TIMELINE LOGS: Whenever a significant plot point occurs, an important discovery is made, a physical injury is sustained, a status change occurs, or a relationship dynamic shifts, you must append a hidden timeline block at the absolute end of your response on a new line using this exact format:
<update_chronicle>NEW_CONCISE_CHRONICLE_FACT</update_chronicle>
This fact must be extremely concise, factual, and chronological (under 15 words). For example:
<update_chronicle>Barry's left arm was severed by a lightsaber during combat.</update_chronicle>
<update_chronicle>Ezra and Hera confessed their feelings for each other.</update_chronicle>
<update_chronicle>Discovered the secret tracking beacon hidden inside Ezra's boot.</update_chronicle>
CRITICAL: Only output a chronicle update for completely new, newly-revealed events. Keep the tags at the very end of your output, separated from your main story text.

4. AUTOMATIC WORLD DETAILS UPDATES: Whenever a significant change to the world, locations, factions, environment, or global lore occurs (e.g. a planet gets blockaded, a faction gains power, a city is ruined, a base is established, or historical lore is uncovered), you must append a hidden world update block at the absolute end of your response on a new line using this exact format:
<update_world>NEW_CONCISE_WORLD_DETAIL</update_world>
The detail must be extremely concise and factual (under 15 words). For example:
<update_world>The planet Lothal is blockaded by Imperial remnants.</update_world>
<update_world>The Crimson Dawn syndicate controls Sector 4.</update_world>
<update_world>A safehouse has been established in the undercity sewers.</update_world>
CRITICAL: Only output an update if the world change or lore discovery is completely new and has never been established or logged before. Keep the tags at the very end of your output, separated from your main story text.

5. SYSTEM ADMIN UPDATES: You are also the System Administrator for this RPG. Whenever the player gains XP, levels up, undergoes a condition change, gains/loses money, or acquires/loses/equips/unequips/discards/consumes an item, active weapon, or skill/ability, you must append an update block at the absolute end of your response on a new line using these exact formats:
- To adjust XP: <update_xp>+AMOUNT</update_xp> or <update_xp>-AMOUNT</update_xp> (e.g., <update_xp>+250</update_xp>)
- To adjust Credits: <update_credits>+AMOUNT</update_credits> or <update_credits>-AMOUNT</update_credits> (e.g., <update_credits>+50</update_credits> or <update_credits>-100</update_credits>)
- To change active Condition: <update_condition>NEW_STATUS</update_condition> (Healthy, Injured, Critical, Exhausted, Unconscious)

- To add items to backpack: <update_items>+item_name : description : value</update_items> (e.g. <update_items>+Waterskin : A leather skin holding 2L of water. : 15</update_items>)
- To remove items from backpack: <update_items>-item_name</update_items> (e.g. <update_items>-Waterskin</update_items>)

- To add/equip gear/weapons: <update_equipped>+gear_name : rank : description : value</update_equipped> (e.g. <update_equipped>+Leather Armor : C : Lightweight protection. : 450</update_equipped>)
- To remove/unequip gear/weapons: <update_equipped>-gear_name</update_equipped> (e.g. <update_equipped>-Leather Armor</update_equipped>)

- To add properties/assets/vehicles: <update_properties>+property_name : description : value</update_properties> (e.g. <update_properties>+Freljord Hut : A secure wood cabin. : 15000</update_properties>)
- To remove properties/assets/vehicles: <update_properties>-property_name</update_properties> (e.g. <update_properties>-Freljord Hut</update_properties>)

- To add passive skills: <update_passives>+ability_name : rank : description</update_passives> (e.g. <update_passives>+Running Proficiency : B : Heightened stamina</update_passives>)
- To remove passive skills: <update_passives>-ability_name</update_passives> (e.g. <update_passives>-Running Proficiency</update_passives>)

- To add active skills: <update_actives>+skill_name : rank : description : cost</update_actives> (e.g. <update_actives>+Force Push : C : Emit telekinetic kinetic shockwave. : 50 Mana</update_actives>)
- To remove active skills: <update_actives>-skill_name</update_actives> (e.g. <update_actives>-Force Push</update_actives>)

- To add everyday skills: <update_skills>+skill_name : rank : description</update_skills>
- To remove everyday skills: <update_skills>-skill_name</update_skills>

CRITICAL SYNCHRONIZATION DIRECTIVE: You MUST keep the character's active inventory, backpack, and equipped gear fully synchronized with the story. 
1. If the player "equips" an item currently in their backpack, you must emit BOTH:
   - <update_items>-Item Name</update_items>
   - <update_equipped>+Item Name : rank : description : value</update_equipped>
2. If the player "unequips" an active weapon or armor but keeps it, you must emit BOTH:
   - <update_equipped>-Item Name</update_equipped>
   - <update_items>+Item Name : description : value</update_items>
3. If the player "discards" or "drops" an item entirely, you must emit:
   - <update_items>-Item Name</update_items> or <update_equipped>-Item Name</update_equipped>

CRITICAL IMPLICIT ACTIONS & COLLECTIVE PRONOUNS DIRECTIVE: If the player says "I take off my armor" or "I strip bare" or "I unequip everything leaving them behind", you MUST remove ALL associated equipped pieces. For example, if they have multiple items equipped, and say "I unequip everything and leave them behind", you must emit removal tags for ALL of them separated by commas or newlines:
- <update_equipped>-Worn Robe, -Leather Helmet, -Rusty Sword</update_equipped>
Do not leave matching accessories or weapons equipped if they have shed everything.

RECREATION & ENVIRONMENTAL FINDING DIRECTIVE: If the player picks up, retrieves, equips, buys, or finds an item that is NOT currently listed in their backpack or equipped gear (such as picking up armor they previously dropped on the floor, finding a sword in a chest, or receiving a gift), you MUST creatively manifest/recreate that item using the '+' tag (e.g. <update_equipped>+Leather Armor : C : Protective leather cuirass. : 250</update_equipped>). Do not let items get lost or fail to equip just because they aren't on their active sheet.

GROUPING SYNTAX NOTE: You are fully allowed to group multiple additions/removals of the same type inside a single tag by separating them with newlines or commas. For example:
<update_equipped>
-Worn Robe
-Leather Helmet
-Rusty Sword
</update_equipped>

CRITICAL ITEM CONSOLIDATION & SIMPLICITY DIRECTIVE: When generating '+' tags to add items, you MUST consolidate items into distinct, logical, unified pieces. Never emit duplicate, redundant, or overlapping items for a single action, and never break a single armor set down into redundant separate pieces (e.g., do NOT emit separate tags for "metal armor", "polished metal armor", and "part of the metal armor set." Just emit a single "Metal Armor" item). 
Always adhere to these naming rules:
1. Keep names brief, clean, and capitalize them properly (e.g., "Steel Longsword", "Chainmail Coif").
2. NEVER include trailing periods, quotes, or trailing punctuation inside the item names themselves (e.g., write "Dark Robe", NOT "dark robe.").
3. Never add multiple overlapping variations of the same equipment in one turn.

CRITICAL VALUATION DIRECTIVE: Treat 1 Credit (1 CR) as exactly 1.00 Euro in value. All prices must reflect realistic modern pricing (e.g. a meal is 10 CR, a weapon is 150 CR to 500 CR, and properties/structures are valued realistically from 15,000 CR to 250,000 CR). Strip all outer quotes and ending periods from your tag contents. Keep the tags at the very end of your output, separated from your main story text.`

const DEFAULT_SYSTEM = `You are the Dungeon Master for an immersive text RPG. You control all NPCs and characters in the campaign. When the player addresses or interacts with a character, you respond AS that character in first person, prefixing their dialogue with [CHARACTER_NAME]: exactly. You are never an AI assistant — you are always the DM or the character being spoken to. Be vivid, immersive, and stay in character at all times.`

export function useGemini() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendToGemini(
    userMessage: string,
    history: GeminiMessage[],
    systemPrompt: string,
    apiKey: string,
    characters: { name: string; role: string }[],
    model: string,
    onChunk?: (text: string) => void
  ): Promise<{ reply: string | null; error: string | null; usage?: any }> {
    setLoading(true)
    setError(null)

    const charactersContext = characters.length > 0
      ? `\n\nCHARACTERS IN THIS CAMPAIGN:\n${characters.map(c => `- ${c.name}${c.role ? ` (${c.role})` : ''}`).join('\n')}`
      : ''

    const fullSystem = (systemPrompt || DEFAULT_SYSTEM) + charactersContext + FORMAT_RULE

    const body = {
      system_instruction: {
        parts: [{ text: fullSystem }]
      },
      contents: [
        ...history,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 1500
      }
    }

    try {
      const res = await fetch(`${getUrl(model)}?alt=sse&key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        return { reply: null, error: errorData.error?.message || 'Error reaching Gemini.' }
      }

      const reader = res.body?.getReader()
      if (!reader) {
        return { reply: null, error: 'Response stream body is unreadable.' }
      }

      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      let fullText = ''
      let usage: any = undefined

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const cleanLine = line.trim()
          if (!cleanLine || !cleanLine.startsWith('data:')) continue

          const dataStr = cleanLine.slice(5).trim()
          if (dataStr === '[DONE]') continue

          try {
            const json = JSON.parse(dataStr)
            const textChunk = json.candidates?.[0]?.content?.parts?.[0]?.text || ''
            
            if (textChunk) {
              fullText += textChunk
              if (onChunk) onChunk(fullText)
            }

            if (json.usageMetadata) {
              usage = {
                promptTokens: json.usageMetadata.promptTokenCount || 0,
                completionTokens: json.usageMetadata.candidatesTokenCount || 0,
                totalTokens: json.usageMetadata.totalTokenCount || 0
              }
            }
          } catch (e) {
            
          }
        }
      }

      if (buffer && buffer.startsWith('data:')) {
        try {
          const json = JSON.parse(buffer.slice(5).trim())
          const textChunk = json.candidates?.[0]?.content?.parts?.[0]?.text || ''
          if (textChunk) {
            fullText += textChunk
            if (onChunk) onChunk(fullText)
          }
        } catch (e) {}
      }

      return { reply: fullText || null, error: null, usage }

    } catch (err) {
      return { reply: null, error: 'Connection error. Check your internet connection.' }
    } finally {
      setLoading(false)
    }
  }

  return { sendToGemini, loading, error }
}