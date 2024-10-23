/**
 * 🚨🚨🚨 🐼🐼🐼 🚨🚨🚨
 *
 * This file is based on the original `styled-system/types/jsx.d.ts`
 *
 * This layer is added to avoid modifying the original via hooks in the panda.config.ts.
 * Yes there is a plugin that does it but has no control over PandaCSS changes and is not typesafe
 * https://github.com/astahmer/pandabox/blob/main/packages/panda-plugins/src/restrict-styled-props.ts
 *
 * In this file we can add the design system `StyledComponent` features and keep it in sync with the original.
 *
 * We check changes in the original file in build time and fail the build if it's not in sync.
 */

import type {
  ComponentPropsWithoutRef,
  ElementType,
  ElementRef,
  Ref,
} from 'react'
import type { OnlyHTMLAttributes, OneOrMore } from '@mirohq/design-system-types'
import type {
  Primitives,
  PrimitiveProps,
} from '@mirohq/design-system-primitive'

import type {
  RecipeRuntimeFn,
  RecipeDefinition,
  RecipeSelection,
  RecipeVariantRecord,
} from '@mirohq/design-system-pandacss/styled-system/types/recipe'
import type {
  Assign,
  DistributiveOmit,
  DistributiveUnion,
  JsxHTMLProps,
  JsxStyleProps,
  Pretty,
  SystemStyleObject,
} from '@mirohq/design-system-pandacss/styled-system/types/system-types'
import type { SystemProperties } from '@mirohq/design-system-pandacss/styled-system/types/style-props'
import type { Nested } from '@mirohq/design-system-pandacss/styled-system/types/conditions'

// Design System Types
// -----------------------------------------------------------------------------
export type StyledForbiddenProps = 'className' | 'style'

export type StyledAllowedProps = 'css' | 'asChild' | 'children' | 'ref'

export type StyledSafeProps<P extends {}> = Omit<P, StyledForbiddenProps>

/**
 * Filter out all non-html props and forbidden attributes from the extended component.
 *
 * It's useful when the component should not expose props from the extended component.
 * It will be mostly used with third-party libraries to avoid unwanted props to leak in the public component API.
 *
 * For example, if we extend a Radix component, it's not desired to expose all
 * the Radix props but only the ones declared in the component using it internally.
 *
 * const Foo = styled(Radix.Primitive, {})
 * type React.ComponentProps<typeof Foo> // all radix, html and styled props
 * type StrictComponentProps<typeof Foo> // only html and styled props
 */
export type StrictStyledComponentProps<T extends StyledComponent> = Pick<
  ComponentProps<T>,
  Extract<
    keyof ComponentProps<T>,
    | keyof StyledVariantProps<T>
    | StyledAllowedProps
    | keyof OnlyHTMLAttributes<T>
  >
>

// PandaCSS Types
// -----------------------------------------------------------------------------
interface Dict {
  [k: string]: unknown
}

type SystemProps = keyof SystemProperties

export type FilterStyleProps<
  Styles extends {} | [],
  AllowedCssProps extends SystemProps[]
> = Styles extends Array<infer T>
  ? Array<Nested<Pick<T, Extract<keyof T, AllowedCssProps[number]>>>>
  : Nested<Pick<Styles, Extract<keyof Styles, AllowedCssProps[number]>>>

export interface StyledComponent<
  T extends ElementType = any,
  P extends Dict = {},
  AllowedCssProps extends SystemProps[] = SystemProps[]
> {
  (
    props: JsxHTMLProps<
      StyledSafeProps<ComponentProps<T>>,
      Assign<
        JsxStyleProps extends { css?: OneOrMore<SystemStyleObject> }
          ? AllowedCssProps extends never[]
            ? {}
            : AllowedCssProps extends SystemProps[]
            ? FilterStyleProps<JsxStyleProps, AllowedCssProps> & {
                css?: OneOrMore<
                  | FilterStyleProps<
                      OneOrMore<SystemStyleObject>,
                      AllowedCssProps
                    >
                  | OneOrMore<RecipeRuntimeFn<any>>
                >
              }
            : JsxStyleProps
          : FilterStyleProps<JsxStyleProps, AllowedCssProps>,
        P
      >
    >
  ): JSX.Element
  displayName?: string
}

export type StyledRecipe<
  T extends ElementType,
  P extends RecipeVariantRecord,
  AllowedCssProps extends SystemProps[]
> =
  // remove base from the recipes
  Omit<RecipeDefinition<P>, 'base'> &
    // if the recipe is using a StyledComponent
    (T extends StyledComponent<any, any, infer X>
      ? {
          allowedCssProps?: AllowedCssProps extends X ? AllowedCssProps : never
        } & FilterStyleProps<SystemStyleObject, X>
      : // if the recipe is using a regular component
        { allowedCssProps?: AllowedCssProps } & SystemStyleObject)

interface RecipeFn {
  __type: any
}

interface JsxFactoryOptions<TProps extends Dict> {
  dataAttr?: boolean
  defaultProps?: TProps
  shouldForwardProp?: (prop: string, variantKeys: string[]) => boolean
}

export type JsxRecipeProps<
  T extends ElementType,
  P extends Dict
> = JsxHTMLProps<ComponentProps<T>, P>

export type JsxElement<
  T extends ElementType,
  P extends Dict,
  AllowedCssProps extends SystemProps[]
> = T extends StyledComponent<infer A, infer B, infer C>
  ? StyledComponent<
      A,
      Pretty<DistributiveUnion<P, B>>,
      AllowedCssProps extends C ? AllowedCssProps : C
    >
  : StyledComponent<T, P, AllowedCssProps>

export interface JsxFactory {
  // no recipe
  <T extends ElementType>(component: T): StyledComponent<T>
  // recipe fn
  <
    T extends ElementType,
    P extends RecipeFn,
    AllowedCssProps extends SystemProps[]
  >(
    component: T,
    recipeFn: P,
    options?: JsxFactoryOptions<JsxRecipeProps<T, P['__type']>>
  ): JsxElement<T, P['__type'], AllowedCssProps>
  // recipe
  <
    T extends ElementType,
    P extends RecipeVariantRecord,
    AllowedCssProps extends SystemProps[]
  >(
    component: T,
    recipe: StyledRecipe<T, P, AllowedCssProps>,
    options?: JsxFactoryOptions<JsxRecipeProps<T, RecipeSelection<P>>>
  ): JsxElement<T, RecipeSelection<P>, AllowedCssProps>
}

export type JsxElements = {
  [K in keyof JSX.IntrinsicElements]: StyledComponent<
    K,
    K extends keyof Primitives ? PrimitiveProps<K> : {}
  >
}

export type Styled = JsxFactory & JsxElements

export type HTMLStyledProps<T extends ElementType> = JsxHTMLProps<
  ComponentProps<T>,
  JsxStyleProps
>

export type StyledVariantProps<T extends StyledComponent<any>> =
  T extends StyledComponent<any, infer Props> ? Props : never

export type ComponentProps<T extends ElementType> = DistributiveOmit<
  ComponentPropsWithoutRef<T>,
  'ref'
> & {
  ref?: Ref<ElementRef<T>>
}
