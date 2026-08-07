import {useState} from 'react'
import {useClient, type DocumentActionComponent} from 'sanity'
import {useToast} from '@sanity/ui'
import {TranslateIcon} from '@sanity/icons/Translate'
import {apiVersion} from '../env'
import {translateDocumentWithClient} from '../lib/translateDocument'

/**
 * Fills hidden English fields from Spanish.
 * Mayra only edits Spanish; visitors still get ES/EN on the site.
 * Shown next to Publish (not buried in •••).
 */
export const translateAction: DocumentActionComponent = (props) => {
  const {id, onComplete, draft, published} = props
  const toast = useToast()
  const client = useClient({apiVersion})
  const [loading, setLoading] = useState(false)

  const docId = draft?._id || published?._id || id
  const hasSavedDoc = Boolean(draft || published)

  return {
    label: loading ? 'Traduciendo…' : 'Traducir al inglés',
    title:
      'Completa todo en español, guarda, y haz clic aquí. El inglés se llena solo.',
    icon: TranslateIcon,
    tone: 'default',
    // Footer menu next to Publish + top-right ••• menu
    group: ['default', 'paneActions'],
    disabled: loading || !hasSavedDoc,
    onHandle: async () => {
      setLoading(true)
      try {
        const data = await translateDocumentWithClient(client, String(docId))

        toast.push({
          status: data.mode === 'copy' ? 'warning' : 'success',
          title:
            data.mode === 'copy'
              ? 'Inglés copiado'
              : data.mode === 'machine'
                ? 'Inglés traducido'
                : 'Listo',
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
              : 'No se pudo completar la traducción.',
        })
        setLoading(false)
        onComplete()
      }
    },
  }
}
