'use client'

import {useEffect, useMemo, useState} from 'react'
import {DragHandleIcon} from '@sanity/icons/DragHandle'
import {Card, Flex, Stack, Text} from '@sanity/ui'
import {set, unset, useClient, useFormValue, type ArrayOfPrimitivesInputProps} from 'sanity'

/**
 * Lists piece subtypes for this category (from existing pieces) and lets
 * Mayra drag them into the order she wants on the site.
 */
export function TypeOrderInput(props: ArrayOfPrimitivesInputProps) {
  const saved = (props.value || []) as string[]
  const rawId = useFormValue(['_id']) as string | undefined
  const category = useMemo(() => {
    const id = (rawId || '').replace(/^drafts\./, '')
    return id.startsWith('type-order-') ? id.slice('type-order-'.length) : null
  }, [rawId])
  const client = useClient({apiVersion: '2025-01-01'})
  const [existing, setExisting] = useState<string[]>([])
  const [dragging, setDragging] = useState<number | null>(null)

  useEffect(() => {
    if (!category) {
      setExisting([])
      return
    }
    let cancelled = false
    client
      .fetch<string[]>(
        `*[_type == "piece" && category == $category && defined(pieceType.es)].pieceType.es`,
        {category},
      )
      .then((rows) => {
        if (cancelled) return
        const unique = Array.from(
          new Set(rows.map((r) => r?.trim()).filter(Boolean) as string[]),
        )
        setExisting(unique)
      })
      .catch(() => {
        if (!cancelled) setExisting([])
      })
    return () => {
      cancelled = true
    }
  }, [client, category])

  const display = useMemo(() => {
    const seen = new Set<string>()
    const ordered: string[] = []
    for (const name of saved) {
      const trimmed = name?.trim()
      if (!trimmed || seen.has(trimmed)) continue
      if (existing.includes(trimmed)) {
        ordered.push(trimmed)
        seen.add(trimmed)
      }
    }
    for (const name of existing) {
      if (!seen.has(name)) {
        ordered.push(name)
        seen.add(name)
      }
    }
    return ordered
  }, [saved, existing])

  const write = (next: string[]) => {
    if (next.length === 0) {
      props.onChange(unset())
      return
    }
    props.onChange(set(next))
  }

  if (!category) {
    return (
      <Text size={1} muted>
        Abre este documento desde una categoría (Joyería, Cerámica…).
      </Text>
    )
  }

  if (display.length === 0) {
    return (
      <Text size={1} muted>
        Todavía no hay tipos en las piezas de esta categoría. Cuando agregues un
        tipo a una pieza (Aretes, Collares…), aparecerá aquí para reordenar.
      </Text>
    )
  }

  return (
    <Stack space={2}>
      <Text size={1} muted>
        Arrastra el asa para cambiar el orden. Publica cuando termines.
      </Text>
      {display.map((name, index) => (
        <Card
          key={name}
          padding={3}
          radius={2}
          shadow={1}
          tone={dragging === index ? 'primary' : 'default'}
          draggable
          onDragStart={(event) => {
            setDragging(index)
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.setData('text/plain', String(index))
          }}
          onDragOver={(event) => {
            event.preventDefault()
            event.dataTransfer.dropEffect = 'move'
          }}
          onDrop={(event) => {
            event.preventDefault()
            const from = Number(event.dataTransfer.getData('text/plain'))
            if (Number.isNaN(from) || from === index) {
              setDragging(null)
              return
            }
            const next = [...display]
            const [moved] = next.splice(from, 1)
            next.splice(index, 0, moved)
            write(next)
            setDragging(null)
          }}
          onDragEnd={() => setDragging(null)}
          style={{cursor: 'grab'}}
        >
          <Flex align="center" gap={3}>
            <Text size={2}>
              <DragHandleIcon />
            </Text>
            <Text size={2} weight="medium">
              {name}
            </Text>
          </Flex>
        </Card>
      ))}
    </Stack>
  )
}
