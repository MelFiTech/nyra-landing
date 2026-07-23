import type { DocEndpoint } from './types'
import type { DocGuide } from './guides'
import { DOCS_API_BASE_URL } from './buildRequest'

function appendTable(
  lines: string[],
  headers: string[],
  rows: string[][],
) {
  lines.push('', headers.join(' | '))
  lines.push(headers.map(() => '---').join(' | '))
  for (const row of rows) {
    lines.push(row.join(' | '))
  }
}

export function guideToPlainText(guide: DocGuide): string {
  const lines: string[] = [guide.title]
  if (guide.subtitle) {
    lines.push('', guide.subtitle)
  }

  const sectionGroups: { label?: string; sections: NonNullable<DocGuide['sections']> }[] =
    guide.tabs?.length
      ? guide.tabs.map(tab => ({ label: tab.label, sections: tab.sections }))
      : [{ sections: guide.sections ?? [] }]

  for (const group of sectionGroups) {
    if (group.label) {
      lines.push('', group.label)
    }
    for (const section of group.sections) {
      if (section.heading) lines.push('', section.heading)
      for (const p of section.paragraphs ?? []) {
        lines.push('', p)
      }
      for (const item of section.bullets ?? []) {
        lines.push(`- ${item}`)
      }
      if (section.urlBox) {
        lines.push('', `${section.urlBox.label}: ${DOCS_API_BASE_URL}`)
      }
      if (section.table) {
        appendTable(lines, section.table.headers, section.table.rows)
      }
    }
  }
  lines.push('', window.location.href)
  return lines.join('\n').trim()
}

export function endpointToPlainText(endpoint: DocEndpoint, apiBase: string): string {
  if (endpoint.comingSoon) {
    return [endpoint.title, '', endpoint.description, '', window.location.href].join('\n').trim()
  }

  const lines: string[] = [
    endpoint.title,
    '',
    `${endpoint.method} ${apiBase}${endpoint.path}`,
    '',
    endpoint.description,
  ]

  const groups: { title: string; params: NonNullable<DocEndpoint['params']> }[] = [
    { title: 'Headers', params: endpoint.params?.filter(p => p.location === 'header') ?? [] },
    { title: 'Query params', params: endpoint.params?.filter(p => p.location === 'query') ?? [] },
    { title: 'Path params', params: endpoint.params?.filter(p => p.location === 'path') ?? [] },
    { title: 'Body params', params: endpoint.params?.filter(p => p.location === 'body') ?? [] },
  ]

  for (const group of groups) {
    if (group.params.length === 0) continue
    lines.push('', group.title)
    for (const p of group.params) {
      const req = p.required ? ' (required)' : ''
      lines.push(`- ${p.name} (${p.type})${req}: ${p.description}`)
      if (p.enum?.length) lines.push(`  Allowed: ${p.enum.join(', ')}`)
      if (p.example) lines.push(`  Example: ${p.example}`)
      if (p.defaultValue) lines.push(`  Default: ${p.defaultValue}`)
    }
  }

  lines.push('', 'Responses')
  for (const r of endpoint.responses) {
    lines.push('', `${r.status} ${r.label}`, r.body)
  }

  if (endpoint.webhookSamples?.length) {
    lines.push('', 'Webhook event payloads (POST to your URL)')
    for (const sample of endpoint.webhookSamples) {
      lines.push('', `${sample.label} (${sample.event})`, sample.description, sample.body)
    }
  }

  lines.push('', window.location.href)
  return lines.join('\n').trim()
}
