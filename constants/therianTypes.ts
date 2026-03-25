export interface TherianType {
  id: string;
  label: string;
  emoji: string;
}

export const THERIAN_TYPES: TherianType[] = [
  { id: 'wolf', label: 'Wolf', emoji: '🐺' },
  { id: 'fox', label: 'Fox', emoji: '🦊' },
  { id: 'cat', label: 'Cat', emoji: '🐱' },
  { id: 'dog', label: 'Dog', emoji: '🐕' },
  { id: 'deer', label: 'Deer', emoji: '🦌' },
  { id: 'dragon', label: 'Dragon', emoji: '🐉' },
  { id: 'bird', label: 'Bird', emoji: '🦅' },
  { id: 'bear', label: 'Bear', emoji: '🐻' },
  { id: 'rabbit', label: 'Rabbit', emoji: '🐇' },
  { id: 'horse', label: 'Horse', emoji: '🐴' },
  { id: 'snake', label: 'Snake', emoji: '🐍' },
  { id: 'lion', label: 'Lion', emoji: '🦁' },
  { id: 'raven', label: 'Raven', emoji: '🐦' },
  { id: 'custom', label: '+ Custom', emoji: '✨' },
];
