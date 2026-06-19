import React from 'react'
import type { Character, PlayerCharacter } from '../types' 

interface SidebarProps {
  player: PlayerCharacter | null
  characters: Character[]
  onAddCharacter: () => void
  onEditCharacter: (index: number) => void
  onDeleteCharacter: (index: number) => void
  onEditPlayer?: () => void
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '230px',
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflow: 'hidden',
  },
  header: {
    padding: '13px 16px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: '11px',
    color: 'var(--gold)',
    letterSpacing: '1.5px',
  },
  addBtn: {
    background: 'transparent',
    border: '1px solid var(--border2)',
    color: 'var(--text2)',
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
  },
  charItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 9px',
    borderRadius: 'var(--radius)',
    border: '1px solid transparent',
    marginBottom: '4px',
    transition: 'all 0.2s',
    position: 'relative',
    cursor: 'pointer',
  },
  dmItem: {
    borderColor: 'var(--gold-dim)', 
    background: 'rgba(255,255,255,0.015)', 
    marginBottom: '6px',
  },
  avatarPh: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'var(--surface3)',
    border: '2px solid var(--border2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Cinzel, serif',
    fontSize: '14px',
    flexShrink: 0,
  },
  charInfo: {
    flex: 1,
    minWidth: 0,
  },
  charName: {
    fontFamily: 'Cinzel, serif',
    fontSize: '11px',
    color: 'var(--text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  charRole: {
    fontSize: '12px',
    color: 'var(--text3)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: '1px',
  },
  deleteBtn: {
    position: 'absolute',
    right: '7px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    color: 'var(--text3)',
    fontSize: '13px',
    padding: '2px 4px',
    opacity: 0,
    transition: 'opacity 0.2s',
  },
}

interface CharItemProps {
  character: Character
  index: number
  onEdit: (index: number) => void
  onDelete: (index: number) => void
}

function CharItem({ character, index, onEdit, onDelete }: CharItemProps) {
  const [hovered, setHovered] = React.useState(false)

  return (
    <div
      style={{ ...styles.charItem, background: hovered ? 'var(--surface2)' : 'transparent', borderColor: hovered ? 'var(--border)' : 'transparent' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={() => onEdit(index)}
    >
      {character.avatar ? (
        <img
          src={character.avatar}
          alt={character.name}
          style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${character.color}`, flexShrink: 0 }}
        />
      ) : (
        <div style={{ ...styles.avatarPh, borderColor: character.color, color: character.color }}>
          {character.name[0]}
        </div>
      )}
      <div style={styles.charInfo}>
        <div style={styles.charName}>{character.name}</div>
        <div style={styles.charRole}>{character.role}</div>
      </div>
      <button
        style={{ ...styles.deleteBtn, opacity: hovered ? 1 : 0 }}
        onClick={(e) => { e.stopPropagation(); onDelete(index) }}
      >
        ✕
      </button>
    </div>
  )
}

export default function Sidebar({ player, characters, onAddCharacter, onEditCharacter, onDeleteCharacter, onEditPlayer }: SidebarProps) {
  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>ROSTER</span>
        <button style={styles.addBtn} onClick={onAddCharacter}>+</button>
      </div>
      <div style={styles.list}>
        {}
        <div style={{ ...styles.charItem, ...styles.dmItem }}>
          <div style={{ ...styles.avatarPh, borderColor: 'var(--gold)', color: 'var(--gold)' }}>D</div>
          <div style={styles.charInfo}>
            <div style={styles.charName}>DM / Narrator</div>
            <div style={styles.charRole}>Dungeon Master</div>
          </div>
        </div>

        {}
        {player && (
          <div 
            style={{ 
              ...styles.charItem, 
              borderColor: 'var(--blue-dim)', 
              background: 'rgba(255,255,255,0.015)',
              marginBottom: '10px' 
            }}
            onDoubleClick={onEditPlayer} 
            title="Double-click to edit your Character Sheet"
          >
            {player.appearance.avatar ? (
              <img
                src={player.appearance.avatar}
                alt={player.appearance.name}
                style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--blue)', flexShrink: 0 }}
              />
            ) : (
              <div style={{ ...styles.avatarPh, borderColor: 'var(--blue)', color: 'var(--blue)' }}>
                {player.appearance.name[0] || 'P'}
              </div>
            )}
            <div style={styles.charInfo}>
              <div style={styles.charName}>{player.appearance.name || 'Unnamed Hero'}</div>
              <div style={styles.charRole}>{player.powers.class || 'Player'}</div>
            </div>
          </div>
        )}

        {}
        {characters.map((char, i) => (
          <CharItem
            key={char.id}
            character={char}
            index={i}
            onEdit={onEditCharacter}
            onDelete={onDeleteCharacter}
          />
        ))}
      </div>
    </div>
  )
}