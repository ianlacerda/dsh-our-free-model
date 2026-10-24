export function visibilityCopy(locale) {
  const lang = String(locale).toLowerCase()
  if (lang.startsWith('pt')) {
    return {
      hideFree: 'Ocultar modelos gratuitos anônimos e Kilo',
      hideEac: 'Ocultar modelos EAC',
      hide: 'Ocultar modelo',
      show: 'Mostrar modelo',
      hidden: 'Oculto por preferência',
      groupHidden: 'Desative primeiro a ocultação do grupo',
      saved: 'Visibilidade do modelo salva',
    }
  }
  if (lang.startsWith('es')) {
    return {
      hideFree: 'Ocultar modelos gratuitos anónimos y Kilo',
      hideEac: 'Ocultar modelos EAC',
      hide: 'Ocultar modelo',
      show: 'Mostrar modelo',
      hidden: 'Oculto por preferencia',
      groupHidden: 'Primero desactive la ocultación del grupo',
      saved: 'Visibilidad del modelo guardada',
    }
  }
  if (lang.startsWith('fr')) {
    return {
      hideFree: 'Masquer les modèles gratuits anonymes et Kilo',
      hideEac: 'Masquer les modèles EAC',
      hide: 'Masquer le modèle',
      show: 'Afficher le modèle',
      hidden: 'Masqué selon les préférences',
      groupHidden: 'Désactiver d\'abord le masquage de groupe',
      saved: 'Visibilité du modèle enregistrée',
    }
  }
  if (lang.startsWith('en')) {
    return {
      hideFree: 'Hide anonymous and Kilo free models',
      hideEac: 'Hide EAC models',
      hide: 'Hide model',
      show: 'Show model',
      hidden: 'Hidden by preference',
      groupHidden: 'Turn off group hiding first',
      saved: 'Model visibility saved',
    }
  }
  return {
    hideFree: '隐藏匿名与 Kilo 免费模型',
    hideEac: '隐藏 EAC 模型',
    hide: '隐藏模型',
    show: '显示模型',
    hidden: '已按偏好隐藏',
    groupHidden: '请先关闭整组隐藏',
    saved: '模型显示设置已保存',
  }
}
