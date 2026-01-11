import {z} from 'zod';

export const createOrderDto = z.object({
  buyerId: z.string(),
  sellerId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      title: z.string(),
      price: z.number().nonnegative(),
      qty: z.number().int().positive(),
    })
  ),
  total: z.number().nonnegative(),
  currency: z.string().optional(),
  idempotencyKey: z.string().uuid().optional(), // prevent duplicate create
});
