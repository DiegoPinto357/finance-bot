export const buildLogger = module => message => {
  if (process.env.NODE_ENV === 'test') return;

  const date = new Date();
  const timestamp = date.toLocaleString('sv', {
    timeZone: 'America/Sao_Paulo',
  });

  console.log(`${timestamp}: [${module}] ${message}`);
};
