import {useState} from 'react'
import type {DocumentActionComponent} from 'sanity'
import {useToast} from '@sanity/ui'
import {TranslateIcon} from '@sanity/icons/Translate'

/**
 * Fills hidden English fields from Spanish.
 * Mayra only edits Spanish; visitors still get ES/EN on the site.
 * Shown next to Publish (not buried in •••).
 */
export const translateAction: DocumentActionComponent = (props) => {
  const {id, onComplete, draft, published} = props
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const docId = draft?._id || published?._id || id
  const hasSavedDoc = Boolean(draft || published)

  return {
    label: loading ? 'Traduciendo…' : 'Traducir al inglés',
    title:
      'Completa todo en español, guarda, y haz clic aquí. El inglés se llena solo.',
    icon: TranslateIcon,
    tone: 'default',
    // Visible action bar next to Publish — not the ••• menu
    group: ['default'],
    disabled: loading || !hasSavedDoc,
    onHandle: async () => {
      setLoading(true)
      try {
        const targetId = docId

        let response = await fetch('/api/translate', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({documentId: targetId}),
        })

        if (!response.ok) {
          const publishedId = String(targetId).replace(/^drafts\./, '')
          response = await fetch('/api/translate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({documentId: publishedId}),
          })
        }

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Error al traducir')

        toast.push({
          status: data.mode === 'copy' ? 'warning' : 'success',
          title: data.mode === 'copy' ? 'Inglés copiado' : 'Listo',
          description:
            data.message ||
            'Inglés actualizado. Recargando para que puedas publicar…',
        })

        // Reload so Studio picks up patched EN fields and Publish stays in sync
        window.setTimeout(() => {
          window.location.reload()
        }, 600)
      } catch (error) {
        toast.push({
          status: 'error',
          title: 'No se pudo traducir',
          description:
            error instanceof Error
              ? error.message
              : 'Pide ayuda para configurar el token de traducción.',
        })
        setLoading(false)
        onComplete()
      }
    },
  }
}
