import type { PandaHooks } from '@pandacss/types'

export const hook: PandaHooks['context:created'] = ({ ctx }) => {
  // @ts-expect-error
  const { processAtomicRecipe } = ctx.processor.encoder

  // @ts-expect-error
  ctx.processor.encoder.processAtomicRecipe = recipe => {
    const {
      base,
      allowedCssProps,
      variants = {},
      compoundVariants = [],
      defaultVariants = {},
      ...styles
    } = recipe

    return processAtomicRecipe({
      base: base ?? styles,
      variants,
      compoundVariants,
      defaultVariants,
    })
  }
}
