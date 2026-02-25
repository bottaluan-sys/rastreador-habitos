import { useState, useEffect } from 'react'
import { Bell, Plus, Trash2 } from 'lucide-react'

const STORAGE_KEY = 'rastreador-alerts'

export interface AlertItem {
  id: string
  label: string
  hour: number
  minute: number
  enabled: boolean
}

function loadAlerts(): AlertItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveAlerts(alerts: AlertItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
}

export function AlertsView() {
  const [alerts, setAlerts] = useState<AlertItem[]>(loadAlerts)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )

  useEffect(() => {
    saveAlerts(alerts)
  }, [alerts])

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return
    const perm = await Notification.requestPermission()
    setNotificationPermission(perm)
  }

  const addAlert = () => {
    const newAlert: AlertItem = {
      id: crypto.randomUUID(),
      label: 'Lembrete de hábitos',
      hour: 8,
      minute: 0,
      enabled: true,
    }
    setAlerts((prev) => [...prev, newAlert])
  }

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  const updateAlert = (id: string, updates: Partial<AlertItem>) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    )
  }

  return (
    <section
      style={{
        background: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '24px',
        margin: '16px 20px',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Bell size={20} />
        Lembretes
      </h2>

      {notificationPermission === 'denied' && (
        <div
          style={{
            padding: '12px',
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            color: 'var(--text-secondary)',
          }}
        >
          <p style={{ marginBottom: '8px' }}>
            Ative as notificações para receber lembretes dos seus hábitos.
          </p>
          <button
            onClick={requestPermission}
            style={{
              padding: '8px 16px',
              background: 'var(--accent-red)',
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          >
            Permitir notificações
          </button>
        </div>
      )}

      {notificationPermission === 'granted' && (
        <p style={{ fontSize: '12px', color: 'var(--accent-green)', marginBottom: '12px' }}>
          Notificações ativadas
        </p>
      )}

      <button
        onClick={addAlert}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          background: 'var(--bg-secondary)',
          border: '1px dashed var(--border-subtle)',
          borderRadius: '8px',
          color: 'var(--text-secondary)',
          fontSize: '14px',
          width: '100%',
          marginBottom: '16px',
        }}
      >
        <Plus size={18} />
        Adicionar lembrete
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alerts.length === 0 ? (
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Nenhum lembrete configurado.
          </p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                flexWrap: 'wrap',
              }}
            >
              <input
                type="text"
                value={alert.label}
                onChange={(e) => updateAlert(alert.id, { label: e.target.value })}
                placeholder="Descrição"
                style={{
                  flex: 1,
                  minWidth: 120,
                  padding: '8px 12px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              />
              <input
                type="number"
                min={0}
                max={23}
                value={alert.hour}
                onChange={(e) => updateAlert(alert.id, { hour: parseInt(e.target.value, 10) || 0 })}
                style={{
                  width: 50,
                  padding: '8px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>:</span>
              <input
                type="number"
                min={0}
                max={59}
                value={alert.minute}
                onChange={(e) => updateAlert(alert.id, { minute: parseInt(e.target.value, 10) || 0 })}
                style={{
                  width: 50,
                  padding: '8px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={alert.enabled}
                  onChange={(e) => updateAlert(alert.id, { enabled: e.target.checked })}
                />
                Ativo
              </label>
              <button
                onClick={() => removeAlert(alert.id)}
                aria-label="Remover"
                style={{ color: 'var(--accent-red)' }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
