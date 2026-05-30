export type ScreenType = 
  | 'welcome'
  | 'adventure-hub' 
  | 'physics-sandbox' 
  | 'kepler-simulation' 
  | 'astrophysics-simulation' 
  | 'relativity-simulation' 
  | 'thermal-simulation'
  | 'static-simulation'
  | 'sound-simulation'
  | 'prism-simulation'
  | 'mirror-simulation'
  | 'archimedes-simulation'
  | 'boyle-simulation';

export interface CardItem {
  id: string;
  category: string;
  title: string;
  theoryName?: string;
  description: string;
  iconType: string;
  colorTheme: 'orange' | 'blue' | 'purple' | 'green' | 'teal';
  screen: ScreenType;
  badge?: string;
  locked?: boolean;
  emoji?: string;
  preset?: string;
}

export interface SidebarItem {
  id: ScreenType;
  label: string;
  iconName: string;
  color: string;
}
