import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CircleAlert, Network, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { providers } from 'ofm-provider-list'
import { shared } from 'ofm-shared-client'
import { Badge, Button, Card, Input } from './ui'
import { t, useLocale } from '../i18n'
import type { Summary } from '../types'

interface Status { closed?: boolean; accounts?: { total: number; enabled: number }; models?: { total: number; disabled: number } }
type Rpc = (method: string, payload?: object) => Promise<any>

export function ChannelBrowser({ rpc, summary }: { rpc: Rpc; summary: Summary & { reload?(): void } }) {
  const [locale] = useLocale()
  const tShared = Object.assign((key: string) => {
    const custom = t(key)
    if (custom && custom !== key) return custom
    const dict = locale === 'zh' ? shared.DICT.zh : (shared.DICT[locale] ?? shared.DICT.en ?? shared.DICT.zh)
    return dict?.[key] ?? shared.DICT.zh[key] ?? key
  }, { locale: locale === 'zh' ? 'zh' : 'en' })

  const [statuses, setStatuses] = useState<Record<string, Status>>()
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, select] = useState<string>()
  const [auto, setAuto] = useState<{ enabled: boolean; running?: boolean; ranToday?: boolean }>()
  const [busy, setBusy] = useState(false)
  const mounted = useRef(false)
  const sequence = useRef(0)
  const detailHeading = useRef<HTMLHeadingElement>(null)
  const reload = useCallback(async () => {
    const started = ++sequence.current
    try {
      const value = await rpc('provider.status', { providers: providers.map(row => row.id) })
      if (!mounted.current || started !== sequence.current) return
      setStatuses(value.statuses ?? {})
      setError('')
    } catch (failure) {
      if (mounted.current && started === sequence.current) setError((failure as Error).message)
    }
  }, [rpc])
  useEffect(() => {
    mounted.current = true
    void reload()
    void rpc('usage.autoCheckin', {}).then(value => {
      if (mounted.current) setAuto(value.autoCheckin)
    }).catch(() => {})
    const timer = setInterval(() => { void reload() }, 45000)
    return () => { mounted.current = false; sequence.current++; clearInterval(timer) }
  }, [rpc, reload])
  useEffect(() => {
    if (selected) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      detailHeading.current?.focus({ preventScroll: true })
    }
  }, [selected])
  const onChanged = useCallback(() => {
    void reload()
    window.dispatchEvent(new CustomEvent('ofm:channels'))
    summary.reload?.()
  }, [reload, summary.reload])
  const onError = useCallback((_provider: unknown, failure: Error) => { if (mounted.current) setError(failure.message) }, [])
  const connected = providers.filter(provider => statuses?.[provider.id]?.accounts?.enabled && !statuses[provider.id].closed).length
  const accounts = Object.values(statuses ?? {}).reduce((sum, row) => sum + (row.accounts?.total ?? 0), 0)
  const selectedProvider = providers.find(row => row.id === selected)
  const rows = providers.filter(provider => {
    const status = statuses?.[provider.id]
    const isConnected = (status?.accounts?.enabled ?? 0) > 0 && !status?.closed
    return `${provider.name} ${provider.org}`.toLowerCase().includes(search.toLowerCase().trim())
      && (filter === 'all' || (status !== undefined && (filter === 'connected' ? isConnected : !isConnected)))
  })
  const counts: Record<string, number> = {
    all: providers.length,
    connected,
    pending: providers.filter(provider => {
      const status = statuses?.[provider.id]
      return status !== undefined && (status.closed || (status.accounts?.enabled ?? 0) <= 0)
    }).length,
  }
  return <>
    <div className="channel-summary-strip">
      <div className="ch-metric"><span className="ch-metric-icon"><Network size={16} /></span>
        <div className="ch-metric-body"><span className="ch-metric-label">{t('channels.connected')}</span>
          <strong className="ch-metric-value">{statuses ? connected : <span className="ch-skeleton" />}<small> / {providers.length}</small></strong></div></div>
      <div className="ch-metric"><span className="ch-metric-icon"><ShieldCheck size={16} /></span>
        <div className="ch-metric-body"><span className="ch-metric-label">{t('channels.accounts')}</span>
          <strong className="ch-metric-value">{statuses ? accounts : <span className="ch-skeleton" />}</strong></div></div>
      <div className="checkin-control"><span className="status-dot" /><span>{auto?.running ? t('channels.checkinRunning') : auto?.ranToday ? t('channels.checkinDone') : t('channels.autoCheckin')}</span>
        <button type="button" role="switch" aria-label={t('channels.autoCheckin')} aria-checked={auto?.enabled === true}
          className={`ui-switch ${auto?.enabled ? 'on' : ''}`} disabled={!auto || busy} onClick={() => {
            setBusy(true)
            void rpc('usage.autoCheckin', { enabled: !auto?.enabled }).then(value => { if (mounted.current) setAuto(value.autoCheckin) })
              .catch(failure => { if (mounted.current) setError(failure.message) }).finally(() => { if (mounted.current) setBusy(false) })
          }}><span /></button>
      </div>
    </div>
    {error && <div className="channel-error" role="alert"><CircleAlert size={16} /><span>{error}</span><Button variant="ghost" onClick={() => { void reload() }}>{t('ov.refresh')}</Button></div>}
    {selectedProvider ? <div className="provider-detail" data-testid="provider-detail">
      <div className="provider-detail-top"><Button variant="outline" onClick={() => select(undefined)}><ArrowLeft size={15} />{t('channels.back')}</Button>
        <span>{t('channels.storageNote')}</span></div>
      <div className="provider-detail-layout"><Card className="provider-detail-sidebar"><h2 tabIndex={-1} ref={detailHeading}>{t(`channels.providers.${selectedProvider.id}.name`) || selectedProvider.name}</h2><p>{t(`channels.providers.org.${selectedProvider.org}`) || selectedProvider.org}</p>
        <div className="detail-label">{t('channels.switchChannel')}</div>{providers.map(provider => <button className={`detail-provider-link ${provider.id === selected ? 'active' : ''}`} key={provider.id}
          onClick={() => select(provider.id)}><span>{t(`channels.providers.${provider.id}.name`) || provider.name}</span>{provider.id === selected && <Check size={14} />}</button>)}</Card>
        <div className="provider-detail-main"><div className="provider-detail-description"><h2>{t('channels.accountsAndModels')}</h2><p>{t('channels.accountsAndModelsSub')}</p></div>
          <shared.ChannelCard key={selectedProvider.id} channel={selectedProvider} status={statuses?.[selectedProvider.id]} rpc={rpc} t={tShared} onChanged={onChanged} onError={onError} />
          <div className="detail-security-note"><ShieldCheck size={16} />{t('channels.ruleNote')}</div>
        </div></div>
    </div> : <>
      <div className="channel-toolbar"><div className="channel-search"><Search size={17} /><Input aria-label={t('channels.search')} placeholder={t('channels.search')} value={search} onChange={event => setSearch(event.target.value)} /></div>
        <div className="channel-filters" aria-label={t('channels.connected')}>{[['all', t('channels.filterAll')], ['connected', t('channels.filterConnected')], ['pending', t('channels.filterPending')]].map(([id, label]) =>
          <button key={id} aria-pressed={filter === id} disabled={id !== 'all' && !statuses} onClick={() => setFilter(id)}>{label}<span>{id === 'all' || statuses ? counts[id] : '—'}</span></button>)}</div>
      </div>
      <div className="channel-results-meta"><span>{t('channels.countChannels', { n: rows.length })}</span><span><SlidersHorizontal size={13} />{t('channels.accountsAndModelsSub')}</span></div>
      <div className="provider-grid">{rows.map(provider => {
        const status = statuses?.[provider.id]
        const state = status === undefined ? t('channels.reading') : status.closed ? t('channels.closed') : (status.accounts?.enabled ?? 0) > 0 ? t('channels.filterConnected') : t('channels.filterPending')
        const isConn = state === t('channels.filterConnected')
        const name = t(`channels.providers.${provider.id}.name`) || provider.name
        const org = t(`channels.providers.org.${provider.org}`) || provider.org
        const note = t(`channels.providers.${provider.id}.note`) || provider.note
        return <Card className="provider-card" key={provider.id}>
          <div className="provider-card-top"><span className="provider-logo" style={{ color: provider.accent, backgroundColor: `${provider.accent}0d` }}>{name.slice(0, 2).toUpperCase()}</span>
            <Badge tone={isConn ? 'success' : 'neutral'}>{isConn && <span className="status-dot" />}{state}</Badge></div>
          <h2>{name}</h2><div className="provider-org">{org}</div><p className="provider-description">{note}</p>
          <div className="provider-counts"><span>{t('channels.accounts')} <strong>{status ? status.accounts?.total ?? 0 : '—'}</strong></span>
            <span>{t('usage.thModel')} <strong>{status ? Math.max(0, (status.models?.total ?? 0) - (status.models?.disabled ?? 0)) : '—'}</strong></span></div>
          <Button variant="outline" className="provider-manage" onClick={() => select(provider.id)}>{t('channels.manage')} <ArrowRight size={14} /></Button>
        </Card>
      })}</div>
      {rows.length === 0 && <Card className="channel-empty"><Search size={24} /><h2>{t('channels.empty')}</h2><p>{t('channels.emptySub')}</p><Button variant="outline" onClick={() => { setSearch(''); setFilter('all') }}>{t('channels.reset')}</Button></Card>}
    </>}
  </>
}
