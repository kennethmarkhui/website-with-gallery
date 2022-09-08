// https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_pick
// https://stackoverflow.com/a/68167121
export const pick = <
  T extends Record<string | number | symbol, T>,
  K extends keyof T
>(
  object: T,
  keys: K[]
): Pick<T, K> => {
  return Object.assign(
    {},
    ...keys.map((key: K) => {
      return { [key]: object[key] }
    })
  )
}

// https://stackoverflow.com/a/18650828
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) '0 Bytes'

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(0)) + ' ' + sizes[i]
}
