import { useEffect, useRef, useState } from 'react'
import { Activity, ArrowDownToLine, ArrowUpFromLine, ChevronLeft, ChevronRight, CircleAlert, Layers3, RefreshCw, Search, RotateCcw, X } from 'lucide-react'
import { Badge, Button, Card, Input } from './components/ui'
import { usageDays, usageModels } from './usage-data.mjs'
import { t, useLocale } from './i18n'
import type { Host, Stats, UsageModel } from './types'
import './usage.css'

export function Usage({ stats, host, active }: { stats: Stats; host: Host; active: boolean }) {
  const [locale] = useLocale()
  const [period, setPeriod] = useState(14)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('calls')
  const [page, setPage] = useState(1)
  const [refreshing, setRefreshing] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const generation = useRef(0)
  const refreshingRef = useRef(false)
  const activeRef = useRef(active)
  activeRef.current = active

  const number = (value: number) => new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : locale).format(value)
  const compact = (value: number) => value >= 1e6 ? `${Number((value / 1e6).toFixed(1))}M`
    : value >= 1e3 ? `${Number((value / 1e3).toFixed(1))}K` : number(value)
  const measured = (value?: number | null) => value != null && Number.isFinite(value) ? number(value) : '—'

  useEffect(() => {
    if (!active) {
      generation.current++
      refreshingRef.current = false
      setRefreshing(false); setMessage(''); setError('')
    }
    return () => { generation.current++ }
  }, [active])
  const days: { day: string; total: number }[] = usageDays(stats.days, period)
  const windowTotal = days.reduce((sum, day) => sum + day.total, 0)
  const max = Math.max(1, ...days.map(day => day.total))
  const models: { total: number; pages: number; page: number; rows: UsageModel[] } = usageModels(stats.models, { search, sort, page })
  useEffect(() => { if (page !== models.page) setPage(models.page) }, [page, models.page])
  const hasHistory = stats.requests > 0 || stats.turns > 0 || stats.models.length > 0 || stats.days.length > 0
  const metrics = [
    { name: t('usage.metric.turns'), value: stats.turns, detail: t('usage.metric.turnsSub'), icon: Layers3 },
    { name: t('usage.metric.requests'), value: stats.requests, detail: t('usage.metric.requestsSub'), icon: Activity },
    { name: t('usage.metric.input'), value: stats.grand.input, detail: t('usage.metric.inputSub'), icon: ArrowDownToLine },
    { name: t('usage.metric.output'), value: stats.grand.output, detail: t('usage.metric.outputSub'), icon: ArrowUpFromLine },
    { name: t('usage.metric.failed'), value: stats.failedTurns, detail: t('usage.metric.failedSub'), icon: CircleAlert },
    { name: t('usage.metric.recovered'), value: stats.recoveredTurns, detail: t('usage.metric.recoveredSub'), icon: RotateCcw },
  ]
  const refresh = async () => {
    if (refreshingRef.current || !activeRef.current) return
    const started = ++generation.current
    const isCurrent = () => started === generation.current && activeRef.current
    refreshingRef.current = true
    setRefreshing(true); setMessage(''); setError('')
    try {
      await host.refresh()
      if (isCurrent()) setMessage(t('usage.updated'))
    } catch (reason) {
      if (isCurrent()) setError(reason instanceof Error ? reason.name === 'TimeoutError' ? t('login.timeout')
        : reason instanceof TypeError && /fetch/i.test(reason.message) ? t('login.failed')
        : reason.message : t('login.failed'))
    } finally {
      if (isCurrent()) { refreshingRef.current = false; setRefreshing(false) }
    }
  }
  if (!active) return null
  return <div className="usage-browser" data-testid="usage-ready">
    <header className="dashboard-heading"><div><div className="heading-eyebrow">{t('usage.eyebrow')}</div>
      <h1>{t('usage.heading')}</h1><p>{t('usage.sub')}</p></div>
      <Button variant="outline" disabled={refreshing} onClick={() => { void refresh() }}>
        <RefreshCw size={15} className={refreshing ? 'spinning' : ''} />{refreshing ? t('usage.refreshing') : t('usage.refresh')}
      </Button>
    </header>
    {message && <p className="usage-feedback" role="status">{message}</p>}
    {error && <div className="channel-error" role="alert"><CircleAlert size={16} /><span>{error}</span>
      <Button variant="ghost" aria-label={t('common.close')} onClick={() => setError('')}><X size={15} /></Button></div>}
    <div className="usage-metrics">{metrics.map(metric => <Card className="dashboard-metric ov-metric" key={metric.name}>
      <div><span>{metric.name}</span><div className="ov-metric-icon"><metric.icon size={17} /></div></div>
      <strong title={number(metric.value)} data-metric={metric.name}>{metric.name.includes('Token') ? compact(metric.value) : number(metric.value)}</strong><p>{metric.detail}</p>
    </Card>)}</div>
    <div className="usage-scope"><span>{t('usage.scopeNote')}</span>
      <span>{t('usage.requestFailures')} <strong data-testid="usage-request-failures">{number(stats.requestFailures)}</strong></span>
      <span>{t('usage.reasoningTokens')} <strong>{number(stats.grand.reasoning)}</strong></span></div>
    {(stats.logicalEstimated || stats.requestFailuresEstimated) && <p className="usage-estimated" role="note">
      <CircleAlert size={15} /><span>{t('usage.estimated')}</span></p>}
    <Card className="usage-trend">
      <div className="card-heading"><div><h2>{t('usage.trendHeading')}</h2><p>{t('usage.trendSub', { n: period })}</p></div>
        <div className="channel-filters" role="group" aria-label="range">{[7, 14, 30].map(count =>
          <button key={count} aria-pressed={period === count} onClick={() => setPeriod(count)}>{t('usage.daysUnit', { n: count })}</button>)}</div>
      </div>
      <div className="usage-window-total"><strong data-testid="usage-window-total">{number(windowTotal)}</strong><span>{t('usage.windowTotal')}</span></div>
      <p className="usage-scroll-hint">{t('usage.scrollHint')}</p>
      <div className="usage-trend-scroll"><div className="usage-trend-chart" style={{ minWidth: period * 35 }}
        role="img" aria-label={`Tokens: ${days.map(day => `${day.day} ${number(day.total)}`).join('; ')}`}>
        {days.map(day => <div className="usage-day" key={day.day} tabIndex={0} title={`${day.day} · ${number(day.total)} Token`}
          aria-label={`${day.day}: ${number(day.total)} Token`}>
          <div className="usage-day-track"><div className={`usage-day-bar ${day.total ? '' : 'zero'}`} style={{ height: `${Math.max(1, day.total / max * 100)}%` }} /></div>
          <span>{day.day.slice(5).replace('-', '/')}</span>
        </div>)}
      </div></div>
      {windowTotal === 0 && <p className="usage-window-empty" role="status">{t('usage.emptyTrend')}</p>}
      <div className="card-foot"><span>{days[0].day} — {days[days.length - 1].day}</span><span>{t('usage.footnote')}</span></div>
    </Card>
    <Card className="usage-model-panel">
      <div className="card-heading"><div><h2>{t('usage.modelPanel')}</h2><p>{t('usage.modelPanelSub')}</p></div>
        <Badge>{number(stats.models.length)} {t('models.empty', { count: stats.models.length }).replace('0', '')}</Badge></div>
      <div className="usage-model-filters"><div className="usage-model-search"><Search size={16} />
        <Input type="search" aria-label={t('usage.searchModel')} placeholder={t('usage.searchModel')} value={search}
          onChange={event => { setSearch(event.target.value); setPage(1) }} /></div>
        <select aria-label="Sort" value={sort} onChange={event => { setSort(event.target.value); setPage(1) }}>
          <option value="calls">{t('usage.sortCalls')}</option><option value="tokens">{t('usage.sortTokens')}</option>
          <option value="failedTurns">{t('usage.sortFailures')}</option><option value="name">{t('usage.sortName')}</option>
        </select>
        {search && <Button variant="ghost" onClick={() => { setSearch(''); setPage(1) }}><X size={14} />{t('usage.clear')}</Button>}
      </div>
      {models.total ? <><p className="usage-scroll-hint">{t('usage.scrollHint')}</p>
      <div className="usage-model-scroll" tabIndex={0} role="region" aria-label="model usage table">
        <table className="usage-model-table"><thead><tr>
          <th scope="col">{t('usage.thModel')}</th><th scope="col">{t('usage.thTurns')}</th><th scope="col">{t('usage.thCalls')}</th><th scope="col">{t('usage.thInput')}</th>
          <th scope="col">{t('usage.thOutput')}</th><th scope="col">{t('usage.thFailed')}</th><th scope="col">{t('usage.thRecovered')}</th><th scope="col">{t('usage.thTtft')}</th><th scope="col">{t('usage.thTps')}</th>
        </tr></thead><tbody>{models.rows.map(model => <tr key={model.model} data-usage-model={model.model}>
          <td><strong>{model.name}</strong><code>{model.model}</code></td><td>{number(model.turns)}</td>
          <td>{number(model.calls)}<small>{t('usage.thFailed')} {number(model.failed)}</small></td>
          <td>{number(model.input)}</td><td>{number(model.output)}</td><td>{number(model.failedTurns)}</td>
          <td>{number(model.recoveredTurns)}</td><td>{measured(model.avgTtftMs)}<small>ms</small></td><td>{measured(model.tps)}<small>Token/s</small></td>
        </tr>)}</tbody></table>
      </div></> : <div className="usage-empty"><Activity size={25} /><h3>{t('usage.emptyModels')}</h3>
        <p>{t('usage.emptyModelsSub')}</p></div>}
      <div className="usage-pagination"><span data-testid="usage-model-count">{t('usage.pagination', { current: number(models.total), total: number(stats.models.length) })}</span>
        <span>{t('usage.pageOf', { p: models.page, pages: models.pages })}</span><Button variant="outline" aria-label={t('usage.prev')} disabled={models.page === 1}
          onClick={() => setPage(models.page - 1)}><ChevronLeft size={15} />{t('usage.prev')}</Button>
        <Button variant="outline" aria-label={t('usage.next')} disabled={models.page === models.pages}
          onClick={() => setPage(models.page + 1)}>{t('usage.next')}<ChevronRight size={15} /></Button></div>
    </Card>
    <p className="footnote">{t('usage.footnote')}</p>
  </div>
}
