import type { MessageBlock } from '../types'

export function parseReply(text: string): MessageBlock[] {
  const lines = text.split('\n')
  const blocks: MessageBlock[] = []
  let narratorBuffer: string[] = []

  function flushNarrator() {
    const t = narratorBuffer.join('\n').trim()
    if (t) blocks.push({ type: 'narrator', text: t })
    narratorBuffer = []
  }

  lines.forEach(line => {
    const match = line.match(/^\[([^\]]+)\]:\s*(.*)/)
    if (match) {
      flushNarrator()
      blocks.push({ type: 'character', name: match[1], text: match[2] })
    } else {
      narratorBuffer.push(line)
    }
  })

  flushNarrator()
  return blocks.filter(b => b.text.trim() !== '')
}