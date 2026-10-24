import { Coffee, Activity, Boxes, Cable, ChevronRight, Globe, Handshake, LayoutDashboard, LogOut, Moon, Network, Settings2, ShieldCheck, Sun } from 'lucide-react'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import brandMark from '../../../../icon.svg?inline'
import { Badge, Button } from './ui'
import { LOCALES, useLocale, t, type Locale } from '../i18n'
import type { Host, Page, Summary } from '../types'

const navigation = [
  { groupKey: 'workspaceGroup', items: [
    { id: 'overview', key: 'overview', icon: LayoutDashboard },
    { id: 'models', key: 'models', icon: Boxes },
    { id: 'usage', key: 'usage', icon: Activity },
  ] },
  { groupKey: 'channelsGroup', items: [
    { id: 'channels', key: 'channels', icon: Network },
    { id: 'eac', key: 'eac', icon: Handshake },
    { id: 'connection', key: 'connection', icon: Cable },
  ] },
  { groupKey: 'managementGroup', items: [{ id: 'settings', key: 'settings', icon: Settings2 }] },
  { groupKey: 'sponsorGroup', items: [{ id: 'sponsor', key: 'sponsor', icon: Coffee }] },
] as const

type Origin = { x: number; y: number }

function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
  const apply = (next: 'light' | 'dark') => {
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('ofm-theme', next) } catch { /* 存储不可用时仅本次会话生效 */ }
    setTheme(next)
  }
  const toggle = (origin?: Origin) => {
    const next = theme === 'dark' ? 'light' : 'dark'
    if (!origin || typeof document.startViewTransition !== 'function'
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { apply(next); return }
    const root = document.documentElement
    const radius = Math.hypot(Math.max(origin.x, window.innerWidth - origin.x), Math.max(origin.y, window.innerHeight - origin.y))
    root.style.setProperty('--theme-reveal-x', `${origin.x}px`)
    root.style.setProperty('--theme-reveal-y', `${origin.y}px`)
    root.style.setProperty('--theme-reveal-r', `${radius}px`)
    root.classList.add('theme-transitioning')
    const transition = document.startViewTransition(() => { flushSync(() => apply(next)) })
    const finish = () => {
      root.classList.remove('theme-transitioning')
      root.style.removeProperty('--theme-reveal-x')
      root.style.removeProperty('--theme-reveal-y')
      root.style.removeProperty('--theme-reveal-r')
    }
    transition.finished.then(finish, finish)
  }
  return { theme, toggle }
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const label = theme === 'dark' ? t('shell.theme.light') : t('shell.theme.dark')
  return <Button variant="ghost" className="theme-toggle" aria-label={label} title={label}
    onClick={event => { const rect = event.currentTarget.getBoundingClientRect(); toggle({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }) }}>
    <span className="theme-toggle-track" data-theme={theme}>
      <span className="theme-toggle-icon theme-toggle-sun" aria-hidden="true"><Sun size={16} /></span>
      <span className="theme-toggle-icon theme-toggle-moon" aria-hidden="true"><Moon size={16} /></span>
    </span>
  </Button>
}

export function LanguageSelect() {
  const [locale, setLocale] = useLocale()
  return <div className="language-select-wrapper" title={t('common.language')}>
    <Globe size={14} className="lang-icon" aria-hidden="true" />
    <select aria-label={t('common.language')} className="language-select" value={locale}
      onChange={e => setLocale(e.target.value as Locale)}>
      {LOCALES.map(opt => <option key={opt.id} value={opt.id}>{opt.flag} {opt.label}</option>)}
    </select>
  </div>
}

export const pageNames: Record<Page, string> = {
  overview: '概览', models: '模型清单', usage: '用量统计', channels: '免费账号渠道',
  eac: 'EAC 协付渠道', settings: '服务设置', connection: 'API 接入', sponsor: '来自赞助商的广告',
}

export function Sidebar({ page, summary, host }: { page: Page; summary?: Summary; host: Host }) {
  useLocale()
  return <>
    <a className="console-brand" href="/" aria-label="Our Free Model">
      <img className="console-mark" src={brandMark} alt="" width={34} height={36} />
      <span>{t('shell.brand')}<small>{t('shell.sub')}</small></span>
    </a>
    <div className="workspace-switch"><span className="workspace-avatar"><ShieldCheck size={17} /></span>
      <span>{t('shell.personalWorkspace')}<small>{t('shell.independentService')}</small></span><Badge>{t('shell.localhost')}</Badge>
    </div>
    <nav className="console-nav" aria-label="Navigation">{navigation.map(group => <div className="nav-group" key={group.groupKey}>
      <span className="nav-group-label">{t(`shell.nav.${group.groupKey}`)}</span>
      {group.items.map(item => <button key={item.id} id={item.id === 'sponsor' ? 'ofm-sponsor-menu-desktop' : undefined} className={`console-nav-item ${item.id === 'sponsor' ? 'ofm-sponsor-nav' : ''} ${page === item.id ? 'selected' : ''}`}
        aria-current={page === item.id ? 'page' : undefined} onClick={() => host.navigate(item.id)}>
        <span className="console-nav-indicator" aria-hidden="true" />
        <item.icon size={18} strokeWidth={1.7} /><span>{t(`shell.nav.${item.key}`)}</span>
        {item.id === 'models' && <span className="count-badge">{summary?.catalog.length ?? '—'}</span>}
      </button>)}
    </div>)}</nav>
    <div className="sidebar-support"><ShieldCheck size={17} /><div><strong>{t('shell.localStorage')}</strong><p>{t('shell.localOnly')}</p></div></div>
    <div className="console-sidebar-footer"><div><span className="status-dot" />{t('shell.online')}<small>v{summary?.version ?? '—'}</small></div>
      <LanguageSelect />
      <ThemeToggle /><Button variant="ghost" aria-label={t('shell.logout')} title={t('shell.logout')} onClick={() => { void host.logout().catch(host.error) }}><LogOut size={16} /></Button></div>
  </>
}

export function Topbar({ page, summary }: { page: Page; summary?: Summary }) {
  useLocale()
  const pageTitle = t(`shell.nav.${page}`) || pageNames[page]
  return <>
    <div className="console-breadcrumb"><span>{t('shell.workspace')}</span><ChevronRight size={14} /><strong key={page} className="console-breadcrumb-current">{pageTitle}</strong></div>
    <div className="console-topbar-actions">
      <LanguageSelect />
      <div className="console-topbar-status"><span className="status-dot" /><span>{summary?.settings.enabled === false ? t('shell.paused') : t('shell.active')}</span><span className="topbar-divider" /><span>LOCAL</span></div>
    </div>
  </>
}
