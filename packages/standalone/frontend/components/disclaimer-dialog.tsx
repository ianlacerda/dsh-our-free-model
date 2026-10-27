import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DISCLAIMER, DISCLAIMER_VERSION } from '../../../../src/disclaimer.js'
import { useLocale, type Locale } from '../i18n'
import { management } from '../management'
import '../disclaimer.css'

interface DisclaimerCopy {
  title: string
  subtitle: string
  intro: string
  accept: string
  saving: string
  versionLabel: string
  sections: Array<{ id: string; heading: string; body: string }>
}

const LOCALIZED_DISCLAIMER: Record<string, DisclaimerCopy> = {
  en: {
    title: 'Terms of Use & Disclaimer',
    subtitle: 'Please review and confirm before continuing to use Our Free Model.',
    intro: 'Our Free Model is an open-source client management and aggregation tool. It connects users directly to public model channels and third-party APIs without operating any central servers or collecting user credentials.',
    versionLabel: `Disclaimer Version v${DISCLAIMER_VERSION}`,
    accept: 'I Understand and Agree',
    saving: 'Saving…',
    sections: [
      {
        id: 'safety',
        heading: '1. Model Security & Privacy',
        body: 'Public free pools and third-party APIs may log prompts and outputs according to their own policies. Do not submit sensitive, confidential, personal, or proprietary data through untrusted channels.',
      },
      {
        id: 'liability',
        heading: '2. Limitation of Liability',
        body: 'This tool is provided "as is" for learning and productivity purposes. The authors and maintainers are not responsible for service availability, output accuracy, data loss, account suspension, or any direct or indirect damages.',
      },
      {
        id: 'compliance',
        heading: '3. Compliance & Lawful Use',
        body: 'Users are solely responsible for ensuring their usage complies with all applicable local laws, regulations, and third-party service provider terms of use.',
      },
    ],
  },
  'pt-BR': {
    title: 'Termos de Uso e Aviso Legal',
    subtitle: 'Por favor, leia e confirme antes de continuar utilizando o Our Free Model.',
    intro: 'O Our Free Model é uma ferramenta de código aberto para gerenciamento e agregação de clientes. Ele conecta os usuários diretamente a canais de modelos públicos e APIs de terceiros, sem servidores intermediários nem coleta de credenciais.',
    versionLabel: `Versão do Aviso Legal v${DISCLAIMER_VERSION}`,
    accept: 'Entendido e Concordo',
    saving: 'Salvando…',
    sections: [
      {
        id: 'safety',
        heading: '1. Segurança e Privacidade dos Modelos',
        body: 'Pools públicos gratuitos e APIs de terceiros podem registrar prompts e saídas conforme suas próprias políticas. Não envie dados confidenciais, sensíveis, pessoais ou proprietários por canais não confiáveis.',
      },
      {
        id: 'liability',
        heading: '2. Limitação de Responsabilidade',
        body: 'Esta ferramenta é fornecida "como está" para aprendizado e produtividade. Os autores e mantenedores não se responsabilizam por disponibilidade de serviço, precisão das respostas, perda de dados ou quaisquer danos diretos ou indiretos.',
      },
      {
        id: 'compliance',
        heading: '3. Conformidade e Uso Legal',
        body: 'O usuário é o único responsável por garantir que o uso esteja em conformidade com as leis aplicáveis e os termos de serviço dos provedores terceiros utilizados.',
      },
    ],
  },
  es: {
    title: 'Términos de Uso y Descargo de Responsabilidad',
    subtitle: 'Por favor, revise y confirme antes de continuar usando Our Free Model.',
    intro: 'Our Free Model es una herramienta de código abierto para gestionar y agregar clientes. Conecta a los usuarios directamente con canales públicos de modelos y APIs de terceros, sin servidores intermedios ni recopilación de credenciales.',
    versionLabel: `Versión del Descargo v${DISCLAIMER_VERSION}`,
    accept: 'Entendido y Acepto',
    saving: 'Guardando…',
    sections: [
      {
        id: 'safety',
        heading: '1. Seguridad y Privacidad de Modelos',
        body: 'Los pools públicos gratuitos y las APIs de terceros pueden registrar prompts y salidas según sus propias políticas. No envíe información confidencial, sensible o personal por canales no confiables.',
      },
      {
        id: 'liability',
        heading: '2. Limitación de Responsabilidad',
        body: 'Esta herramienta se proporciona "tal cual" con fines de aprendizaje y productividad. Los autores y mantenedores no se responsabilizan por la disponibilidad del servicio, la precisión de las respuestas o cualquier daño directo o indirecto.',
      },
      {
        id: 'compliance',
        heading: '3. Cumplimiento y Uso Lícito',
        body: 'El usuario es el único responsable de garantizar que su uso cumpla con todas las leyes aplicables y los términos de servicio de los proveedores de terceros utilizados.',
      },
    ],
  },
  fr: {
    title: 'Conditions d\'Utilisation et Avertissement',
    subtitle: 'Veuillez lire et confirmer avant de continuer à utiliser Our Free Model.',
    intro: 'Our Free Model est un outil open source de gestion et d\'agrégation de clients. Il connecte directement les utilisateurs aux canaux de modèles publics et aux API tierces, sans serveurs intermédiaires ni collecte d\'identifiants.',
    versionLabel: `Version de l'Avertissement v${DISCLAIMER_VERSION}`,
    accept: 'Compris et J\'accepte',
    saving: 'Enregistrement…',
    sections: [
      {
        id: 'safety',
        heading: '1. Sécurité et Confidentialité des Modèles',
        body: 'Les pools gratuits publics et les API tierces peuvent enregistrer les requêtes et les réponses selon leurs propres politiques. Ne soumettez pas de données sensibles, personnelles ou confidentielles sur des canaux non vérifiés.',
      },
      {
        id: 'liability',
        heading: '2. Limitation de Responsabilité',
        body: 'Cet outil est fourni "en l\'état" à des fins d\'apprentissage et de productivité. Les auteurs et mainteneurs ne sauraient être tenus responsables de la disponibilité du service ou des dommages directs ou indirects.',
      },
      {
        id: 'compliance',
        heading: '3. Conformité et Utilisation Légale',
        body: 'L\'utilisateur est seul responsable du respect des lois applicables et des conditions d\'utilisation des fournisseurs de services tiers.',
      },
    ],
  },
}

function getLocalizedDisclaimer(locale: Locale): DisclaimerCopy {
  if (locale === 'zh') {
    return {
      title: DISCLAIMER.title,
      subtitle: DISCLAIMER.subtitle,
      intro: DISCLAIMER.intro,
      accept: DISCLAIMER.accept,
      saving: '保存中…',
      versionLabel: `免责声明版本 v${(DISCLAIMER as { version?: number }).version ?? DISCLAIMER_VERSION}`,
      sections: (DISCLAIMER.sections as unknown as Array<{ id: string; heading: string; body: string }>),
    }
  }
  return LOCALIZED_DISCLAIMER[locale] || LOCALIZED_DISCLAIMER.en
}

export function DisclaimerDialog({ open, onClose }: { open: boolean; onClose(): void }) {
  const [locale] = useLocale()
  const copy = getLocalizedDisclaimer(locale)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const node = dialog.current
    if (!node) return
    if (open && !node.open) node.showModal()
    if (!open && node.open) node.close()
  }, [open])
  if (!open) return null
  const dismiss = async () => {
    if (busy) return
    setBusy(true); setError('')
    try {
      await management('/disclaimer/ack', {})
      onClose()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '保存失败，请重试。')
    } finally { setBusy(false) }
  }
  return createPortal(
    <dialog ref={dialog} className="ofm-disclaimer-dialog" aria-labelledby="ofm-disclaimer-title"
      onCancel={event => { event.preventDefault(); if (!busy) void dismiss() }}>
      <header>
        <span className="ofm-disclaimer-eyebrow">OUR FREE MODEL</span>
        <h2 id="ofm-disclaimer-title">{copy.title}</h2>
        <p>{copy.subtitle}</p>
      </header>
      <div className="ofm-disclaimer-body">
        <p className="ofm-disclaimer-intro">{copy.intro}</p>
        {copy.sections.map((section: { id: string; heading: string; body: string }) => (
          <section key={section.id}>
            <h3>{section.heading}</h3>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
      <footer>
        <span className="ofm-disclaimer-version">{copy.versionLabel}</span>
        {error && <span className="ofm-disclaimer-error" role="alert">{error}</span>}
        <button type="button" className="primary" disabled={busy} onClick={() => void dismiss()}>
          {busy ? copy.saving : copy.accept}
        </button>
      </footer>
    </dialog>,
    document.body,
  )
}
