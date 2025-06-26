import { useOnlineStatus } from './useEventListener'

export function useNetworkStatus() {
  const isOnline = useOnlineStatus()
  return { isOnline }
}
