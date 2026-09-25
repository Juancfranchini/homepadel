export const POS_PERMISSIONS = {
  SELL: 'pos.sell',
  DISCOUNT: 'pos.discount',
  CREATE_PRODUCT: 'pos.create_product',
  RETURNS: 'pos.returns',
  CASH: 'pos.cash',
  STATS: 'pos.stats',
  SETTINGS: 'pos.settings',
} as const;

export const ALL_POS_PERMISSIONS = Object.values(POS_PERMISSIONS);
