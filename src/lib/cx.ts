/** 拼接 className，自动跳过 false / null / undefined */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}
