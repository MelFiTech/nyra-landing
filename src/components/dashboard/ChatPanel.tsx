import { useState, useRef, useEffect } from 'react'
import Button from '../ui/Button'
import styles from './ChatPanel.module.css'

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

const TabsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="5" rx="1"/>
    <rect x="12" y="3" width="5" height="5" rx="1"/>
    <rect x="3" y="8" width="18" height="13" rx="1"/>
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
}

const suggestions = [
  "What's my balance?",
  'Show recent transfers',
  'How do I top up?',
  'Payment methods',
]

const aiReplies: Record<string, string> = {
  default: "I'm here to help with your wallet. Ask me about transactions, balances, or payments.",
  balance: 'Your NGN wallet currently shows ₦0.00 available balance. Fund your account via the Account Details button.',
  transfer: 'You have no recent transfers yet. Use the Transfer button to send money to others.',
  topup: 'To top up, click "Account Details" on the wallet card to get your dedicated bank account numbers.',
}

function getReply(text: string): string {
  const t = text.toLowerCase()
  if (t.includes('balance')) return aiReplies.balance
  if (t.includes('transfer') || t.includes('transaction')) return aiReplies.transfer
  if (t.includes('top') || t.includes('fund') || t.includes('deposit')) return aiReplies.topup
  return aiReplies.default
}

let idCounter = 3

function AiMessage({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState<'up' | 'down' | null>(null)

  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={styles.aiMessage}>
      <p className={styles.aiText}>{text}</p>
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

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'ai', text: "Hi! I'm Nyra AI. Ask me anything about your wallet — balances, transactions, payments and more." },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const userMsg: Message = { id: ++idCounter, role: 'user', text: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, { id: ++idCounter, role: 'ai', text: getReply(trimmed) }])
    }, 900)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <Button variant="icon" className={styles.headerIconBtn} title="Conversation history">
          <TabsIcon />
        </Button>
        <span className={styles.headerTitle}>New Conversation</span>
        <Button variant="icon" className={styles.headerEditBtn} title="New chat">
          <EditIcon />
        </Button>
      </div>

      <div className={styles.messages}>
        {messages.map(msg => (
          msg.role === 'user' ? (
            <div key={msg.id} className={styles.userBubbleRow}>
              <div className={styles.userBubble}>{msg.text}</div>
            </div>
          ) : (
            <AiMessage key={msg.id} text={msg.text} />
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

      {messages.length <= 1 && (
        <div className={styles.suggestions}>
          {suggestions.map(s => (
            <button key={s} className={styles.suggestion} onClick={() => send(s)}>{s}</button>
          ))}
        </div>
      )}

      <div className={styles.inputRow}>
        <input
          className={styles.input}
          placeholder="Ask Nyra AI..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <Button
          variant="icon"
          className={`${styles.sendBtn} ${input.trim() ? styles.sendBtnActive : ''}`}
          onClick={() => send(input)}
          disabled={!input.trim()}
        >
          <SendIcon />
        </Button>
      </div>
    </div>
  )
}
