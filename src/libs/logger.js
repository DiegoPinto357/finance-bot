export const buildLogger = module => message => {
  const date = new Date();
  const timestamp = date.toLocaleString('sv', {
    timeZone: 'America/Sao_Paulo',
  });
  console.log(`${timestamp}: [${module}] ${message}`);
};
