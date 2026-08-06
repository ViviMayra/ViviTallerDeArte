'use client'

import {AddIcon, RemoveIcon} from '@sanity/icons'
import {Button, Flex, Stack, TextInput} from '@sanity/ui'
import {set, unset, type ArrayOfPrimitivesInputProps} from 'sanity'

/**
 * Separate detail boxes (like Sanity’s default list), but new rows start as
 * empty strings — not undefined — so Studio doesn’t mark them red/invalid.
 */
export function DetailsInput(props: ArrayOfPrimitivesInputProps) {
  const values = (props.value || []) as string[]

  const update = (next: string[]) => {
    const cleaned = next.map((v) => v ?? '')
    if (cleaned.every((v) => !v.trim()) && cleaned.length === 0) {
      props.onChange(unset())
      return
    }
    props.onChange(set(cleaned))
  }

  return (
    <Stack space={2}>
      {values.map((item, index) => (
        <Flex key={index} gap={2} align="center">
          <TextInput
            style={{flex: 1}}
            value={item}
            placeholder="Ej: Plata 925"
            onChange={(event) => {
              const next = [...values]
              next[index] = event.currentTarget.value
              update(next)
            }}
          />
          <Button
            mode="ghost"
            icon={RemoveIcon}
            tone="critical"
            fontSize={1}
            padding={2}
            aria-label="Quitar detalle"
            onClick={() => update(values.filter((_, i) => i !== index))}
          />
        </Flex>
      ))}
      <Button
        mode="ghost"
        icon={AddIcon}
        text="Agregar detalle"
        fontSize={1}
        padding={3}
        style={{justifyContent: 'flex-start'}}
        onClick={() => update([...values, ''])}
      />
    </Stack>
  )
}
