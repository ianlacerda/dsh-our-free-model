import { useEffect, useRef, useState } from 'react'
import { ArrowDownToLine, Check, CircleAlert, RefreshCw, RotateCw, ShieldCheck } from 'lucide-react'
import { Badge, Button, Card } from './components/ui'
import { management } from './management'
import { t, useLocale } from './i18n'
import './settings.css'
import './desktop-update.css'

interface UpdateStatus {
  currentVersion: string
  supported: boolean
  phase: 'idle' | 'checking' | 'downloading' | 'ready' | 'error'
  latest: { version: string; notes: string; publishedAt: string | null; releaseURL: string; size: number } | null
  available: boolean
  checkedAt: number | null
  received: number
  total: number
  error: string
}
type NativeWindow = Window & { __TAURI__?: { core?: { invoke<T>(command: string): Promise<T> } } }
export const hasDesktopBridge = () => typeof window !== 'undefined' && typeof (window as NativeWindow).__TAURI__?.core?.invoke === 'function'
const bytes = (value: number) => `${(value / 1024 / 1024).toFixed(1)} MB`

export function DesktopUpdate() {
  useLocale()
  const [status, setStatus] = useState<UpdateStatus | null>(null)
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [installing, setInstalling] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const live = useRef(true)
  const busyRef = useRef(false)
  const native = hasDesktopBridge()
  useEffect(() => {
    live.current = true
    if (!native) return () => { live.current = false }
    let timer: ReturnType<typeof setTimeout>
    const poll = async () => {
      try {
        const value = await management<UpdateStatus>('/desktop-update')
        if (!live.current) return
        setStatus(value)
        setLoadError('')
        timer = setTimeout(() => { void poll() }, 1000)
      } catch (reason) { if (live.current) { setLoadError(reason instanceof Error ? reason.message : t('updates.error.status')); timer = setTimeout(() => { void poll() }, 5000) } }
    }
    void poll()
    return () => { live.current = false; clearTimeout(timer) }
  }, [native])
  const action = async (name: 'check' | 'download') => {
    if (busyRef.current) return
    busyRef.current = true; setRequesting(true); setError('')
    try { const value = await management<UpdateStatus>(`/desktop-update/${name}`, {}); if (live.current) setStatus(value) }
    catch (reason) { if (live.current) setError(reason instanceof Error ? reason.message : t('updates.error.request')) }
    finally { busyRef.current = false; if (live.current) setRequesting(false) }
  }
  const install = async () => {
    if (busyRef.current || status?.phase !== 'ready') return
    busyRef.current = true; setInstalling(true); setError('')
    try { await (window as NativeWindow).__TAURI__!.core!.invoke('install_desktop_update') }
    catch (reason) { if (live.current) { setError(String(reason)); setInstalling(false); busyRef.current = false } }
  }
  const busy = requesting || installing || status?.phase === 'checking' || status?.phase === 'downloading'
  const percentage = status?.total ? Math.min(100, Math.round(status.received / status.total * 100)) : 0
  return <div className="settings-browser desktop-update-browser" data-testid="desktop-update-ready">
    <header className="dashboard-heading"><div><div className="heading-eyebrow">MANAGEMENT / UPDATES</div>
      <h1>{t('updates.title')}</h1><p>{t('updates.desc')}</p></div>
      <Badge tone={status?.phase === 'ready' ? 'success' : 'neutral'}>{status?.phase === 'ready' ? t('updates.status.verifiedReady') : t('updates.status.desktopClient')}</Badge></header>
    <Card className="settings-card"><div className="settings-card-heading"><RefreshCw size={16} /><div><h2>{t('updates.card.title')}</h2><p>{t('updates.card.desc')}</p></div></div>
      <div className="desktop-update-versions"><div><small>{t('updates.version.current')}</small><strong>{status?.currentVersion ? `v${status.currentVersion}` : '—'}</strong></div>
        <div><small>{t('updates.version.latest')}</small><strong>{status?.latest ? `v${status.latest.version}` : t('updates.version.notChecked')}</strong></div>
        <div><small>{t('updates.version.lastChecked')}</small><span>{status?.checkedAt ? new Date(status.checkedAt).toLocaleString() : t('updates.version.never')}</span></div></div>
      {!native ? <p className="settings-note"><CircleAlert size={15} />{t('updates.note.browser')}</p>
        : status && !status.supported ? <p className="settings-note"><CircleAlert size={15} />{t('updates.note.unsupported')}</p>
          : <div className="desktop-update-actions"><Button variant="outline" busy={requesting || status?.phase === 'checking'} disabled={!!busy || !status} onClick={() => { void action('check') }}><RefreshCw size={15} />{t('updates.action.check')}</Button>
            {status?.available && status.phase !== 'ready' && <Button busy={status.phase === 'downloading'} disabled={!!busy} onClick={() => { void action('download') }}><ArrowDownToLine size={15} />{t('updates.action.download')}{status.latest ? ` · ${bytes(status.latest.size)}` : ''}</Button>}
            {status?.phase === 'ready' && <Button busy={installing} disabled={!!busy} onClick={() => { void install() }}><RotateCw size={15} />{t('updates.action.install')}</Button>}</div>}
      {status?.checkedAt && status.phase === 'idle' && !status.available && <p className="settings-note" role="status"><Check size={15} />{status.latest ? t('updates.note.upToDate') : t('updates.note.noPackage')}</p>}
      {status?.phase === 'downloading' && <div className="desktop-update-progress" role="status"><div><span>{t('updates.progress.downloading')}</span><span>{percentage}% · {bytes(status.received)} / {bytes(status.total)}</span></div><progress aria-label={t('updates.progress.aria')} max={100} value={percentage} /></div>}
      {status?.phase === 'ready' && <p className="settings-note" role="status"><ShieldCheck size={15} />{t('updates.note.ready')}</p>}
      {installing && <p className="settings-note" role="status"><RotateCw size={15} />{t('updates.note.installing')}</p>}
      {(error || loadError || status?.error) && <p className="settings-save-error" role="alert"><CircleAlert size={15} /><span>{error || loadError || status?.error}</span></p>}
    </Card>
    {status?.latest && <Card className="settings-card"><div className="settings-card-heading"><ArrowDownToLine size={16} /><div><h2>{t('updates.notes.title', { version: status.latest.version })}</h2><p>{status.latest.publishedAt ? new Date(status.latest.publishedAt).toLocaleDateString() : t('updates.notes.official')}</p></div></div>
      <div className="desktop-update-notes">{status.latest.notes || t('updates.notes.empty')}</div></Card>}
  </div>
}
