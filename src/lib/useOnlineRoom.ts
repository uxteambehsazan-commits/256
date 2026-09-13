import { useEffect, useRef, useCallback } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { GameState, GameAction } from '../types'

export interface JoinInfo {
  name: string
  avatar: string
  colorIndex: number
}

interface Options {
  code: string
  isHost: boolean
  state: GameState
  dispatch: React.Dispatch<GameAction>
  onRemoteState: (s: GameState) => void
  joinInfo?: JoinInfo
}

export function useOnlineRoom({ code, isHost, state, dispatch, onRemoteState, joinInfo }: Options) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const lastStateRef = useRef<string>('')
  const mountedRef = useRef(true)

  // Subscribe once to the broadcast channel
  useEffect(() => {
    mountedRef.current = true

    const channel = supabase.channel(`room-${code}`, {
      config: { broadcast: { self: false } },
    })

    channel
      // Non-host receives game state pushed by host
      .on('broadcast', { event: 'state' }, ({ payload }: any) => {
        if (!mountedRef.current || isHost) return
        if (payload?.state) onRemoteState(payload.state as GameState)
      })
      // Host receives actions queued by non-hosts
      .on('broadcast', { event: 'action' }, ({ payload }: any) => {
        if (!mountedRef.current || !isHost) return
        if (payload?.action) dispatch(payload.action as GameAction)
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED' || !mountedRef.current) return
        if (!isHost && joinInfo) {
          // Announce join to the host
          await channel.send({
            type: 'broadcast',
            event: 'action',
            payload: {
              action: {
                type: 'ADD_PLAYER',
                name: joinInfo.name,
                avatar: joinInfo.avatar,
                colorIndex: joinInfo.colorIndex,
              },
            },
          })
        }
      })

    channelRef.current = channel

    return () => {
      mountedRef.current = false
      supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, isHost])

  // Host: broadcast state to all non-hosts on every change
  useEffect(() => {
    if (!isHost || !channelRef.current) return
    const str = JSON.stringify(state)
    if (str === lastStateRef.current) return
    lastStateRef.current = str
    channelRef.current.send({
      type: 'broadcast',
      event: 'state',
      payload: { state },
    }).catch(() => {})
  }, [state, isHost])

  // Non-host: send an action to the host via broadcast
  const sendAction = useCallback((action: GameAction) => {
    if (isHost) {
      dispatch(action)
    } else if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'action',
        payload: { action },
      }).catch(() => {})
    }
  }, [isHost, dispatch])

  return { sendAction }
}
