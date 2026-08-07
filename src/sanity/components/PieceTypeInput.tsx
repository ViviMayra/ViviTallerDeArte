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

  const currentEs = value.es || ''
  const currentEsTrimmed = currentEs.trim()
  const known = useMemo(() => {
    if (currentEsTrimmed && !existing.includes(currentEsTrimmed)) {
      return [...existing, currentEsTrimmed].sort((a, b) =>
        a.localeCompare(b, 'es'),
      )
    }
    return existing
  }, [existing, currentEsTrimmed])

  const selectValue =
    mode === 'new'
      ? NEW
      : currentEsTrimmed && known.includes(currentEsTrimmed)
        ? currentEsTrimmed
        : NONE

  const writeEs = (es: string) => {
    // Keep characters as typed (no length cap). Only clear the field when empty.
    if (es === '') {
      props.onChange(unset())
      return
    }
    // Clear English so “Traducir al inglés” can refill after a rename
    props.onChange(set({es, en: undefined}))
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
          id={props.id}
          value={currentEs}
          placeholder="Ej: Collares, Aretes, Anillos…"
          onChange={(event) => writeEs(event.currentTarget.value)}
          onBlur={() => {
            const trimmed = currentEs.trim()
            if (!trimmed) props.onChange(unset())
            else if (trimmed !== currentEs) writeEs(trimmed)
          }}
        />
      )}
    </Stack>
  )
}
