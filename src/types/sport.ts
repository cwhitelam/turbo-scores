export type Sport = 'NFL' | 'MLB' | 'NBA' | 'NHL';

export interface SportConfig {
  name: Sport;
  apiPath: string;
  isIndoor?: boolean;
}