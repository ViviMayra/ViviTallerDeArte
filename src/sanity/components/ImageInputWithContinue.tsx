'use client'

import {Button, Flex, Stack} from '@sanity/ui'
import type {ObjectInputProps} from 'sanity'

/** Adds a Continuar button under the photo editor so she can leave without using X. */
export function ImageInputWithContinue(props: ObjectInputProps) {
  return (
    <Stack space={4}>
      {props.renderDefault(props)}
      <Flex justify="flex-end">
        <Button
          text="Continuar"
          tone="primary"
          mode="default"
          onClick={() => {
            // Collapse nested editor / return to the piece form
            props.onPathFocus([])
          }}
        />
      </Flex>
    </Stack>
  )
}
