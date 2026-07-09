/**
 * Get placeholder image URL for development
 * @param width - Image width
 * @param height - Image height
 * @param text - Optional text overlay
 */
export function getPlaceholder(
  width: number,
  height: number,
  text?: string
): string {
  const bgColor = '1c1c1f';
  const textColor = '71717a';
  const encodedText = text ? encodeURIComponent(text) : `${width}x${height}`;
  return `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${encodedText}`;
}

/**
 * Get skill screenshot placeholder
 */
export function getSkillPlaceholder(
  type: 'before' | 'after' | 'preview',
  skillName?: string
): string {
  const labels = {
    before: 'Before',
    after: 'After',
    preview: 'Preview',
  };
  const label = skillName
    ? `${labels[type]}: ${skillName}`
    : labels[type];
  return getPlaceholder(800, 500, label);
}

/**
 * Check if image is external URL
 */
export function isExternalImage(src: string): boolean {
  return src.startsWith('http://') || src.startsWith('https://');
}

/**
 * Get image dimensions from aspect ratio
 */
export function getImageDimensions(
  aspectRatio: '16/9' | '4/3' | '1/1' | '3/2' = '16/9',
  maxWidth = 800
): { width: number; height: number } {
  const ratios: Record<string, number> = {
    '16/9': 9 / 16,
    '4/3': 3 / 4,
    '1/1': 1,
    '3/2': 2 / 3,
  };
  const ratio = ratios[aspectRatio] || ratios['16/9'];
  return {
    width: maxWidth,
    height: Math.round(maxWidth * ratio),
  };
}
