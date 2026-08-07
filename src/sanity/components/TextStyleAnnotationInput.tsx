'use client'

import {Button, Card, Flex, Stack, Text} from '@sanity/ui'
import type {ObjectInputProps} from 'sanity'
import {dismissStudioFocus} from './dismissStudioFocus'

/** Fuente y tamaño popover — Continuar closes it so Publish works again. */
export function TextStyleAnnotationInput(props: ObjectInputProps) {
  return (
    <Stack space={3}>
      {props.renderDefault(props)}
      <Text size={1} muted>
        Elige fuente y tamaño, luego Continuar para volver al documento y poder
        Publish.
      </Text>
      <Card
        padding={2}
        radius={2}
        shadow={1}
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 40,
          background: 'var(--card-bg-color)',
        }}
      >
        <Flex justify="flex-end">
          <Button
            text="Continuar"
            tone="primary"
            type="button"
            onClick={() => dismissStudioFocus(props.onPathFocus)}
          />
        </Flex>
      </Card>
    </Stack>
  )
}
