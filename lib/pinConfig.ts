import { prisma } from './db'

export interface PinDefinition {
  id: string
  axis: string
  level: number
  label: string
  icon: string
  metallic: 'bronze' | 'silver' | 'gold'
  imageUrl: string | null
}

/**
 * Get all pin definitions from database
 * Includes badge image paths for rendering
 */
export async function getAllPinDefinitions(): Promise<PinDefinition[]> {
  const pins = await prisma.pin.findMany({
    orderBy: [{ axis: 'asc' }, { level: 'asc' }],
  })
  return pins as PinDefinition[]
}

/**
 * Get pin definition by axis and level
 */
export async function getPinByAxisAndLevel(
  axis: string,
  level: number
): Promise<PinDefinition | null> {
  const pin = await prisma.pin.findUnique({
    where: {
      axis_level: {
        axis,
        level,
      },
    },
  })
  return pin as PinDefinition | null
}

/**
 * Get all pins for a specific axis (spending, events, referrals)
 */
export async function getPinsByAxis(axis: string): Promise<PinDefinition[]> {
  const pins = await prisma.pin.findMany({
    where: { axis },
    orderBy: { level: 'asc' },
  })
  return pins as PinDefinition[]
}

/**
 * Get pin image URL for a specific axis and level
 * Returns null if no image is configured
 */
export async function getPinImageUrl(
  axis: string,
  level: number
): Promise<string | null> {
  const pin = await getPinByAxisAndLevel(axis, level)
  return pin?.imageUrl || null
}

/**
 * Batch get pin images for Client axis (spending)
 * Useful for rendering the Client badge collection
 */
export async function getClientPinImages(): Promise<Record<number, string | null>> {
  const pins = await getPinsByAxis('spending')
  const images: Record<number, string | null> = {}
  pins.forEach((pin) => {
    images[pin.level] = pin.imageUrl
  })
  return images
}
