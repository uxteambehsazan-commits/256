import { useState } from 'react'
import type { GameState, GameAction } from '../types'
import { PLAYER_COLORS, generateRoomCode, GAME_NAME } from '../constants'
import PlayerAvatar from '../components/PlayerAvatar'
import { AVATAR_IMGS } from '../lib/avatars'
import { api } from '../lib/supabase'
import type { OnlineSession } from '../App'
import bmLogo from '../imports/03-BMC-Right_FA-EN_1.png'

interface Props {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  session?: OnlineSession
}

const LOCAL_ROOM_CODE = generateRoomCode()

function buildInviteText(code: string): string {
  const url = typeof window !== 'undefined' ? window.location.href : ''
  return `🎮 بیا ${GAME_NAME} بازی کنیم!\n\n۱. این لینک رو باز کن:\n${url}\n\n۲. روی «ورود با کد» بزن\n۳. کد اتاق رو وارد کن:\n\n   ${code}\n\nبهسازان ملت`
}

async function shareInvite(code: string, onDone: () => void) {
  const text = buildInviteText(code)
  const url = typeof window !== 'undefined' ? window.location.href : ''
  if (navigator.share) {
    try { await navigator.share({ title: GAME_NAME, text, url }); onDone(); return } catch { /* fallthrough */ }
  }
  try { await navigator.clipboard.writeText(text); onDone() } catch { /* ignore */ }
}

export default function Lobby({ state, dispatch, session }: Props) {
  const roomCode = session?.code ?? LOCAL_ROOM_CODE
  const isOnline = !!session
  const isHost = !isOnline || !!session?.isHost

  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(0)
  const [color, setColor] = useState(1)
  const [adding, setAdding] = useState(false)
  const [copied, setCopied] = useState(false)

  const activePlayers = state.players.filter(p => p.connected)
  const allReady = activePlayers.length >= 2 && activePlayers.every(p => p.ready)
  const canForceStart = activePlayers.length >= 2
  const usedColors = state.players.map(p => p.colorIndex)

  function toggleReady(playerId: string) {
    dispatch({ type: 'TOGGLE_READY', id: playerId })
  }

  function addPlayer() {
    if (!name.trim() || state.players.length >= 8) return
    dispatch({ type: 'ADD_PLAYER', name: name.trim(), avatar: String(avatar), colorIndex: color })
    setName('')
    setAdding(false)
    const next = [0,1,2,3,4,5,6,7].find(c => !usedColors.includes(c) && c !== color) ?? 2
    setColor(next)
    setAvatar((avatar + 1) % AVATAR_IMGS.length)
  }

  function handleShare() {
    shareInvite(roomCode, () => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* ══ HEADER ══ */}
      <div className="glass-panel flex-shrink-0 px-4 pt-3 pb-3 flex flex-col gap-2">
        {/* Row 1: back | title | player count */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch({ type: 'NEW_PLAYERS' })}
            className="btn-game flex-shrink-0 text-sm px-3 py-1.5 rounded-xl font-bold"
            style={{ background: '#1e1e20', border: '1px solid #2e2e32', color: '#6D6E71' }}>
            ← خروج
          </button>
          <div className="flex-1 text-center">
            <span className="font-display font-black text-white text-base">{GAME_NAME}</span>
            <span className="text-xs mr-1.5" style={{ color: '#6D6E71' }}>
              {isOnline ? (isHost ? '· میزبان' : '· بازیکن') : '· محلی'}
            </span>
          </div>
          <div className="flex-shrink-0 flex items-center gap-1" style={{ color: '#6D6E71' }}>
            <span className="text-xs">بازیکنان:</span>
            <span className="font-display font-black text-white text-sm">{activePlayers.length}</span>
            <span className="text-xs">/۸</span>
          </div>
        </div>

        {/* Row 2: room code | invite button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs flex-shrink-0" style={{ color: '#6D6E71' }}>کد اتاق:</span>
            <span
              className="font-display font-black text-xl tracking-widest truncate"
              style={{ color: '#CC2229', textShadow: '0 0 12px #CC222966', letterSpacing: '0.12em' }}>
              {roomCode}
            </span>
          </div>
          <button
            onClick={handleShare}
            className="btn-game flex-shrink-0 px-4 py-1.5 rounded-xl text-sm font-black text-white"
            style={{ background: copied ? '#16a34a' : 'linear-gradient(135deg,#CC2229,#e84249)' }}>
            {copied ? '✓ کپی' : '📤 دعوت'}
          </button>
        </div>
      </div>

      {/* ══ Invite instructions (online host) ══ */}
      {isOnline && isHost && (
        <div className="mx-4 mt-3 rounded-2xl px-4 py-3 flex-shrink-0"
          style={{ background: '#160808', border: '1px solid #CC222930' }}>
          <p className="text-xs font-bold mb-1.5" style={{ color: '#e84249' }}>📲 چطور بقیه وارد بشن؟</p>
          <p className="text-xs leading-5" style={{ color: '#aaa' }}>
            دکمه «دعوت» رو بزن ← لینک + کد برای دوستات بفرست ← اونا «ورود با کد» می‌زنن ← کد
            <span className="font-display font-black mx-1" style={{ color: '#CC2229' }}>{roomCode}</span>
            رو وارد می‌کنن
          </p>
        </div>
      )}

      {/* ══ Waiting (online non-host) ══ */}
      {isOnline && !isHost && (
        <div className="mx-4 mt-3 rounded-2xl px-4 py-3 flex-shrink-0 text-center"
          style={{ background: '#0f0f10', border: '1px solid #CC222922' }}>
          <p className="text-sm font-bold" style={{ color: '#e84249' }}>⏳ منتظر میزبان...</p>
          <p className="text-xs mt-0.5" style={{ color: '#6D6E71' }}>وقتی همه آماده شدن، میزبان بازی رو شروع می‌کنه</p>
        </div>
      )}

      {/* ══ Player list ══ */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">

        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold text-sm" style={{ color: '#CC2229' }}>بازیکنان</span>
          {activePlayers.length < 2 && (
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: '#ffd60a18', color: '#ffd60a', border: '1px solid #ffd60a30' }}>
              حداقل ۲ نفر لازمه
            </span>
          )}
        </div>

        {activePlayers.map((p, i) => {
          const pc = PLAYER_COLORS[p.colorIndex % PLAYER_COLORS.length]
          const pIsHost = p.id === state.hostId
          return (
            <div key={p.id}
              className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-3 animate-slide-up"
              style={{ animationDelay: `${i * 0.06}s`, borderColor: `${pc.bg}44` }}>
              <PlayerAvatar avatar={p.avatar} colorIndex={p.colorIndex} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-white text-sm truncate">{p.name}</span>
                  {pIsHost && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 font-bold"
                      style={{ background: '#ffd60a18', color: '#ffd60a', border: '1px solid #ffd60a33' }}>
                      👑 میزبان
                    </span>
                  )}
                </div>
                <button onClick={() => toggleReady(p.id)}
                  className="btn-game text-xs px-3 py-1 rounded-full font-bold"
                  style={{
                    background: p.ready ? `${pc.bg}28` : 'transparent',
                    border: `1px solid ${p.ready ? pc.bg : '#3a3a3e'}`,
                    color: p.ready ? pc.light : '#6D6E71',
                  }}>
                  {p.ready ? '✓ آماده‌ام' : 'آماده نیستم'}
                </button>
              </div>
              {isHost && (
                <button onClick={() => dispatch({ type: 'REMOVE_PLAYER', id: p.id })}
                  className="btn-game text-xs w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: '#1e1e20', color: '#6D6E71' }}>
                  ✕
                </button>
              )}
            </div>
          )
        })}

        {/* Add player (local mode) */}
        {!isOnline && activePlayers.length < 8 && !adding && (
          <button onClick={() => setAdding(true)}
            className="btn-game glass-panel rounded-2xl px-4 py-3.5 flex items-center justify-center gap-2"
            style={{ border: '1.5px dashed #CC222950', color: '#CC2229' }}>
            <span className="text-lg font-black">+</span>
            <span className="font-bold text-sm">افزودن بازیکن</span>
          </button>
        )}

        {/* Add player form (local) */}
        {adding && !isOnline && (
          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-3 animate-slide-up">
            <p className="font-black text-sm" style={{ color: '#CC2229' }}>بازیکن جدید</p>
            <input
              className="w-full rounded-xl px-4 py-3 text-white outline-none text-sm"
              style={{ background: '#1e1e20', border: '1.5px solid #CC222966' }}
              placeholder="اسم بازیکن..." value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPlayer()}
              autoFocus maxLength={14}
            />
            <div>
              <p className="text-xs mb-2" style={{ color: '#6D6E71' }}>آواتار</p>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_IMGS.map((src, i) => (
                  <button key={i} onClick={() => setAvatar(i)}
                    className="btn-game w-10 h-10 rounded-xl overflow-hidden transition-all"
                    style={{ border: `2px solid ${avatar === i ? '#CC2229' : '#2e2e32'}`, opacity: avatar === i ? 1 : 0.5 }}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs mb-2" style={{ color: '#6D6E71' }}>رنگ</p>
              <div className="flex gap-2 flex-wrap">
                {PLAYER_COLORS.map((c, i) => (
                  <button key={i} onClick={() => setColor(i)} disabled={usedColors.includes(i)}
                    className="btn-game w-8 h-8 rounded-full disabled:opacity-25"
                    style={{ background: c.bg, border: `3px solid ${color === i ? '#fff' : 'transparent'}`, transform: color === i ? 'scale(1.2)' : 'scale(1)' }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setAdding(false)}
                className="btn-game flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ background: '#1e1e20', border: '1.5px solid #2e2e32', color: '#6D6E71' }}>
                لغو
              </button>
              <button onClick={addPlayer} disabled={!name.trim()}
                className="btn-game py-3 px-5 rounded-xl font-black text-white text-sm disabled:opacity-35"
                style={{ flex: 2, background: 'linear-gradient(135deg,#CC2229,#e84249)' }}>
                اضافه کن
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══ Start button (host only) ══ */}
      {isHost && (
        <div className="glass-panel px-4 py-4 flex-shrink-0" style={{ borderTop: '1.5px solid #CC222920' }}>
          {activePlayers.length < 2 ? (
            <p className="text-center text-xs mb-3" style={{ color: '#6D6E71' }}>
              هنوز به یک بازیکن دیگه نیاز داری
            </p>
          ) : !allReady ? (
            <div className="flex flex-col gap-2 mb-3">
              <p className="text-center text-xs" style={{ color: '#6D6E71' }}>
                {activePlayers.filter(p => !p.ready).length} نفر هنوز آماده نشدن
              </p>
              <button
                onClick={() => dispatch({ type: 'START_GAME' })}
                className="btn-game w-full py-3 rounded-2xl font-bold text-sm text-white"
                style={{ background: '#1e1e20', border: '1.5px solid #CC222940', color: '#e84249' }}>
                شروع بدون انتظار →
              </button>
            </div>
          ) : null}
          <button
            onClick={() => canForceStart && dispatch({ type: 'START_GAME' })}
            disabled={!canForceStart}
            className="btn-game w-full py-4 rounded-2xl font-black text-xl text-white disabled:opacity-30 transition-all"
            style={allReady
              ? { background: 'linear-gradient(135deg,#CC2229,#e84249)', boxShadow: '0 4px 28px #CC222955' }
              : canForceStart
                ? { background: 'linear-gradient(135deg,#8B0000,#CC2229)' }
                : { background: '#1a1a1c' }}>
            🚀 شروع بازی!
          </button>
        </div>
      )}
    </div>
  )
}
