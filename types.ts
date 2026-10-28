export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  category: string;
  tags: string[];
  developer?: string;
  isTrending?: boolean;
  badge?: string;
}

export type SortOption = 'trending' | 'newest' | 'az' | 'rating';

export interface PopupConfig {
  enabled: boolean;
  title: string;
  message: string;
  badge: string;
  buttonText: string;
  displayMode: 'always' | 'once_per_session' | 'once_total';
  updatedAt: number;
}
