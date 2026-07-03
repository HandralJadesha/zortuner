import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    contact: z.string().optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
  })
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    code: z.string().length(6, 'OTP must be exactly 6 characters')
  })
});

export const productSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Category ID'),
    basePrice: z.number().positive('Price must be greater than 0'),
    discountPrice: z.number().nonnegative().optional(),
    images: z.array(z.string()).min(1, 'At least one image is required'),
    materials: z.array(z.string()).optional(),
    colors: z.array(z.string()).optional(),
    dimensions: z.object({
      length: z.number().positive('Length must be positive').optional(),
      width: z.number().positive('Width must be positive').optional(),
      height: z.number().positive('Height must be positive').optional()
    }).optional(),
    weight: z.union([z.string().min(1, 'Weight is required'), z.number().positive('Weight must be positive')]),
    inventory: z.number().int().nonnegative().optional(),
    printDuration: z.number().positive().optional(),
    isFeatured: z.boolean().optional(),
    isBestseller: z.boolean().optional(),
    isNewArrival: z.boolean().optional()
  })
});

export const customOrderSchema = z.object({
  body: z.object({
    fileUrl: z.string().min(1, 'File URL/Data is required'),
    fileName: z.string().min(1, 'File name is required'),
    volume: z.number().positive('Volume must be positive'),
    dimensions: z.object({
      length: z.number().positive('Length must be positive'),
      width: z.number().positive('Width must be positive'),
      height: z.number().positive('Height must be positive')
    }),
    selectedMaterial: z.string().min(1, 'Material is required'),
    selectedColor: z.string().min(1, 'Color is required'),
    selectedFinish: z.string().min(1, 'Finish is required'),
    infill: z.number().min(10).max(100).optional()
  })
});

export const orderSchema = z.object({
  body: z.object({
    orderItems: z.array(
      z.object({
        product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID'),
        title: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
        selectedMaterial: z.string(),
        selectedColor: z.string()
      })
    ).min(1, 'Order must contain at least one item'),
    shippingAddress: z.object({
      street: z.string().min(3),
      city: z.string().min(2),
      state: z.string().min(2),
      postalCode: z.string().min(5),
      country: z.string().default('India')
    }),
    paymentMethod: z.string().default('Razorpay'),
    couponCode: z.string().optional()
  })
});

export const ticketSchema = z.object({
  body: z.object({
    subject: z.string().min(5, 'Subject must be at least 5 characters'),
    message: z.string().min(10, 'Message must be at least 10 characters')
  })
});
