// https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_pick
export function pick(object, keys) {
  return keys.reduce((obj, key) => {
    if (object) {
      obj[key] = object[key]
    }
    return obj
  }, {})
}
