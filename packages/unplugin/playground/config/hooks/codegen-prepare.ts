// TODO - Test the generated types file and throw and error if it changed
// https://miro.atlassian.net/browse/MDS-1000

// TODO - Create PandaCSS snapshots from the generated files in the styled-system to make it easier to review
// https://miro.atlassian.net/browse/MDS-1055

import type { PandaHooks, CodegenPrepareHookArgs } from '@pandacss/types'

const prepareJsx = (args: CodegenPrepareHookArgs): void => {
  const jsxFactory = args.artifacts.find(x => x.id === 'jsx-factory')
  const jsxFactoryTypes = jsxFactory?.files.find(x => x.file === 'factory.d.ts')
  const jsxFactoryJs = jsxFactory?.files.find(x => x.file === 'factory.js')

  const jsxTypes = args.artifacts
    .find(x => x.id === 'types-jsx')
    ?.files.find(x => x.file === 'jsx.d.ts')

  if (jsxTypes !== undefined) {
    jsxTypes.code = "export * from '@mirohq/design-system-pandacss'"
  }

  if (jsxFactoryTypes !== undefined && jsxFactoryJs !== undefined) {
    jsxFactoryTypes.file = 'panda-factory.d.ts'
    jsxFactoryTypes.code = 'export declare const styled: any'
    jsxFactoryJs.file = 'panda-factory.js'
    jsxFactoryJs.code = jsxFactoryJs.code?.replace(
      /\bcss\(([^*]*?)\)/g,
      'css($1).className()'
    )
  }

  jsxFactory?.files.push(
    {
      file: 'mds-factory.js',
      code: "export { styled } from '@mirohq/design-system-pandacss'",
    },
    {
      file: 'mds-factory.d.ts',
      code:
        "import type { Styled } from '@mirohq/design-system-pandacss'\n" +
        'export declare const styled: Styled',
    },
    {
      file: 'factory.js',
      code: "export * from './mds-factory.js'",
    },
    {
      file: 'factory.d.ts',
      code: "export * from './mds-factory'",
    }
  )
}

const prepareCss = (args: CodegenPrepareHookArgs): void => {
  const cssFn = args.artifacts.find(x => x.id === 'css-fn')
  const cssTypes = cssFn?.files.find(x => x.file === 'css.d.ts')
  const cssJs = cssFn?.files.find(x => x.file === 'css.js')

  if (cssJs?.code !== undefined) {
    cssJs.code = cssJs.code.replace(
      /export const css = .*/,
      '' +
        'export const css = (...styles) => mergeCss(...styles)\n' +
        'css.className = (...styles) => cssFn(mergeCss(...styles))'
    )
  }

  if (cssTypes !== undefined && cssJs !== undefined) {
    cssTypes.file = 'panda-css.d.ts'
    cssJs.file = 'panda-css.js'
  }

  cssFn?.files.push(
    {
      file: 'mds-css.js',
      code:
        "export * from './panda-css.js'\n" +
        "export { css } from '@mirohq/design-system-pandacss'",
    },
    {
      file: 'mds-css.d.ts',
      code:
        "import type { CssFunction } from '@mirohq/design-system-pandacss'\n" +
        'export declare const css: CssFunction',
    },
    {
      file: 'css.js',
      code: "export * from './mds-css.js'",
    },
    {
      file: 'css.d.ts',
      code: "export * from './mds-css'",
    }
  )
}

const prepareRecipes = (args: CodegenPrepareHookArgs): void => {
  const createRecipe = args.artifacts
    .find(x => x.id === 'create-recipe')
    ?.files.find(x => x.file === 'create-recipe.js')

  if (createRecipe?.code !== undefined) {
    createRecipe.code = createRecipe.code.replace(/\bcss\(/g, 'css.className(')
  }

  const recipeTypes = args.artifacts
    .find(x => x.id === 'types-gen')
    ?.files.find(x => x.file === 'recipe.d.ts')

  if (recipeTypes?.code !== undefined) {
    recipeTypes.code = recipeTypes.code
      .replace(
        /(export type RecipeVariantFn.*) => string/,
        '$1 => SystemStyleObject'
      )
      .replace(
        'raw: (props?: RecipeSelection<T>) => SystemStyleObject',
        '' +
          'raw: (props?: RecipeSelection<T>) => SystemStyleObject\n' +
          'className: (props?: RecipeSelection<T>) => string'
      )
      .replace(
        'raw: (props?: RecipeSelection<T>) => Record<S, SystemStyleObject>',
        '' +
          'raw: (props?: RecipeSelection<T>) => Record<S, SystemStyleObject>\n' +
          'className: (props?: RecipeSelection<T>) => Record<S, string>'
      )
      .replace(
        /(export type SlotRecipeVariantFn[^*]*?) => SlotRecord<S, string>/,
        '$1 => SlotRecord<S, SystemStyleObject>'
      )
  }
}

const preparePatterns = (args: CodegenPrepareHookArgs): void => {
  const patterns = args.artifacts.find(x => x.id === 'patterns')

  patterns?.files?.forEach(pattern => {
    if (pattern.file.endsWith('.d.ts') && typeof pattern.code === 'string') {
      pattern.code = pattern.code.replace(
        /(\(styles\?:.*\)): string/,
        '$1: SystemStyleObject'
      )
      pattern.code = pattern.code.replace(
        /(raw: (\(styles\?:.*\)) => SystemStyleObject)/,
        '' +
          '$1\n' + // raw
          'className: $2 => string' // className
      )
    }

    if (pattern.file.endsWith('.js') && typeof pattern.code === 'string') {
      pattern.code = pattern.code.replace(
        /export const (.*) = \(styles\) => css\((\w+).*/,
        '' +
          'export const $1 = $2\n' + // raw
          '$1.className = styles => css($2(styles)).className()' // className
      )
    }
  })
}

const prepareCva = (args: CodegenPrepareHookArgs): void => {
  const cva = args.artifacts
    .find(x => x.id === 'cva')
    ?.files.find(x => x.file === 'cva.js')

  if (cva?.code !== undefined) {
    cva.code = cva.code
      .replace('./css.js', './panda-css.js')
      .replace(/function cvaFn[^*]*?\}/, 'const cvaFn = resolve')
      .replace(
        'raw: resolve,',
        '' +
          'raw: resolve,\n' +
          'className: props => css.className(resolve(props)),'
      )
  }
}

const prepareSva = (args: CodegenPrepareHookArgs): void => {
  const sva = args.artifacts
    .find(x => x.id === 'sva')
    ?.files.find(x => x.file === 'sva.js')

  if (sva?.code !== undefined) {
    sva.code = sva.code
      .replace(
        'return Object.assign(memo(svaFn)',
        'return Object.assign(memo(raw)'
      )
      .replace(/\bcvaFn\(/g, 'cvaFn.className(')
      .replace(
        /(__cva__: false,\s+raw,)/,
        '' +
          '$1\n' + // raw
          'className: svaFn,' // className
      )
  }
}

export const hook: PandaHooks['codegen:prepare'] = args => {
  /**
   * Modifiy jsxFactory (styled) to work without the `base` key and use
   * the design-system styled function
   */
  prepareJsx(args)

  /**
   * Modifiy functions that generate string of classes to return the raw style objects
   *
   * fn: css, cva, sva, patterns
   *
   * {fn}()           // StyleSystemObject
   * {fn}.raw()       // StyleSystemObject
   * {fn}.className() // string
   */
  prepareCss(args)
  prepareRecipes(args)
  preparePatterns(args)
  prepareCva(args)
  prepareSva(args)

  return args.artifacts
}
