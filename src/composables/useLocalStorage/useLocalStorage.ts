export function useLocalStorage() {

  function setLocalStorage (key: string, value: unknown): void {
    window.localStorage.setItem(key, JSON.stringify(value))
  }

  function getLocalStorage (key: string) {
    try {
      return JSON.parse(window.localStorage.getItem(key)!)
    } catch (error) {
      console.error(error)
    }
  }

  return { setLocalStorage, getLocalStorage }
}

