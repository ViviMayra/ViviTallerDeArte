'use client'

import {TextArea} from '@sanity/ui'
import {set, unset, type ArrayOfPrimitivesInputProps} from 'sanity'

/** One detail per line — avoids Sanity’s empty-item red state on “Add item”. */
export function DetailsInput(props: ArrayOfPrimitivesInputProps) {
  const lines = (props.value || []) as string[]
  const text = lines.join('\n')

  return (
    <TextArea
      {...props.elementProps}
      rows={4}
      value={text}
      placeholder={'Plata 925\nHecho a mano\nÚnica'}
      onChange={(event) => {
        const next = event.currentTarget.value
        if (!next.trim()) {
          props.onChange(unset())
          return
        }
        // Keep blank lines while typing so Enter can start a new detail.
        props.onChange(set(next.split('\n')))
      }}
      onBlur={(event) => {
        props.elementProps.onBlur?.(event)
        const items = event.currentTarget.value
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
        if (items.length === 0) props.onChange(unset())
        else props.onChange(set(items))
      }}
    />
  )
}
