import chalk from 'chalk';

const separatorLength = 100;

const severityMessage = {
  info: '',
  warn: 'WARNING ',
  error: 'ERROR ',
} as const;

const style = {
  info: (m: string) => m,
  warn: chalk.bold.yellow,
  error: chalk.bold.red,
} as const;

type Severity = 'info' | 'warn' | 'error';

const log = (message: unknown, severity: Severity) => {
  switch (severity) {
    case 'error':
      console.error(message);
      return;

    case 'warn':
      console.warn(message);
      return;

    default:
      console.log(message);
  }
};

type Options = {
  breakLineAbove?: boolean;
  breakLineBelow?: boolean;
  separatorAbove?: string;
  separatorBelow?: string;
  severity?: Severity;
};

export const buildLogger =
  (module: string) =>
  (
    message: unknown,
    {
      breakLineAbove,
      breakLineBelow,
      separatorAbove,
      separatorBelow,
      severity,
    }: Options = {}
  ) => {
    if (process.env.NODE_ENV === 'test') return;

    const date = new Date();
    const timestamp = date.toLocaleString('sv', {
      timeZone: 'America/Sao_Paulo',
    });

    severity = severity ? severity : 'info';

    if (breakLineAbove) log('', severity);
    if (separatorAbove)
      log(style[severity](separatorAbove.repeat(separatorLength)), severity);

    const isStringMessage = typeof message === 'string';

    log(
      style[severity](
        `${timestamp}: ${severityMessage[severity]}[${module}] ${
          isStringMessage ? message : ''
        }`.trim()
      ),
      severity
    );
    if (!isStringMessage) {
      console.dir(message, { depth: null });
    }

    if (separatorBelow)
      log(style[severity](separatorBelow.repeat(separatorLength)), severity);
    if (breakLineBelow) log('', severity);
  };
