import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface SunflowerAnimationProps {
  progress: number
  size?: number
}

export function SunflowerAnimation({ progress, size = 140 }: SunflowerAnimationProps) {
  const p = Math.min(100, Math.max(0, progress))

  const sproutGrow = Math.min(1, p / 12)
  const stemGrow = Math.min(1, Math.max(0, (p - 5) / 25))
  const leafGrow = Math.min(1, Math.max(0, (p - 20) / 15))
  const budGrow = Math.min(1, Math.max(0, (p - 30) / 15))
  const petalOpen = Math.min(1, Math.max(0, (p - 40) / 60))
  const isFullBloom = p >= 95

  const stemHeight = 15 + stemGrow * 85
  const stemTopY = 175 - stemHeight
  const flowerCenterY = stemTopY - 2

  const outerPetals = useMemo(() => {
    return [...Array(14)].map((_, i) => {
      const angle = (i / 14) * 360
      const fills = ['#f59e0b', '#fbbf24', '#f9a825']
      const strokes = ['#d97706', '#e6a817', '#e08f00']
      return { angle, fill: fills[i % 3], stroke: strokes[i % 3] }
    })
  }, [])

  const innerPetals = useMemo(() => {
    return [...Array(10)].map((_, i) => {
      const angle = (i / 10) * 360 + 18
      const fills = ['#fcd34d', '#fde68a']
      const strokes = ['#fbbf24', '#fcd34d']
      return { angle, fill: fills[i % 2], stroke: strokes[i % 2] }
    })
  }, [])

  const seedDots = useMemo(() => {
    return [...Array(19)].map((_, i) => {
      const goldenAngle = i * 137.508
      const r = 1.5 + Math.sqrt(i) * 1.6
      const x = r * Math.cos((goldenAngle * Math.PI) / 180)
      const y = r * Math.sin((goldenAngle * Math.PI) / 180)
      return { x, y }
    })
  }, [])

  const barWidth = size * 0.75
  const barHeight = 5

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <svg
        width={size}
        height={size + 40}
        viewBox="0 0 140 210"
        fill="none"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="sf-soil" cx="50%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#8B7355" />
            <stop offset="70%" stopColor="#6B5344" />
            <stop offset="100%" stopColor="#4a3728" />
          </radialGradient>
          <linearGradient id="sf-stem" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2e7d32" />
            <stop offset="50%" stopColor="#4caf50" />
            <stop offset="100%" stopColor="#2e7d32" />
          </linearGradient>
          <linearGradient id="sf-stem-hl" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#81c784" stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="sf-leaf-l" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#66bb6a" />
            <stop offset="50%" stopColor="#43a047" />
            <stop offset="100%" stopColor="#2e7d32" />
          </linearGradient>
          <linearGradient id="sf-leaf-r" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#66bb6a" />
            <stop offset="50%" stopColor="#43a047" />
            <stop offset="100%" stopColor="#2e7d32" />
          </linearGradient>
          <radialGradient id="sf-center-o" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#5d4037" />
            <stop offset="60%" stopColor="#3e2723" />
            <stop offset="100%" stopColor="#1b0c06" />
          </radialGradient>
          <radialGradient id="sf-center-i" cx="45%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#6d4c41" />
            <stop offset="100%" stopColor="#3e2723" />
          </radialGradient>
          <radialGradient id="sf-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff9c4" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#fff176" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#fff176" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sf-bud" cx="45%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#66bb6a" />
            <stop offset="100%" stopColor="#2e7d32" />
          </radialGradient>
          <linearGradient id="sf-bar" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#43a047" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Solo */}
        <ellipse cx="70" cy="198" rx="52" ry="11" fill="url(#sf-soil)" />
        <ellipse cx="70" cy="196" rx="44" ry="7" fill="#7a6352" opacity="0.25" />

        {/* Grama */}
        {sproutGrow > 0.3 && (
          <g opacity={Math.min(0.5, sproutGrow * 0.5)}>
            <path d="M32 195 Q34 187 30 181" stroke="#66bb6a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M37 196 Q38 189 35 184" stroke="#43a047" strokeWidth="1" fill="none" strokeLinecap="round" />
            <path d="M103 195 Q101 188 105 182" stroke="#66bb6a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M108 196 Q107 190 110 185" stroke="#43a047" strokeWidth="1" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* Semente */}
        {sproutGrow < 0.5 && (
          <g opacity={1 - sproutGrow * 2}>
            <ellipse cx="70" cy="192" rx="6" ry="4" fill="#4a3728" />
            <ellipse cx="69" cy="191" rx="2" ry="1" fill="#6d5040" opacity="0.4" />
          </g>
        )}

        {/* Caule */}
        {sproutGrow > 0.2 && (
          <g>
            <line
              x1="70" y1="195"
              x2="70" y2={flowerCenterY}
              stroke="url(#sf-stem)"
              strokeWidth={4 + stemGrow * 3}
              strokeLinecap="round"
            />
            <line
              x1="70" y1="195"
              x2="70" y2={flowerCenterY}
              stroke="url(#sf-stem-hl)"
              strokeWidth={1.5 + stemGrow * 1.5}
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Folha esquerda */}
        {leafGrow > 0 && (
          <g opacity={leafGrow}>
            <path
              d={`M70 162 C${70 - leafGrow * 10} 160 ${70 - leafGrow * 24} ${162 - leafGrow * 7} ${70 - leafGrow * 32} ${162 - leafGrow * 18} C${70 - leafGrow * 28} ${162 - leafGrow * 15} ${70 - leafGrow * 20} ${162 - leafGrow * 12} ${70 - leafGrow * 12} ${162 - leafGrow * 10} C${70 - leafGrow * 20} ${162 - leafGrow * 14} ${70 - leafGrow * 26} ${162 - leafGrow * 20} ${70 - leafGrow * 30} ${162 - leafGrow * 26} C${70 - leafGrow * 22} ${162 - leafGrow * 19} ${70 - leafGrow * 12} ${162 - leafGrow * 12} 70 ${162 - leafGrow * 8}`}
              fill="url(#sf-leaf-l)" stroke="#2e7d32" strokeWidth="0.7"
            />
            <path d={`M70 162 C${70 - leafGrow * 12} ${162 - leafGrow * 5} ${70 - leafGrow * 24} ${162 - leafGrow * 12} ${70 - leafGrow * 30} ${162 - leafGrow * 22}`} stroke="#1b5e20" strokeWidth="0.5" fill="none" opacity="0.4" />
          </g>
        )}

        {/* Folha direita */}
        {leafGrow > 0 && (
          <g opacity={leafGrow}>
            <path
              d={`M70 142 C${70 + leafGrow * 10} 140 ${70 + leafGrow * 24} ${142 - leafGrow * 7} ${70 + leafGrow * 32} ${142 - leafGrow * 18} C${70 + leafGrow * 28} ${142 - leafGrow * 15} ${70 + leafGrow * 20} ${142 - leafGrow * 12} ${70 + leafGrow * 12} ${142 - leafGrow * 10} C${70 + leafGrow * 20} ${142 - leafGrow * 14} ${70 + leafGrow * 26} ${142 - leafGrow * 20} ${70 + leafGrow * 30} ${142 - leafGrow * 26} C${70 + leafGrow * 22} ${142 - leafGrow * 19} ${70 + leafGrow * 12} ${142 - leafGrow * 12} 70 ${142 - leafGrow * 8}`}
              fill="url(#sf-leaf-r)" stroke="#2e7d32" strokeWidth="0.7"
            />
            <path d={`M70 142 C${70 + leafGrow * 12} ${142 - leafGrow * 5} ${70 + leafGrow * 24} ${142 - leafGrow * 12} ${70 + leafGrow * 30} ${142 - leafGrow * 22}`} stroke="#1b5e20" strokeWidth="0.5" fill="none" opacity="0.4" />
          </g>
        )}

        {/* Botão floral */}
        {budGrow > 0 && petalOpen < 0.3 && (
          <g>
            <circle cx="70" cy={flowerCenterY} r={6 + budGrow * 6} fill="url(#sf-bud)" />
            <path
              d={`M66 ${flowerCenterY - 5} Q70 ${flowerCenterY - 10 - budGrow * 3} 74 ${flowerCenterY - 5}`}
              fill="#43a047" stroke="#2e7d32" strokeWidth="0.5"
            />
          </g>
        )}

        {/* Brilho atrás da flor */}
        {petalOpen > 0.2 && (
          <circle
            cx="70" cy={flowerCenterY}
            r={25 + petalOpen * 12}
            fill="url(#sf-glow)"
            opacity={petalOpen * 0.7}
          />
        )}

        {/* Sépalas */}
        {budGrow > 0.6 && (
          <g opacity={Math.min(1, (budGrow - 0.6) * 2.5)}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <ellipse
                key={`s-${i}`}
                cx="70" cy={flowerCenterY - 5}
                rx="2.2" ry="5.5"
                fill="#43a047" stroke="#2e7d32" strokeWidth="0.4"
                transform={`rotate(${angle} 70 ${flowerCenterY})`}
              />
            ))}
          </g>
        )}

        {/* Pétalas externas — valores diretos, sem initial/animate */}
        {petalOpen > 0 && (
          <g transform={`translate(70, ${flowerCenterY})`}>
            {outerPetals.map(({ angle, fill, stroke }, i) => {
              const len = 10 + petalOpen * 16
              return (
                <ellipse
                  key={`op-${i}`}
                  cx="0"
                  cy={-len / 2 - 3}
                  rx={3.8 + petalOpen * 2}
                  ry={len / 2}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="0.5"
                  opacity={petalOpen}
                  transform={`rotate(${angle})`}
                />
              )
            })}
          </g>
        )}

        {/* Pétalas internas */}
        {petalOpen > 0.15 && (() => {
          const openFactor = Math.max(0, (petalOpen - 0.15) / 0.85)
          return (
            <g transform={`translate(70, ${flowerCenterY})`}>
              {innerPetals.map(({ angle, fill, stroke }, i) => {
                const len = 7 + openFactor * 11
                return (
                  <ellipse
                    key={`ip-${i}`}
                    cx="0"
                    cy={-len / 2 - 1.5}
                    rx={2.5 + openFactor * 1.5}
                    ry={len / 2}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="0.3"
                    opacity={openFactor * 0.9}
                    transform={`rotate(${angle})`}
                  />
                )
              })}
            </g>
          )
        })()}

        {/* Centro da flor */}
        {budGrow > 0.3 && (() => {
          const s = Math.min(1, budGrow * 1.4)
          return (
            <g transform={`translate(70, ${flowerCenterY}) scale(${s})`}>
              <circle cx="0" cy="0" r="12" fill="url(#sf-center-o)" />
              <circle cx="0" cy="0" r="9" fill="url(#sf-center-i)" />
              {petalOpen > 0.4 && seedDots.map(({ x, y }, i) => (
                <circle key={`sd-${i}`} cx={x} cy={y} r="0.7" fill="#8d6e63" opacity="0.5" />
              ))}
              <circle cx="-3" cy="-3" r="2.5" fill="#8d6e63" opacity="0.15" />
            </g>
          )
        })()}

        {/* Partículas de pólen */}
        {isFullBloom && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            {[
              { cx: 58, cy: flowerCenterY - 22 },
              { cx: 82, cy: flowerCenterY - 18 },
              { cx: 65, cy: flowerCenterY - 30 },
              { cx: 76, cy: flowerCenterY - 26 },
            ].map((dot, i) => (
              <motion.circle
                key={`pl-${i}`}
                cx={dot.cx} cy={dot.cy} r="1"
                fill="#fff9c4"
                animate={{ opacity: [0, 0.6, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, delay: i * 1.2, ease: 'easeInOut' }}
              />
            ))}
          </motion.g>
        )}
      </svg>

      {/* Barra de progresso */}
      <div
        style={{
          width: barWidth,
          height: barHeight,
          borderRadius: barHeight / 2,
          backgroundColor: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <motion.div
          style={{
            height: '100%',
            borderRadius: barHeight / 2,
            background: 'linear-gradient(90deg, #43a047, #fbbf24, #f59e0b)',
            transformOrigin: 'left',
          }}
          initial={false}
          animate={{ width: `${p}%` }}
          transition={{ duration: 0.3, ease: 'linear' }}
        />
      </div>
    </div>
  )
}
