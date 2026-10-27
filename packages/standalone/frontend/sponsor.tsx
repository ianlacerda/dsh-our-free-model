import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { SPONSOR, SPONSOR_DAY_KEY, sponsorLocalDay, claimSponsorDay } from '../../../src/sponsor.js'
import image from '../../../docs/images/sponsor-beichen-examples.jpg?inline'
import '../../../src/sponsor.css'
import { useLocale, type Locale } from './i18n'

interface LocalizedSponsorCopy {
  title: string
  subtitle: string
  dialogSub: string
  introTitle: string
  introSub: string
  greeting: string
  paragraphs: string[]
  contact: string
  inviteLabel: string
  copyInvite: string
  copied: string
  copyFail: string
  signoff: string
  team: string
  evidenceTitle: string
  evidenceSub: string
  evidenceAlt: string
  endTitle: string
  visit: string
  visitSub: string
  closeAria: string
  closeTitle: string
  scrollAria: string
  footText: string
  footSub: string
  foldBtn: string
}

const SPONSOR_LOCALIZED: Record<string, LocalizedSponsorCopy> = {
  en: {
    title: 'Sponsor Advertisement',
    subtitle: 'Beichen API × OFM · You can read the full text at any time.',
    dialogSub: 'Beichen API × OFM · Shown once daily on first launch',
    introTitle: 'Keeping the free service running.',
    introSub: 'A note from the OFM team, and a sincere sponsorship invitation.',
    greeting: 'Dear friends and users:',
    paragraphs: [
      'To keep our servers running (super expensive for a few broke students...), we have to partner with sponsors for a small commission. We apologize for this—it is 100% to increase capacity and keep pools active. Thank you for your patience and understanding.',
      'Our goal is to provide free compute for learning. Responses might be slow during peak hours when many people use the service simultaneously. We are doing everything we can to improve speed.',
      'About the ads: ad revenue helps pay for server infrastructure through referral commissions. If you find it helpful, please consider using our invitation code.',
      'This is our partner relay service offering high-quality international LLM compute. If you want to test premium models, please consider registering through our link.',
      'If you need paid compute services, our partner provides excellent pricing and reliability. Our project will remain free and maintained for the community.',
      'Finally, thank you so much for your support, stars, and companionship. With this community backing, we will keep making OFM better and better.',
    ],
    contact: 'Registration link with our invitation code:',
    inviteLabel: 'Invite code: ',
    copyInvite: 'Copy Code',
    copied: 'Code copied',
    copyFail: 'Could not copy automatically; please copy manually.',
    signoff: 'Thank you for your understanding and support',
    team: 'OFM Team',
    evidenceTitle: 'Addendum: Image Generation Test',
    evidenceSub: 'Sample outputs provided by partner',
    evidenceAlt: 'Sample outputs demonstrating model image generation capabilities.',
    endTitle: 'Want to learn more?',
    visit: 'Visit Beichen API',
    visitSub: 'Sponsor website · includes invitation code',
    closeAria: 'Close notice',
    closeTitle: 'Close notice (Esc)',
    scrollAria: 'Full advertisement text, scrollable',
    footText: 'You can dismiss this at any time.',
    footSub: 'The full text remains accessible anytime from the sidebar menu.',
    foldBtn: 'Close to menu',
  },
  'pt-BR': {
    title: 'Anúncio do Patrocinador',
    subtitle: 'Beichen API × OFM · Leia a mensagem completa aqui.',
    dialogSub: 'Beichen API × OFM · Exibido uma vez ao dia na primeira abertura',
    introTitle: 'Mantendo o serviço gratuito ativo.',
    introSub: 'Uma nota da equipe OFM e um convite sincero de patrocínio.',
    greeting: 'Prezados amigos e usuários:',
    paragraphs: [
      'Para manter os servidores ativos (que são caros para nós, estudantes...), precisamos de parcerias e patrocínios para cobrir custos de infraestrutura e garantir estabilidade.',
      'Este projeto busca oferecer poder de computação gratuito para estudo e experimentação. Agradecemos a compreensão se houver lentidão decorrente de alta demanda simultânea.',
      'Sobre os anúncios: eles financiam a operação dos servidores através de comissões de uso. Se você puder, utilize nosso código de convite ao se cadastrar.',
      'Este é o serviço parceiro, fornecendo inferência para diversos modelos internacionais com estabilidade e qualidade garantidas.',
      'Se você precisar de poder computacional pago, considere usar nosso link parceiro para apoiar a manutenção deste projeto gratuito.',
      'Agradecemos sinceramente a todos que utilizam o projeto, deixam estrelas no GitHub e nos apoiam nesta jornada.',
    ],
    contact: 'Link de cadastro com nosso código de convite:',
    inviteLabel: 'Código de convite: ',
    copyInvite: 'Copiar Código',
    copied: 'Código copiado',
    copyFail: 'Não foi possível copiar automaticamente; selecione e copie manualmente.',
    signoff: 'Agradecemos sua compreensão e apoio',
    team: 'Equipe OFM',
    evidenceTitle: 'Anexo: Demonstração de Geração de Imagens',
    evidenceSub: 'Exemplos fornecidos pelo parceiro',
    evidenceAlt: 'Amostras de imagens geradas demonstrando a capacidade dos modelos.',
    endTitle: 'Quer saber mais?',
    visit: 'Acessar Beichen API',
    visitSub: 'Site do patrocinador · inclui código de convite',
    closeAria: 'Fechar aviso',
    closeTitle: 'Fechar aviso (Esc)',
    scrollAria: 'Texto completo do anúncio, rolável',
    footText: 'Você pode fechar a qualquer momento.',
    footSub: 'O texto continuará disponível no menu lateral.',
    foldBtn: 'Recolher',
  },
  es: {
    title: 'Anuncio del Patrocinador',
    subtitle: 'Beichen API × OFM · Puede leer el mensaje completo aquí.',
    dialogSub: 'Beichen API × OFM · Mostrado una vez al día en la primera apertura',
    introTitle: 'Manteniendo el servicio gratuito en funcionamiento.',
    introSub: 'Una nota del equipo OFM y una sincera invitación de patrocinio.',
    greeting: 'Estimados amigos y usuarios:',
    paragraphs: [
      'Para mantener los servidores en funcionamiento, necesitamos patrocinios para cubrir costos de infraestructura y garantizar estabilidad.',
      'Este proyecto tiene como objetivo ofrecer potencia de cálculo gratuita para el aprendizaje. Agradecemos su comprensión ante posibles demoras por alta demanda.',
      'Sobre los anuncios: financian la operación de servidores mediante comisiones por referidos. Si es posible, utilice nuestro código de invitación al registrarse.',
      'Este es el servicio asociado, que proporciona inferencia para múltiples modelos internacionales con calidad y estabilidad garantizadas.',
      'Si necesita potencia de cálculo de pago, considere usar nuestro enlace para apoyar el mantenimiento de este proyecto gratuito.',
      'Agradecemos de corazón a todos los que usan el proyecto, dejan estrellas en GitHub y nos acompañan.',
    ],
    contact: 'Enlace de registro con nuestro código de invitación:',
    inviteLabel: 'Código de invitación: ',
    copyInvite: 'Copiar Código',
    copied: 'Código copiado',
    copyFail: 'No se pudo copiar automáticamente; copie manualmente.',
    signoff: 'Gracias por su comprensión y apoyo',
    team: 'Equipo OFM',
    evidenceTitle: 'Anexo: Demostración de Generación de Imágenes',
    evidenceSub: 'Muestras proporcionadas por el socio',
    evidenceAlt: 'Muestra de imágenes generadas que demuestran la capacidad de los modelos.',
    endTitle: '¿Desea conocer más?',
    visit: 'Visitar Beichen API',
    visitSub: 'Sitio web del patrocinador · incluye código de invitación',
    closeAria: 'Cerrar anuncio',
    closeTitle: 'Cerrar anuncio (Esc)',
    scrollAria: 'Texto del anuncio, desplazable hacia abajo',
    footText: 'Puede cerrarlo en cualquier momento.',
    footSub: 'El texto completo permanecerá accesible en el menú lateral.',
    foldBtn: 'Cerrar',
  },
  fr: {
    title: 'Annonce du Sponsor',
    subtitle: 'Beichen API × OFM · Vous pouvez lire le message complet ici.',
    dialogSub: 'Beichen API × OFM · Affiché une fois par jour à la première ouverture',
    introTitle: 'Garder le service gratuit en fonctionnement.',
    introSub: 'Une note de l\'équipe OFM et une invitation sincère au sponsoring.',
    greeting: 'Chers amis et utilisateurs :',
    paragraphs: [
      'Pour maintenir les serveurs en service, nous devons nouer des partenariats pour couvrir les coûts d\'infrastructure et assurer la stabilité.',
      'Ce projet vise à offrir une puissance de calcul gratuite pour l\'apprentissage. Merci de votre compréhension en cas de forte affluence.',
      'À propos des annonces : elles financent l\'exploitation des serveurs grâce à des commissions. Si possible, utilisez notre code d\'invitation lors de votre inscription.',
      'Voici le service partenaire, fournissant l\'inférence pour de nombreux modèles internationaux avec une stabilité garantie.',
      'Si vous avez besoin de puissance de calcul payante, pensez à utiliser notre lien partenaire pour soutenir la maintenance du projet.',
      'Nous remercions sincèrement tous ceux qui utilisent le projet et nous soutiennent.',
    ],
    contact: 'Lien d\'inscription avec notre code d\'invitation :',
    inviteLabel: 'Code d\'invitation : ',
    copyInvite: 'Copier le code',
    copied: 'Code copié',
    copyFail: 'Impossible de copier automatiquement ; veuillez copier manuellement.',
    signoff: 'Merci pour votre compréhension et votre soutien',
    team: 'Équipe OFM',
    evidenceTitle: 'Annexe : Démonstration de Génération d\'Images',
    evidenceSub: 'Exemples fournis par le partenaire',
    evidenceAlt: 'Exemple d\'images générées démontrant la capacité des modèles.',
    endTitle: 'En savoir plus ?',
    visit: 'Visiter Beichen API',
    visitSub: 'Site du sponsor · inclut le code d\'invitation',
    closeAria: 'Fermer l\'annonce',
    closeTitle: 'Fermer l\'annonce (Esc)',
    scrollAria: 'Texte de l\'annonce, défilable',
    footText: 'Vous pouvez fermer à tout moment.',
    footSub: 'Le texte complet restera accessible dans le menu latéral.',
    foldBtn: 'Fermer',
  },
}

function getSponsorCopy(locale: Locale): LocalizedSponsorCopy | null {
  if (locale === 'zh') return null
  return SPONSOR_LOCALIZED[locale] || SPONSOR_LOCALIZED.en
}

const icon = (name: 'arrow' | 'close' | 'cup', size = 18) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'arrow' ? <path d="M7 17 17 7M7 7h10v10" />
      : name === 'close' ? <path d="m6 6 12 12M6 18 18 6" />
        : [<path key={1} d="M20 8v5a3 3 0 0 1-3 3H8a4 4 0 0 1-4-4V8zM20 9h1a2 2 0 0 1 0 4h-1M8 4v1m5-1v1" />, <path key={2} d="M4 20h16" />]}
  </svg>
)

export function SponsorArticle() {
  const [locale] = useLocale()
  const s = getSponsorCopy(locale)
  const [copied, setCopied] = useState('')
  const copyTimer = useRef<number | ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current) }, [])

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(s ? `${label} ${s.copied}` : `${label}已复制`)
    } catch {
      setCopied(s ? s.copyFail : '复制未完成，请选中文字手动复制。')
    }
    if (copyTimer.current) clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(''), 3000)
  }

  const paragraphs = s ? s.paragraphs : SPONSOR.paragraphs

  return (
    <article className="ofm-sponsor-article">
      <div className="ofm-sponsor-intro">
        <div>
          <h2>{s ? s.introTitle : '让免费服务，继续陪伴。'}</h2>
          <p>{s ? s.introSub : '一封来自 OFM 团队的说明，也是一份坦诚的赞助邀请。'}</p>
        </div>
        <span className="ofm-sponsor-seal" aria-hidden="true">{icon('cup', 26)}</span>
      </div>
      <div className="ofm-sponsor-letter">
        <p className="ofm-sponsor-greeting">{s ? s.greeting : SPONSOR.greeting}</p>
        <p key={0}>{paragraphs[0]}</p>
        <p key={1}>{paragraphs[1]}</p>
        <p key={2}>{paragraphs[2]}</p>
        <div className="ofm-sponsor-contact">
          <p>{s ? s.contact : '这里是附上了邀请码的链接：'}</p>
          <a className="ofm-sponsor-url" href={SPONSOR.url} target="_blank" rel="noopener noreferrer">
            {SPONSOR.url} {icon('arrow', 16)}
          </a>
          <div className="ofm-sponsor-copyrow">
            <span>{s ? s.inviteLabel : '邀请码 '}<strong>{SPONSOR.invite}</strong></span>
            <button type="button" onClick={() => copy(SPONSOR.invite, s ? s.inviteLabel.trim() : '邀请码')}>
              {s ? s.copyInvite : '复制邀请码'}
            </button>
          </div>
          <span className="ofm-sponsor-copy-status" role="status">{copied}</span>
        </div>
        <p key={3}>{paragraphs[3]}</p>
        <p key={4}>{paragraphs[4]}</p>
        <p key={5}>{paragraphs[5]}</p>
        <div className="ofm-sponsor-signoff">
          <span>{s ? s.signoff : '感谢你的理解与陪伴'}</span>
          <strong>{s ? s.team : 'OFM 团队'}</strong>
        </div>
      </div>
      <figure className="ofm-sponsor-evidence">
        <figcaption>
          <strong>{s ? s.evidenceTitle : '另附：中转站鹈鹕测试'}</strong>
          <span>{s ? s.evidenceSub : '发现问题直接电 · 以下为提供的原图'}</span>
        </figcaption>
        <img src={image} alt={s ? s.evidenceAlt : '提供的生成示例：三幅图像分别展示骑行鹈鹕和山河场景，下方保留模型名称、生成时间与耗时。'} width={1227} height={367} loading="lazy" decoding="async" />
      </figure>
      <div className="ofm-sponsor-end">
        <p>{s ? s.endTitle : '愿意了解，再往前一步。'}</p>
        <a className="ofm-sponsor-visit" href={SPONSOR.url} target="_blank" rel="noopener noreferrer">
          {s ? s.visit : '前往北辰 API'} {icon('arrow')}
        </a>
        <span>{s ? s.visitSub : '赞助商网站 · 含邀请码'}</span>
      </div>
    </article>
  )
}

export function SponsorPage() {
  const [locale] = useLocale()
  const s = getSponsorCopy(locale)
  return (
    <section className="ofm-sponsor ofm-sponsor-desktop ofm-sponsor-page" aria-labelledby="ofm-sponsor-page-title">
      <header className="ofm-sponsor-pagehead">
        <h1 id="ofm-sponsor-page-title">{s ? s.title : SPONSOR.title}</h1>
        <p>{s ? s.subtitle : '北辰 API × OFM · 你可以在这里随时阅读全文。'}</p>
      </header>
      <SponsorArticle />
    </section>
  )
}

export function SponsorNotice({ targetId, placement = 'below' }: { targetId: string; placement?: 'below' | 'side' }) {
  const [locale] = useLocale()
  const s = getSponsorCopy(locale)
  const dialog = useRef<HTMLDialogElement>(null)
  const mounted = useRef(false)
  const closing = useRef(false)
  const animation = useRef<Animation | null>(null)
  const previousFocus = useRef<Element | null>(null)
  const unlock = useRef(() => {})
  const [opened, setOpened] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const finish = () => {
    dialog.current?.close()
    animation.current?.cancel()
    animation.current = null
    unlock.current()
    if (mounted.current) { setOpened(false); setLeaving(false) }
  }

  const dismiss = () => {
    const node = dialog.current
    if (!node?.open || closing.current) return
    closing.current = true
    setLeaving(true)
    const target = document.getElementById(targetId)
    if (!target) { finish(); return }
    const start = node.getBoundingClientRect(), end = target.getBoundingClientRect()
    const dx = end.left + end.width / 2 - (start.left + start.width / 2)
    const dy = end.top + end.height / 2 - (start.top + start.height / 2)
    try {
      const a = node.animate([
        { opacity: 1, transform: 'translate(0, 0) scale(1)' },
        { opacity: 0.15, transform: `translate(${dx}px, ${dy}px) scale(0.18)` },
      ], { duration: 320, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)', fill: 'forwards' })
      animation.current = a
      a.onfinish = finish
      a.oncancel = finish
    } catch { finish() }
  }

  useEffect(() => {
    mounted.current = true
    let cancelled = false
    const blockedByDialog = () => {
      const selector = 'dialog[open], [role="dialog"][aria-modal="true"]'
      return [...document.querySelectorAll(selector)].some(node => node !== dialog.current && node.getClientRects().length > 0)
    }
    const show = () => {
      if (cancelled || document.hidden || !dialog.current || blockedByDialog()) throw new Error('not ready')
      previousFocus.current = document.activeElement
      dialog.current.showModal()
      closing.current = false
      const oldOverflow = document.body.style.overflow, oldPadding = document.body.style.paddingRight
      const gutter = Math.max(0, window.innerWidth - document.documentElement.clientWidth)
      document.body.style.overflow = 'hidden'
      if (gutter) document.body.style.paddingRight = `${gutter + parseFloat(getComputedStyle(document.body).paddingRight || '0')}px`
      let restored = false
      unlock.current = () => { if (restored) return; restored = true; document.body.style.overflow = oldOverflow; document.body.style.paddingRight = oldPadding }
      setOpened(true)
    }
    const tryShow = () => {
      if (cancelled || document.hidden) return
      if (blockedByDialog()) { observe(); return }
      let storage: Storage
      try { storage = window.localStorage } catch { return }
      void claimSponsorDay({ storage, locks: navigator.locks, eligible: () => !cancelled && !document.hidden, show }).then(shown => {
        if (shown || storage.getItem(SPONSOR_DAY_KEY) === sponsorLocalDay()) observer.disconnect()
      }).catch(() => { observer.disconnect() })
    }
    let timer: number | ReturnType<typeof setTimeout> | undefined
    const observer = new MutationObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(tryShow, 120)
    })
    const observe = () => {
      try { observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open', 'aria-modal'] }) } catch {}
    }
    const onVisibility = () => { if (!document.hidden) tryShow() }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dialog.current?.open && !closing.current) {
        event.preventDefault(); event.stopImmediatePropagation()
        dismiss()
      }
    }
    tryShow()
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      cancelled = true; mounted.current = false
      clearTimeout(timer)
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('keydown', onKeyDown, true)
      animation.current?.cancel()
      dialog.current?.close()
      unlock.current()
    }
  }, [])

  return createPortal(
    <dialog
      ref={dialog}
      className={`ofm-sponsor ofm-sponsor-desktop ofm-sponsor-dialog${leaving ? ' is-closing' : ''}`}
      aria-labelledby="ofm-sponsor-dialog-title"
      aria-describedby="ofm-sponsor-dialog-description"
      data-placement={placement}
      onCancel={event => { event.preventDefault(); dismiss() }}
      onClick={event => {
        if (event.target === dialog.current) {
          const r = dialog.current.getBoundingClientRect()
          if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dismiss()
        }
      }}>
      <header className="ofm-sponsor-dialoghead">
        <div>
          <h2 id="ofm-sponsor-dialog-title">{s ? s.title : SPONSOR.title}</h2>
          <p id="ofm-sponsor-dialog-description">{s ? s.dialogSub : '北辰 API × OFM · 每天首次打开时展示一次'}</p>
        </div>
        <button
          type="button"
          className="ofm-sponsor-close"
          autoFocus
          onClick={dismiss}
          aria-label={s ? s.closeAria : '收起公告到广告菜单'}
          title={s ? s.closeTitle : '收起到广告菜单（Esc）'}>
          {icon('close')}
        </button>
      </header>
      <div className="ofm-sponsor-scroll" tabIndex={0} role="region" aria-label={s ? s.scrollAria : '广告全文，可向下滚动'}>
        {opened ? <SponsorArticle /> : null}
      </div>
      <footer className="ofm-sponsor-dialogfoot">
        <p>
          {s ? s.footText : '无需读完，也可以随时收起。'}
          <span>{s ? s.footSub : '全文会留在广告菜单中。'}</span>
        </p>
        <button type="button" className="ofm-sponsor-fold" onClick={dismiss}>
          {s ? s.foldBtn : '收起至菜单'} {icon('arrow', 16)}
        </button>
      </footer>
    </dialog>,
    document.body
  )
}
