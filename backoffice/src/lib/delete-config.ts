import { DeleteConfirmationData } from '../types/delete.types';

export const DELETE_CONFIG = {
  brand: {
    title: 'Eliminar marca',
    message: (name: string) => `Estas por eliminar la marca "${name}"`,
    getDependencies: (data: any): DeleteConfirmationData['dependencies'] => {
      const deps = [];
      if (data.productCount > 0) {
        deps.push({ table: 'Product', count: data.productCount, message: `${data.productCount} productos asociados` });
      }
      if (data.reviewCount > 0) {
        deps.push({ table: 'ProductReview', count: data.reviewCount, message: `${data.reviewCount} reseñas de esos productos` });
      }
      if (data.orderItemCount > 0) {
        deps.push({ table: 'OrderItem', count: data.orderItemCount, message: `${data.orderItemCount} items de pedidos historicos` });
      }
      return deps;
    },
    hasOrders: (data: any) => data.orderItemCount > 0,
    action: 'soft_delete' as const,
  },
  category: {
    title: 'Eliminar categoria',
    message: (name: string) => `Estas por eliminar la categoria "${name}"`,
    getDependencies: (data: any): DeleteConfirmationData['dependencies'] => {
      const deps = [];
      if (data.productCount > 0) {
        deps.push({ table: 'Product', count: data.productCount, message: `${data.productCount} productos asociados` });
      }
      if (data.sizeGuideCount > 0) {
        deps.push({ table: 'SizeGuide', count: data.sizeGuideCount, message: `${data.sizeGuideCount} guías de talles asociadas` });
      }
      return deps;
    },
    hasOrders: (data: any) => data.orderItemCount > 0,
    action: 'soft_delete' as const,
  },
  product: {
    title: 'Eliminar producto',
    message: (name: string) => `Estas por eliminar el producto "${name}"`,
    getDependencies: (data: any): DeleteConfirmationData['dependencies'] => {
      const deps = [];
      if (data.reviewCount > 0) {
        deps.push({ table: 'ProductReview', count: data.reviewCount, message: `${data.reviewCount} reseñas de este producto` });
      }
      if (data.orderItemCount > 0) {
        deps.push({ table: 'OrderItem', count: data.orderItemCount, message: `${data.orderItemCount} items de pedidos historicos` });
      }
      return deps;
    },
    hasOrders: (data: any) => data.orderItemCount > 0,
    action: 'soft_delete' as const,
  },
  review: {
    title: 'Eliminar reseña',
    message: (name: string) => `Estas por eliminar la reseña de "${name}"`,
    getDependencies: (): DeleteConfirmationData['dependencies'] => [],
    hasOrders: () => false,
    action: 'delete' as const,
  },
  user: {
    title: 'Eliminar cliente',
    message: (name: string) => `Estas por eliminar al cliente "${name}"`,
    getDependencies: (data: any): DeleteConfirmationData['dependencies'] => {
      const deps = [];
      if (data.orderCount > 0) {
        deps.push({ table: 'Order', count: data.orderCount, message: `${data.orderCount} pedidos realizados` });
      }
      if (data.reviewCount > 0) {
        deps.push({ table: 'ProductReview', count: data.reviewCount, message: `${data.reviewCount} reseñas publicadas` });
      }
      return deps;
    },
    hasOrders: (data: any) => data.orderCount > 0,
    action: 'soft_delete' as const,
  },
  template: {
    title: 'Eliminar plantilla de email',
    message: (name: string) => `Estas por eliminar la plantilla "${name}"`,
    getDependencies: (data: any): DeleteConfirmationData['dependencies'] => {
      const deps = [];
      if (data.campaignCount > 0) {
        deps.push({ table: 'EmailCampaign', count: data.campaignCount, message: `${data.campaignCount} campañas asociadas` });
      }
      return deps;
    },
    hasOrders: () => false,
    action: 'cascade' as const,
  },
  other: {
    title: 'Eliminar',
    message: (name: string) => `Estas por eliminar "${name}"`,
    getDependencies: (): DeleteConfirmationData['dependencies'] => [],
    hasOrders: () => false,
    action: 'delete' as const,
  },
};

export type EntityType = keyof typeof DELETE_CONFIG;
