import {useClient, useDocumentOperation, type DocumentActionComponent} from 'sanity'
import {apiVersion} from '../env'
import {slugify} from '../lib/slugify'

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

type DocLike = {
  _id?: string
  title?: {es?: string}
  slug?: {current?: string}
}

/**
 * Wraps Sanity's Publish action so it stays enabled whenever there is a draft.
 * Also fills a missing slug from the Spanish title before publishing so piece
 * pages (/pieza/[slug]) actually open.
 */
export function wrapPublishAction(
  PublishAction: DocumentActionComponent,
): DocumentActionComponent {
  const PublishReady: DocumentActionComponent = (props) => {
    const original = PublishAction(props)
    const {publish} = useDocumentOperation(props.id, props.type)
    const client = useClient({apiVersion})
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
        window.setTimeout(async () => {
          const doc = (props.draft || props.published) as DocLike | undefined
          const titleEs = doc?.title?.es
          const currentSlug = doc?.slug?.current
          const nextSlug = titleEs ? slugify(titleEs) : ''
          const docId = doc?._id || props.draft?._id

          // Without a slug the catalog links to /pieza/null and the page 404s
          if (docId && nextSlug && !currentSlug?.trim()) {
            try {
              await client
                .patch(docId)
                .set({slug: {_type: 'slug', current: nextSlug}})
                .commit({autoGenerateArrayKeys: true})
            } catch {
              // Still try to publish — better than blocking Mayra
            }
          }

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
