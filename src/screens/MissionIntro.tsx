import type { GameState } from '../types'
import { MISSIONS, PLAYER_COLORS } from '../constants'
import { avatarSrc } from '../lib/avatars'

interface Props { state: GameState }

export default function MissionIntro({ state }: Props) {
  const mission = MISSIONS[state.currentMissionIndex]
  const firstPlayerId = state.turnOrder[0]
  const firstPlayer = state.players.find(p => p.id === firstPlayerId)
  const firstColor = firstPlayer ? PLAYER_COLORS[firstPlayer.colorIndex % PLAYER_COLORS.length] : null

  return (
    <div className="h-full flex flex-col items-center justify-center gap-8 relative overflow-hidden">
      {/* Bg glow */}
      <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #9333ea, transparent)', top: '20%', left: '50%', transform: 'translateX(-50%)' }}
      />

      <div className="text-center animate-pop-in">
        <div className="text-8xl mb-4 animate-float">{mission.emoji}</div>
        <div className="text-purple-400 font-bold text-lg tracking-wider mb-2">
          مأموریت {String(state.currentMissionIndex + 1).padStart(2, '0')} از ۰۶
        </div>
        <h1 className="font-display text-5xl font-black text-white mb-3"
          style={{ textShadow: '0 0 30px #a855f7' }}>
          {mission.name}
        </h1>
        <p className="text-purple-300 text-lg">{mission.desc}</p>
      </div>

      <div className="glass-panel rounded-2xl px-8 py-4 text-center animate-slide-up max-w-sm" style={{ animationDelay: '0.2s' }}>
        <div className="text-sm text-gray-400 mb-1">امتیازدهی</div>
        <div className="text-purple-200 font-bold">{mission.scoring}</div>
      </div>

      {mission.type === 'turn' && firstPlayer && firstColor && (
        <div className="animate-slide-up text-center" style={{ animationDelay: '0.4s' }}>
          <div className="text-sm text-gray-400 mb-2">👑 شروع‌کننده راند</div>
          <div className="flex items-center gap-3 glass-panel rounded-2xl px-6 py-3">
            <img src={avatarSrc(firstPlayer.avatar)} alt="" className="w-12 h-12 rounded-full object-cover" />
            <span className="font-black text-xl" style={{ color: firstColor.light }}>{firstPlayer.name}</span>
          </div>
        </div>
      )}

      {mission.type === 'simultaneous' && (
        <div className="text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-yellow-400 font-bold text-lg">⚡ همه با هم بازی می‌کنید!</div>
        </div>
      )}

      {mission.type === 'cooperative' && (
        <div className="text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-green-400 font-bold text-lg">🤝 با هم کار کنید!</div>
        </div>
      )}

      <div className="font-display text-6xl font-black animate-timer-warning"
        style={{ color: state.timeLeft <= 2 ? '#ff2d78' : '#ffd60a' }}>
        {state.timeLeft > 0 ? state.timeLeft : ''}
      </div>
    </div>
  )
}
