/* eslint-disable import/no-duplicates */

import type * as themes from '@mirohq/design-system-themes'
import type { Theme } from '@mirohq/design-system-themes'
import type * as tokens from '@mirohq/design-tokens'

// Types
// -----------------------------------------------------------------------------
export interface Token {
  value: string
}

export type Tokens = typeof tokens

export type ParsedTokens = { [category in keyof Tokens]: Category }

export type Category = { [key in keyof Tokens]: Token | Category }

export type Themes = typeof themes

export type ParsedThemes = { [theme in keyof Themes]: ParsedTokens }

export type ThemesSemanticTokens = {
  [category in keyof Theme]?: {
    [token in keyof Theme[category]]: {
      value: {
        [theme in keyof Themes as theme extends 'base'
          ? 'base'
          : `_${theme}Theme`]: Themes[theme][category][token]
      }
    }
  }
}

// INTERNALS
// -----------------------------------------------------------------------------

/**
 * Convert a token into a pandacss format
 *
 * DS token anatomy
 * https://miro.design/foundation/naming
 *
 * input:                           output:
 * $colors$blue-100                 {colors.blue.100}
 * $colors$background-alpha-active  {colors.background-alpha.active}
 */
const parseToken = (category: string, token: string): Token => {
  const parsedToken = token.replace(
    // find all token references $token or $categoryt$token
    /(\$[\w.-]+)+/g,
    // convert it into the pandacss spec
    // $colors$blue-100 -> {colors.blue.100}
    match => {
      const tokenWithCategory = /^\$.*\$/.test(match)
        ? // has a category defined in the token
          match
        : // otherwise uses an external reference
          `$${category}${match}`

      const [categoryName, ...tokenPath] = tokenWithCategory
        .split(/[$-]/)
        .filter(Boolean)

      const mappedCategoryName = categoryNameMap(categoryName)

      return `var(--${[mappedCategoryName, ...tokenPath].join('-')})`
    }
  )

  return { value: parsedToken }
}

/**
 * Recursively parse all categories
 * input:
 * {
 *   colors: {
 *     'blue-100': '#00f',
 *     'blue-200': '#0ff',
 *   },
 *   space: {
 *     100: '8px'
 *   },
 *   spaceInset: {
 *     '100': '$space$100',
 *   }
 * }
 *
 * output:
 * {
 *   colors: {
 *     blue: {
 *       100: { value: '#00f' },
 *       200: { value: '#0ff' },
 *     }
 *   },
 *   spacing: {
 *     100: { value: '8px' },
 *     inset: {
 *       100: {'spacing.100'}
 *     }
 *   }
 * }
 */
const parseCategory = (
  categoryName: string,
  category: Tokens | string
): Category =>
  Object.entries(category).reduce((result, [token, value]) => {
    if (token.includes('-')) {
      const [, subCategoryName, subCategoryToken] =
        token.match(/(.*)-(.*)/) ?? []
      const subCategory = (result as any)[subCategoryName] ?? {}

      return {
        ...result,
        [subCategoryName]: {
          ...subCategory,
          [subCategoryToken]: parseToken(categoryName, `${value}`),
        },
      }
    }

    return {
      ...result,
      [token]:
        value?.toString() === '[object Object]'
          ? parseCategory(categoryName, value)
          : parseToken(categoryName, `${value}`),
    }
  }, {}) as Category

const categoryNameMap = (category: string): string => {
  const mapping: { [x: string]: string } = {
    space: 'spacing',
    spaceInset: 'spacingInset',
    spaceOffset: 'spacingOffset',
    spaceGap: 'spacingGap',
  }

  return mapping[category] ?? category
}

const parseThemes = (themes: Themes): ParsedThemes =>
  Object.entries(themes).reduce(
    (result, [theme, tokens]) => ({
      ...result,
      [theme]: parseTokens(tokens),
    }),
    {}
  ) as ParsedThemes

// PARSERS
// -----------------------------------------------------------------------------

export const parseTokens = (tokens: Tokens | Partial<Theme>): ParsedTokens =>
  Object.entries(tokens).reduce((result, [category, tokens]) => {
    const mappedCategoryName = categoryNameMap(category)

    return {
      ...result,
      [mappedCategoryName]: parseCategory(mappedCategoryName, tokens),
    }
  }, {}) as ParsedTokens

export const parseSemanticTokens = (themes: Themes): ThemesSemanticTokens => {
  const semanticTokens = {} as any
  const parsedThemes = parseThemes(themes)

  for (const [theme, categories] of Object.entries(parsedThemes)) {
    for (const [category, subCategories] of Object.entries(categories)) {
      for (const [subCategory, tokens] of Object.entries(subCategories)) {
        for (const [token, value] of Object.entries(tokens)) {
          const themeKey = theme === 'base' ? theme : `_${theme}`

          semanticTokens[category] ??= {}
          semanticTokens[category][subCategory] ??= {}

          // if value is a string it means that there is no subcategory and it should be as final value
          if (typeof value === 'string') {
            semanticTokens[category][subCategory].value ??= {}
            semanticTokens[category][subCategory].value[themeKey] = value
          } else {
            semanticTokens[category][subCategory][token] ??= { value: {} }
            semanticTokens[category][subCategory][token].value[themeKey] =
              value.value
          }
        }
      }
    }
  }

  return semanticTokens
}
