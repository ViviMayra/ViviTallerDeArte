import {defineField} from 'sanity'
import {TranslateToEnglishInput} from '../../components/TranslateToEnglishInput'

/** Shared “Traducir al inglés” control shown inside editable documents. */
export const translateButtonField = defineField({
  name: 'translateHelper',
  title: 'Traducir al inglés',
  description: 'Botón para llenar el inglés del sitio desde el español.',
  type: 'string',
  components: {input: TranslateToEnglishInput},
})
