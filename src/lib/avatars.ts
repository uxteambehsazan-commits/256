import a1 from '../imports/1.png'
import a2 from '../imports/2.png'
import a3 from '../imports/3.png'
import a4 from '../imports/4.png'
import a5 from '../imports/5.png'
import a6 from '../imports/6.png'
import a7 from '../imports/7.png'

export const AVATAR_IMGS = [a1, a2, a3, a4, a5, a6, a7]

export function avatarSrc(av: string): string {
  const idx = parseInt(av, 10)
  return AVATAR_IMGS[idx] ?? AVATAR_IMGS[0]
}
