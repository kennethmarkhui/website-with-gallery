const fetcher = async <T = any>(
  url: string,
  init?: RequestInit
): Promise<T> => {
  try {
    const response = await fetch(url, init)
    const dataResponse = await response.json()
    if (!response.ok && dataResponse.hasOwnProperty('error')) {
      throw dataResponse
    }
    return dataResponse
  } catch (error) {
    throw error
    // throw new Error('Something went wrong.')
  }
}

export default fetcher
