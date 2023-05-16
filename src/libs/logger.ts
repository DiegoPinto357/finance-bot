import chalk from 'chalk';

const separatorLength = 100;

interface SeverityMessage {
  [key: string]: string;
}

const severityMessage: SeverityMessage = {
  info: '',
  warn: 'WARNING ',
  error: 'ERROR ',
};

interface Style {
  [key: string]: (m: string) => string;
}

const style: Style = {
  info: (m: string) => m,
  warn: chalk.bold.yellow,
  error: chalk.bold.red,
};

const log = (message: string, severity: string) => {
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

interface Options {
  breakLineAbove?: string;
  breakLineBelow?: string;
  separatoAbove?: string;
  separatorBelow?: string;
  severity?: string;
}

export const buildLogger =
  (module: string) =>
  (
    message: string,
    {
      breakLineAbove,
      breakLineBelow,
      separatoAbove,
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
    if (separatoAbove)
      log(style[severity](separatoAbove.repeat(separatorLength)), severity);

    log(
      style[severity](
        `${timestamp}: ${severityMessage[severity]}[${module}] ${message}`
      ),
      severity
    );

    if (separatorBelow)
      log(style[severity](separatorBelow.repeat(separatorLength)), severity);
    if (breakLineBelow) log('', severity);
  };
