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
        // Keep blank lines while typing; drop trailing empties on the edges only
        // so Enter for a new line doesn’t clear the field.
        const items = next.split('\n')
        props.onChange(set(items))
      }}
    />
  )
}
