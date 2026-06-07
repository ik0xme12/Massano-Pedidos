'use client'

export function useClearCache() {
  const clearCache = async () => {
    try {
      // Limpiar localStorage
      localStorage.clear()

      // Limpiar sessionStorage
      sessionStorage.clear()

      // Unregistrar service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (const registration of registrations) {
          await registration.unregister()
        }
      }

      // Limpiar IndexedDB (usado por some apps)
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases()
        for (const db of databases) {
          indexedDB.deleteDatabase(db.name)
        }
      }

      // Esperar un poco y recargar
      setTimeout(() => {
        window.location.href = window.location.pathname
      }, 500)
    } catch (error) {
      console.error('Error clearing cache:', error)
      // Forzar recarga aunque haya error
      window.location.reload()
    }
  }

  return { clearCache }
}
