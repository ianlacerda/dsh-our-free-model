import { useEffect, useRef, useState } from 'react'
import { providers } from 'ofm-provider-list'
import { Activity, ArrowRight, ArrowUpRight, Boxes, Check, CircleCheck, Copy, Handshake, Layers3, Network, RefreshCw, Terminal, Zap } from 'lucide-react'
import { Badge, Button, Card } from './ui'
import { t, useLocale } from '../i18n'
import '../usage.css'
import type { Host, Snapshot } from '../types'

export function Overview({ summary, stats, host }: Snapshot & { host: Host }) {
  const [locale] = useLocale()
  const [refreshing, setRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const number = (value: number) => new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : locale).format(value)
  const compact = (value: number) => value >= 1e6 ? `${(value / 1e6).toFixed(1)}M` : value >= 1e3 ? `${(value / 1e3).toFixed(1)}K` : number(value)

  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current) }, [])

  const metricRows = [
    { name: t('ov.metric.models'), value: number(summary.catalog.filter(model => model.routable).length), icon: Boxes, detail: t('ov.metric.modelsSub') },
    { name: t('ov.metric.turns'), value: number(stats.turns), icon: Layers3, detail: t('ov.metric.turnsSub', { n: number(stats.requests) }) },
    { name: t('ov.metric.tokens'), value: compact(stats.grand.input + stats.grand.output), icon: Zap, detail: t('ov.metric.tokensSub', { in: compact(stats.grand.input), out: compact(stats.grand.output) }) },
    { name: t('ov.metric.recovered'), value: number(stats.recoveredTurns), icon: Activity, detail: t('ov.metric.recoveredSub', { n: number(stats.failedTurns) }) },
  ]
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, index) => {
    const at = new Date(today); at.setDate(at.getDate() - 6 + index)
    const id = `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, '0')}-${String(at.getDate()).padStart(2, '0')}`
    return { id, value: stats.days.find(row => row.day === id)?.total ?? 0 }
  })
  const total = days.reduce((sum, row) => sum + row.value, 0)
  const max = Math.max(1, ...days.map(row => row.value))
  const failures = [...stats.samples].reverse().filter(row => row.ok === false).slice(0, 4)
  const sources = [
    { name: t('ov.sources.anon'), sub: t('ov.sources.anonSub'), icon: Zap, count: summary.catalog.filter(row => row.channel === 'anonymous' || row.channel === 'kilo').length, page: 'models' as const },
    { name: t('ov.sources.channels'), sub: t('ov.sources.channelsSub', { n: providers.length }), icon: Network, count: summary.catalog.filter(row => !['anonymous', 'kilo', 'eac'].includes(row.channel)).length, page: 'channels' as const },
    { name: t('ov.sources.eac'), sub: summary.eacAuth?.local ? t('ov.sources.eacSaved') : t('ov.sources.eacNotSaved'), icon: Handshake, count: summary.catalog.filter(row => row.channel === 'eac').length, page: 'eac' as const },
  ]

  const copyEndpoint = () => {
    void host.copy(`${summary.baseUrl}/v1`).then(() => {
      setCopied(true)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 2000)
    }).catch(host.error)
  }

  return <div className="dashboard" data-testid="overview-ready">
    <header className="dashboard-heading"><div><div className="heading-eyebrow">{t('ov.eyebrow')}</div><h1>{t('ov.heading')}</h1><p>{t('ov.sub')}</p></div>
      <Button variant="outline" disabled={refreshing} onClick={() => {
        setRefreshing(true); void host.refresh().catch(host.error).finally(() => setRefreshing(false))
      }}><RefreshCw size={15} className={refreshing ? 'spinning' : ''} />{refreshing ? t('ov.refreshing') : t('ov.refresh')}</Button></header>

    <div className="dashboard-metrics">{metricRows.map(metric => <Card className="dashboard-metric ov-metric" key={metric.name}>
      <div><span>{metric.name}</span><div className="ov-metric-icon"><metric.icon size={17} /></div></div>
      <strong>{metric.value}</strong><p>{metric.detail}</p>
    </Card>)}</div>

    <div className="dashboard-main-grid">
      <Card className="usage-panel ov-chart-panel">
        <div className="card-heading"><div><h2>{t('ov.chart.heading')}</h2><p>{t('ov.chart.sub')}</p></div><Badge>{t('ov.chart.badge')}</Badge></div>
        <div className="usage-total ov-chart-total">{compact(total)} <span>Token</span></div>
        <div className="dashboard-chart ov-chart" role="img" aria-label={`Token usage: ${days.map(day => `${day.id} ${day.value}`).join('; ')}`}>
          <div className="chart-grid-lines"><span /><span /><span /><span /></div>
          {days.map(day => <div className="dashboard-chart-column ov-chart-col" key={day.id} title={`${day.id} · ${number(day.value)} Token`}>
            <div className={`dashboard-chart-bar ${day.value === 0 ? 'zero' : ''}`} style={{ height: `${Math.max(2, day.value / max * 80)}%` }} />
            <span>{day.id.slice(5).replace('-', '/')}</span>
          </div>)}
          {total === 0 && <div className="chart-empty ov-chart-empty"><Activity size={22} /><span>{t('ov.chart.empty')}</span><small>{t('ov.chart.emptySub')}</small></div>}
        </div>
        <div className="card-foot"><span>{t('ov.chart.recordedBy')}</span><button onClick={() => host.navigate('usage')}>{t('ov.chart.viewAll')} <ArrowRight size={14} /></button></div>
      </Card>

      <Card className="quick-connect ov-quick">
        <div className="quick-icon ov-quick-icon"><Terminal size={20} /></div>
        <h2>{t('ov.quick.heading')}</h2><p>{t('ov.quick.sub')}</p>
        <label>{t('ov.quick.baseUrl')}</label>
        <div className="quick-endpoint ov-endpoint"><code>{summary.baseUrl}/v1</code>
          <Button variant="ghost" aria-label={t('ov.quick.baseUrl')} onClick={copyEndpoint} title={t('ov.quick.baseUrl')}
            className={copied ? 'ov-copied' : ''}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </Button>
        </div>
        {copied && <span className="copy-feedback" role="status">{t('ov.quick.copied')}</span>}
        <div className="connect-steps"><span>{t('ov.quick.stepSession')}</span><span>{t('ov.quick.stepAuth')}</span><span>{t('ov.quick.stepScope')}</span></div>
        <Button className="connect-button" onClick={() => host.navigate('connection')}>{t('ov.quick.viewConfig')} <ArrowUpRight size={16} /></Button>
        <div className="connection-footnote"><span className={`status-dot ${summary.settings.enabled ? '' : 'paused'}`} />{summary.settings.enabled ? t('ov.quick.enabled') : t('ov.quick.paused')}</div>
      </Card>
    </div>

    <div className="dashboard-bottom-grid">
      <Card className="ov-sources">
        <div className="card-heading"><div><h2>{t('ov.sources.heading')}</h2><p>{t('ov.sources.sub')}</p></div><Network size={18} /></div>
        <div className="source-list ov-source-list">{sources.map((source, index) => <button className="source-row ov-source-row" key={source.name} onClick={() => host.navigate(source.page)}
          style={{ animationDelay: `${index * 60}ms` }}>
          <span className="source-icon"><source.icon size={18} /></span>
          <span><strong>{source.name}</strong><small>{source.sub}</small></span>
          <Badge>{t('ov.sources.models', { n: source.count })}</Badge><ArrowRight size={14} />
        </button>)}</div>
      </Card>

      <Card className="ov-failures">
        <div className="card-heading"><div><h2>{t('ov.health.heading')}</h2><p>{t('ov.health.sub')}</p></div>
          <Badge tone={failures.length ? 'warning' : 'success'}>{failures.length ? t('ov.health.hasFailures') : t('ov.health.noFailures')}</Badge></div>
        <div className="runtime-check"><CircleCheck size={17} /><span>{t('ov.health.channelModule')}</span><strong>{summary.channels.state === 'ready' ? t('ov.health.channelReady') : summary.channels.state === 'failed' ? t('ov.health.channelFailed') : t('ov.health.channelInit')}</strong></div>
        <div className="runtime-check"><RefreshCw size={17} /><span>{t('ov.health.autoRefresh')}</span><strong>{summary.automaticRefresh ? t('ov.health.everyMinutes', { m: summary.settings.probeIntervalMinutes }) : t('ov.health.refreshPaused')}</strong></div>
        {failures.length ? <div className="failure-list ov-failure-list">{failures.map((row, index) =>
          <div key={`${row.at}-${index}`} className="ov-failure-row">
            <span>{row.model ?? t('ov.health.unknownModel')}</span>
            <small>{row.at ? new Date(row.at).toLocaleTimeString(locale === 'zh' ? 'zh-CN' : locale) : t('ov.health.unknownTime')} · {t('ov.health.turnIncomplete')}</small>
          </div>)}</div>
          : <div className="runtime-empty ov-runtime-empty"><CircleCheck size={18} /><span>{t('ov.health.emptyFailures')}</span></div>}
        <div className="card-foot"><span title={summary.dataDir}>{t('ov.health.storageNote')}</span><button onClick={() => host.navigate('settings')}>{t('ov.health.settingsBtn')} <ArrowRight size={14} /></button></div>
      </Card>
    </div>
  </div>
}
