'use client'

import {useEffect, useMemo, useState} from 'react'
import {Select, Stack, TextInput} from '@sanity/ui'
import {set, unset, useClient, useFormValue, type ObjectInputProps} from 'sanity'

type Localized = {es?: string; en?: string}

const NEW = '__new__'
const NONE = ''

/** Dropdown of types already used on pieces, or type a new one to group on the site. */
export function PieceTypeInput(props: ObjectInputProps) {
  const value = (props.value || {}) as Localized
  const category = useFormValue(['category']) as string | undefined
  const client = useClient({apiVersion: '2025-01-01'})
  const [existing, setExisting] = useState<string[]>([])
  const [mode, setMode] = useState<'pick' | 'new'>('pick')

  useEffect(() => {
    let cancelled = false
    client
      .fetch<string[]>(
        `*[_type == "piece" && defined(pieceType.es) && ($category == null || category == $category)].pieceType.es`,
        {category: category || null},
      )
      .then((rows) => {
        if (cancelled) return
        const unique = Array.from(
          new Set(rows.map((r) => r?.trim()).filter(Boolean) as string[]),
        ).sort((a, b) => a.localeCompare(b, 'es'))
        setExisting(unique)
      })
      .catch(() => {
        if (!cancelled) setExisting([])
      })
    return () => {
      cancelled = true
    }
  }, [client, category])

  const currentEs = value.es?.trim() || ''
  const known = useMemo(() => {
    if (currentEs && !existing.includes(currentEs)) {
      return [...existing, currentEs].sort((a, b) => a.localeCompare(b, 'es'))
    }
    return existing
  }, [existing, currentEs])

  const selectValue =
    mode === 'new' ? NEW : currentEs && known.includes(currentEs) ? currentEs : NONE

  const writeEs = (es: string) => {
    const next = es.trim()
    if (!next) {
      props.onChange(unset())
      return
    }
    // Clear English so “Traducir al inglés” can refill after a rename
    props.onChange(set({es: next, en: undefined}))
  }

  return (
    <Stack space={3}>
      <Select
        fontSize={2}
        padding={3}
        value={selectValue}
        onChange={(event) => {
          const next = event.currentTarget.value
          if (next === NEW) {
            setMode('new')
            props.onChange(unset())
            return
          }
          setMode('pick')
          if (next === NONE) props.onChange(unset())
          else writeEs(next)
        }}
      >
        <option value={NONE}>Sin tipo (no agrupar)</option>
        {known.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
        <option value={NEW}>+ Agregar nuevo tipo…</option>
      </Select>

      {mode === 'new' && (
        <TextInput
          {...props.elementProps}
          value={currentEs}
          placeholder="Ej: Collares, Aretes, Anillos…"
          onChange={(event) => writeEs(event.currentTarget.value)}
        />
      )}
    </Stack>
  )
}
