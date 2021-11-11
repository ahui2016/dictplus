// https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping
// https://github.com/iamkun/dayjs/blob/dev/types/index.d.ts

declare function dayjs (date?: dayjs.ConfigType): dayjs.Dayjs

declare namespace dayjs {
  interface ConfigTypeMap {
    default: string | number | Date | Dayjs | null | undefined
  }

  export type ConfigType = ConfigTypeMap[keyof ConfigTypeMap];

  class Dayjs {
    constructor (config?: ConfigType)

    format(template?: string): string
    unix(): number
  }

  export function unix(t: number): Dayjs;
}
