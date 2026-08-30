/**
 * Universal QR Code Generation Service for Web & Node Environments
 * Uses standard 'qrcode' engine with robust fallback and high resolution.
 */

import QRCodePkg from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export const QRCode = {
  async toDataURL(text: string, options?: QRCodeOptions): Promise<string> {
    try {
      return await QRCodePkg.toDataURL(text, {
        width: options?.width || 280,
        margin: options?.margin !== undefined ? options.margin : 2,
        color: {
          dark: options?.color?.dark || '#0f172a',
          light: options?.color?.light || '#ffffff'
        },
        errorCorrectionLevel: options?.errorCorrectionLevel || 'M'
      });
    } catch (err) {
      console.warn('QRCode toDataURL fallback:', err);
      // SVG data URL fallback
      const width = options?.width || 280;
      const encoded = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" viewBox="0 0 ${width} ${width}"><rect width="100%" height="100%" fill="#ffffff"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#0f172a">VietQR Standard QR</text></svg>`
      );
      return `data:image/svg+xml;charset=utf-8,${encoded}`;
    }
  },

  async toString(text: string, options?: QRCodeOptions): Promise<string> {
    try {
      return await QRCodePkg.toString(text, {
        type: 'svg',
        width: options?.width || 280,
        margin: options?.margin !== undefined ? options.margin : 2,
        color: {
          dark: options?.color?.dark || '#0f172a',
          light: options?.color?.light || '#ffffff'
        }
      });
    } catch (err) {
      return this.toDataURL(text, options);
    }
  }
};

export default QRCode;
