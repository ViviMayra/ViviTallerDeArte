import {useState} from 'react'
import {useClient, type DocumentActionComponent} from 'sanity'
import {useToast} from '@sanity/ui'

export const translateAction: DocumentActionComponent = (props) => {
  const {id, type, onComplete} = props
  const client = useClient({apiVersion: '2025-01-01'})
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  if (!['piece', 'exhibition', 'homePage', 'aboutPage', 'jewelryType', 'jewelrySubtype', 'categorySubsection'].includes(type)) {
    return null
  }

  return {
    label: loading ? 'Traduciendo…' : 'Traducir al inglés',
    onHandle: async () => {
      setLoading(true)
      try {
        // Ensure latest draft is available
        await client.fetch(`*[_id == $id][0]._id`, {id})
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({documentId: id.replace(/^drafts\./, '')}),
        })
        // Also try draft id if published id fails
        if (!response.ok) {
          const retry = await fetch('/api/translate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({documentId: id}),
          })
          const data = await retry.json()
          if (!retry.ok) throw new Error(data.error || 'Error')
        } else {
          const data = await response.json()
          if (data.error) throw new Error(data.error)
        }
        toast.push({
          status: 'success',
          title: 'Traducción lista',
          description:
            'Campos en inglés actualizados. Revisa y ajusta si hace falta.',
        })
      } catch (error) {
        toast.push({
          status: 'error',
          title: 'No se pudo traducir',
          description:
            error instanceof Error
              ? error.message
              : 'Configura SANITY_API_WRITE_TOKEN y TRANSLATE_API_KEY',
        })
      } finally {
        setLoading(false)
        onComplete()
      }
    },
  }
}
