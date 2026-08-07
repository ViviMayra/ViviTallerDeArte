'use client'

import {useEffect, useRef} from 'react'
import {set, unset, type ObjectInputProps} from 'sanity'

type Localized = {es?: unknown; en?: unknown}

function key(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

/** Convert legacy plain strings into portable text blocks. */
function stringToBlocks(text: string, prefix: string) {
  return [
    {
      _type: 'block',
      _key: key(`${prefix}-b`),
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: key(`${prefix}-s`),
          text,
          marks: [],
        },
      ],
    },
  ]
}

/**
 * Auto-migrates old `{ es: "texto" }` hero strings into rich-text blocks
 * so Studio stops showing “Invalid property value”.
 */
export function LocalizedStyledTextInput(props: ObjectInputProps) {
  const {value, onChange, renderDefault} = props
  const migrated = useRef(false)

  useEffect(() => {
    if (migrated.current) return
    if (!value || typeof value !== 'object') return

    const current = value as Localized
    const esIsString = typeof current.es === 'string'
    const enIsString = typeof current.en === 'string'
    if (!esIsString && !enIsString) return

    migrated.current = true

    const next: Localized = {}
    if (esIsString) {
      const trimmed = (current.es as string).trim()
      if (trimmed) next.es = stringToBlocks(trimmed, 'es')
    } else if (current.es !== undefined) {
      next.es = current.es
    }

    if (enIsString) {
      const trimmed = (current.en as string).trim()
      if (trimmed) next.en = stringToBlocks(trimmed, 'en')
    } else if (current.en !== undefined) {
      next.en = current.en
    }

    if (next.es === undefined && next.en === undefined) {
      onChange(unset())
    } else {
      onChange(set(next))
    }
  }, [value, onChange])

  return renderDefault(props)
}
