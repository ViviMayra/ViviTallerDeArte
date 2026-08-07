'use client'

import {RemoveIcon} from '@sanity/icons/Remove'
import {Button, Card, Flex, Stack, Text} from '@sanity/ui'
import {unset, type ObjectInputProps} from 'sanity'
import {dismissStudioFocus} from './dismissStudioFocus'

type ImageValue = {
  asset?: {_ref?: string; _type?: string}
  _upload?: {progress?: number; file?: {name?: string}}
}

/** Continuar + Quitar foto under the photo editor (leave without X; clear stuck uploads). */
export function ImageInputWithContinue(props: ObjectInputProps) {
  const value = props.value as ImageValue | undefined
  const isUploading = Boolean(value?._upload)
  const hasPhoto = Boolean(value?.asset) || isUploading
  const progress = value?._upload?.progress

  const leaveEditor = () => dismissStudioFocus(props.onPathFocus)

  const clearPhoto = () => {
    props.onChange(unset())
    leaveEditor()
  }

  return (
    <Stack space={3}>
      {props.renderDefault(props)}
      {isUploading ? (
        <Text size={1} muted>
          Subiendo
          {typeof progress === 'number' ? ` (${Math.round(progress)}%)` : ''}…
          Si se queda trabada, usa Quitar foto e intenta de nuevo.
        </Text>
      ) : null}
      <Card
        padding={2}
        radius={2}
        shadow={1}
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 30,
          background: 'var(--card-bg-color)',
        }}
      >
        <Flex justify="flex-end" gap={2} wrap="wrap">
          {hasPhoto ? (
            <Button
              text="Quitar foto"
              icon={RemoveIcon}
              tone="critical"
              mode="ghost"
              type="button"
              onClick={clearPhoto}
            />
          ) : null}
          <Button
            text="Continuar"
            tone="primary"
            mode="default"
            type="button"
            onClick={leaveEditor}
          />
        </Flex>
      </Card>
    </Stack>
  )
}
