import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Button from '../components/ui/Button'
import EmptyState, { CardEmptyIcon } from '../components/ui/EmptyState'
import { TableRowsSkeleton } from '../components/ui/Skeletons'
import CardDetailDrawer from '../components/cards/CardDetailDrawer'
import CreateCardSheet from '../components/cards/CreateCardSheet'
import UsdDepositSheet from '../components/treasury/UsdDepositSheet'
import { useBalance } from '../context/BalanceContext'
import { useBusiness, usePermissions } from '../context/BusinessContext'
import { useCardSummary, useCards, useUsdCryptoDeposit } from '../hooks/useAppData'
import { queryKeys } from '../lib/queryKeys'
import type { VirtualCard } from '../lib/api'
import styles from './CardsPage.module.css'

const PAGE_SIZE = 10

function usd(value: number | string | undefined | null) {
  const n = Number(value ?? 0)
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function compactUsd(value: number | string | undefined | null) {
  const n = Number(value ?? 0)
  const abs = Math.abs(n)
  const prefix = n < 0 ? '-$' : '$'

  if (abs >= 1_000_000) {
    return `${prefix}${(abs / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`
  }
  if (abs >= 1_000) {
    return `${prefix}${(abs / 1_000).toLocaleString('en-US', { maximumFractionDigits: 1 })}K`
  }
  return usd(n)
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function maskCardNumber(lastFour: string) {
  return `•••• •••• •••• ${lastFour}`
}

function CardStatus({ status }: { status: VirtualCard['status'] }) {
  if (status === 'ACTIVE') {
    return (
      <span className={styles.statusActive}>
        <span className={styles.dotActive} />
        Active
      </span>
    )
  }
  if (status === 'FROZEN') {
    return (
      <span className={styles.statusFrozen}>
        <span className={styles.dotFrozen} />
        Frozen
      </span>
    )
  }
  return (
    <span className={styles.statusTerminated}>
      <span className={styles.dotTerminated} />
      Terminated
    </span>
  )
}

export default function CardsPage() {
  const { visible: balanceVisible } = useBalance()
  const { canAct } = usePermissions()
  const { businessId, businessesLoading } = useBusiness()
  const queryClient = useQueryClient()
  const { data: summary, isLoading: summaryLoading, isError: summaryError } = useCardSummary()
  const { data: cards = [], isLoading: cardsLoading, isError: cardsError, error: cardsLoadError, refetch: refetchCards } = useCards()
  const { data: usdCryptoDeposit = null, isLoading: usdCryptoLoading } = useUsdCryptoDeposit()
  const [page, setPage] = useState(1)
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [usdDepositOpen, setUsdDepositOpen] = useState(false)
  const [cardOverrides, setCardOverrides] = useState<Record<string, Partial<VirtualCard>>>({})


  function refreshCards() {
    if (!businessId) return
    void queryClient.invalidateQueries({ queryKey: queryKeys.cards(businessId) })
    void queryClient.invalidateQueries({ queryKey: queryKeys.cardSummary(businessId) })
  }

  const displayCards = useMemo(
    () => cards.map(card => ({ ...card, ...cardOverrides[card.card_id] })),
    [cards, cardOverrides],
  )

  const totalPages = Math.max(1, Math.ceil(displayCards.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = useMemo(
    () => displayCards.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [displayCards, currentPage],
  )

  const metricsLoading = businessesLoading || (summaryLoading && !summary && !summaryError)
  const cardsListLoading = businessesLoading || (cardsLoading && cards.length === 0 && !cardsError)

  const usdBalanceValue = !balanceVisible
    ? '$ ••••'
    : compactUsd(summary?.usd_balance)

  const totalCardsValue = String(summary?.total_cards ?? 0)

  const totalCardBalanceValue = !balanceVisible
    ? '$ ••••'
    : compactUsd(summary?.total_card_balance)

  function handleCardUpdate(updated: VirtualCard) {
    setCardOverrides(prev => ({ ...prev, [updated.card_id]: updated }))
    setSelectedCard(updated)
  }

  return (
    <>
      <CardDetailDrawer
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
        onUpdate={handleCardUpdate}
        onRefresh={refreshCards}
        canManage={canAct}
      />

      <CreateCardSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          refreshCards()
          setPage(1)
        }}
      />

      <UsdDepositSheet
        open={usdDepositOpen}
        onClose={() => setUsdDepositOpen(false)}
        cryptoDeposit={usdCryptoDeposit}
        loading={usdCryptoLoading}
        onFunded={() => {
          refreshCards()
          if (businessId) {
            void queryClient.invalidateQueries({ queryKey: queryKeys.wallet(businessId) })
          }
        }}
      />

      <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Virtual card</h1>
        {canAct && (
          <div className={styles.pageActions}>
            <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
              Create card
            </Button>
          </div>
        )}
      </div>

      {metricsLoading ? (
        <div className={styles.metrics}>
          <div className={styles.skMetric} />
          <div className={styles.skMetric} />
          <div className={styles.skMetric} />
        </div>
      ) : (
      <div className={styles.metrics}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>USD Balance</span>
            <button
              type="button"
              className={styles.addFundsPill}
              onClick={() => setUsdDepositOpen(true)}
            >
              Add funds
            </button>
          </div>
          <span className={styles.metricValue}>{usdBalanceValue}</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total Cards</span>
          <span className={styles.metricValue}>{totalCardsValue}</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total Card Balance</span>
          <span className={styles.metricValue}>{totalCardBalanceValue}</span>
        </div>
      </div>
      )}

      <div className={styles.tableWrap}>
        {cardsListLoading ? (
          <TableRowsSkeleton rows={6} />
        ) : cardsError && cards.length === 0 ? (
          <EmptyState
            icon={<CardEmptyIcon />}
            title="Could not load cards"
            description={
              cardsLoadError instanceof Error
                ? cardsLoadError.message
                : 'Check your connection and try again.'
            }
            action={
              <Button variant="outline" size="sm" onClick={() => void refetchCards()}>
                Retry
              </Button>
            }
          />
        ) : displayCards.length === 0 ? (
          <EmptyState
            icon={<CardEmptyIcon />}
            title="No virtual cards yet"
            description="Create a card for an existing customer, or issue cards through the Nyra API."
            action={
              canAct ? (
                <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
                  Create card
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Cardholder</th>
                    <th className={styles.cardNumberCol}>Card Number</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Date Issued</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map(card => (
                    <tr
                      key={card.card_id}
                      className={styles.tableRow}
                      onClick={() => setSelectedCard(card)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelectedCard(card)
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`View card for ${card.cardholder_name}`}
                    >
                      <td className={styles.nameCell}>{card.cardholder_name}</td>
                      <td className={`${styles.cardNumberCell} ${styles.cardNumberCol}`}>
                        {maskCardNumber(card.last_four)}
                      </td>
                      <td className={styles.balanceCell}>
                        {balanceVisible ? usd(card.balance) : '$ ••••'}
                      </td>
                      <td>
                        <CardStatus status={card.status} />
                      </td>
                      <td className={styles.dateCell}>{formatDate(card.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.tableFooter}>
              <span className={styles.footerCount}>
                {displayCards.length} Card{displayCards.length === 1 ? '' : 's'}
              </span>
              <span className={styles.footerShowing}>
                Showing {pageItems.length} of {displayCards.length} results
              </span>
              <div className={styles.pagination}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  &#8249; Previous
                </Button>
                <span className={styles.footerPage}>Page {currentPage} of {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Next &#8250;
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
      </div>
    </>
  )
}
