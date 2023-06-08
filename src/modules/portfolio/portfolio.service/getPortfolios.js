import { getPortfolioData } from './common';

export default async () => {
  const portfolioData = await getPortfolioData();
  const portfolios = new Set();

  portfolioData.forEach(asset =>
    asset.shares.forEach(({ portfolio }) => portfolios.add(portfolio))
  );

  return Array.from(portfolios);
};
