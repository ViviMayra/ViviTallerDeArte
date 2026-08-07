import type {DocumentActionComponent, DocumentActionDescription} from 'sanity'

/** Close photo/text popovers so Publish is always clickable. */
function dismissBlockingFocus() {
  if (typeof document === 'undefined') return

  const active = document.activeElement
  if (active instanceof HTMLElement) active.blur()

  const escape = () =>
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

  escape()
  requestAnimationFrame(escape)
}

/**
 * Wraps Sanity's Publish action: clears nested editor focus first, then publishes.
 * Keeps Publish as the primary button Mayra can always reach.
 */
export function wrapPublishAction(
  PublishAction: DocumentActionComponent,
): DocumentActionComponent {
  const PublishReady: DocumentActionComponent = (props) => {
    const original = PublishAction(props)
    if (!original) return original

    const description: DocumentActionDescription = {
      ...original,
      onHandle: () => {
        dismissBlockingFocus()
        // Let Escape/blur settle before Sanity runs publish
        window.setTimeout(() => {
          original.onHandle?.()
        }, 50)
      },
    }
    return description
  }

  PublishReady.action = 'publish'
  PublishReady.displayName = PublishAction.displayName || 'PublishAction'
  return PublishReady
}
