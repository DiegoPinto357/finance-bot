type ArbitraryObject = { [key: string]: unknown };

const isArbitraryObject = (
  potentialObject: unknown
): potentialObject is ArbitraryObject =>
  typeof potentialObject === 'object' && potentialObject !== null;

export const isErrnoException = (
  error: unknown
): error is NodeJS.ErrnoException =>
  isArbitraryObject(error) &&
  error instanceof Error &&
  (typeof error.errno === 'number' || typeof error.errno === 'undefined') &&
  (typeof error.code === 'string' || typeof error.code === 'undefined') &&
  (typeof error.path === 'string' || typeof error.path === 'undefined') &&
  (typeof error.syscall === 'string' || typeof error.syscall === 'undefined');
