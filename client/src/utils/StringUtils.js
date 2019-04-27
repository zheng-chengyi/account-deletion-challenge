class StringUtils {
  static format(value, ...params) {
    let result = value
    for (let i = 0; i < params.length; i++) {
      const values = result.split(`{${i}}`)
      if (values.length > 1) {
        result = `${values[0]}${params[i]}${values[1]}`
      }
    }
    return result
  }
}
export default StringUtils
