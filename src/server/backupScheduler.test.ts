import { promises as fs } from 'fs';
import cron from 'node-cron';
import { initializeBackupScheduler } from './backupScheduler';
import database from '../providers/database';

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
  },
}));

jest.mock('../providers/database', () => ({
  find: jest.fn(),
}));

describe('backupScheduler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('schedules a cron job', () => {
    initializeBackupScheduler();
    expect(cron.schedule).toHaveBeenCalledWith(
      '0 0 * * *',
      expect.any(Function)
    );
  });

  it('creates backup folder and write backups', async () => {
    const mockData = { test: 'data' };
    (database.find as jest.Mock).mockResolvedValue(mockData);

    initializeBackupScheduler();

    // We need to manually execute the cron's scheduled task because it's async
    const scheduledFunction = (cron.schedule as jest.Mock).mock.calls[0][1];
    await scheduledFunction();

    expect(fs.mkdir).toHaveBeenCalledWith(expect.stringContaining('/backup'), {
      recursive: true,
    });
    expect(fs.writeFile).toHaveBeenCalledTimes(5);

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('/backup/assets-fixed-'),
      JSON.stringify(mockData, null, 2),
      'utf-8'
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('/backup/assets-stock-'),
      JSON.stringify(mockData, null, 2),
      'utf-8'
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('/backup/assets-crypto-'),
      JSON.stringify(mockData, null, 2),
      'utf-8'
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('/backup/portfolio-shares-'),
      JSON.stringify(mockData, null, 2),
      'utf-8'
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('/backup/portfolio-history-'),
      JSON.stringify(mockData, null, 2),
      'utf-8'
    );
  });

  it('logs an error if backup fails', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    (database.find as jest.Mock).mockRejectedValue(new Error('Database error'));

    initializeBackupScheduler();

    // Execute the cron's scheduled task
    const scheduledFunction = (cron.schedule as jest.Mock).mock.calls[0][1];
    await scheduledFunction();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to backup database:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
