import type {ObjectInputProps} from 'sanity'

/** Leave nested Studio editors (image, annotation popovers) so Publish is clickable. */
export function dismissStudioFocus(onPathFocus: ObjectInputProps['onPathFocus']) {
  if (typeof document !== 'undefined') {
    const active = document.activeElement
    if (active instanceof HTMLElement) active.blur()

    // Annotation / dialog UIs usually close on Escape
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        which: 27,
        bubbles: true,
        cancelable: true,
      }),
    )
  }

  onPathFocus([])
  requestAnimationFrame(() => {
    onPathFocus([])
    if (typeof document !== 'undefined') {
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
          keyCode: 27,
          which: 27,
          bubbles: true,
          cancelable: true,
        }),
      )
    }
  })
}
