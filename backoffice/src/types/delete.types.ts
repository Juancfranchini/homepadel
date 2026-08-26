export type DependantEntity = {
  table: string;
  count: number;
  message: string;
};

export type DeleteConfirmationData = {
  title: string;
  type: 'brand' | 'category' | 'product' | 'review' | 'user' | 'template' | 'other';
  entityName: string;
  entityId: string;
  dependencies: DependantEntity[];
  hasOrders: boolean;
  action: 'delete' | 'soft_delete' | 'cascade';
  warningMessage?: string;
};

export type DeleteResponse = {
  success: boolean;
  message: string;
  requiresConfirmation: boolean;
  relatedData?: {
    products: number;
    reviews: number;
    orderItems: number;
    hasOrders: boolean;
  };
  dependencies?: DependantEntity[];
};
