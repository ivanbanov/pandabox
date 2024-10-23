import type {
  UnionToIntersection,
  OneOrMore,
} from '@mirohq/design-system-types'

import type {
  RecipeRuntimeFn,
  RecipeDefinition,
  RecipeVariantRecord,
} from '@mirohq/design-system-pandacss/styled-system/types/recipe'
import type {
  SystemStyleObject,
  Pretty,
} from '@mirohq/design-system-pandacss/styled-system/types/system-types'

export type CssRecipe<Variants extends RecipeVariantRecord> = Omit<
  RecipeDefinition<Variants>,
  'base'
> &
  SystemStyleObject

type CssRecipes = Array<
  | OneOrMore<CssRecipe<RecipeVariantRecord>>
  | OneOrMore<RecipeRuntimeFn<RecipeVariantRecord>>
>

type ExtractVariants<T> = T extends RecipeRuntimeFn<infer V>
  ? V
  : T extends Array<infer U>
  ? ExtractVariants<U>
  : T extends { variants: infer V }
  ? V
  : {}

export type CssRuntimeFn<Variants extends RecipeVariantRecord> =
  // narrow down to make the compiler happy
  UnionToIntersection<Variants> extends RecipeVariantRecord
    ? RecipeRuntimeFn<Pretty<UnionToIntersection<Variants>>>
    : RecipeRuntimeFn<Variants>

export type CssFunction = <
  Styles extends CssRecipes,
  Variants extends RecipeVariantRecord = ExtractVariants<Styles>
>(
  ...styles: Styles | CssRecipes
) => CssRuntimeFn<Variants>
