const separatorLength = 100;

const severityMessage = {
  info: '',
  warn: 'WARNING ',
  error: 'ERROR ',
};

export const buildLogger =
  module =>
  (
    message,
    {
      breakLineAbove,
      breakLineBelow,
      separatoAbove,
      separatorBelow,
      severity,
    } = {}
  ) => {
    if (process.env.NODE_ENV === 'test') return;

    const date = new Date();
    const timestamp = date.toLocaleString('sv', {
      timeZone: 'America/Sao_Paulo',
    });

    severity = severity ? severity : 'info';

    if (breakLineAbove) console[severity]();
    if (separatoAbove) console[severity](separatoAbove.repeat(separatorLength));

    console[severity](
      `${timestamp}: ${severityMessage[severity]}[${module}] ${message}`
    );

    if (separatorBelow)
      console[severity](separatorBelow.repeat(separatorLength));
    if (breakLineBelow) console[severity]();
  };
