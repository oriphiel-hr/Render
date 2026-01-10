// White-Label Service - PRO users only
import { prisma } from '../lib/prisma.js';

/**
 * Get or create white-label configuration for user
 */
export async function getWhiteLabelConfig(userId) {
  try {
    let config = await prisma.whiteLabel.findUnique({
      where: { userId }
    });

    if (!config) {
      // Create default config
      config = await prisma.whiteLabel.create({
        data: {
          userId,
          companyName: 'My Company',
          primaryColor: '#3B82F6',
          isActive: true
        }
      });
    }

    return config;
  } catch (error) {
    console.error('❌ Error getting white-label config:', error);
    throw new Error('Failed to get white-label configuration');
  }
}

/**
 * Update white-label configuration
 */
export async function updateWhiteLabelConfig(userId, data) {
  try {
    const { companyName, logoUrl, primaryColor, secondaryColor, accentColor, faviconUrl, footerText, poweredByHidden } = data;

    let config = await prisma.whiteLabel.findUnique({
      where: { userId }
    });

    if (!config) {
      // Create new config
      config = await prisma.whiteLabel.create({
        data: {
          userId,
          companyName: companyName || 'My Company',
          logoUrl: logoUrl || null,
          primaryColor: primaryColor || '#3B82F6',
          secondaryColor: secondaryColor || null,
          accentColor: accentColor || null,
          faviconUrl: faviconUrl || null,
          footerText: footerText || null,
          poweredByHidden: poweredByHidden || false,
          isActive: true
        }
      });
    } else {
      // Update existing config
      config = await prisma.whiteLabel.update({
        where: { userId },
        data: {
          companyName: companyName || config.companyName,
          logoUrl: logoUrl !== undefined ? logoUrl : config.logoUrl,
          primaryColor: primaryColor || config.primaryColor,
          secondaryColor: secondaryColor !== undefined ? secondaryColor : config.secondaryColor,
          accentColor: accentColor !== undefined ? accentColor : config.accentColor,
          faviconUrl: faviconUrl !== undefined ? faviconUrl : config.faviconUrl,
          footerText: footerText !== undefined ? footerText : config.footerText,
          poweredByHidden: poweredByHidden !== undefined ? poweredByHidden : config.poweredByHidden
        }
      });
    }

    console.log(`✅ White-label config updated for user: ${userId}`);
    return config;
  } catch (error) {
    console.error('❌ Error updating white-label config:', error);
    throw new Error('Failed to update white-label configuration');
  }
}

/**
 * Toggle white-label on/off
 */
export async function toggleWhiteLabel(userId, isActive) {
  try {
    const config = await prisma.whiteLabel.update({
      where: { userId },
      data: { isActive }
    });

    console.log(`✅ White-label ${isActive ? 'activated' : 'deactivated'} for user: ${userId}`);
    return config;
  } catch (error) {
    console.error('❌ Error toggling white-label:', error);
    throw new Error('Failed to toggle white-label');
  }
}

/**
 * Delete white-label configuration
 */
export async function deleteWhiteLabelConfig(userId) {
  try {
    await prisma.whiteLabel.delete({
      where: { userId }
    });

    console.log(`✅ White-label config deleted for user: ${userId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting white-label config:', error);
    throw new Error('Failed to delete white-label configuration');
  }
}

