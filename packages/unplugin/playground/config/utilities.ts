import type {
  UtilityConfig,
  PropertyTransform,
  NestedCssProperties,
} from '@pandacss/types'

const cssProp = (prop: string, x: unknown): NestedCssProperties => ({
  [prop as any]: typeof x === 'string' ? x : undefined,
})

const transform =
  (prop: string, category: string): PropertyTransform =>
  (value, { token }) => {
    if (typeof value !== 'string') {
      return cssProp(prop, value)
    }

    const values = value
      .split(' ')
      .map(x => {
        const tokenValue = x.replace(/^\$/, '')
        return token(`$${category}-${tokenValue}`) ?? tokenValue
      })
      .join(' ')

    return cssProp(prop, values)
  }

// CSS shorthand properties
// https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties
export const CSS_PROPS_MAPPING = {
  background: 'colors',
  border: 'colors',
  borderBlock: 'colors',
  borderBlockEnd: 'colors',
  borderBlockStart: 'colors',
  borderBottom: 'colors',
  borderColor: 'colors',
  borderImage: 'colors',
  borderInline: 'colors',
  borderInlineEnd: 'colors',
  borderInlineStart: 'colors',
  borderLeft: 'colors',
  borderRadius: 'radii',
  borderRight: 'colors',
  borderTop: 'colors',
  borderWidth: 'border-widths',
  columnRule: 'colors',
  font: 'fonts',
  gap: 'spacing',
  grid: 'spacing',
  gridTemplate: 'spacing',
  inset: 'spacing',
  insetBlock: 'spacing',
  insetInline: 'spacing',
  margin: 'spacing',
  marginBlock: 'spacing',
  marginInline: 'spacing',
  outline: 'colors',
  padding: 'spacing',
  paddingBlock: 'spacing',
  paddingInline: 'spacing',
  scrollMargin: 'spacing',
  scrollMarginBlock: 'spacing',
  scrollMarginInline: 'spacing',
  scrollPadding: 'spacing',
  scrollPaddingBlock: 'spacing',
  scrollPaddingInline: 'spacing',
  textDecoration: 'colors',
  textEmphasis: 'colors',
} as const

export const utilities: UtilityConfig = Object.entries(
  CSS_PROPS_MAPPING
).reduce(
  (result, [prop, category]) => ({
    ...result,
    [prop]: {
      transform: transform(prop, category),
    },
  }),
  {}
)
