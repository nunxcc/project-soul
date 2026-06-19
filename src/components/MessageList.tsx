import React, { useEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown' 
import { parseReply } from '../utils/parseReply'
import type { Message, Character, MessageBlock, PlayerCharacter } from '../types'

interface MessageListProps {
  messages: Message[]
  characters: Character[]
  player: PlayerCharacter | null 
  onDeleteMessage: (id: string) => void
  onEditMessage: (id: string, newContent: string) => void
  onRerunTurn: () => void
  disabled: boolean
}

function findCharacter(name: string, characters: Character[]): Character | undefined {
  const n = name.toLowerCase().trim()
  return characters.find(
    c => c.name.toLowerCase() === n || c.name.toLowerCase().split(' ')[0] === n.split(' ')[0]
  )
}

export default function MessageList({ messages, characters, player, onDeleteMessage, onEditMessage, onRerunTurn, disabled }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null)
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null)
  const [editBuffer, setEditBuffer] = useState('')

  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<any>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleScroll() {
    setIsScrolling(true)
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [])

  function startEdit(id: string, text: string) {
    if (disabled) return
    setEditingMsgId(id)
    setEditBuffer(text)
  }

  function saveEdit(id: string) {
    if (disabled) return
    onEditMessage(id, editBuffer.trim())
    setEditingMsgId(null)
  }

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }
        .msg-container {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .control-panel {
          display: flex;
          gap: 6px;
          opacity: 0;
          transition: opacity 0.15s ease-in-out;
          position: absolute;
          top: -10px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 2px 6px;
          z-index: 10;
        }
        .msg-container:hover .control-panel {
          opacity: 1;
        }
        .ctrl-btn {
          background: transparent;
          border: none;
          color: var(--text3);
          font-family: 'Cinzel', serif;
          fontSize: 10px;
          cursor: pointer;
          transition: color 0.1s;
          padding: 2px 4px;
        }
        .ctrl-btn:hover {
          color: var(--gold);
        }

        .fading-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .fading-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .fading-scrollbar::-webkit-scrollbar-thumb {
          background: transparent; 
          border-radius: 2px;
          transition: background 0.3s ease-in-out;
        }
        .fading-scrollbar.scrolling::-webkit-scrollbar-thumb {
          background: var(--border2);
        }
      `}</style>
      
      <div 
        onScroll={handleScroll}
        className={`fading-scrollbar ${isScrolling ? 'scrolling' : ''}`}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {messages.length === 0 && (
            <SystemMessage text='✦ Begin your campaign. Type your first action below. ✦' />
          )}
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user'
            const isLastModelMsg = !isUser && index === messages.length - 1

            return (
              <div
                key={msg.id}
                className="msg-container"
                onMouseEnter={() => setHoveredMsgId(msg.id)}
                onMouseLeave={() => setHoveredMsgId(null)}
              >
                {hoveredMsgId === msg.id && msg.content !== '__typing__' && !msg.content.startsWith('__system__:') && !disabled && (
                  <div className="control-panel" style={{ right: isUser ? '0' : 'auto', left: isUser ? 'auto' : '0' }}>
                    <button className="ctrl-btn" onClick={() => startEdit(msg.id, msg.content)}>✏ EDIT</button>
                    <button className="ctrl-btn" onClick={() => onDeleteMessage(msg.id)}>✕ DELETE</button>
                    {isLastModelMsg && (
                      <button className="ctrl-btn" onClick={onRerunTurn}>🔄 RERUN</button>
                    )}
                  </div>
                )}

                {editingMsgId === msg.id ? (
                  <div style={{
                    width: '100%', display: 'flex', flexDirection: 'column', gap: '8px',
                    background: 'var(--surface)', padding: '12px', border: '1px solid var(--border2)', borderRadius: 'var(--radius)'
                  }}>
                    <textarea
                      value={editBuffer}
                      onChange={e => setEditBuffer(e.target.value)}
                      disabled={disabled}
                      style={{
                        width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                        color: 'var(--text)', padding: '8px', fontFamily: 'Crimson Pro, serif', fontSize: '15px',
                        outline: 'none', resize: 'none', opacity: disabled ? 0.6 : 1
                      }}
                      rows={3}
                    />
                    <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
                      <button 
                        disabled={disabled} 
                        onClick={() => setEditingMsgId(null)} 
                        style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text3)', borderRadius: 'var(--radius)', fontSize: '10px', cursor: disabled ? 'not-allowed' : 'pointer' }}
                      >
                        CANCEL
                      </button>
                      <button 
                        disabled={disabled} 
                        onClick={() => saveEdit(msg.id)} 
                        style={{ padding: '6px 12px', background: 'var(--gold-dim)', border: '1px solid var(--gold)', color: 'var(--text)', borderRadius: 'var(--radius)', fontSize: '10px', cursor: disabled ? 'not-allowed' : 'pointer' }}
                      >
                        {disabled ? 'SAVING...' : 'SAVE CHANGES'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {msg.role === 'user' && <PlayerMessage text={msg.content} player={player} />}
                    {msg.content === '__typing__' && <TypingIndicator />}
                    {msg.content.startsWith('__system__:') && <SystemMessage text={msg.content.replace('__system__:', '')} />}
                    {msg.role === 'model' && msg.content !== '__typing__' && !msg.content.startsWith('__system__:') && (
                      <React.Fragment>
                        {parseReply(msg.content).map((block, i) =>
                          block.type === 'narrator'
                            ? <NarratorBlock key={i} text={block.text} />
                            : <CharacterBlock key={i} block={block} characters={characters} />
                        )}
                      </React.Fragment>
                    )}
                  </>
                )}
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>
    </>
  )
}



function NarratorBlock({ text }: { text: string }) {
  return (
    <div style={{
      background: 'rgba(53, 53, 53, 0.2)', 
      border: 'none',                            
      borderLeft: '4px solid var(--gold)',       
      borderRadius: '0 var(--radius) var(--radius) 0', 
      padding: '16px 20px 16px 24px',            
      fontStyle: 'normal',                       
      color: 'var(--text)',                      
      fontSize: 'var(--font-lg)',                
      lineHeight: '1.8',                         
      letterSpacing: '0.4px',                    
      width: '100%',
      marginBottom: '16px',
    }}>
      <div style={{
        fontFamily: 'Cinzel, serif',
        fontSize: 'var(--font-xs)',
        color: 'var(--gold)',
        letterSpacing: '1.5px',
        marginBottom: '10px',
        fontStyle: 'normal',
        opacity: 0.85,
        fontWeight: 'bold'
      }}>
        ✦ NARRATOR
      </div>
      {}
      <div className="markdown-content">
        <Markdown>{text}</Markdown>
      </div>
    </div>
  )
}

function CharacterBlock({ block, characters }: { block: MessageBlock, characters: Character[] }) {
  const char = block.name ? findCharacter(block.name, characters) : undefined
  const color = char?.color ?? 'var(--gold)'
  const initial = (char?.name ?? block.name ?? '?')[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '85%', alignSelf: 'flex-start', width: '100%', marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        {char?.avatar ? (
          <img
            src={char.avatar}
            alt={char.name}
            style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${color}`, flexShrink: 0 }}
          />
        ) : (
          <div style={{
            width: '46px', height: '46px', borderRadius: '50%',
            background: 'var(--surface3)', border: `2px solid ${color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Cinzel, serif', fontSize: 'var(--font-md)', color, flexShrink: 0,
          }}>
            {initial}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <div style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 'var(--font-sm)',
            color,
            letterSpacing: '1px',
            fontWeight: 600,
          }}>
            {char?.name ?? block.name}
          </div>
          <div style={{
            background: 'var(--surface2)',
            border: `1px solid var(--border)`,
            borderLeft: `3px solid ${color}`,
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: 'var(--font-lg)',
            lineHeight: '1.7',
            color: 'var(--text)',
          }}>
            {}
            <div className="markdown-content">
              <Markdown>{block.text}</Markdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlayerMessage({ text, player }: { text: string, player: PlayerCharacter | null }) {
  const avatar = player?.appearance?.avatar
  const name = player?.appearance?.name || 'You'
  const initial = name[0] || 'Y'
  const color = 'var(--blue)' 

  return (
    <div style={{ 
      display: 'flex', 
      gap: '14px', 
      alignSelf: 'flex-end', 
      maxWidth: '75%', 
      marginBottom: '4px',
      alignItems: 'flex-start' 
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', flex: 1 }}>
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 'var(--font-sm)',
          color: 'var(--blue)',
          letterSpacing: '1px',
          fontWeight: 600,
        }}>
          {name}
        </div>
        <div style={{
          background: 'var(--blue-dim)',
          border: '1px solid var(--blue)', 
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: 'var(--font-lg)',
          lineHeight: '1.7',
          color: 'var(--text)',
        }}>
          {}
          <div className="markdown-content">
            <Markdown>{text}</Markdown>
          </div>
        </div>
      </div>

      {avatar ? (
        <img
          src={avatar}
          alt={name}
          style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${color}`, flexShrink: 0 }}
        />
      ) : (
        <div style={{
          width: '46px', height: '46px', borderRadius: '50%',
          background: 'var(--surface3)', border: `2px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Cinzel, serif', fontSize: 'var(--font-md)', color, flexShrink: 0,
        }}>
          {initial}
        </div>
      )}
    </div>
  )
}

function SystemMessage({ text }: { text: string }) {
  const isError = text.toLowerCase().includes('error') || text.toLowerCase().includes('fail') || text.toLowerCase().includes('blocked');

  return (
    <div style={{
      alignSelf: 'center',
      background: isError ? 'rgba(195, 7, 63, 0.08)' : 'var(--surface2)',
      border: isError ? '1px solid var(--gold)' : '1px solid var(--border)', 
      borderRadius: '20px',
      padding: '6px 16px',
      fontSize: '11px',
      fontFamily: 'Cinzel, serif',
      color: isError ? 'var(--gold)' : 'var(--text3)',
      letterSpacing: '1px',
      textAlign: 'center',
      maxWidth: '90%',
      margin: '8px auto',
    }}>
      {text}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderLeft: '3px solid var(--gold)',
      borderRadius: 'var(--radius)',
      padding: '14px 20px',
      width: 'fit-content',
      marginBottom: '8px',
    }}>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--text3)',
            animation: 'pulse 1.2s infinite',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  )
}