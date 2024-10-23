import type { PandaHooks } from '@pandacss/types'

const dasherize = (tokenPath: string[]): string =>
  tokenPath
    .join('-')
    .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
    .toLowerCase()

export const hook: PandaHooks['tokens:created'] = ({ configure }) => {
  configure({
    formatTokenName: path => {
      const dasherized = dasherize(path)
      if (dasherized.startsWith('spacing--')) {
        return `-$spacing-${dasherized.replace('spacing--', '')}`
      }
      return `$${dasherized}`
    },
    formatCssVar: path => {
      const variable = `--${dasherize(path)}` as const
      return {
        var: variable,
        ref: `var(${variable})`,
      }
    },
  })
}
