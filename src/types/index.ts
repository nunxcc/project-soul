

export interface Character {
  id: string
  name: string
  role: string
  color: string
  avatar: string | null
  appearance?: string
  personality?: string
  powers?: string
  backstory?: string
}



export interface PlayerAppearance {
  avatar: string | null          
  statusPortrait?: string | null 
  name: string
  race: string
  gender: string
  age: string
  height: string
  weight: string
  eyeColor: string
  hairType: string
  hairColor: string
  skinColor: string
  bodyType: string
  distinctiveMarks: string
  clothingStyle: string
}

export interface PlayerPersonality {
  alignment: string
  traits: string
  ideals: string
  bonds: string
  flaws: string
  backstory: string
  darkSecret: string
}

export interface PlayerPowers {
  class: string
  subclass: string
  weapons: string
  powers: string
  specialAbility: string
}

export interface PlayerCharacter {
  appearance: PlayerAppearance
  personality: PlayerPersonality
  powers: PlayerPowers
}




export interface PlayerSkill {
  name: string
  rank: 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S'
  description: string
  manaCost?: string 
}

export interface SystemAttributes {
  str: number;
  agi: number;
  vit: number;
  int: number;
  mana: number;
}

export interface PlayerSoul {
  condition: string;
  level: number;
  xp: number;
  xpNeeded: number;
  affinity: string;
  attributes: SystemAttributes;
  passives: PlayerSkill[];
  actives: PlayerSkill[];
  skills: PlayerSkill[]; 
  languages: string;
}

export interface InventoryItem {
  name: string
  description: string
  value: number                                 
  rank?: 'F' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S' 
  image?: string | null 
}

export interface PlayerInventory {
  credits: number;
  
  
  equipped: InventoryItem[];
  items: InventoryItem[];
  properties: InventoryItem[];
}



export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface Campaign {
  id: string
  name: string
  setting: string
  dmInstructions: string
  player: PlayerCharacter
  
  
  soul?: PlayerSoul
  inventory?: PlayerInventory
  
  roster: Character[]
  history: GeminiMessage[]
  createdAt: number
  updatedAt: number
  
  backgrounds?: string[]
  activeBackground?: string | null
  tokenUsage?: TokenUsage
  timeline?: string[] 
  worldChanges?: string 
}



export interface Message {
  id: string
  role: 'user' | 'model'
  content: string
  timestamp: number
}

export interface MessageBlock {
  type: 'narrator' | 'character'
  name?: string
  text: string
}



export interface GeminiPart {
  text: string
}

export interface GeminiMessage {
  role: 'user' | 'model'
  parts: GeminiPart[]
}