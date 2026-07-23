import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import NyraLogo from '../components/ui/NyraLogo'
import MethodBadge from '../components/docs/MethodBadge'
import CopyPageButton from '../components/docs/CopyPageButton'
import CopySnippetButton from '../components/docs/CopySnippetButton'
import DocCodeBlock from '../components/docs/DocCodeBlock'
import BankListShowcase from '../components/docs/BankListShowcase'
import landingNav from '../components/landing/LandingNav.module.css'
import '../landing.css'
import { endpointToPlainText, guideToPlainText } from '../lib/apiDocs/copyPageText'
import {
  DOC_ENDPOINTS,
  DOC_GROUPS,
  getDefaultEndpointId,
  getEndpointById,
} from '../lib/apiDocs/catalog'
import { buildSampleCurl, getDocsApiBaseUrl } from '../lib/apiDocs/buildRequest'
import {
  DOC_GUIDES,
  GUIDE_GROUPS,
  getDefaultGuideId,
  getGuideById,
} from '../lib/apiDocs/guides'
import type { DocEndpoint } from '../lib/apiDocs/types'
import type { DocGuide } from '../lib/apiDocs/guides'
import { renderProseInline } from '../lib/apiDocs/renderProseInline'
import { useLockHorizontalScroll } from '../hooks/useLockHorizontalScroll'
import styles from './DeveloperDocsPage.module.css'

type DocsView = 'guides' | 'api'

const DOCS_MOBILE_MQ = '(max-width: 900px)'

function useIsDocsMobile() {
  return useSyncExternalStore(
    onStoreChange => {
      const mq = window.matchMedia(DOCS_MOBILE_MQ)
      mq.addEventListener('change', onStoreChange)
      return () => mq.removeEventListener('change', onStoreChange)
    },
    () => window.matchMedia(DOCS_MOBILE_MQ).matches,
    () => false,
  )
}

function DocsMobileScreen({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className={styles.mobilePage}>
      <section className={styles.mobileHero} aria-label="Developer documentation">
        <Link to="/" className={styles.mobileHeroLogo}>
          <NyraLogo />
        </Link>
        <h1 className={styles.mobileHeroTitle}>Developer documentation</h1>
        <p className={styles.mobileHeroText}>
          Full guides and API reference work best on a larger screen. Start building with Nyra from your dashboard.
        </p>
        <button
          type="button"
          className={`${landingNav.getStarted} ${styles.mobileHeroCta}`}
          onClick={onGetStarted}
        >
          Get started
        </button>
      </section>
    </div>
  )
}

function GuideContent({ guide }: { guide: DocGuide }) {
  const [guideTabId, setGuideTabId] = useState(() => guide.tabs?.[0]?.id ?? 'pricing')

  useEffect(() => {
    if (guide.tabs?.length) {
      setGuideTabId(guide.tabs[0].id)
    }
  }, [guide.id, guide.tabs])

  const sections = useMemo(() => {
    if (guide.tabs?.length) {
      return guide.tabs.find(t => t.id === guideTabId)?.sections ?? guide.tabs[0].sections
    }
    return guide.sections ?? []
  }, [guide, guideTabId])

  const toc = sections.filter(s => s.heading).map(s => s.heading!)

  return (
    <div className={styles.docLayout}>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderTop}>
          <h1 className={styles.pageTitle}>{guide.title}</h1>
          <CopyPageButton getText={() => guideToPlainText(guide)} />
        </div>
        {guide.subtitle && <p className={styles.pageSubtitle}>{guide.subtitle}</p>}
        {guide.tabs && guide.tabs.length > 0 && (
          <div className={styles.guideTabPills} role="tablist" aria-label="Pricing sections">
            {guide.tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={guideTabId === tab.id}
                className={`${styles.guideTabPill} ${guideTabId === tab.id ? styles.guideTabPillActive : ''}`}
                onClick={() => setGuideTabId(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
        <div className={styles.titleRule} />
      </header>

      <div className={styles.docGrid}>
        <div className={styles.docColLeft}>
          <div className={styles.prose}>
            {sections.map((section, i) => (
              <section key={i} className={styles.proseSection} id={section.heading ? slugHeading(section.heading) : undefined}>
                {section.heading && <h2 className={styles.proseH2}>{section.heading}</h2>}
                {section.urlBox && (
                  <div className={styles.baseUrlBox}>
                    <div className={styles.baseUrlMain}>
                      <span className={styles.baseUrlLabel}>{section.urlBox.label}</span>
                      <code className={styles.baseUrlValue}>{getDocsApiBaseUrl()}</code>
                    </div>
                    <CopySnippetButton text={getDocsApiBaseUrl()} label="Copy base URL" />
                  </div>
                )}
                {section.paragraphs?.map((p, j) => {
                  if (p.includes('curl ') || p.includes('--request')) return null
                  return (
                    <p key={j} className={styles.proseP}>
                      {renderProseInline(p, {
                        inlineLink: styles.inlineLink,
                        supportEmail: styles.supportEmail,
                      })}
                    </p>
                  )
                })}
                {section.bullets && (
                  <ul className={styles.proseList}>
                    {section.bullets.map(item => (
                      <li key={item}>
                        {renderProseInline(item, {
                          inlineLink: styles.inlineLink,
                          supportEmail: styles.supportEmail,
                        })}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>

        <aside className={styles.docColRight}>
          {toc.length > 0 && (
            <nav className={styles.railBlock} aria-label="On this page">
              <h3 className={styles.railTitle}>On this page</h3>
              <ul className={styles.tocList}>
                {toc.map(h => (
                  <li key={h}>
                    <a href={`#${slugHeading(h)}`} className={styles.tocLink}>
                      {h}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {sections.map((section, i) => (
            <div key={i} className={styles.railBlock}>
              {section.table && (
                <>
                  {section.heading && <h3 className={styles.railTitle}>{section.heading}</h3>}
                  <div className={styles.tableWrap}>
                    <table className={styles.pricingTable}>
                      <thead>
                        <tr>
                          {section.table.headers.map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell, ci) => (
                              <td key={ci}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              {section.paragraphs?.map((p, j) =>
                p.includes('curl ') || p.includes('--request') ? (
                  <div key={j}>
                    {section.heading && !section.table && (
                      <h3 className={styles.railTitle}>{section.heading}</h3>
                    )}
                    <DocCodeBlock text={p} preClassName={styles.codeSnip} copyLabel="Copy sample request" />
                  </div>
                ) : null,
              )}
            </div>
          ))}

          <footer className={styles.supportRail}>
            <h3 className={styles.railTitle}>Support</h3>
            <p className={styles.proseP}>
              Questions about integration? Email{' '}
              <a href="mailto:support@nyrawallet.com" className={styles.supportEmail}>
                support@nyrawallet.com
              </a>{' '}
              or use in-dashboard chat after you sign in.
            </p>
          </footer>
        </aside>
      </div>
    </div>
  )
}

function slugHeading(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function CollapsibleSection({
  resetKey,
  title,
  count,
  defaultOpen = true,
  variant = 'section',
  children,
}: {
  resetKey: string
  title: string
  count?: number
  defaultOpen?: boolean
  variant?: 'section' | 'rail'
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    setOpen(defaultOpen)
  }, [resetKey, defaultOpen])

  const shellClass = variant === 'section' ? styles.collapsibleSection : styles.collapsibleRail
  const titleClass = variant === 'section' ? styles.collapsibleTitle : styles.railTitleInline

  return (
    <section className={shellClass}>
      <button
        type="button"
        className={styles.collapsibleTrigger}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} aria-hidden />
        <span className={titleClass}>{title}</span>
        {count !== undefined && <span className={styles.sectionCount}>{count}</span>}
      </button>
      {open && <div className={styles.collapsibleBody}>{children}</div>}
    </section>
  )
}

function buildWebhookDeliveryCurl(body: string): string {
  const compact = body
    .split('\n')
    .map(line => line.trim())
    .join('')
  const escaped = compact.replace(/'/g, "'\\''")
  return `curl --request POST \\
  --url 'https://your-server.com/webhooks/nyra' \\
  --header 'Content-Type: application/json' \\
  --header 'X-Nyra-Signature: <hmac-sha256-hex-of-raw-body>' \\
  --data '${escaped}'`
}

function EndpointDetail({
  endpoint,
  selectedResponse,
  onSelectResponse,
}: {
  endpoint: DocEndpoint
  selectedResponse: number
  onSelectResponse: (status: number) => void
}) {
  const base = getDocsApiBaseUrl()
  const displayPath = endpoint.comingSoon
    ? ''
    : `${base}${endpoint.path.replace(/\{([^}]+)\}/g, '{$1}')}`

  const bodyParams = endpoint.params?.filter(p => p.location === 'body') ?? []
  const pathParams = endpoint.params?.filter(p => p.location === 'path') ?? []
  const queryParams = endpoint.params?.filter(p => p.location === 'query') ?? []
  const headerParams = endpoint.params?.filter(p => p.location === 'header') ?? []

  const webhookSamples = endpoint.webhookSamples
  const [selectedWebhookSampleLabel, setSelectedWebhookSampleLabel] = useState(
    () => webhookSamples?.[0]?.label ?? '',
  )

  useEffect(() => {
    if (webhookSamples?.length) {
      setSelectedWebhookSampleLabel(webhookSamples[0].label)
    }
  }, [endpoint.id, webhookSamples])

  const activeWebhookSample =
    webhookSamples?.find(s => s.label === selectedWebhookSampleLabel) ?? webhookSamples?.[0]

  const sampleCurl = endpoint.comingSoon
    ? ''
    : webhookSamples?.length
      ? activeWebhookSample
        ? buildWebhookDeliveryCurl(activeWebhookSample.body)
        : ''
      : buildSampleCurl(endpoint)

  const bankListShowcase =
    endpoint.showcase?.kind === 'bank-list' ? endpoint.showcase : null

  const hasParamSections =
    headerParams.length > 0 ||
    pathParams.length > 0 ||
    queryParams.length > 0 ||
    bodyParams.length > 0

  return (
    <div className={styles.docLayout}>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderTop}>
          <h1 className={styles.pageTitle}>{endpoint.title}</h1>
          <CopyPageButton getText={() => endpointToPlainText(endpoint, base)} />
        </div>
        {endpoint.comingSoon ? (
          <p className={styles.comingSoonBadge}>Coming soon</p>
        ) : (
          <div className={styles.endpointUrl}>
            <MethodBadge method={endpoint.method} />
            <code className={styles.urlCode}>{displayPath}</code>
            <CopySnippetButton text={displayPath} label="Copy endpoint URL" />
          </div>
        )}
        <p className={styles.pageSubtitle}>{endpoint.description}</p>
        <div className={styles.titleRule} />
      </header>

      {endpoint.comingSoon ? null : (
      <div className={styles.docGrid}>
        <div className={styles.docColLeft}>
          {headerParams.length > 0 && (
            <CollapsibleSection
              resetKey={`${endpoint.id}-headers`}
              title="Headers"
              count={headerParams.length}
            >
              <div className={styles.paramList}>
                {headerParams.map(p => (
                  <ParamDoc key={p.name} param={p} />
                ))}
              </div>
            </CollapsibleSection>
          )}

          {pathParams.length > 0 && (
            <CollapsibleSection
              resetKey={`${endpoint.id}-path`}
              title="Path params"
              count={pathParams.length}
            >
              <div className={styles.paramList}>
                {pathParams.map(p => (
                  <ParamDoc key={p.name} param={p} />
                ))}
              </div>
            </CollapsibleSection>
          )}

          {queryParams.length > 0 && (
            <CollapsibleSection
              resetKey={`${endpoint.id}-query`}
              title="Query params"
              count={queryParams.length}
            >
              <div className={styles.paramList}>
                {queryParams.map(p => (
                  <ParamDoc key={p.name} param={p} />
                ))}
              </div>
            </CollapsibleSection>
          )}

          {bodyParams.length > 0 && (
            <CollapsibleSection
              resetKey={`${endpoint.id}-body`}
              title="Body params"
              count={bodyParams.length}
            >
              <div className={styles.paramList}>
                {bodyParams.map(p => (
                  <ParamDoc key={p.name} param={p} />
                ))}
              </div>
            </CollapsibleSection>
          )}

          {bankListShowcase && <BankListShowcase intro={bankListShowcase.intro} />}

          {!hasParamSections && !bankListShowcase && !webhookSamples?.length && (
              <p className={styles.proseP}>This endpoint has no documented parameters.</p>
            )}

          {webhookSamples && webhookSamples.length > 0 && (
            <CollapsibleSection
              resetKey={`${endpoint.id}-list-api`}
              title="List endpoints (dashboard API)"
              defaultOpen={false}
            >
              <p className={styles.webhookAsideNote}>
                Use the dashboard or session-authenticated{' '}
                <code className={styles.inlineCode}>GET {endpoint.path}</code> call to manage
                webhook URLs and subscriptions.
              </p>
              <DocCodeBlock
                text={endpoint.responses[0]?.body ?? ''}
                preClassName={styles.responseBody}
                copyLabel="Copy response"
              />
            </CollapsibleSection>
          )}
        </div>

        <aside className={styles.docColRight}>
          {endpoint.id !== 'authentication' && (
            <CollapsibleSection
              resetKey={`${endpoint.id}-curl`}
              title={webhookSamples?.length ? 'Sample delivery' : 'Sample request'}
              variant="rail"
            >
              <DocCodeBlock
                text={sampleCurl}
                preClassName={styles.codeSnip}
                copyLabel="Copy sample request"
              />
            </CollapsibleSection>
          )}

          {webhookSamples && webhookSamples.length > 0 ? (
            <CollapsibleSection
              resetKey={`${endpoint.id}-webhook-payloads`}
              title="Event payloads"
              count={webhookSamples.length}
              variant="rail"
            >
              <p className={styles.webhookAsideNote}>
                Nyra POSTs JSON to your URL. Verify{' '}
                <code className={styles.inlineCode}>X-Nyra-Signature</code> (HMAC-SHA256 of the raw
                body with your signing secret).
              </p>
              <div className={styles.eventPills} role="tablist" aria-label="Webhook event types">
                {webhookSamples.map(sample => (
                  <button
                    key={sample.label}
                    type="button"
                    role="tab"
                    aria-selected={selectedWebhookSampleLabel === sample.label}
                    className={`${styles.eventPill} ${selectedWebhookSampleLabel === sample.label ? styles.eventPillActive : ''}`}
                    onClick={() => setSelectedWebhookSampleLabel(sample.label)}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
              {activeWebhookSample && (
                <>
                  <p className={styles.eventMeta}>
                    <code className={styles.inlineCode}>{activeWebhookSample.event}</code>
                  </p>
                  <p className={styles.eventDescription}>{activeWebhookSample.description}</p>
                  <DocCodeBlock
                    text={activeWebhookSample.body}
                    preClassName={styles.responseBody}
                    copyLabel="Copy event payload"
                  />
                </>
              )}
            </CollapsibleSection>
          ) : (
            <CollapsibleSection
              resetKey={`${endpoint.id}-responses`}
              title="Responses"
              count={endpoint.responses.length}
              variant="rail"
            >
              <div className={styles.responseTabs}>
                {endpoint.responses.map(r => (
                  <button
                    key={r.status}
                    type="button"
                    className={`${styles.responseTab} ${selectedResponse === r.status ? styles.responseTabActive : ''}`}
                    onClick={() => onSelectResponse(r.status)}
                  >
                    <span className={r.status < 400 ? styles.dotOk : styles.dotErr} />
                    {r.status}: {r.label}
                  </button>
                ))}
              </div>
              <DocCodeBlock
                text={
                  endpoint.responses.find(r => r.status === selectedResponse)?.body ??
                  endpoint.responses[0]?.body ??
                  ''
                }
                preClassName={styles.responseBody}
                copyLabel="Copy response"
              />
            </CollapsibleSection>
          )}
        </aside>
      </div>
      )}
    </div>
  )
}

function ParamDoc({ param }: { param: import('../lib/apiDocs/types').DocParam }) {
  return (
    <div className={styles.paramRow}>
      <span className={styles.paramName}>
        {param.name}
        {param.required && <span className={styles.required}>required</span>}
      </span>
      <span className={styles.paramType}>{param.type}</span>
      <p className={styles.paramDesc}>{param.description}</p>
      {param.enum && <p className={styles.paramEnum}>Allowed: {param.enum.join(', ')}</p>}
      {(param.example ?? param.defaultValue) && (
        <p className={styles.paramExample}>
          {param.defaultValue ? `Default: ${param.defaultValue}` : `Example: ${param.example}`}
        </p>
      )}
    </div>
  )
}

export default function DeveloperDocsPage() {
  const navigate = useNavigate()
  useLockHorizontalScroll()
  const isDocsMobile = useIsDocsMobile()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filter, setFilter] = useState('')
  const [selectedResponse, setSelectedResponse] = useState(200)
  const [collapsedSidebarGroups, setCollapsedSidebarGroups] = useState<Record<string, boolean>>({})

  const view: DocsView = searchParams.get('view') === 'api' ? 'api' : 'guides'
  const guideId = searchParams.get('g') ?? getDefaultGuideId()
  const endpointId = searchParams.get('e') ?? getDefaultEndpointId()

  const guide = getGuideById(guideId) ?? getGuideById(getDefaultGuideId())!
  const endpoint = getEndpointById(endpointId) ?? getEndpointById(getDefaultEndpointId())!

  useEffect(() => {
    if (view === 'guides' && !getGuideById(guideId)) {
      const next = new URLSearchParams(searchParams)
      next.set('view', 'guides')
      next.set('g', getDefaultGuideId())
      setSearchParams(next, { replace: true })
    }
  }, [view, guideId, searchParams, setSearchParams])

  useEffect(() => {
    if (view !== 'api') return
    if (!getEndpointById(endpointId)) {
      const next = new URLSearchParams(searchParams)
      next.set('view', 'api')
      next.set('e', getDefaultEndpointId())
      setSearchParams(next, { replace: true })
      return
    }
    if (endpointId.startsWith('crypto-') && endpointId !== 'crypto-coming-soon') {
      const next = new URLSearchParams(searchParams)
      next.set('view', 'api')
      next.set('e', 'crypto-coming-soon')
      setSearchParams(next, { replace: true })
    }
  }, [view, endpointId, searchParams, setSearchParams])

  useEffect(() => {
    const html = document.documentElement
    const hadDark = html.classList.contains('dark')
    html.classList.add('dark')

    return () => {
      if (hadDark) html.classList.add('dark')
      else html.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    let changed = false
    if (!searchParams.get('view')) {
      next.set('view', 'guides')
      changed = true
    }
    if (view === 'guides' && !searchParams.get('g')) {
      next.set('g', getDefaultGuideId())
      changed = true
    }
    if (view === 'api' && !searchParams.get('e')) {
      next.set('e', getDefaultEndpointId())
      changed = true
    }
    if (changed) setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams, view])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)')

    function ensureGuidesOnlyOnMobile() {
      if (mq.matches && view === 'api') {
        setSearchParams({ view: 'guides', g: guideId }, { replace: true })
      }
    }

    ensureGuidesOnlyOnMobile()
    mq.addEventListener('change', ensureGuidesOnlyOnMobile)
    return () => mq.removeEventListener('change', ensureGuidesOnlyOnMobile)
  }, [view, guideId, setSearchParams])

  useEffect(() => {
    if (view === 'api') {
      setSelectedResponse(endpoint.responses[0]?.status ?? 200)
    }
  }, [endpoint.id, view])

  const setView = useCallback(
    (nextView: DocsView) => {
      const next = new URLSearchParams()
      next.set('view', nextView)
      if (nextView === 'guides') next.set('g', guideId)
      else next.set('e', endpointId)
      setSearchParams(next, { replace: true })
    },
    [guideId, endpointId, setSearchParams],
  )

  const selectGuide = useCallback(
    (id: string) => {
      setSearchParams({ view: 'guides', g: id })
    },
    [setSearchParams],
  )

  const selectEndpoint = useCallback(
    (id: string) => {
      setSearchParams({ view: 'api', e: id })
    },
    [setSearchParams],
  )

  const filteredGuideGroups = useMemo(() => {
    const q = filter.trim().toLowerCase()
    return GUIDE_GROUPS.map(group => ({
      ...group,
      items: DOC_GUIDES.filter(g => {
        if (g.group !== group.id) return false
        if (!q) return true
        return g.title.toLowerCase().includes(q) || g.id.includes(q)
      }),
    })).filter(g => g.items.length > 0)
  }, [filter])

  const filteredApiGroups = useMemo(() => {
    const q = filter.trim().toLowerCase()
    return DOC_GROUPS.map(group => ({
      ...group,
      endpoints: DOC_ENDPOINTS.filter(e => {
        if (e.group !== group.id) return false
        if (!q) return true
        return (
          e.title.toLowerCase().includes(q) ||
          e.path.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q)
        )
      }),
    })).filter(g => g.endpoints.length > 0)
  }, [filter])

  const activeSidebarId = view === 'guides' ? guide.id : endpoint.id
  const activeSidebarGroupId = view === 'guides' ? guide.group : endpoint.group

  const toggleSidebarGroup = useCallback((groupId: string) => {
    setCollapsedSidebarGroups(prev => {
      const collapsed = prev[groupId] !== false
      return { ...prev, [groupId]: collapsed ? false : true }
    })
  }, [])

  const isSidebarGroupCollapsed = useCallback(
    (groupId: string) => collapsedSidebarGroups[groupId] !== false,
    [collapsedSidebarGroups],
  )

  useEffect(() => {
    if (!activeSidebarGroupId) return
    setCollapsedSidebarGroups(prev => ({
      ...prev,
      [activeSidebarGroupId]: false,
    }))
  }, [activeSidebarGroupId])

  useEffect(() => {
    const q = filter.trim()
    if (!q) return
    const groupIds =
      view === 'guides'
        ? filteredGuideGroups.map(g => g.id)
        : filteredApiGroups.map(g => g.id)
    setCollapsedSidebarGroups(prev => {
      const next = { ...prev }
      for (const id of groupIds) {
        next[id] = false
      }
      return next
    })
  }, [filter, view, filteredGuideGroups, filteredApiGroups])

  function renderSidebarGroupHeader(groupId: string, label: string, badge?: string) {
    const collapsed = isSidebarGroupCollapsed(groupId)
    return (
      <button
        type="button"
        className={styles.sidebarGroupHeader}
        onClick={() => toggleSidebarGroup(groupId)}
        aria-expanded={!collapsed}
      >
        <span
          className={`${styles.sidebarChevron} ${collapsed ? '' : styles.sidebarChevronOpen}`}
          aria-hidden
        />
        <span className={styles.sidebarGroupLabelText}>{label}</span>
        {badge && <span className={styles.newBadge}>{badge}</span>}
      </button>
    )
  }

  if (isDocsMobile) {
    return <DocsMobileScreen onGetStarted={() => navigate('/app/signup')} />
  }

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <Link to="/" className={styles.logoLink}>
            <NyraLogo />
          </Link>
          <div className={styles.topNavPills}>
            <button
              type="button"
              className={`${styles.pill} ${view === 'guides' ? styles.pillActive : ''}`}
              onClick={() => setView('guides')}
            >
              Guides
            </button>
            <button
              type="button"
              className={`${styles.pill} ${styles.pillApi} ${view === 'api' ? styles.pillActive : ''}`}
              onClick={() => setView('api')}
              aria-label="API Reference"
            >
              API Reference
            </button>
          </div>
        </div>

        <div className={styles.topbarRight}>
          <div className={styles.topActions}>
            <Link to="/app/settings" className={styles.topNavLink}>
              API keys
            </Link>
            <button type="button" className={styles.topBtn} onClick={() => navigate('/app/login')}>
              Sign in
            </button>
            <button type="button" className={styles.topBtnPrimary} onClick={() => navigate('/app/signup')}>
              Get started
            </button>
          </div>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <input
            className={styles.jumpTo}
            placeholder="Search docs…"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
          {view === 'guides'
            ? filteredGuideGroups.map(group => (
                <div key={group.id} className={styles.sidebarGroup}>
                  {renderSidebarGroupHeader(group.id, group.label)}
                  {!isSidebarGroupCollapsed(group.id) &&
                    group.items.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        className={`${styles.sidebarItem} ${item.id === activeSidebarId ? styles.sidebarItemActive : ''}`}
                        onClick={() => selectGuide(item.id)}
                      >
                        {item.title}
                      </button>
                    ))}
                </div>
              ))
            : filteredApiGroups.map(group => (
                <div key={group.id} className={styles.sidebarGroup}>
                  {renderSidebarGroupHeader(group.id, group.label, group.badge)}
                  {!isSidebarGroupCollapsed(group.id) &&
                    group.endpoints.map(ep => (
                      <button
                        key={ep.id}
                        type="button"
                        className={`${styles.sidebarItem} ${styles.sidebarItemApi} ${ep.id === activeSidebarId ? styles.sidebarItemActive : ''}`}
                        onClick={() => selectEndpoint(ep.id)}
                      >
                        {!ep.comingSoon && <MethodBadge method={ep.method} />}
                        <span className={styles.sidebarItemTitle}>{ep.title}</span>
                      </button>
                    ))}
                </div>
              ))}
        </aside>

        <main className={styles.main}>
          <div className={styles.content}>
            {view === 'guides' ? (
              <GuideContent guide={guide} />
            ) : (
              <EndpointDetail
                endpoint={endpoint}
                selectedResponse={selectedResponse}
                onSelectResponse={setSelectedResponse}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
