import { useServerHealth } from './useApi'

export function useServerConnection() {
  const [isServerConnected, lastChecked, checkServerConnection] =
    useServerHealth('/api/todos', 30000)

  return {
    isServerConnected,
    lastChecked,
    checkServerConnection,
  }
}
