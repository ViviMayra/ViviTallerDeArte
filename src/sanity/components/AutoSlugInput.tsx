'use client'

import {useEffect, useRef} from 'react'
import {Stack, Text} from '@sanity/ui'
import {
  set,
  unset,
  useFormValue,
  type FieldProps,
  type ObjectInputProps,
  type SlugValue,
} from 'sanity'
import {slugify} from '../lib/slugify'

/** Keeps slug.current in sync with title.es — no Generate click needed. */
export function AutoSlugInput(props: ObjectInputProps) {
  const titleEs = useFormValue(['title', 'es']) as string | undefined
  const current = (props.value as SlugValue | undefined)?.current
  const {onChange, readOnly: readOnlyProp} = props
  const lastWritten = useRef<string | undefined>(current)
  const readOnly = Boolean(readOnlyProp)

  useEffect(() => {
    // Published / locked docs throw if we patch — skip until there's a draft
    if (readOnly) return

    const next = slugify(titleEs || '')
    if (!next) {
      if (current || lastWritten.current) {
        lastWritten.current = undefined
        try {
          onChange(unset())
        } catch {
          // Document became read-only mid-render
        }
      }
      return
    }
    if (next === current || next === lastWritten.current) return
    lastWritten.current = next
    try {
      // Field-scoped patch is more reliable than document-level PatchEvent
      onChange(set({_type: 'slug', current: next}))
    } catch {
      // Ignore read-only patch attempts (e.g. viewing published version)
    }
  }, [titleEs, current, onChange, readOnly])

  return (
    <Stack space={2}>
      <Text size={1} muted>
        {current
          ? `URL: ${current}`
          : 'Se crea sola al escribir el nombre.'}
      </Text>
    </Stack>
  )
}

/** Compact field chrome — still visible so Publish errors aren’t hidden. */
export function QuietSlugField(props: FieldProps) {
  const hasError = props.validation?.some((item) => item.level === 'error')
  return (
    <Stack space={2}>
      <Text size={1} weight="medium">
        URL (automática)
      </Text>
      {props.children}
      {hasError && (
        <Text size={1} style={{color: 'var(--card-badge-critical-fg-color)'}}>
          Escribe el nombre de la pieza arriba para crear la URL, luego Publish.
        </Text>
      )}
    </Stack>
  )
}
