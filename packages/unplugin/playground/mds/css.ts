import type { OneOrMore } from '@mirohq/design-system-types'

// @ts-expect-error: There is no type definition for this module yet
import { composeCvaFn } from '@mirohq/design-system-pandacss/styled-system/jsx/factory-helper'
import { cva } from '@mirohq/design-system-pandacss/styled-system/css'
import type {
  RecipeRuntimeFn,
  RecipeVariantRecord,
} from '@mirohq/design-system-pandacss/styled-system/types/recipe'

import type { CssRuntimeFn, CssFunction, CssRecipe } from './css-types'

alert(1)

const convertToCva = <
  Variants extends RecipeVariantRecord,
  Cva extends RecipeRuntimeFn<Variants>
>(
  recipe: OneOrMore<CssRecipe<Variants>>
): OneOrMore<Cva> => {
  if (Array.isArray(recipe)) {
    return recipe.map(convertToCva) as Cva[]
  }

  const {
    variants = {},
    compoundVariants = [],
    defaultVariants = {},
    ...base
  } = recipe

  return cva({
    base,
    // Panda variants does not expect a empty object but the runtime works fine
    // Since we enable css with and without variants we need to send an empty object as default.
    // @ts-expect-error
    variants,
    compoundVariants,
    defaultVariants,
  }) as Cva
}

export const css: CssFunction = (...styles) => {
  const cvaFn = styles
    .filter(Boolean)
    .flat(Infinity)
    .map(style => {
      // @ts-expect-error Panda does not type the internals
      if (style.__cva__ === true) {
        return style
      }

      // @ts-expect-error Casting to any is conflicting with eslint somehow
      return convertToCva(style)
    })
    .reduce((result, cva) => composeCvaFn(result, cva))

  return cvaFn as CssRuntimeFn<any>
}
