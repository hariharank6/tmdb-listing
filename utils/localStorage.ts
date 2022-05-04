export function addMovieToStorage(value: string) {
  let storedValue: string[] | null = JSON.parse(localStorage.getItem('highlightedMovies') || '[]')
  if (typeof storedValue !== 'undefined' && Array.isArray(storedValue)) {
    if (!storedValue.includes(value)) {
      localStorage.setItem('highlightedMovies', JSON.stringify([...storedValue, value]))
      return true
    }
  } else {
    localStorage.setItem('highlightedMovies', JSON.stringify([value]))
  }

  return false
}

export function removeMovieToStorage(value: string) {
  let storedValue: string[] | null = JSON.parse(localStorage.getItem('highlightedMovies') || '[]')
  if (typeof storedValue !== 'undefined' && Array.isArray(storedValue) && storedValue.length > 1) {
    localStorage.setItem(
      'highlightedMovies',
      JSON.stringify(storedValue.filter(highlightedMovie => highlightedMovie !== value))
    )
    return true
  } else {
    localStorage.removeItem('highlightedMovies')
  }

  return false
}

export function getStorageValue(key: string) {
  const storageData = localStorage.getItem(key)
  if (storageData) {
    return JSON.parse(storageData)
  }
}
