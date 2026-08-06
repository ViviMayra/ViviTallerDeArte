'use client'

import {TextArea, TextInput} from '@sanity/ui'
import {set, unset, type ObjectInputProps} from 'sanity'

type Localized = {es?: string; en?: string}

/** Single Spanish field — no nested panel to close with X. */
export function SpanishStringInput(props: ObjectInputProps) {
  const value = (props.value || {}) as Localized
  const {elementProps, onChange, schemaType} = props
  const isText = schemaType.name === 'localizedText'

  if (isText) {
    return (
      <TextArea
        {...elementProps}
        rows={4}
        value={value.es || ''}
        onChange={(event) => {
          const next = event.currentTarget.value
          if (!next && !value.en) onChange(unset())
          else onChange(set({...value, es: next}))
        }}
      />
    )
  }

  return (
    <TextInput
      {...elementProps}
      value={value.es || ''}
      onChange={(event) => {
        const next = event.currentTarget.value
        if (!next && !value.en) onChange(unset())
        else onChange(set({...value, es: next}))
      }}
    />
  )
}
