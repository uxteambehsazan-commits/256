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
    <div className="flex items-center justify-between px-4 py-2 glass-panel border-b border-purple-900/50">
      {/* Mission progress */}
      <div className="flex items-center gap-2">
        {MISSIONS.map((m, i) => (
          <div key={m.id} className="flex flex-col items-center gap-0.5">
            <span className={`text-lg transition-all ${i === state.currentMissionIndex ? 'scale-125' : i < state.currentMissionIndex ? 'opacity-60' : 'opacity-30'}`}>
              {i < state.currentMissionIndex ? '✓' : m.emoji}
            </span>
            <div className={`h-1 w-6 rounded-full transition-all ${i < state.currentMissionIndex ? 'bg-green-400' : i === state.currentMissionIndex ? 'bg-purple-400' : 'bg-gray-700'}`} />
          </div>
        ))}
      </div>

      {/* Timer */}
      <div className={`font-display text-3xl font-black transition-all ${isCritical ? 'animate-timer-warning' : isWarning ? 'text-orange-400' : 'text-white'}`}>
        {String(state.timeLeft).padStart(2, '0')}
      </div>

      {/* Scores mini */}
      <div className="flex items-center gap-2">
        {[...state.players].sort((a, b) => a.rank - b.rank).slice(0, 4).map(p => {
          const color = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
          return (
            <div key={p.id} className="flex items-center gap-1">
              <img src={avatarSrc(p.avatar)} alt="" className="w-6 h-6 rounded-full object-cover" />
              <span className="text-xs font-bold" style={{ color: color.light }}>{p.score}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
