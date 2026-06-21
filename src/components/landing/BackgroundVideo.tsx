import { useEffect, useRef, useState } from 'react'
import { LANDING_VIDEO_URL } from '../../lib/landingVideo'
import styles from './BackgroundVideo.module.css'

type Props = {
  className?: string
}

export default function BackgroundVideo({ className }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    video.defaultMuted = true
    video.muted = true
    video.playsInline = true
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', 'true')

    const reveal = () => setVisible(true)
    const tryPlay = () => {
      void video.play().catch(() => {})
    }

    video.addEventListener('playing', reveal, { once: true })
    video.addEventListener('canplay', tryPlay)
    video.addEventListener('loadeddata', tryPlay)
    tryPlay()

    return () => {
      video.removeEventListener('playing', reveal)
      video.removeEventListener('canplay', tryPlay)
      video.removeEventListener('loadeddata', tryPlay)
    }
  }, [])

  return (
    <video
      ref={ref}
      className={[styles.video, visible && styles.visible, className].filter(Boolean).join(' ')}
      src={LANDING_VIDEO_URL}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      tabIndex={-1}
      disablePictureInPicture
      disableRemotePlayback
      controlsList="nodownload nofullscreen noremoteplayback"
      aria-hidden
    />
  )
}
