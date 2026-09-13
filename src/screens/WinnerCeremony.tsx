import { useState, useEffect, useRef } from 'react'
import type { GameState, GameAction } from '../types'
import { PLAYER_COLORS, GAME_NAME } from '../constants'
import PlayerAvatar from '../components/PlayerAvatar'
import Confetti from '../components/Confetti'
import bmLogo from '../imports/03-BMC-Right_FA-EN_1.png'
import { saveGameScores } from '../lib/scores'

interface Props {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  onShowScores: () => void
}

const RANK_MEDAL = ['🥇', '🥈', '🥉']

function getGameUrl() {
  return typeof window !== 'undefined' ? window.location.href : 'https://behsazan.ir'
}

function buildShareText(players: GameState['players']): string {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const lines = sorted.slice(0, 3).map((p, i) => `${RANK_MEDAL[i]} ${p.name} — ${p.score.toLocaleString('fa-IR')} امتیاز`)
  const url = getGameUrl()
  return `🏆 نتایج ${GAME_NAME}\n\n${lines.join('\n')}\n\n🎮 بیا با ما بازی کن!\n${url}\n\nبهسازان ملت | Behsazan Mellat`
}

function buildInviteText(): string {
  const url = getGameUrl()
  return `🎮 بیا ${GAME_NAME} بازی کنیم!\n\nیه بازی رقابتی گروهی از بهسازان ملت — ۶ ماموریت، ۸ نفر، یه برنده!\n\n👇 لینک بازی:\n${url}\n\nبهسازان ملت | Behsazan Mellat`
}

async function shareResult(text: string, setCopied: (v: boolean) => void, label = 'score') {
  if (navigator.share) {
    try { await navigator.share({ title: GAME_NAME, text, url: getGameUrl() }); return } catch { /* fallthrough */ }
  }
  await navigator.clipboard.writeText(text)
  setCopied(true)
  setTimeout(() => setCopied(false), 2500)
}

type CopiedState = 'none' | 'score' | 'invite'

export default function WinnerCeremony({ state, dispatch, onShowScores }: Props) {
  const [reveal, setReveal] = useState(0)
  const [copied, setCopied] = useState<CopiedState>('none')
  const [tab, setTab] = useState<'podium' | 'all'>('podium')
  const savedRef = useRef(false)

  const ranked = [...state.players].sort((a, b) => b.score - a.score || a.totalResponseTime - b.totalResponseTime)
  const winner = ranked[0]
  const second = ranked[1]
  const third = ranked[2]
  const winnerColor = winner ? PLAYER_COLORS[winner.colorIndex % PLAYER_COLORS.length] : null

  useEffect(() => {
    const timings = [1200, 2800, 4800]
    const timers = timings.map((t, i) => setTimeout(() => setReveal(i + 1), t))
    return () => timers.forEach(clearTimeout)
  }, [])

  // Save scores once per game
  useEffect(() => {
    if (!savedRef.current && state.players.length > 0) {
      savedRef.current = true
      const gameId = `game-${Date.now()}`
      saveGameScores(state.players.map(p => ({ name: p.name, score: p.score })), gameId)
    }
  }, [state.players])

  const shareText = buildShareText(state.players)
  const inviteText = buildInviteText()

  return (
    <div className="h-full flex flex-col items-center overflow-hidden relative">
      <Confetti active={reveal >= 3} />

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 25%, #ffd60a18 0%, transparent 60%)' }} />
        {reveal >= 3 && [...Array(8)].map((_, i) => (
          <div key={i} className="absolute w-3 h-3 rounded-full animate-ping opacity-50"
            style={{
              background: ['#CC2229', '#ffd60a', '#e84249', '#fff', '#6D6E71', '#9e1a20'][i % 6],
              left: `${6 + i * 12}%`, top: `${15 + (i % 3) * 22}%`,
              animationDelay: `${i * 0.2}s`,
            }} />
        ))}
      </div>

      {/* Header */}
      <div className="w-full glass-panel bm-header-bar px-5 py-3 flex items-center gap-3 flex-shrink-0 z-10">
        <img src={bmLogo} alt="بهسازان ملت" className="h-8 object-contain opacity-80" />
        <div className="flex-1 text-center">
          <div className="font-display text-lg font-black text-yellow-400" style={{ textShadow: '0 0 16px #ffd60a' }}>
            🏆 بازی تموم شد!
          </div>
          <div className="text-xs" style={{ color: '#6D6E71' }}>{GAME_NAME}</div>
        </div>
        {reveal >= 3 && (
          <button
            onClick={() => shareResult(shareText, (v) => setCopied(v ? 'score' : 'none'))}
            className="btn-game px-3 py-2 rounded-xl text-sm font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#CC2229,#e84249)', boxShadow: '0 0 14px #CC222944' }}>
            {copied === 'score' ? '✓ کپی' : '📤 نتایج'}
          </button>
        )}
      </div>

      {/* Tab switcher */}
      {reveal >= 3 && (
        <div className="flex gap-2 px-5 pt-3 w-full max-w-lg z-10">
          {(['podium', 'all'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="btn-game flex-1 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: tab === t ? '#CC2229' : 'transparent',
                color: tab === t ? '#fff' : '#6D6E71',
                border: `1px solid ${tab === t ? '#CC2229' : '#333'}`,
              }}>
              {t === 'podium' ? '🏆 سکو' : '📋 همه امتیازات'}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 w-full overflow-y-auto flex flex-col items-center">

        {/* ── Podium tab ── */}
        {(tab === 'podium' || reveal < 3) && (
          <div className="flex flex-col items-center gap-4 px-4 py-4 w-full">

            {/* Podium */}
            <div className="flex items-end justify-center gap-3 w-full max-w-md">
              {/* 2nd */}
              <div className={`flex flex-col items-center gap-1.5 transition-all duration-700 ${reveal >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {second && (<>
                  <div className="text-3xl">🥈</div>
                  <PlayerAvatar avatar={second.avatar} colorIndex={second.colorIndex} size="md" />
                  <div className="text-xs font-black text-center leading-tight max-w-[72px] break-words" style={{ color: '#c0c0c0' }}>{second.name}</div>
                  <div className="font-display text-lg font-black text-white">{second.score}</div>
                  <div className="w-20 h-16 glass-panel rounded-t-xl flex items-center justify-center" style={{ borderColor: '#c0c0c033' }}>
                    <span className="font-display text-xl font-black" style={{ color: '#c0c0c0' }}>2</span>
                  </div>
                </>)}
              </div>

              {/* 1st */}
              <div className={`flex flex-col items-center gap-1.5 transition-all duration-700 ${reveal >= 3 ? 'opacity-100 translate-y-0 scale-110' : 'opacity-0 translate-y-8'}`}>
                {winner && winnerColor && (<>
                  <div className="text-4xl animate-bounce">👑</div>
                  <PlayerAvatar avatar={winner.avatar} colorIndex={winner.colorIndex} size="xl" isActive />
                  <div className="font-display text-xl font-black text-center max-w-[88px] break-words" style={{ color: winnerColor.light, textShadow: `0 0 20px ${winnerColor.bg}` }}>{winner.name}</div>
                  <div className="font-display text-2xl font-black" style={{ color: '#ffd60a', textShadow: '0 0 16px #ffd60a' }}>{winner.score}</div>
                  <div className="w-24 h-24 glass-panel rounded-t-xl flex items-center justify-center" style={{ borderColor: '#ffd60a44', boxShadow: '0 0 24px #ffd60a22' }}>
                    <span className="font-display text-2xl font-black" style={{ color: '#ffd60a' }}>1</span>
                  </div>
                </>)}
              </div>

              {/* 3rd */}
              <div className={`flex flex-col items-center gap-1.5 transition-all duration-700 ${reveal >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {third && (<>
                  <div className="text-3xl">🥉</div>
                  <PlayerAvatar avatar={third.avatar} colorIndex={third.colorIndex} size="md" />
                  <div className="text-xs font-black text-center leading-tight max-w-[72px] break-words" style={{ color: '#cd7f32' }}>{third.name}</div>
                  <div className="font-display text-lg font-black text-white">{third.score}</div>
                  <div className="w-16 h-12 glass-panel rounded-t-xl flex items-center justify-center" style={{ borderColor: '#cd7f3233' }}>
                    <span className="font-display text-xl font-black" style={{ color: '#cd7f32' }}>3</span>
                  </div>
                </>)}
              </div>
            </div>

            {/* Winner label */}
            {reveal >= 3 && winner && (
              <div className="animate-pop-in text-center">
                <div className="font-display text-2xl font-black text-yellow-400" style={{ textShadow: '0 0 24px #ffd60a' }}>
                  قهرمان {GAME_NAME}! 🏆
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── All scores tab ── */}
        {tab === 'all' && reveal >= 3 && (
          <div className="flex flex-col gap-2 px-4 py-4 w-full max-w-lg">
            {ranked.map((p, i) => {
              const color = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
              return (
                <div key={p.id}
                  className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-3 animate-slide-up"
                  style={{
                    animationDelay: `${i * 0.08}s`,
                    borderColor: i === 0 ? '#ffd60a44' : i === 1 ? '#c0c0c033' : i === 2 ? '#cd7f3233' : `${color.bg}22`,
                  }}>
                  <div className="font-display text-xl font-black w-8 text-center flex-shrink-0">
                    {i < 3 ? RANK_MEDAL[i] : <span style={{ color: '#6D6E71' }}>{i + 1}</span>}
                  </div>
                  <PlayerAvatar avatar={p.avatar} colorIndex={p.colorIndex} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-white truncate">{p.name}</div>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <div className="font-display text-xl font-black"
                      style={{ color: i === 0 ? '#ffd60a' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#CC2229' }}>
                      {p.score.toLocaleString('fa-IR')}
                    </div>
                    <div className="text-xs text-left" style={{ color: '#6D6E71' }}>امتیاز</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      {reveal >= 3 && (
        <div className="glass-panel w-full px-4 py-4 flex-shrink-0 z-10" style={{ borderTop: '1px solid #CC222922' }}>
          {/* Invite banner */}
          <button
            onClick={() => shareResult(inviteText, (v) => setCopied(v ? 'invite' : 'none'))}
            className="btn-game w-full mb-3 py-3 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#1a1a1c,#222224)', border: '1px solid #CC222966', boxShadow: '0 0 18px #CC222922' }}>
            {copied === 'invite'
              ? <><span>✓</span><span>لینک کپی شد — برای دوستات بفرست!</span></>
              : <><span>🔗</span><span>دعوت دوستان برای بازی</span></>}
          </button>
          {/* Action row */}
          <div className="flex gap-2 max-w-lg mx-auto">
            <button onClick={() => dispatch({ type: 'REPLAY' })}
              className="btn-game flex-1 py-3 rounded-2xl font-black text-white min-w-0"
              style={{ fontSize: 'clamp(0.7rem,3vw,0.875rem)', background: 'linear-gradient(135deg,#CC2229,#e84249)', boxShadow: '0 0 16px #CC222944' }}>
              🔥 دوباره
            </button>
            <button onClick={onShowScores}
              className="btn-game flex-1 py-3 rounded-2xl font-black min-w-0"
              style={{ fontSize: 'clamp(0.7rem,3vw,0.875rem)', background: 'rgba(204,34,41,0.08)', border: '1px solid #CC222944', color: '#e84249' }}>
              🏅 تابلو
            </button>
            <button onClick={() => dispatch({ type: 'NEW_PLAYERS' })}
              className="btn-game flex-1 py-3 rounded-2xl font-black min-w-0"
              style={{ fontSize: 'clamp(0.7rem,3vw,0.875rem)', border: '1px solid #333', color: '#6D6E71', background: 'transparent' }}>
              👥 جدید
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
