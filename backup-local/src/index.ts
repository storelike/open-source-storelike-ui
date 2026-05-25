import Fastify from 'fastify';
import { readdirSync, unlinkSync, statSync } from 'node:fs';
import { join } from 'node:path';
import cron from 'node-cron';
import { createBackup } from './backup.js';

const app = Fastify({ logger: true });

const BACKUP_DIR = process.env.BACKUP_DIR ?? '/backups';
const CRON_EXPR = process.env.BACKUP_INTERVAL_CRON ?? '0 2 * * *';
const RETAIN_DAYS = parseInt(process.env.BACKUP_RETAIN_DAYS ?? '7', 10);
const TEMPLATES_PATH = process.env.TEMPLATES_BASE_PATH ?? '/templates';
const STORE_URL = process.env.STORE_URL ?? 'http://store-sqlite:3001';

app.get('/health', async () => ({ status: 'ok' }));

app.get('/backups', async () => {
  const files = readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.tar.gz'))
    .map(f => {
      const stat = statSync(join(BACKUP_DIR, f));
      return { name: f, size: stat.size, created: stat.birthtime.toISOString() };
    })
    .sort((a, b) => b.created.localeCompare(a.created));
  return { backups: files };
});

app.post('/backup', async () => {
  const filename = await createBackup(TEMPLATES_PATH, STORE_URL, BACKUP_DIR);
  return { filename };
});

function pruneOldBackups() {
  const cutoff = Date.now() - RETAIN_DAYS * 24 * 60 * 60 * 1000;
  const files = readdirSync(BACKUP_DIR).filter(f => f.endsWith('.tar.gz'));
  for (const f of files) {
    const stat = statSync(join(BACKUP_DIR, f));
    if (stat.mtimeMs < cutoff) {
      unlinkSync(join(BACKUP_DIR, f));
      app.log.info(`Pruned old backup: ${f}`);
    }
  }
}

cron.schedule(CRON_EXPR, async () => {
  app.log.info('Running scheduled backup...');
  try {
    await createBackup(TEMPLATES_PATH, STORE_URL, BACKUP_DIR);
    pruneOldBackups();
    app.log.info('Backup completed');
  } catch (err) {
    app.log.error(err, 'Backup failed');
  }
});

const start = async () => {
  await app.listen({ port: 3006, host: '0.0.0.0' });
};

start().catch(err => {
  app.log.error(err);
  process.exit(1);
});
