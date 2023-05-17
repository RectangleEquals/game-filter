export const COLORS = {
  // Basic
  WHITE: { rgb: 'rgb(255, 255, 255)', hex: '#ffffff' },
  BLACK: { rgb: 'rgb(0, 0, 0)', hex: '#000000' },
  RED: { rgb: 'rgb(255, 0, 0)', hex: '#ff0000' },
  GREEN: { rgb: 'rgb(0, 255, 0)', hex: '#00ff00' },
  BLUE: { rgb: 'rgb(0, 0, 255)', hex: '#0000ff' },

  // BOOTSTAP 5
  PRIMARY: { rgb: 'rgb(13, 110, 253)', hex: '#0d6efd' },
  SECONDARY: { rgb: 'rgb(108, 117, 125)', hex: '#6c757d' },
  SUCCESS: { rgb: 'rgb(40, 167, 69)', hex: '#28a745' },
  DANGER: { rgb: 'rgb(220, 53, 69)', hex: '#dc3545' },
  WARNING: { rgb: 'rgb(255, 193, 7)', hex: '#ffc107' },
  INFO: { rgb: 'rgb(23, 162, 184)', hex: '#17a2b8' },
  LIGHT: { rgb: 'rgb(248, 249, 250)', hex: '#f8f9fa' },
  DARK: { rgb: 'rgb(52, 58, 64)', hex: '#343a40' }
}

export const colorWithOpacity = (rgb, opacity) =>
{
  const index = rgb.indexOf(')');
  const prefix = rgb.substring(0, index - 1);
  const color = `${prefix}, ${opacity})`;
  return color;
}

export default { COLORS, colorWithOpacity };