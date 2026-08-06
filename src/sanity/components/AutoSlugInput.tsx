'use client'

import {useEffect} from 'react'
import {
  set,
  unset,
  useFormValue,
  type FieldProps,
  type ObjectInputProps,
  type SlugValue,
} from 'sanity'

function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Keeps slug.current in sync with title.es — no Generate click needed. */
export function AutoSlugInput(props: ObjectInputProps) {
  const titleEs = useFormValue(['title', 'es']) as string | undefined
  const {onChange, value} = props
  const current = (value as SlugValue | undefined)?.current

  useEffect(() => {
    const next = slugify(titleEs || '')
    if (!next) {
      if (current) onChange(unset())
      return
    }
    if (current !== next) {
      onChange(set({_type: 'slug', current: next}))
    }
  }, [titleEs, current, onChange])

  return null
}

/** Renders the input (for side effects) without showing URL / Generate in Studio. */
export function HiddenSlugField(props: FieldProps) {
  return <div style={{display: 'none'}}>{props.children}</div>
}
