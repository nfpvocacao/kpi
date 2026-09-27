import fs from 'fs';
import path from 'path';

function updateVersion() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const versionTag = `V.${year}${month}${day}${hours}${minutes}`;
  const fileContent = `// Arquivo gerado automaticamente no build (npm run build)
export const APP_VERSION = "${versionTag}";
`;

  const targetPath = path.resolve('src/version.ts');
  fs.writeFileSync(targetPath, fileContent, 'utf-8');
  console.log(`[Version Generator] Versão atualizada automaticamente: ${versionTag}`);
}

updateVersion();
