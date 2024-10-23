import { defineConfig } from '@pandacss/dev'

import { hook as codegenPrepare } from './config/hooks/codegen-prepare'
import { hook as contextCreated } from './config/hooks/context-created'
import { hook as tokensCreated } from './config/hooks/tokens-created'

export default defineConfig({
  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}', './{App,main,minimal}*.{js,jsx,ts,tsx}'],

  // Miro
  // hash: true,
  // clean: true,
  lightningcss: true,
  // polyfill: true,
  shorthands: false,
  jsxFramework: 'react',
  jsxStyleProps: 'minimal',
  separator: '-',
  outdir: 'styled-system',
  outExtension: 'js',
  preflight: false,
  presets: ['@pandacss/preset-base'],
  conditions: {
    light: '[data-color-mode=light] &',
    dark: '[data-color-mode=dark] &',
    defaultTheme: '[data-theme=default] &',
  },
  theme: {
    tokens: {
      colors: {
        red: {
          light: { value: '#ff0000' },
          dark: { value: '#990000' },
        },
        blue: {
          light: { value: '#0000ff' },
          dark: { value: '#000099' },
        },
        yellow: {
          light: { value: '#ffff00' },
          dark: { value: '#999900' },
        },
      },
    },
    semanticTokens: {
      colors: {
        danger: {
          value: {
            base: '{colors.red.light}',
            _light: { value: '{colors.red.light}' },
            _dark: { value: '{colors.red.dark}' },
          },
        },
      },
    },
  },
  hooks: {
    'codegen:prepare': codegenPrepare,
    'context:created': contextCreated,
    'tokens:created': tokensCreated,
  },
})
