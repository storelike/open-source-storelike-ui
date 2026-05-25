import { createWriteStream, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import tar from 'tar';

export async function createBackup(
  templatesPath: string,
  storeUrl: string,
  backupDir: string
): Promise<string> {
  mkdirSync(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${timestamp}.tar.gz`;
  const filepath = join(backupDir, filename);

  await tar.create(
    {
      gzip: true,
      file: filepath,
      cwd: templatesPath,
    },
    ['.']
  );

  return filename;
}
