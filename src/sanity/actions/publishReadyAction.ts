import {useDocumentOperation, type DocumentActionComponent} from 'sanity'

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
 * Wraps Sanity's Publish action so it stays enabled whenever there is a draft.
 * Bypasses Studio validation gating (missing photo/price/etc.) — Mayra can always publish.
 */
export function wrapPublishAction(
  PublishAction: DocumentActionComponent,
): DocumentActionComponent {
  const PublishReady: DocumentActionComponent = (props) => {
    const original = PublishAction(props)
    const {publish} = useDocumentOperation(props.id, props.type)
    const hasDraft = Boolean(props.draft)

    if (!original) return original

    // No draft / no permission / already published — keep Sanity's disabled state
    if (!hasDraft || !original.onHandle) return original

    return {
      ...original,
      disabled: false,
      title: 'Publicar en la web',
      onHandle: () => {
        dismissBlockingFocus()
        window.setTimeout(() => {
          publish.execute()
          props.onComplete()
        }, 50)
      },
    }
  }

  PublishReady.action = 'publish'
  PublishReady.displayName = PublishAction.displayName || 'PublishAction'
  return PublishReady
}
