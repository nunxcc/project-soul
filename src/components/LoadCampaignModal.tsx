import React, { useState, useEffect } from 'react'
import type { Campaign } from '../types'
import { getAllCampaigns, deleteCampaign } from '../utils/campaignStorage'

interface LoadCampaignModalProps {
  open: boolean
  onClose: () => void
  onSelectCampaign: (campaign: Campaign) => void
}

export default function LoadCampaignModal({ open, onClose, onSelectCampaign }: LoadCampaignModalProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [hovered, setHovered] = useState<string | null>(null)
  const [deleteHovered, setDeleteHovered] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      
      getAllCampaigns().then(all => {
        setCampaigns(all.sort((a, b) => b.updatedAt - a.updatedAt))
      })
    }
  }, [open])

  async function handleDelete(e: React.MouseEvent, id: string, name: string) {
    e.stopPropagation() 
    if (!confirm(`Are you sure you want to permanently delete the chronicle "${name}"?`)) return
    
    await deleteCampaign(id) 
    
    
    const all = await getAllCampaigns()
    setCampaigns(all.sort((a, b) => b.updatedAt - a.updatedAt))
  }

  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!open) return null

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 150,
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border2)',
        borderRadius: '14px', padding: '36px', width: '640px', maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
      }}>
        {}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '19px', color: 'var(--gold)', letterSpacing: '2px', fontWeight: 700 }}>
              LOAD CAMPAIGN
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text3)', fontStyle: 'italic', marginTop: '6px' }}>
              Select a chronicle to continue your adventure
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)',
              width: '36px', height: '36px', borderRadius: '50%', fontSize: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
          >✕</button>
        </div>

        {}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '6px' }} className="fading-scrollbar">
          {campaigns.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text3)', fontStyle: 'italic', padding: '40px 0', fontSize: '14px' }}>
              No saved campaigns found. Go build some legends!
            </div>
          ) : (
            campaigns.map(c => {
              const charName = c.player?.appearance?.name || 'Unnamed Hero'
              const charClass = c.player?.powers?.class || 'No Class'
              const settingSnippet = c.setting ? c.setting.slice(0, 100) + (c.setting.length > 100 ? '...' : '') : 'No description'

              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCampaign(c)}
                  onMouseEnter={() => setHovered(c.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px', background: hovered === c.id ? 'var(--surface2)' : 'var(--surface3)',
                    border: `1px solid ${hovered === c.id ? 'var(--gold)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '20px' }}>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: '17px', color: 'var(--text)', letterSpacing: '1px', fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text2)', marginTop: '6px' }}>
                      <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{charName}</span> • <span style={{ fontStyle: 'italic', color: 'var(--text3)' }}>{charClass}</span>
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text3)', fontStyle: 'italic', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {settingSnippet}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)', letterSpacing: '0.5px', marginTop: '10px', fontFamily: 'monospace' }}>
                      LAST PLAYED: {formatDate(c.updatedAt)}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, c.id, c.name)}
                    onMouseEnter={() => setDeleteHovered(c.id)}
                    onMouseLeave={() => setDeleteHovered(null)}
                    style={{
                      background: deleteHovered === c.id ? 'rgba(195,7,63,0.15)' : 'transparent',
                      border: `1px solid ${deleteHovered === c.id ? 'var(--gold)' : 'transparent'}`,
                      borderRadius: 'var(--radius)', color: deleteHovered === c.id ? 'var(--gold)' : 'var(--text3)',
                      padding: '10px 14px', fontFamily: 'Cinzel, serif', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    ✕ DELETE
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}