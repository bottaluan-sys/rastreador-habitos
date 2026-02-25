import { useState, useEffect, useRef } from 'react'
import {
  Home,
  Activity,
  LayoutGrid,
  MoreHorizontal,
  BarChart3,
  Lightbulb,
  Bell,
  Settings,
  Share2,
  User,
  Flower2,
  Wind,
  Moon,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Area } from '../types'
import { getAreaIcon } from '../constants/areaIcons'

type NavItem = 'home' | 'pomodoro' | 'wimhof' | 'sleep' | 'stats' | 'tips' | 'alerts' | 'settings' | 'share' | 'profile' | 'area'
type GroupId = 'bemestar' | 'areas' | 'mais'

interface BottomNavProps {
  active: NavItem
  selectedAreaId: string | null
  onNavigate: (item: NavItem) => void
  onAreaNavigate: (areaId: string) => void
  areas: Area[]
}

const BEMESTAR_ITEMS: { id: NavItem; label: string; icon: typeof Flower2 }[] = [
  { id: 'pomodoro', label: 'Pomodoro', icon: Flower2 },
  { id: 'wimhof', label: 'Wim Hof', icon: Wind },
  { id: 'sleep', label: 'Sono', icon: Moon },
]

const MAIS_ITEMS: { id: NavItem; label: string; icon: typeof BarChart3 }[] = [
  { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
  { id: 'tips', label: 'Dicas', icon: Lightbulb },
  { id: 'alerts', label: 'Alertas', icon: Bell },
  { id: 'settings', label: 'Configurações', icon: Settings },
  { id: 'share', label: 'Compartilhar', icon: Share2 },
  { id: 'profile', label: 'Perfil', icon: User },
]

function isBemestarActive(active: NavItem): boolean {
  return active === 'pomodoro' || active === 'wimhof' || active === 'sleep'
}

function isMaisActive(active: NavItem): boolean {
  return ['stats', 'tips', 'alerts', 'settings', 'share', 'profile'].includes(active)
}

export function BottomNav({ active, selectedAreaId, onNavigate, onAreaNavigate, areas }: BottomNavProps) {
  const [openGroup, setOpenGroup] = useState<GroupId | null>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (openGroup === null) return
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openGroup])

  const handleGroupClick = (groupId: GroupId) => {
    setOpenGroup((prev) => (prev === groupId ? null : groupId))
  }

  const handleSubItemClick = (itemId: NavItem) => {
    onNavigate(itemId)
    setOpenGroup(null)
  }

  const handleAreaItemClick = (areaId: string) => {
    onAreaNavigate(areaId)
    setOpenGroup(null)
  }

  const bemestarActive = isBemestarActive(active)
  const areasActive = active === 'area'
  const maisActive = isMaisActive(active)

  return (
    <nav
      ref={navRef}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(20, 20, 20, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '10px 8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        {/* Início - direto */}
        <button
          onClick={() => onNavigate('home')}
          aria-label="Início"
          title="Início"
          className="bottom-nav-btn"
          data-active={active === 'home'}
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            color: active === 'home' ? 'var(--accent-red)' : 'var(--text-secondary)',
            transition: 'color var(--transition-fast)',
          }}
        >
          <Home size={22} strokeWidth={active === 'home' ? 2.5 : 1.5} />
        </button>

        {/* Bem-estar - com submenu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => handleGroupClick('bemestar')}
            aria-label="Bem-estar"
            aria-haspopup="menu"
            aria-expanded={openGroup === 'bemestar'}
            title="Bem-estar"
            className="bottom-nav-btn"
            data-active={bemestarActive}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              color: bemestarActive ? 'var(--accent-red)' : 'var(--text-secondary)',
              transition: 'color var(--transition-fast)',
            }}
          >
            <Activity size={22} strokeWidth={bemestarActive ? 2.5 : 1.5} />
          </button>
          <AnimatePresence>
            {openGroup === 'bemestar' && (
              <motion.div
                role="menu"
                className="bottom-nav-popover"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
              >
                {BEMESTAR_ITEMS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    role="menuitem"
                    onClick={() => handleSubItemClick(id)}
                    className="bottom-nav-popover-item"
                    data-active={active === id}
                  >
                    <Icon size={18} strokeWidth={active === id ? 2.5 : 1.5} />
                    <span>{label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Áreas - com submenu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => handleGroupClick('areas')}
            aria-label="Áreas"
            aria-haspopup="menu"
            aria-expanded={openGroup === 'areas'}
            title="Áreas"
            className="bottom-nav-btn"
            data-active={areasActive}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              color: areasActive ? 'var(--accent-red)' : 'var(--text-secondary)',
              transition: 'color var(--transition-fast)',
            }}
          >
            <LayoutGrid size={22} strokeWidth={areasActive ? 2.5 : 1.5} />
          </button>
          <AnimatePresence>
            {openGroup === 'areas' && areas.length > 0 && (
              <motion.div
                role="menu"
                className="bottom-nav-popover"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
              >
                {areas.map((area) => {
                  const AreaIcon = getAreaIcon(area.name)
                  const isActive = areasActive && selectedAreaId === area.id
                  return (
                    <button
                      key={area.id}
                      role="menuitem"
                      onClick={() => handleAreaItemClick(area.id)}
                      className="bottom-nav-popover-item"
                      data-active={isActive}
                      style={isActive ? { color: area.color ?? 'var(--accent-red)' } : undefined}
                    >
                      <AreaIcon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                      <span>{area.name}</span>
                    </button>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mais - com submenu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => handleGroupClick('mais')}
            aria-label="Mais"
            aria-haspopup="menu"
            aria-expanded={openGroup === 'mais'}
            title="Mais"
            className="bottom-nav-btn"
            data-active={maisActive}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              color: maisActive ? 'var(--accent-red)' : 'var(--text-secondary)',
              transition: 'color var(--transition-fast)',
            }}
          >
            <MoreHorizontal size={22} strokeWidth={maisActive ? 2.5 : 1.5} />
          </button>
          <AnimatePresence>
            {openGroup === 'mais' && (
              <motion.div
                role="menu"
                className="bottom-nav-popover"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
              >
                {MAIS_ITEMS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    role="menuitem"
                    onClick={() => handleSubItemClick(id)}
                    className="bottom-nav-popover-item"
                    data-active={active === id}
                  >
                    <Icon size={18} strokeWidth={active === id ? 2.5 : 1.5} />
                    <span>{label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  )
}
