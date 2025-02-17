type FeatureFlags = {
  cryptoDefiEnabled: boolean;
};

// TODO store feature flags in the DB and cache it for 1~5min
const featureFlags: FeatureFlags = {
  cryptoDefiEnabled: false,
};

export const getFlags = () => featureFlags;
