export interface ShiftType {
  id: string;
  label: string;
  color: string;
  description: string;
}

export const SHIFT_TYPES: ShiftType[] = [
  { id: 'mental', label: 'Mental Shift', color: '#7B5CF0', description: 'Mindset shifts toward your theriotype' },
  { id: 'phantom', label: 'Phantom Shift', color: '#39FF8A', description: 'Phantom limb sensations' },
  { id: 'dream', label: 'Dream Shift', color: '#00D4FF', description: 'Shift experienced in a dream' },
  { id: 'sensory', label: 'Sensory Shift', color: '#FFB547', description: 'Heightened animal-like senses' },
  { id: 'aura', label: 'Aura Shift', color: '#FF4D6A', description: 'Others perceive your animal energy' },
  { id: 'astral', label: 'Astral Shift', color: '#B388FF', description: 'Spiritual or out-of-body shift' },
  { id: 'bi-location', label: 'Bi-Location', color: '#4DD0E1', description: 'Simultaneous human and animal presence' },
  { id: 'custom', label: '+ Custom', color: '#7A9E85', description: 'Define your own' },
];
