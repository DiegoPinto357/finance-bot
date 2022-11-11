const separatorLength = 100;

export const buildLogger =
  module =>
  (
    message,
    { breakLineAbove, breakLineBelow, separatoAbove, separatorBelow } = {}
  ) => {
    if (process.env.NODE_ENV === 'test') return;

    const date = new Date();
    const timestamp = date.toLocaleString('sv', {
      timeZone: 'America/Sao_Paulo',
    });

    if (breakLineAbove) console.log();
    if (separatoAbove) console.log(separatoAbove.repeat(separatorLength));
    console.log(`${timestamp}: [${module}] ${message}`);
    if (separatorBelow) console.log(separatorBelow.repeat(separatorLength));
    if (breakLineBelow) console.log();
  };
