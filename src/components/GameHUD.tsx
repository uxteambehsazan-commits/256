import { MISSIONS, PLAYER_COLORS } from '../constants'
import { avatarSrc } from '../lib/avatars'
import type { GameState } from '../types'

interface Props {
  state: GameState
}

export default function GameHUD({ state }: Props) {
  const mission = MISSIONS[state.currentMissionIndex]
  const isWarning = state.timeLeft <= 5 && state.timeLeft > 0
  const isCritical = state.timeLeft <= 3 && state.timeLeft > 0

  return (
    <div className="flex items-center justify-between px-3 py-2 glass-panel border-b border-purple-900/50 gap-2">
      {/* Mission progress */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {MISSIONS.map((m, i) => (
          <div key={m.id} className="flex flex-col items-center gap-0.5">
            <span className={`text-sm transition-all ${i === state.currentMissionIndex ? 'scale-125' : i < state.currentMissionIndex ? 'opacity-60' : 'opacity-30'}`}>
              {i < state.currentMissionIndex ? '✓' : m.emoji}
            </span>
            <div className={`h-0.5 w-4 rounded-full transition-all ${i < state.currentMissionIndex ? 'bg-green-400' : i === state.currentMissionIndex ? 'bg-purple-400' : 'bg-gray-700'}`} />
          </div>
        ))}
      </div>

      {/* Timer */}
      <div className={`font-display text-2xl font-black transition-all flex-shrink-0 ${isCritical ? 'animate-timer-warning' : isWarning ? 'text-orange-400' : 'text-white'}`}>
        {String(state.timeLeft).padStart(2, '0')}
      </div>

      {/* Scores mini */}
      <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
        {[...state.players].sort((a, b) => a.rank - b.rank).slice(0, 4).map(p => {
          const color = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
          return (
            <div key={p.id} className="flex items-center gap-0.5 flex-shrink-0">
              <img src={avatarSrc(p.avatar)} alt="" className="w-5 h-5 rounded-full object-cover" />
              <span className="text-xs font-bold" style={{ color: color.light }}>{p.score}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
