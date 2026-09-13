import { useState } from 'react'
import type { GameAction, GameState } from '../types'
import { PLAYER_COLORS, GAME_NAME } from '../constants'
import { api } from '../lib/supabase'
import { AVATAR_IMGS } from '../lib/avatars'
import type { OnlineSession } from '../App'
import bmLogo from '../imports/03-BMC-Right_FA-EN_1.png'
import backImg from '../imports/image-6.png'

interface Props {
  dispatch: React.Dispatch<GameAction>
  onOnlineCreate: (session: OnlineSession) => void
  onOnlineJoin: (session: OnlineSession, state: null) => void
  onShowScores: () => void
  onShowCredits: () => void
  onShowTutorial: () => void
}

type Step = 'start' | 'create-local' | 'create-online' | 'join'

/* ── Small reusable pieces ── */
function Input({ value, onChange, placeholder, onEnter, dir = 'rtl', autoFocus = false, large = false }: {
  value: string; onChange: (v: string) => void; placeholder: string
  onEnter?: () => void; dir?: string; autoFocus?: boolean; large?: boolean
}) {
  return (
    <input
      value={value} onChange={e => onChange(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && onEnter?.()}
      placeholder={placeholder} autoFocus={autoFocus}
      maxLength={large ? 7 : 14} dir={dir}
      className={`w-full rounded-2xl text-white outline-none transition-all placeholder:opacity-40 ${large ? 'text-center text-3xl font-display font-black py-4 tracking-widest' : 'text-base py-3.5 px-4'}`}
      style={{ background: '#1e1e20', border: `1.5px solid ${value ? '#CC2229' : '#2e2e32'}` }}
    />
  )
}

function PrimaryBtn({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="btn-game w-full py-4 rounded-2xl font-black text-lg text-white disabled:opacity-35"
      style={{ background: disabled ? '#2a2a2c' : 'linear-gradient(135deg,#CC2229,#e84249)', boxShadow: disabled ? 'none' : '0 4px 24px #CC222944' }}>
      {children}
    </button>
  )
}

function BackBtn({ onBack }: { onBack: () => void }) {
  return (
    <button onClick={onBack} className="btn-game py-3.5 px-5 rounded-2xl font-bold text-base"
      style={{ background: '#1e1e20', border: '1.5px solid #2e2e32', color: '#6D6E71' }}>
      ← برگشت
    </button>
  )
}

function AvatarPicker({ avatar, setAvatar, color, setColor }: {
  avatar: number; setAvatar: (i: number) => void; color: number; setColor: (i: number) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-xs mb-2" style={{ color: '#6D6E71' }}>آواتار</p>
        <div className="flex gap-2 flex-wrap">
          {AVATAR_IMGS.map((src, i) => (
            <button key={i} onClick={() => setAvatar(i)}
              className="btn-game w-11 h-11 rounded-xl transition-all overflow-hidden"
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
            <button key={i} onClick={() => setColor(i)}
              className="btn-game w-9 h-9 rounded-full transition-all"
              style={{ background: c.bg, border: `3px solid ${color === i ? '#fff' : 'transparent'}`, transform: color === i ? 'scale(1.2)' : 'scale(1)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Home({ dispatch, onOnlineCreate, onOnlineJoin, onShowScores, onShowCredits, onShowTutorial }: Props) {
  const [step, setStep] = useState<Step>('start')
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(0)
  const [color, setColor] = useState(0)
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function reset() { setName(''); setError(''); setLoading(false); setRoomCode('') }
  function goBack() { setStep('start'); reset() }

  function createLocal() {
    if (!name.trim()) return
    dispatch({ type: 'CREATE_GAME', name: name.trim(), avatar: String(avatar), colorIndex: color })
  }

  async function createOnline() {
    if (!name.trim()) return
    setLoading(true); setError('')
    try {
      const res = await api.createRoom(name.trim(), String(avatar), color) as any
      if (res.error) { setError(res.error); setLoading(false); return }
      dispatch({ type: 'CREATE_GAME', name: name.trim(), avatar: String(avatar), colorIndex: color })
      onOnlineCreate({ code: res.code, playerId: res.playerId, isHost: true })
    } catch { setError('خطا در اتصال به سرور'); setLoading(false) }
  }

  async function joinOnline() {
    const raw = roomCode.replace('-', '')
    if (raw.length < 4) { setError('کد اتاق صحیح نیست'); return }
    if (!name.trim()) { setError('اسمت رو بنویس'); return }
    setLoading(true); setError('')
    try {
      const res = await api.joinRoom(roomCode, name.trim(), String(avatar), color) as any
      if (res.error) { setError(res.error); setLoading(false); return }
      onOnlineJoin({ code: roomCode, playerId: res.playerId, isHost: false, joinInfo: { name: name.trim(), avatar: String(avatar), colorIndex: color } }, null)
    } catch { setError('اتاق پیدا نشد یا خطای اتصال'); setLoading(false) }
  }

  function handleCode(v: string) {
    let c = v.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (c.length > 2) c = c.slice(0, 2) + '-' + c.slice(2, 6)
    setRoomCode(c); setError('')
  }

  /* ── Sub-screens ── */
  if (step === 'create-local') return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="flex-1 flex flex-col gap-5 p-5 pt-8 max-w-md mx-auto w-full">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="btn-game text-2xl" style={{ color: '#6D6E71' }}>←</button>
          <img src={bmLogo} alt="" className="h-7 object-contain opacity-80" />
        </div>
        <div className="text-center py-2">
          <img src={AVATAR_IMGS[avatar]} alt="" className="w-16 h-16 rounded-full object-cover mx-auto" />
          <h2 className="text-2xl font-black text-white">{GAME_NAME}</h2>
          <p className="text-sm mt-1" style={{ color: '#6D6E71' }}>بازی گروهی — یک دستگاه</p>
        </div>
        <div className="glass-panel rounded-3xl p-5 flex flex-col gap-4">
          <div>
            <p className="text-xs mb-2" style={{ color: '#6D6E71' }}>نام میزبان</p>
            <Input value={name} onChange={setName} placeholder="اسمت رو بنویس..." onEnter={createLocal} autoFocus />
          </div>
          <AvatarPicker avatar={avatar} setAvatar={setAvatar} color={color} setColor={setColor} />
          <div className="flex gap-3 pt-1">
            <BackBtn onBack={goBack} />
            <PrimaryBtn onClick={createLocal} disabled={!name.trim()}>بریم! 🚀</PrimaryBtn>
          </div>
        </div>
      </div>
    </div>
  )

  if (step === 'create-online') return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="flex-1 flex flex-col gap-5 p-5 pt-8 max-w-md mx-auto w-full">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="btn-game text-2xl" style={{ color: '#6D6E71' }}>←</button>
          <img src={bmLogo} alt="" className="h-7 object-contain opacity-80" />
        </div>
        <div className="text-center py-2">
          <div className="text-5xl mb-2">🌐</div>
          <h2 className="text-2xl font-black text-white">ساخت اتاق آنلاین</h2>
          <p className="text-sm mt-1" style={{ color: '#6D6E71' }}>کد اتاق رو برای دوستات بفرست</p>
        </div>
        <div className="glass-panel rounded-3xl p-5 flex flex-col gap-4">
          <div>
            <p className="text-xs mb-2" style={{ color: '#6D6E71' }}>نام میزبان</p>
            <Input value={name} onChange={setName} placeholder="اسمت رو بنویس..." onEnter={createOnline} autoFocus />
          </div>
          <AvatarPicker avatar={avatar} setAvatar={setAvatar} color={color} setColor={setColor} />
          {error && <p className="text-sm text-center animate-slide-up" style={{ color: '#e84249' }}>{error}</p>}
          <div className="flex gap-3 pt-1">
            <BackBtn onBack={goBack} />
            <PrimaryBtn onClick={createOnline} disabled={!name.trim() || loading}>
              {loading ? '⏳ در حال ساخت...' : '🌐 ساخت اتاق'}
            </PrimaryBtn>
          </div>
        </div>
      </div>
    </div>
  )

  if (step === 'join') return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="flex-1 flex flex-col gap-5 p-5 pt-8 max-w-md mx-auto w-full">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="btn-game text-2xl" style={{ color: '#6D6E71' }}>←</button>
          <img src={bmLogo} alt="" className="h-7 object-contain opacity-80" />
        </div>
        <div className="text-center py-2">
          <div className="text-5xl mb-2">🔑</div>
          <h2 className="text-2xl font-black text-white">ورود به اتاق</h2>
          <p className="text-sm mt-1" style={{ color: '#6D6E71' }}>کد اتاق رو از میزبان بگیر</p>
        </div>
        <div className="glass-panel rounded-3xl p-5 flex flex-col gap-4">
          <div>
            <p className="text-xs mb-2 text-center" style={{ color: '#6D6E71' }}>کد اتاق</p>
            <Input value={roomCode} onChange={handleCode} placeholder="XX-XXXX" dir="ltr" large autoFocus />
          </div>
          <div>
            <p className="text-xs mb-2" style={{ color: '#6D6E71' }}>نام بازیکن</p>
            <Input value={name} onChange={v => { setName(v); setError('') }} placeholder="اسمت رو بنویس..." onEnter={joinOnline} />
          </div>
          <AvatarPicker avatar={avatar} setAvatar={setAvatar} color={color} setColor={setColor} />
          {error && <p className="text-sm text-center animate-slide-up" style={{ color: '#e84249' }}>{error}</p>}
          <div className="flex gap-3 pt-1">
            <BackBtn onBack={goBack} />
            <PrimaryBtn onClick={joinOnline} disabled={!roomCode || !name.trim() || loading}>
              {loading ? '⏳ در حال ورود...' : '🚀 ورود'}
            </PrimaryBtn>
          </div>
        </div>
      </div>
    </div>
  )

  /* ── Main start screen ── */
  return (
    <div className="h-full flex flex-col relative overflow-hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)', paddingTop: 'env(safe-area-inset-top)' }}>

      {/* ── 1. Title — top, fixed height ── */}
      <div className="relative z-10 flex-shrink-0 flex flex-col items-center pt-4 pb-1 px-5 animate-pop-in">
        <div className="flex items-center gap-2 justify-center">
          <div className="h-px w-6 opacity-40" style={{ background: '#CC2229' }} />
          <h1 className="font-display font-black text-white" style={{ fontSize: 'clamp(1.4rem,6vw,2rem)', textShadow: '0 0 28px #CC222966' }}>
            {GAME_NAME}
          </h1>
          <div className="h-px w-6 opacity-40" style={{ background: '#CC2229' }} />
        </div>
        <p className="text-xs mt-0.5" style={{ color: '#6D6E71' }}>بازی گروهی رقابتی — ۳ تا ۸ نفر</p>
      </div>

      {/* ── 2. Illustration — fixed height so buttons always visible ── */}
      <div className="relative flex-shrink-0 flex items-end justify-center overflow-hidden"
        style={{ height: 'clamp(200px, 48vh, 360px)' }}>
        <img
          src={backImg}
          alt=""
          aria-hidden
          className="h-full w-auto object-contain object-bottom pointer-events-none select-none"
        />
        <div className="absolute inset-x-0 top-0 h-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, #111112, transparent)' }} />
        <div className="absolute inset-x-0 bottom-0 h-8 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #111112, transparent)' }} />
      </div>

      {/* ── 3. Buttons — bottom, fixed, never pushed off screen ── */}
      <div className="relative z-10 flex-1 flex flex-col justify-end gap-2 px-4 pb-4 w-full max-w-sm mx-auto">
        <button onClick={() => setStep('create-online')}
          className="btn-game w-full rounded-2xl font-black text-white"
          style={{ padding: 'clamp(0.75rem,3vw,1.25rem) 1rem', fontSize: 'clamp(0.95rem,4vw,1.25rem)', background: 'linear-gradient(135deg,#CC2229,#e84249)', boxShadow: '0 4px 28px #CC222955' }}>
          🌐 اتاق آنلاین
        </button>

        <div className="flex gap-2">
          <button onClick={() => setStep('join')}
            className="btn-game flex-1 rounded-2xl font-bold text-white"
            style={{ padding: 'clamp(0.6rem,2.5vw,1rem) 0.5rem', fontSize: 'clamp(0.75rem,3.5vw,0.875rem)', background: 'rgba(204,34,41,0.08)', border: '1.5px solid #CC222940' }}>
            🔑 ورود با کد
          </button>
          <button onClick={() => setStep('create-local')}
            className="btn-game flex-1 rounded-2xl font-bold text-white"
            style={{ padding: 'clamp(0.6rem,2.5vw,1rem) 0.5rem', fontSize: 'clamp(0.75rem,3.5vw,0.875rem)', background: 'rgba(109,110,113,0.1)', border: '1.5px solid #6D6E7140' }}>
            🎮 یک دستگاه
          </button>
        </div>

        <button onClick={onShowTutorial}
          className="btn-game w-full rounded-2xl font-bold flex items-center justify-center gap-2"
          style={{ padding: 'clamp(0.55rem,2vw,0.875rem) 1rem', fontSize: 'clamp(0.75rem,3vw,0.875rem)', background: 'rgba(255,214,10,0.07)', border: '1.5px solid #ffd60a30', color: '#fde68a' }}>
          <span>📖</span>
          <span>راهنمای بازی</span>
        </button>

        <div className="flex gap-2">
          <button onClick={onShowScores}
            className="btn-game flex-1 rounded-2xl font-bold"
            style={{ padding: 'clamp(0.5rem,2vw,0.75rem) 0.5rem', fontSize: 'clamp(0.75rem,3vw,0.875rem)', background: 'rgba(204,34,41,0.06)', border: '1.5px solid #CC222930', color: '#e84249' }}>
            🏅 امتیازات
          </button>
          <button onClick={onShowCredits}
            className="btn-game flex-1 rounded-2xl font-bold"
            style={{ padding: 'clamp(0.5rem,2vw,0.75rem) 0.5rem', fontSize: 'clamp(0.75rem,3vw,0.875rem)', background: 'rgba(109,110,113,0.07)', border: '1.5px solid #6D6E7130', color: '#9a9b9e' }}>
            👥 تهیه‌کنندگان
          </button>
        </div>
      </div>
    </div>
  )
}
