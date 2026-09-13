import type { MissionConfig, LogicQuestion } from './types'

export const GAME_NAME = 'ماموریت ۲۵۶'
export const GAME_NAME_EN = 'Mission 256'

export const MISSIONS: MissionConfig[] = [
  {
    id: 'SPEED',
    name: 'حمله سرعت',
    emoji: '⚡',
    fullName: 'مأموریت ۰۱ — حمله سرعت',
    type: 'turn',
    timer: 15,
    desc: 'سریع‌ترین هدف را بزن!',
    scoring: 'درست: +۱۰۰ | اشتباه: ۲۵- | بونوس سرعت: تا +۱۰۰',
  },
  {
    id: 'MEMORY',
    name: 'استاد حافظه',
    emoji: '🧠',
    fullName: 'مأموریت ۰۲ — استاد حافظه',
    type: 'simultaneous',
    timer: 30,
    desc: 'همه با هم جفت‌های یکسان را پیدا کنید!',
    scoring: 'هر جفت درست: +۱۰۰ | اشتباه: ۰',
  },
  {
    id: 'LOGIC',
    name: 'شکست منطق',
    emoji: '🧩',
    fullName: 'مأموریت ۰۳ — شکست منطق',
    type: 'turn',
    timer: 15,
    desc: 'الگو را کامل کن!',
    scoring: 'درست: +۱۵۰ | اشتباه: ۰ | تایم‌اوت: ۰',
  },
  {
    id: 'FASTEST',
    name: 'سریع‌ترین انگشت',
    emoji: '🎯',
    fullName: 'مأموریت ۰۴ — سریع‌ترین انگشت',
    type: 'simultaneous',
    timer: 10,
    desc: 'اول دکمه را بزن!',
    scoring: '🥇 +۳۰۰ | 🥈 +۲۰۰ | 🥉 +۱۰۰ | بقیه +۵۰ | استارت زود: ۵۰-',
  },
  {
    id: 'TEAM',
    name: 'چالش تیمی',
    emoji: '🤝',
    fullName: 'مأموریت ۰۵ — چالش تیمی',
    type: 'cooperative',
    timer: 45,
    desc: 'با هم ماشین را در ترتیب درست روشن کنید!',
    scoring: 'موفقیت تیم: هر بازیکن +۳۰۰ | شکست: ۰',
  },
  {
    id: 'FINAL',
    name: 'مأموریت نهایی',
    emoji: '💥',
    fullName: 'مأموریت ۰۶ — مأموریت ۲۵۶',
    type: 'simultaneous',
    timer: 30,
    desc: 'همه چیز می‌تونه عوض بشه! امتیاز ×۲',
    scoring: 'هر کلیک: +۱۰ × ضریب ۲ | رتبه اول: +۲۰۰',
  },
]

/* Behsazan Mellat–compatible player palette:
   warm/neutral tones that coexist with the red + gray brand */
export const PLAYER_COLORS = [
  { bg: '#CC2229', light: '#f47a7e', label: 'قرمز' },       // brand red
  { bg: '#6D6E71', light: '#b0b1b4', label: 'خاکستری' },    // brand gray
  { bg: '#c0392b', light: '#e88080', label: 'تیره‌قرمز' },
  { bg: '#e67e22', light: '#f4a65a', label: 'نارنجی' },
  { bg: '#8e44ad', light: '#c39bd3', label: 'بنفش' },
  { bg: '#16a085', light: '#76d7c4', label: 'سبز' },
  { bg: '#2980b9', light: '#85c1e9', label: 'آبی' },
  { bg: '#d4ac0d', light: '#f7dc6f', label: 'طلایی' },
]

export const AVATARS = ['0', '1', '2', '3', '4', '5', '6']

export const LOGIC_PUZZLES: LogicQuestion[] = [
  { sequence: ['🟦', '🟨', '🟦', '🟨', '?'], options: ['🟦', '🟨', '🟥', '🟩'], answer: 0, hint: 'الگوی تکرار' },
  { sequence: ['1', '2', '4', '8', '?'], options: ['10', '16', '12', '14'], answer: 1, hint: 'هر عدد دو برابر می‌شود' },
  { sequence: ['🔴', '🔴', '🔵', '🔴', '🔴', '🔵', '?'], options: ['🔴', '🔵', '🟢', '🟡'], answer: 0, hint: 'الگوی ۲+۱' },
  { sequence: ['3', '6', '9', '12', '?'], options: ['14', '15', '16', '18'], answer: 1, hint: 'جدول ضرب ۳' },
  { sequence: ['⬛', '⬜', '⬛', '⬜', '⬛', '?'], options: ['⬛', '⬜', '🟥', '🟦'], answer: 1, hint: 'الگوی متناوب' },
  { sequence: ['1', '1', '2', '3', '5', '?'], options: ['6', '7', '8', '10'], answer: 2, hint: 'دنباله فیبوناچی' },
  { sequence: ['🌙', '⭐', '🌙', '⭐', '⭐', '?'], options: ['🌙', '⭐', '☀️', '🌟'], answer: 0, hint: 'الگوی ۱+۲' },
  { sequence: ['100', '90', '80', '70', '?'], options: ['65', '55', '60', '50'], answer: 2, hint: 'هر بار ۱۰ کم می‌شود' },
]

export const MEMORY_EMOJIS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🥝', '🍒', '🫐', '🍍']

export const SPEED_EMOJIS = [
  ['⭐', '🌙', '☀️', '🌟', '💫', '✨', '🔥', '💧', '🍃'],
  ['🎯', '⚽', '🏀', '🎾', '🏈', '🎱', '🏐', '🏉', '🎳'],
  ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨'],
  ['🚀', '✈️', '🚂', '🚁', '⛵', '🏎️', '🛸', '🛩️', '🚀'],
]

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    if (i === 2) code += '-'
    else code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function formatNumber(n: number): string {
  return n.toLocaleString('fa-IR')
}
