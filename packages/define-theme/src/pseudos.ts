export type AdvancedPseudos =
  | ':-moz-any()'
  | ':-moz-dir'
  | ':-webkit-any()'
  | '::cue'
  | '::cue-region'
  | '::part'
  | '::slotted'
  | '::view-transition-group'
  | '::view-transition-image-pair'
  | '::view-transition-new'
  | '::view-transition-old'
  | ':dir'
  | ':has'
  | ':host'
  | ':host-context'
  | ':is'
  | ':lang'
  | ':matches()'
  | ':not'
  | ':nth-child'
  | ':nth-last-child'
  | ':nth-last-of-type'
  | ':nth-of-type'
  | ':where'

export type SimplePseudos =
  | ':-khtml-any-link'
  | ':-moz-any-link'
  | ':-moz-focusring'
  | ':-moz-full-screen'
  | ':-moz-placeholder'
  | ':-moz-read-only'
  | ':-moz-read-write'
  | ':-moz-ui-invalid'
  | ':-moz-ui-valid'
  | ':-ms-fullscreen'
  | ':-ms-input-placeholder'
  | ':-webkit-any-link'
  | ':-webkit-full-screen'
  | '::-moz-placeholder'
  | '::-moz-progress-bar'
  | '::-moz-range-progress'
  | '::-moz-range-thumb'
  | '::-moz-range-track'
  | '::-moz-selection'
  | '::-ms-backdrop'
  | '::-ms-browse'
  | '::-ms-check'
  | '::-ms-clear'
  | '::-ms-expand'
  | '::-ms-fill'
  | '::-ms-fill-lower'
  | '::-ms-fill-upper'
  | '::-ms-input-placeholder'
  | '::-ms-reveal'
  | '::-ms-thumb'
  | '::-ms-ticks-after'
  | '::-ms-ticks-before'
  | '::-ms-tooltip'
  | '::-ms-track'
  | '::-ms-value'
  | '::-webkit-backdrop'
  | '::-webkit-input-placeholder'
  | '::-webkit-progress-bar'
  | '::-webkit-progress-inner-value'
  | '::-webkit-progress-value'
  | '::-webkit-slider-runnable-track'
  | '::-webkit-slider-thumb'
  | '::after'
  | '::backdrop'
  | '::before'
  | '::cue'
  | '::cue-region'
  | '::first-letter'
  | '::first-line'
  | '::grammar-error'
  | '::marker'
  | '::placeholder'
  | '::selection'
  | '::spelling-error'
  | '::target-text'
  | '::view-transition'
  | ':active'
  | ':after'
  | ':any-link'
  | ':before'
  | ':blank'
  | ':checked'
  | ':current'
  | ':default'
  | ':defined'
  | ':disabled'
  | ':empty'
  | ':enabled'
  | ':first'
  | ':first-child'
  | ':first-letter'
  | ':first-line'
  | ':first-of-type'
  | ':focus'
  | ':focus-visible'
  | ':focus-within'
  | ':fullscreen'
  | ':future'
  | ':hover'
  | ':in-range'
  | ':indeterminate'
  | ':invalid'
  | ':last-child'
  | ':last-of-type'
  | ':left'
  | ':link'
  | ':local-link'
  | ':nth-col'
  | ':nth-last-col'
  | ':only-child'
  | ':only-of-type'
  | ':optional'
  | ':out-of-range'
  | ':past'
  | ':paused'
  | ':picture-in-picture'
  | ':placeholder-shown'
  | ':playing'
  | ':read-only'
  | ':read-write'
  | ':required'
  | ':right'
  | ':root'
  | ':scope'
  | ':target'
  | ':target-within'
  | ':user-invalid'
  | ':user-valid'
  | ':valid'
  | ':visited'

// TODO ? those types are currently not exported from `@pandacss/types`
export type Pseudos = AdvancedPseudos | SimplePseudos
