import React from 'react'
import type { ElementType, ComponentProps, ElementRef } from 'react'
import type { OneOrMore } from '@mirohq/design-system-types'
import { Primitive } from '@mirohq/design-system-primitive'
import type { Primitives } from '@mirohq/design-system-primitive'

import * as pandaJsx from '@mirohq/design-system-pandacss/styled-system/jsx/panda-factory'
import type { SystemStyleObject } from '@mirohq/design-system-pandacss/styled-system/types/system-types'
import type { RecipeRuntimeFn } from '@mirohq/design-system-pandacss/styled-system/types/recipe'

import type { Styled, StyledComponent, StyledRecipe } from './styled-types'

// Error
// -----------------------------------------------------------------------------

export const STYLING_ATTRS_ERROR =
  'The "className" and "style" attributes are not available in styled components.'

export const STYLED_ALLOWED_CSS_PROPS_MISMATCH =
  "Some of the values set in the allowedCssProps are not valid. Please make sure that your component only includes values coming from the extending component's allowedCssProps"

export const STYLED_ALLOWED_CSS_PROPS_ERROR =
  "Some of the props are not allowed in the component's css prop."

// Styled
// -----------------------------------------------------------------------------

/**
 * Regular expression to match CSS selectors without children
 *
 * ^@.*                        - Any at-rule.
 * ^&+                         - Only 'self' selectors.
 * (?!:host|::part|::backdrop) - Negative lookahead to exclude :host, ::part, and ::backdrop selectors.
 * ((::?|[.#])?\w+)?           - Optional: Pseudo-elements ::, class ., or ID #.
 * ([[(].*[)\]])?              - Optional: Attribute selector enclosed in [] or ().
 * ((::?|[.#])?\w+)?           - Optional: Chained pseudo-elements, class, or id
 * $                           - Only fully matched strings.
 *
 * @examples https://regexr.com/7v50g
 */
export const REGEXP_CSS_SELECTOR_WITHOUT_CHILDREN =
  /^(@.*|&+(?!:host|::part|::backdrop)((::?|[.#])?\w+)?([[(].*[)\]])?((::?|[.#])?\w+)?)$/i

const filterAllowedCssProps = (
  styles: Record<string, any> | Array<Record<string, any>>,
  allowedCssProps: string[],
  error: string
): Record<string, any> | Array<Record<string, any>> => {
  if (Array.isArray(styles)) {
    return styles.map(style =>
      filterAllowedCssProps(style, allowedCssProps, error)
    )
  }

  return Object.keys(styles).reduce(
    (result: Record<string, any>, key: string) => {
      if (
        styles[key]?.toString() === '[object Object]' &&
        REGEXP_CSS_SELECTOR_WITHOUT_CHILDREN.test(key)
      ) {
        result[key] = filterAllowedCssProps(styles[key], allowedCssProps, error)
      } else if (allowedCssProps.includes(key)) {
        result[key] = styles[key]
      } else {
        console.error(error)
      }

      return result
    },
    {}
  )
}

const processCss = (
  recipes: OneOrMore<SystemStyleObject | RecipeRuntimeFn<any>>
): OneOrMore<SystemStyleObject> => {
  if (Array.isArray(recipes)) {
    return recipes.map(processCss) as SystemStyleObject[]
  }

  // @ts-expect-error
  if (recipes?.__cva__ === true) {
    return (recipes as RecipeRuntimeFn<any>)()
  }

  return recipes as SystemStyleObject
}

interface PandaStyledInternals {
  __base__?: any
  __cva__?: any
  __shouldForwardProps__?: any
  displayName?: string
}

interface StyledInternals {
  __allowedCssProps__?: string[]
  __styled__?: true
}

type WithStyledInternals<T> = T & PandaStyledInternals & StyledInternals

const styledComponent = <T extends ElementType, P extends ComponentProps<T>>(
  Component: WithStyledInternals<(props: P) => JSX.Element>,
  recipe: StyledRecipe<ElementType, any, any[]> = {}
): WithStyledInternals<StyledComponent<T>> => {
  Component.displayName = Component.displayName?.replace(
    /^styled\.(.*)$/,
    'styled($1)'
  )

  const ForwardRef = React.forwardRef<ElementRef<T>, P>(
    (
      {
        className,
        style,
        children,
        css,
        __renderAsChild__,
        __classesTrash__,
        ...restProps
      },
      forwardRef
    ) => {
      let classes = className

      // Only enable the style prop when it is defined in the recipe
      if (style !== undefined && recipe.variants?.style === undefined) {
        console.error(STYLING_ATTRS_ERROR)
        style = undefined
      }

      if (className !== undefined) {
        classes = undefined

        // asChild components will get the parent classes
        if (__renderAsChild__ !== true || __classesTrash__ !== undefined) {
          console.error(
            `${STYLING_ATTRS_ERROR}\nComponent: ${
              Component.displayName
            }\nClasses: ${
              __renderAsChild__ === true ? __classesTrash__ : className
            }`
          )
        }
      }

      // Collect classes
      if (
        children?.type?.__styled__ === true &&
        restProps.asChild === true &&
        React.Children.count(children) === 1
      ) {
        children = React.cloneElement(children, {
          __renderAsChild__: true,
          __classesTrash__: children?.props.className,
        })
      }

      // Execute the css functions
      css = processCss(css)

      // Apply allowedCssProps
      if (
        Array.isArray(recipe.allowedCssProps) &&
        recipe.base !== undefined &&
        css !== undefined
      ) {
        css = filterAllowedCssProps(
          css,
          recipe.allowedCssProps,
          `${STYLED_ALLOWED_CSS_PROPS_ERROR}\nComponent: ${Component.displayName}`
        )
      }

      return (
        <Component
          {...(restProps as any)}
          className={classes}
          style={style}
          css={css}
          ref={forwardRef}
        >
          {children}
        </Component>
      )
    }
  ) as unknown as WithStyledInternals<StyledComponent<T>>

  ForwardRef.__styled__ = true
  ForwardRef.__allowedCssProps__ = recipe.allowedCssProps
  ForwardRef.__base__ = Component.__base__
  ForwardRef.__cva__ = Component.__cva__
  ForwardRef.__shouldForwardProps__ = Component.__shouldForwardProps__
  ForwardRef.displayName = Component.displayName

  return ForwardRef
}

const styledFn = ((component: ElementType, styles: any = {}) => {
  const baseComponentAllowedCssProps = (component as any)?.__allowedCssProps__

  // make sure the allowedCssProps is extended
  styles.allowedCssProps ??= baseComponentAllowedCssProps

  let recipe = styles

  if (recipe?.toString() === '[object Object]') {
    let {
      variants = {},
      compoundVariants = [],
      defaultVariants = {},
      allowedCssProps,
      ...base
    } = recipe

    // use only allowed css props
    if (Array.isArray(baseComponentAllowedCssProps)) {
      base = filterAllowedCssProps(
        base,
        baseComponentAllowedCssProps,
        `${STYLED_ALLOWED_CSS_PROPS_ERROR}\nComponent: ${
          typeof component === 'string' ? component : component.displayName
        }`
      )

      baseComponentAllowedCssProps.reduce(
        (result: Record<string, any>, cssProp: string) => {
          result[cssProp] = base[cssProp]
          return result
        },
        {}
      )

      if (
        Array.isArray(allowedCssProps) &&
        allowedCssProps.some(
          prop => !baseComponentAllowedCssProps.includes(prop)
        )
      ) {
        console.error(
          `${STYLED_ALLOWED_CSS_PROPS_MISMATCH}\nComponent: ${
            // @ts-expect-error
            component?.displayName
          }`
        )
      }
    }

    recipe = {
      base,
      variants,
      compoundVariants,
      defaultVariants,
    }
  }

  const PandaComponent = pandaJsx.styled(component, recipe)

  return styledComponent(PandaComponent, {
    ...recipe,
    allowedCssProps: styles.allowedCssProps,
  })
}) as Styled

// Factory from PandaCSS
// https://github.com/chakra-ui/panda/blob/935ec86/packages/generator/src/artifacts/react-jsx/jsx.ts#L75-L91
const createJsxFactory = (): Styled => {
  const cache = new Map()

  return new Proxy(styledFn, {
    apply(_, __, args) {
      // @ts-expect-error
      return styledFn(...args)
    },
    get(_, element) {
      if (!cache.has(element) && typeof element === 'string') {
        let el: ElementType | string = element

        if (element in Primitive) {
          el = Primitive[element as keyof Primitives]
        }

        cache.set(element, styledFn(el as ElementType))
      }
      return cache.get(element)
    },
  })
}

export const styled = createJsxFactory()
