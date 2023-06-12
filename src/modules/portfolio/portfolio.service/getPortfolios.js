import { getPortfolioData, extractPortfolioNames } from './common';

export default async () => {
  const portfolioData = await getPortfolioData();
  return extractPortfolioNames(portfolioData);
};
