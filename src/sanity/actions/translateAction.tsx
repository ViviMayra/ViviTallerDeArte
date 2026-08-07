import {useState} from 'react'
import type {DocumentActionComponent} from 'sanity'
import {useToast} from '@sanity/ui'

/**
 * Fills hidden English fields from Spanish.
 * Mayra only edits Spanish; visitors still get ES/EN on the site.
 */
export const translateAction: DocumentActionComponent = (props) => {
  const {id, onComplete, draft, published} = props
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const docId = draft?._id || published?._id || id

  return {
    label: loading ? 'Traduciendo…' : 'Traducir al inglés',
    title:
      'Completa todo en español, guarda, y haz clic aquí. El inglés se llena solo.',
    // Keep this in the ••• menu so it never replaces the Publish button
    group: ['paneActions'],
    disabled: loading,
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
          status: 'success',
          title: 'Listo',
          description:
            data.message ||
            'Inglés actualizado. Puedes seguir editando en español cuando quieras.',
        })
      } catch (error) {
        toast.push({
          status: 'error',
          title: 'No se pudo traducir',
          description:
            error instanceof Error
              ? error.message
              : 'Pide ayuda para configurar el token de traducción.',
        })
      } finally {
        setLoading(false)
        onComplete()
      }
    },
  }
}
