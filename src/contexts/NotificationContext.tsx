import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

type NotifType = 'xp' | 'credits' | 'level' | 'item' | 'skill' | 'error' | 'info'

interface AppNotification {
  id: string
  text: string
  type: NotifType
}

interface NotificationContextValue {
  showNotification: (text: string, type?: NotifType) => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  function showNotification(text: string, type: NotifType = 'info') {
    const id = 'notif_' + Date.now() + '_' + Math.random().toString(36).slice(2)
    setNotifications(prev => [...prev, { id, text, type }])
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 4500)
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {}
      <div style={{
        position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'none'
      }}>
        {notifications.map(n => {
          const isError = n.type === 'error'
          return (
            <div key={n.id} style={{
              background: 'rgba(26, 26, 29, 0.95)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${
                isError ? 'var(--red)' :
                n.type === 'level' ? '#ffb33b' : 
                n.type === 'xp' ? 'var(--blue)' : 
                n.type === 'credits' ? '#ffb33b' : 'var(--gold)'
              }`,
              borderRadius: '8px', padding: '12px 20px', color: 'var(--text)',
              fontFamily: 'Cinzel, serif', fontSize: '12px', letterSpacing: '1px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)', transition: 'all 0.3s ease-in-out',
              animation: 'slideIn 0.35s ease-out', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <span style={{ fontSize: '14px', color: isError ? 'var(--red)' : 'var(--gold)' }}>
                {isError ? '⚠' : n.type === 'level' ? '👑' : n.type === 'xp' ? '⚡' : n.type === 'credits' ? '🪙' : '◈'} 
              </span>
              <span style={{ fontWeight: n.type === 'level' ? 'bold' : 'normal' }}>{n.text}</span>
            </div>
          )
        })}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) throw new Error("useNotification must be used within a NotificationProvider")
  return context
}