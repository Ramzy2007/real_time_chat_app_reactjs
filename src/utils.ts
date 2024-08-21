

export class Utils {
  /**
   * Get mime type of file from it's url
   * @param file_url
   * @returns
   */

  /**
   * Get the timestamp from UTC
   * @returns
   */
  static getTimeUTC() {
    const local = new Date();
    const utc = new Date(
      local.getUTCFullYear(),
      local.getUTCMonth(),
      local.getUTCDate(),
      local.getUTCHours(),
      local.getUTCMinutes(),
      local.getUTCSeconds(),
      local.getUTCMilliseconds()
    );
    return utc.getTime();
  }
}
