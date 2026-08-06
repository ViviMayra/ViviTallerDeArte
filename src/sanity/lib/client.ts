import {createClient} from 'next-sanity'
import {apiVersion, dataset, projectId, hasSanityConfig} from '../env'

export const client = hasSanityConfig
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
    })
  : null

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T | null> {
  if (!client) return null
  try {
    return await client.fetch<T>(query, params)
  } catch {
    return null
  }
}
