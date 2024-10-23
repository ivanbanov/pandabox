import { useRef, forwardRef } from 'react'
import type { ReactNode } from 'react'

import { styled } from '@mirohq/design-system-pandacss/styled-system/jsx'
import { cva, css } from '@mirohq/design-system-pandacss/styled-system/css'

const cssInfoStatus = css({
  variants: {
    status: {
      info: {
        background: '$blue-500',
      },
    },
  },
})

const cssGhost = css({
  background: '$black',
  variants: {
    ghost: {
      true: {
        color: '$white',
      },
    },
  },
})

export const cssStyles = css(
  [
    {
      variants: {
        status: {
          ok: {
            background: '$green-500',
          },
        },
      },
    },
  ],
  {
    variants: {
      status: {
        fail: {
          background: '$red-500',
        },
      },
    },
  },
  cssInfoStatus,
  cssGhost,
)

const Box = styled('div', {
  background: '$blue-500',
  color: '$white',
  variants: {
    ghost: {
      true: {
        background: '$yellow-500',
      },
    },
  },
  allowedCssProps: ['background', 'color', 'margin'],
})

const ExtendedBox = styled(Box, {
  background: '$blue-400',
  '&:hover': {
    background: '$black',
  },
  allowedCssProps: ['background'],
})

ExtendedBox.displayName = 'ExtendedBox'

const ExtendedBox2 = styled(ExtendedBox, {
  background: '$blue-300',
})

ExtendedBox2.displayName = 'ExtendedBox2'

const ForwardRef = forwardRef<HTMLDivElement, { propInForwardRef?: boolean; children: ReactNode }>(
  ({ propInForwardRef, ...props }, ref) => <div data-prop={propInForwardRef} {...props} ref={ref} />,
)

const Variants = styled(ForwardRef, {
  color: '$white',
  variants: {
    ghost: {
      true: {
        background: '$red-400',
      },
      false: {
        background: '$red-500',
      },
    },
  },
  defaultVariants: {
    ghost: false,
  },
})

const BoxCVA = styled(
  'div',
  cva({
    base: {
      background: '$green-500',
      color: '$white',
    },
    variants: {
      fail: {
        true: {
          background: '$green-400',
        },
      },
    },
  }),
)

const BoxPrimitive = styled('div', {
  color: 'red',
  allowedCssProps: ['color'],
})

const BoxPrimitive2 = styled(Primitive.div, {
  color: 'blue',
})

export const App = (): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null)
  console.log('Box ref:', ref)

  return (
    <>
      <Box
        // @ts-expect-error
        style={{ color: 'red' }}
        css={{
          background: '$background-primary-prominent',
          '&:hover': {
            '&:is(div)': {
              '&:not(:empty)': {
                background: '$yellow-500',
              },
            },
          },
        }}
      >
        Box
      </Box>

      <ExtendedBox>ExtendedBox</ExtendedBox>
      <ExtendedBox2>ExtendedBox2</ExtendedBox2>
      <Variants ref={ref}>Variant default</Variants>
      <Variants ghost propInForwardRef>
        Variant with props
      </Variants>
      <Box
        css={[
          css({
            background: '$green-600',
            padding: 10, // wont be applied
          }),
        ]}
      >
        css prop
      </Box>
      <div
        className={cssStyles.className({
          status: 'ok',
          ghost: true,
        })}
      >
        css.className()
      </div>
      <BoxCVA fail>Box with cva()</BoxCVA>

      {/* force some classes to test asChild edge cases */}
      {/* @ts-expect-error */}
      <BoxPrimitive className="primitive1" asChild>
        {/* @ts-expect-error */}
        <BoxPrimitive2 className="p-9999px primitive2" asChild>
          {/* @ts-expect-error */}
          <Box ghost className="m-50px box">
            Box asChild
          </Box>
        </BoxPrimitive2>
      </BoxPrimitive>
    </>
  )
}
