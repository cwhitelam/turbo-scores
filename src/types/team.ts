export interface TeamColors {
  [key: string]: {
    primary: string;
    secondary: string;
  };
}

// Default colors for teams that don't have specific colors defined
export const DEFAULT_COLORS = {
  primary: 'rgb(31, 41, 55)',    // darker gray
  secondary: 'rgb(209, 213, 219)' // lighter gray for better contrast
};