import { useState, useRef, useEffect, useCallback } from 'react'
import Button from '../ui/Button'
import TransactionDrawer, { type Transaction } from '../treasury/TransactionDrawer'
import { useBusiness } from '../../context/BusinessContext'
import { useToast } from '../../context/ToastContext'
import {
  ASSISTANT_BREAKDOWN_OPTIONS,
  assistantApi,
  transactionsApi,
  webhooksApi,
  type AssistantActionButton,
  type AssistantBreakdownPeriod,
  type AssistantList,
  type AssistantListAction,
} from '../../lib/api'
import { mapApiTransaction } from '../../lib/mapTransaction'
import styles from './ChatPanel.module.css'

type Props = {
  onOpenTransfer?: () => void
}

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const ThumbUpIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
  </svg>
)

const ThumbDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
    <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
  </svg>
)

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)

type Message = {
  id: number
  role: 'user' | 'ai'
  text: string
  list?: AssistantList
  actions?: AssistantActionButton[]
}

const suggestions = [
  "What's my balance?",
  'Show recent transfers',
  'How do I top up?',
  'Payment methods',
]

const WELCOME_MESSAGE =
  "Hi! I'm Nyra AI. Ask me anything about your wallet — balances, transactions, payments and more."

let idCounter = 1

function dailyBreakdownKey(businessId: string) {
  return `nyra_daily_breakdown_${businessId}_${new Date().toISOString().slice(0, 10)}`
}

function listPlainText(list: AssistantList): string {
  const parts: string[] = []
  if (list.intro) parts.push(list.intro)
  for (const item of list.items) {
    parts.push(`${item.label}${item.description ? ` ${item.description}` : ''}`)
  }
  if (list.outro) parts.push(list.outro)
  return parts.join('\n')
}

function AiMessage({
  text,
  list,
  actions,
  onAction,
  onActionButton,
  disabled,
}: {
  text: string
  list?: AssistantList
  actions?: AssistantActionButton[]
  onAction: (action: AssistantListAction) => void
  onActionButton: (button: AssistantActionButton) => void
  disabled?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState<'up' | 'down' | null>(null)
  const copySource = list ? listPlainText(list) : text

  function copy() {
    navigator.clipboard.writeText(copySource)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={styles.aiMessage}>
      {list ? (
        <>
          {list.intro && <p className={styles.aiText}>{list.intro}</p>}
          <ul className={styles.aiOptionList}>
            {list.items.map((item, index) => (
              <li key={`${item.label}-${index}`}>
                {item.action ? (
                  <button
                    type="button"
                    className={styles.aiOptionClickable}
                    onClick={() => onAction(item.action!)}
                    disabled={disabled}
                  >
                    <span className={styles.aiOptionLabel}>{item.label}</span>
                    {item.description && (
                      <span className={styles.aiOptionDesc}>{item.description}</span>
                    )}
                  </button>
                ) : (
                  <div className={styles.aiListItem}>
                    <span className={styles.aiOptionLabel}>{item.label}</span>
                    {item.description && (
                      <span className={styles.aiOptionDesc}>{item.description}</span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
          {list.outro && <p className={styles.aiText}>{list.outro}</p>}
        </>
      ) : (
        text && <p className={styles.aiText}>{text}</p>
      )}
      {actions && actions.length > 0 && (
        <div className={styles.aiActionButtons}>
          {actions.map((btn) => (
            <button
              key={btn.label}
              type="button"
              className={styles.aiActionPill}
              onClick={() => onActionButton(btn)}
              disabled={disabled}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}
      <div className={styles.aiActions}>
        <Button
          variant="icon"
          className={`${styles.aiActionBtn} ${liked === 'up' ? styles.aiActionActive : ''}`}
          onClick={() => setLiked(v => v === 'up' ? null : 'up')}
          title="Helpful"
        >
          <ThumbUpIcon />
        </Button>
        <Button
          variant="icon"
          className={`${styles.aiActionBtn} ${liked === 'down' ? styles.aiActionActive : ''}`}
          onClick={() => setLiked(v => v === 'down' ? null : 'down')}
          title="Not helpful"
        >
          <ThumbDownIcon />
        </Button>
        <Button
          variant="icon"
          className={`${styles.aiActionBtn} ${copied ? styles.aiActionActive : ''}`}
          onClick={copy}
          title="Copy"
        >
          <CopyIcon />
        </Button>
      </div>
    </div>
  )
}

function toApiHistory(messages: Message[]) {
  return messages.map((m) => ({
    role: m.role === 'ai' ? 'assistant' as const : 'user' as const,
    content: m.list ? listPlainText(m.list) : m.text,
  }))
}

export default function ChatPanel({ onOpenTransfer }: Props) {
  const { businessId } = useBusiness()
  const { showToast } = useToast()
  const [messages, setMessages] = useState<Message[]>([
    { id: idCounter, role: 'ai', text: WELCOME_MESSAGE },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [breakdownMenuOpen, setBreakdownMenuOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const breakdownMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    if (!breakdownMenuOpen) return
    function onDocClick(e: MouseEvent) {
      if (breakdownMenuRef.current && !breakdownMenuRef.current.contains(e.target as Node)) {
        setBreakdownMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [breakdownMenuOpen])

  const appendAiReply = useCallback((reply: {
    message: string
    list?: AssistantList
    actions?: AssistantActionButton[]
  }) => {
    setMessages((prev) => [
      ...prev,
      {
        id: ++idCounter,
        role: 'ai',
        text: reply.message,
        list: reply.list,
        actions: reply.actions,
      },
    ])
  }, [])

  const requestBreakdown = useCallback(async (
    period: AssistantBreakdownPeriod,
    options?: { silent?: boolean; periodLabel?: string },
  ) => {
    if (!businessId || typing) return
    setBreakdownMenuOpen(false)
    setTyping(true)

    try {
      const reply = await assistantApi.breakdown(businessId, period)
      if (!options?.silent) {
        const label = options?.periodLabel ?? ASSISTANT_BREAKDOWN_OPTIONS.find(o => o.value === period)?.label ?? period
        setMessages((prev) => [
          ...prev,
          { id: ++idCounter, role: 'user', text: `Show activity breakdown for ${label}` },
        ])
      }
      appendAiReply(reply)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load breakdown.'
      showToast(message, 'error')
    } finally {
      setTyping(false)
    }
  }, [appendAiReply, businessId, showToast, typing])

  useEffect(() => {
    if (!businessId) return
    const key = dailyBreakdownKey(businessId)
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    void requestBreakdown('24h', { silent: true })
  }, [businessId, requestBreakdown])

  function startNewChat() {
    idCounter += 1
    setMessages([{ id: idCounter, role: 'ai', text: WELCOME_MESSAGE }])
    setInput('')
    setTyping(false)
    setBreakdownMenuOpen(false)
  }

  async function handleListAction(action: AssistantListAction) {
    if (action.type === 'open_transaction') {
      try {
        const apiTx = await transactionsApi.get(action.transactionId)
        setSelectedTx(mapApiTransaction(apiTx))
      } catch {
        showToast('Could not load transaction details.', 'error')
      }
      return
    }

    if (action.type === 'open_customer') {
      window.location.href = `/app/customers/${action.customerId}`
      return
    }

    if (action.type === 'navigate') {
      window.location.href = action.path
      return
    }

    if (action.type === 'open_transfer') {
      onOpenTransfer?.()
      return
    }

    if (action.type === 'retry_webhook' && businessId) {
      try {
        await webhooksApi.replayDelivery(businessId, action.deliveryId)
        showToast('Webhook retry sent.')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Webhook retry failed.'
        showToast(message, 'error')
      }
    }
  }

  function handleActionButton(button: AssistantActionButton) {
    void handleListAction(button.action)
  }

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || typing || !businessId) return

    const userMsg: Message = { id: ++idCounter, role: 'user', text: trimmed }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setTyping(true)

    try {
      const reply = await assistantApi.chat(businessId, toApiHistory(nextMessages))
      appendAiReply(reply)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nyra AI could not respond. Try again.'
      showToast(message, 'error')
    } finally {
      setTyping(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const canSend = Boolean(input.trim()) && !typing && Boolean(businessId)

  return (
    <>
      <div className={styles.panel}>
        <div className={styles.header}>
          <Button
            variant="icon"
            className={styles.headerEditBtn}
            title="New chat"
            onClick={startNewChat}
            disabled={typing}
          >
            <EditIcon />
          </Button>
          <span className={styles.headerTitle}>New Conversation</span>
          <div className={styles.headerRight} ref={breakdownMenuRef}>
            <button
              type="button"
              className={styles.breakdownBtn}
              onClick={() => setBreakdownMenuOpen(v => !v)}
              disabled={typing || !businessId}
            >
              Get Breakdown
            </button>
            {breakdownMenuOpen && (
              <div className={styles.breakdownMenu}>
                <p className={styles.breakdownMenuTitle}>Choose duration</p>
                {ASSISTANT_BREAKDOWN_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={styles.breakdownMenuItem}
                    onClick={() => void requestBreakdown(opt.value, { periodLabel: opt.label })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.messages}>
          {messages.map(msg => (
            msg.role === 'user' ? (
              <div key={msg.id} className={styles.userBubbleRow}>
                <div className={styles.userBubble}>{msg.text}</div>
              </div>
            ) : (
              <AiMessage
                key={msg.id}
                text={msg.text}
                list={msg.list}
                actions={msg.actions}
                onAction={handleListAction}
                onActionButton={handleActionButton}
                disabled={typing}
              />
            )
          ))}
          {typing && (
            <div className={styles.aiMessage}>
              <div className={styles.typingDots}>
                <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className={styles.suggestions}>
          {suggestions.map(s => (
            <button key={s} type="button" className={styles.suggestion} onClick={() => send(s)} disabled={typing}>
              {s}
            </button>
          ))}
        </div>

        <div className={styles.inputRow}>
          <input
            className={styles.input}
            placeholder="Ask Nyra AI..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={typing}
          />
          <Button
            variant="icon"
            className={`${styles.sendBtn} ${canSend ? styles.sendBtnActive : ''}`}
            onClick={() => send(input)}
            disabled={!canSend}
          >
            <SendIcon />
          </Button>
        </div>
      </div>

      <TransactionDrawer tx={selectedTx} onClose={() => setSelectedTx(null)} />
    </>
  )
}
