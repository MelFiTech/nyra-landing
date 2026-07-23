export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type DocParamLocation = 'path' | 'query' | 'body' | 'header'

export type DocParam = {
  name: string
  location: DocParamLocation
  type: string
  required?: boolean
  description: string
  enum?: string[]
  defaultValue?: string
  example?: string
}

export type DocResponse = {
  status: number
  label: string
  body: string
}

export type DocWebhookSample = {
  event: string
  label: string
  description: string
  body: string
}

export type DocEndpointShowcase =
  | {
      kind: 'bank-list'
      intro: string
    }

export type DocEndpoint = {
  id: string
  group: string
  groupBadge?: string
  title: string
  method: HttpMethod
  path: string
  description: string
  params?: DocParam[]
  responses: DocResponse[]
  webhookSamples?: DocWebhookSample[]
  showcase?: DocEndpointShowcase
  /** Placeholder page — no paths or samples shown. */
  comingSoon?: boolean
}

export type DocGroup = {
  id: string
  label: string
  badge?: string
}
