'use client'

import {TextArea, TextInput} from '@sanity/ui'
import {set, unset, type ObjectInputProps} from 'sanity'

type Localized = {es?: string; en?: string}

/** Single Spanish field — no nested panel to close with X. */
export function SpanishStringInput(props: ObjectInputProps) {
  const value = (props.value || {}) as Localized
  const {elementProps, onChange, schemaType} = props
  const isText = schemaType.name === 'localizedText'

  const handleChange = (next: string) => {
    // Clearing Spanish removes the whole value (including hidden EN).
    // Leaving `{ es: '', en: '...' }` after translate blocks Publish.
    if (!next.trim()) {
      onChange(unset())
      return
    }
    onChange(set({es: next, ...(value.en ? {en: value.en} : {})}))
  }

  if (isText) {
    return (
      <TextArea
        {...elementProps}
        rows={3}
        value={value.es || ''}
        onChange={(event) => handleChange(event.currentTarget.value)}
      />
    )
  }

  return (
    <TextInput
      {...elementProps}
      value={value.es || ''}
      onChange={(event) => handleChange(event.currentTarget.value)}
    />
  )
}
