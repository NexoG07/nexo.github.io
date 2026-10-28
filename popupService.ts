import { PopupConfig } from '../types';

export const DEFAULT_POPUP_CONFIG: PopupConfig = {
  enabled: false,
  title: 'Willkommen auf Nexo!',
  message: 'Viel Spaß beim Zocken der besten kostenlosen Browsergames!',
  badge: '📢 Ankündigung',
  buttonText: "Los geht's!",
  displayMode: 'always',
  updatedAt: Date.now(),
};

export async function fetchPopupConfig(): Promise<PopupConfig> {
  try {
    const res = await fetch('/api/popup');
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return DEFAULT_POPUP_CONFIG;
}

export async function updatePopupConfig(config: Partial<PopupConfig>): Promise<PopupConfig> {
  try {
    const res = await fetch('/api/popup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return { ...DEFAULT_POPUP_CONFIG, ...config };
}
