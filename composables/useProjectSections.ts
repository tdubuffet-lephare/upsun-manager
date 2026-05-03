export interface ProjectNavItem {
  key: string
  label: string
  icon: string
}

export interface ProjectSection {
  key: string
  label: string
  items: ProjectNavItem[]
}

export const PROJECT_SECTIONS: ProjectSection[] = [
  {
    key: 'operate',
    label: 'Operate',
    items: [
      { key: 'environments', label: 'Environnements', icon: 'layers' },
      { key: 'resources', label: 'Ressources', icon: 'gauge' },
    ],
  },
  {
    key: 'observe',
    label: 'Observe',
    items: [
      { key: 'logs', label: 'Logs', icon: 'terminal' },
      { key: 'activities', label: 'Activités', icon: 'activity' },
      { key: 'alerts', label: 'Alertes', icon: 'bell' },
      { key: 'compare', label: 'Comparer', icon: 'diff' },
    ],
  },
  {
    key: 'configure',
    label: 'Configure',
    items: [
      { key: 'variables', label: 'Variables', icon: 'code' },
      { key: 'domains', label: 'Domaines', icon: 'globe' },
      { key: 'crons', label: 'Crons', icon: 'clock' },
      { key: 'backups', label: 'Sauvegardes', icon: 'shield' },
      { key: 'autoscaling', label: 'Autoscaling', icon: 'scale' },
    ],
  },
]

export const SETTINGS_ITEMS: ProjectNavItem[] = [
  { key: 'integrations', label: 'Intégrations', icon: 'plug' },
  { key: 'team', label: 'Équipe', icon: 'users' },
  { key: 'appearance', label: 'Apparence', icon: 'palette' },
]

export function useProjectSections() {
  function findSection(tabKey: string): ProjectSection | null {
    return PROJECT_SECTIONS.find(s => s.items.some(i => i.key === tabKey)) || null
  }

  function isSettingsTab(tabKey: string): boolean {
    return SETTINGS_ITEMS.some(i => i.key === tabKey)
  }

  function getItem(tabKey: string): ProjectNavItem | null {
    const all = [...PROJECT_SECTIONS.flatMap(s => s.items), ...SETTINGS_ITEMS]
    return all.find(i => i.key === tabKey) || null
  }

  function isValidTab(tabKey: string): boolean {
    return findSection(tabKey) !== null || isSettingsTab(tabKey)
  }

  return {
    sections: PROJECT_SECTIONS,
    settingsItems: SETTINGS_ITEMS,
    findSection,
    isSettingsTab,
    getItem,
    isValidTab,
  }
}
