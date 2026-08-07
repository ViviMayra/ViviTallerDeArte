import {createClient} from 'next-sanity'
import {apiVersion, dataset, projectId, hasSanityConfig} from '../env'

export const client = hasSanityConfig
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      // Published content should show promptly after Studio Publish.
      useCdn: false,
    })
  : null

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T | null> {
  if (!client) return null
  try {
    return await client.fetch<T>(query, params, {
      // Keep Studio publishes visible quickly on the site.
      next: {revalidate: 0, tags: ['sanity']},
    })
  } catch {
    return null
  }
}
