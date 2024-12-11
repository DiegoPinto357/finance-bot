import cron from 'node-cron';
import { promises as fs } from 'fs';
import path from 'path';
import { format } from 'date-fns';
import database from '../providers/database';
import { buildLogger } from '../libs/logger';

const log = buildLogger('Backup Scheduler');

const backupFolder = path.join(__dirname, '../../backup');

const databases = [
  { name: 'assets', collections: ['fixed', 'stock', 'crypto'] },
  { name: 'portfolio', collections: ['shares', 'history'] },
];

const fetchAndSaveBackup = async () => {
  await fs.mkdir(backupFolder, { recursive: true });

  for (const { name, collections } of databases) {
    await Promise.all(
      collections.map(async collection => {
        const data = await database.find(name, collection);

        const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
        const filename = `${name}-${collection}-${timestamp}.json`;

        const filepath = path.join(backupFolder, filename);
        await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
      })
    );
  }
};

export const initializeBackupScheduler = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      log('Performing scheduled database backup...');
      await fetchAndSaveBackup();
      log('Database backup completed.');
    } catch (error) {
      console.error('Failed to backup database:', error);
    }
  });

  log('Backup scheduler initialized.');
};
