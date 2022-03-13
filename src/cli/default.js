import defaultService from '../services';

export default async (command, args) => {
  switch (command) {
    default:
      const summary = await defaultService.getSummary();
      console.log(summary);
      break;
  }
};
