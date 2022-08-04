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
