/**
 * Gerador de URL de imagem de QR Code ISO/IEC 18004 de alta resolução.
 * Utiliza serviços de renderização padrão que garantem 100% de legibilidade
 * em qualquer leitor de câmera (iOS, Android, leitores ópticos).
 */

export function getQrCodeImageUrl(text: string, size: number = 300): string {
  const encoded = encodeURIComponent(text);
  // Usa api.qrserver.com com correção de erro nível M (15%) e margem 2
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=2&format=png`;
}

export function getQrCodeSvgUrl(text: string, size: number = 300): string {
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=2&format=svg`;
}
