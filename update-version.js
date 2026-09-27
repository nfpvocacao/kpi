import fs from 'fs';
import path from 'path';

function updateVersion() {
  // Ajustar para fuso horário oficial de Brasília (America/Sao_Paulo, UTC-3)
  const now = new Date();
  const brasiliaDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));

  const year = brasiliaDate.getFullYear();
  const month = String(brasiliaDate.getMonth() + 1).padStart(2, '0');
  const day = String(brasiliaDate.getDate()).padStart(2, '0');
  const hours = String(brasiliaDate.getHours()).padStart(2, '0');
  const minutes = String(brasiliaDate.getMinutes()).padStart(2, '0');

  const versionTag = `V.${year}${month}${day}${hours}${minutes}`;
  const fileContent = `// Arquivo gerado automaticamente no build (npm run build)
export const APP_VERSION = "${versionTag}";
`;

  const targetPath = path.resolve('src/version.ts');
  fs.writeFileSync(targetPath, fileContent, 'utf-8');
  console.log(`[Version Generator] Versão atualizada (Horário de Brasília): ${versionTag}`);
}

updateVersion();
