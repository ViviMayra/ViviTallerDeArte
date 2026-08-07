'use client'

import {useState} from 'react'
import {Button, Card, Flex, Stack, Text, useToast} from '@sanity/ui'
import {TranslateIcon} from '@sanity/icons/Translate'
import {useClient, useFormValue, type StringInputProps} from 'sanity'
import {apiVersion} from '../env'
import {translateDocumentWithClient} from '../lib/translateDocument'

/**
 * Big in-form button so Mayra always sees “Traducir al inglés”
 * (document actions are easy to miss in the ••• menu).
 */
export function TranslateToEnglishInput(_props: StringInputProps) {
  const toast = useToast()
  const client = useClient({apiVersion})
  const [loading, setLoading] = useState(false)
  const documentId = useFormValue(['_id']) as string | undefined

  const onTranslate = async () => {
    if (!documentId) {
      toast.push({
        status: 'warning',
        title: 'Guarda primero',
        description: 'Escribe algo y espera un momento, luego traduce.',
      })
      return
    }

    setLoading(true)
    try {
      const data = await translateDocumentWithClient(client, documentId)
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
            : 'Pide ayuda para configurar la traducción.',
      })
      setLoading(false)
    }
  }

  return (
    <Card padding={3} radius={2} tone="primary" border>
      <Stack space={3}>
        <Text size={1}>
          Completa el texto en español, luego pulsa el botón. El inglés del
          sitio se llena solo (gratis).
        </Text>
        <Flex>
          <Button
            text={loading ? 'Traduciendo…' : 'Traducir al inglés'}
            icon={TranslateIcon}
            tone="primary"
            mode="default"
            disabled={loading || !documentId}
            onClick={onTranslate}
          />
        </Flex>
      </Stack>
    </Card>
  )
}
