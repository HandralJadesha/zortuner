import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { Coupon } from '../models/Coupon.js';

dotenv.config();

const categoriesData = [
  {
    name: 'Home Decor',
    slug: 'home-decor',
    description: 'Minimalist luxury vases, geometric planters, and artistic sculptures.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Anime Figures',
    slug: 'anime-figures',
    description: 'High-detail collectible figures and customized action characters.',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Gaming Accessories',
    slug: 'gaming-accessories',
    description: 'Controller docks, custom keycaps, headset stands, and desk elements.',
    image: 'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Desk Accessories',
    slug: 'desk-accessories',
    description: 'Premium phone docks, organizer trays, and modern geometric pen cups.',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Lamps & Lighting',
    slug: 'lamps-lighting',
    description: 'Stunning lit lithophanes, planetary globes, and custom shadow projectors.',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Personalized Gifts',
    slug: 'personalized-gifts',
    description: 'Custom keyrings, named plaques, photo frames, and customized models.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: '3D Printers',
    slug: '3d-printers',
    description: 'State of the art, high speed Bambu Lab 3D printers for all your creative needs.',
    image: 'https://store.bblcdn.com/s7/default/c2d75be87c2946dba3ab5074fb4afe78/P2S_Combo.jpg'
  },
  {
    name: 'Filaments',
    slug: 'filaments',
    description: 'Premium quality Bambu Lab filaments including PLA, PETG, and special effects.',
    image: 'https://store.bblcdn.com/s7/default/f00291f9a7464d948b9f28fad351932c/White.jpg'
  }
];

const productsData = (categoryIds) => [
  {
    title: "Invisible Man Illusion Statue",
    slug: "invisible-man-illusion-statue",
    description: "A mind-bending 3D printed modern art sculpture of a man walking with a briefcase, featuring an incredible 'invisible' midsection. This optical illusion piece is a fantastic conversation starter for your modern living room or office desk.",
    category: categoryIds['Home Decor'],
    basePrice: 1499,
    images: ['/images/products/6.jpeg'],
    inventory: 10,
    weight: 200,
    dimensions: { length: 80, width: 80, height: 220 },
    isFeatured: true,
    isNewArrival: true
  },
  {
    title: "Jesus Christ Cross Devotional Statue",
    slug: "jesus-christ-cross-statue",
    description: "A beautifully detailed 3D printed white statue of Jesus Christ praying, set within a stylized cross frame. A serene and peaceful addition to your home altar or prayer room.",
    category: categoryIds['Home Decor'],
    basePrice: 999,
    images: ['/images/products/8.jpeg'],
    inventory: 20,
    weight: 150,
    dimensions: { length: 60, width: 40, height: 150 },
    isNewArrival: true
  },
  {
    title: "Father & Son Heart Silhouette Statue",
    slug: "father-son-heart-statue",
    description: "A touching and emotionally resonant 3D printed silhouette capturing the beautiful bond between a father and son. Featuring a unique heart-shaped cutout at the base and a natural beige finish, this piece makes a perfect Father's Day gift.",
    category: categoryIds['Personalized Gifts'],
    basePrice: 1299,
    images: ['/images/products/7.jpeg'],
    inventory: 15,
    weight: 200,
    dimensions: { length: 100, width: 60, height: 180 },
    isFeatured: true,
    isBestseller: true
  },
  {
    title: "Low-Poly Geometric Lion Wall Mount - White",
    slug: "low-poly-lion-wall-mount-white",
    description: "Add a touch of wild elegance to your walls with this minimalist low-poly 3D printed lion head. Finished in sleek matte white, it perfectly complements modern, Scandinavian, and minimalist interior decor styles.",
    category: categoryIds['Home Decor'],
    basePrice: 1899,
    images: ['/images/products/10.jpeg'],
    inventory: 12,
    weight: 450,
    dimensions: { length: 200, width: 100, height: 250 },
    isFeatured: true
  },
  {
    title: "Classic Mouse in Winter Sweater Model",
    slug: "classic-mouse-winter-sweater",
    description: "An adorable, highly detailed 3D printed model of a classic cartoon mouse wearing a cozy winter sweater. A nostalgic and charming addition to any desk, bookshelf, or kid's room. Ready to be painted or displayed in its pristine white finish.",
    category: categoryIds['Desk Accessories'],
    basePrice: 799,
    images: ['/images/products/9.jpeg'],
    inventory: 30,
    weight: 120,
    dimensions: { length: 80, width: 80, height: 150 },
    isNewArrival: true
  },
  {
    title: "Low-Poly Geometric Lion Wall Mount - Gold",
    slug: "low-poly-lion-wall-mount-gold",
    description: "Make a bold, luxurious statement with this striking golden low-poly 3D printed lion head wall mount. Perfect for adding a premium, artistic flair to your living space or office.",
    category: categoryIds['Home Decor'],
    basePrice: 1999,
    images: ['/images/products/11.jpeg'],
    inventory: 8,
    weight: 450,
    dimensions: { length: 200, width: 100, height: 250 },
    isFeatured: true,
    isBestseller: true
  },
  {
    title: "UNO Card Game Storage Box",
    slug: "uno-card-game-storage-box",
    description: "Keep your UNO cards safe and organized with this custom 3D printed storage box! Shaped like a mini briefcase with the classic UNO logo, it's durable and perfect for travel or game nights.",
    category: categoryIds['Gaming Accessories'],
    basePrice: 499,
    images: ['/images/products/12.jpeg'],
    inventory: 40,
    weight: 90,
    dimensions: { length: 110, width: 80, height: 35 },
    isNewArrival: true
  },
  {
    title: "Lord Shiva Trident Wall Relief",
    slug: "lord-shiva-trident-wall-relief",
    description: "A stunning 3D printed wall relief of Lord Shiva holding his Trishul. Crafted in a sleek black finish, this geometric backplate design adds a modern touch to divine home decor.",
    category: categoryIds['Home Decor'],
    basePrice: 1599,
    images: ['/images/products/13.jpeg'],
    inventory: 20,
    weight: 400,
    dimensions: { length: 150, width: 25, height: 250 },
    isFeatured: true
  },
  {
    title: "Ayodhya Ram Mandir 3D Model",
    slug: "ayodhya-ram-mandir-3d-model",
    description: "An intricately detailed 3D printed scale model of the majestic Ayodhya Ram Mandir. A perfect spiritual centerpiece for your home or pooja room.",
    category: categoryIds['Home Decor'],
    basePrice: 1999,
    images: ['/images/products/14.jpeg'],
    inventory: 10,
    weight: 600,
    dimensions: { length: 180, width: 140, height: 160 },
    isBestseller: true
  },
  {
    title: "Sports Motorcycle 3D Model",
    slug: "sports-motorcycle-3d-model",
    description: "A highly detailed 3D printed model of a modern sports motorcycle. Unpainted grey finish allows for custom painting or displaying its raw 3D printed texture.",
    category: categoryIds['Desk Accessories'],
    basePrice: 899,
    images: ['/images/products/15.jpeg'],
    inventory: 15,
    weight: 250,
    dimensions: { length: 200, width: 80, height: 120 },
    isNewArrival: true
  },
  {
    title: "Meditating Lord Shiva Statue",
    slug: "meditating-lord-shiva-statue",
    description: "Bring peace and divine energy to your space with this stunning, highly detailed 3D printed statue of Lord Shiva meditating on a tiger skin. Crafted with precision, it features an elegant marble-like finish perfect for your pooja room, dashboard, or office desk.",
    category: categoryIds['Home Decor'],
    basePrice: 1999,
    images: ['/images/products/1.jpeg'],
    inventory: 15,
    weight: 350,
    dimensions: { length: 120, width: 100, height: 200 },
    isFeatured: true,
    isBestseller: true
  },
  {
    title: "FIFA World Cup Can Holder Coozie",
    slug: "fifa-world-cup-can-holder",
    description: "Celebrate every match in style! This 3D printed can holder is intricately designed to replicate the iconic FIFA World Cup trophy. It perfectly fits standard 330ml soda and beer cans, keeping your beverage cool while you lift the trophy.",
    category: categoryIds['Personalized Gifts'],
    basePrice: 899,
    images: ['/images/products/2.jpeg'],
    inventory: 50,
    weight: 180,
    dimensions: { length: 90, width: 90, height: 150 },
    isBestseller: true
  },
  {
    title: "Lord Ganesha Idols (Set of 3 Finishes)",
    slug: "lord-ganesha-idols-set",
    description: "A gorgeous set of 3D printed Lord Ganesha idols, representing wisdom, success, and good fortune. This listing includes a beautifully detailed idol available in premium gold, matte white, or sleek obsidian black finishes.",
    category: categoryIds['Home Decor'],
    basePrice: 1499,
    images: ['/images/products/3.jpeg'],
    inventory: 30,
    weight: 250,
    dimensions: { length: 80, width: 80, height: 120 },
    isNewArrival: true
  },
  {
    title: "Father & Daughter Heart Silhouette Statue",
    slug: "father-daughter-heart-statue",
    description: "A beautiful, emotionally resonant 3D printed silhouette capturing the tender bond between a father and daughter. Featuring a unique heart-shaped cutout at the base, this piece makes a perfect Father's Day gift or a touching centerpiece for any family home.",
    category: categoryIds['Personalized Gifts'],
    basePrice: 1299,
    images: ['/images/products/4.jpeg'],
    inventory: 10,
    weight: 200,
    dimensions: { length: 100, width: 60, height: 180 },
    isFeatured: true
  },
  {
    title: "Minimalist Remote Control & Organiser Holder",
    slug: "minimalist-remote-holder",
    description: "Keep your living room tidy and stylish with this sleek, 3D printed minimalist remote control organizer. Designed with clean lines and a smooth finish, it features multiple compartments to hold your TV remotes, pens, and other small desk accessories.",
    category: categoryIds['Desk Accessories'],
    basePrice: 599,
    images: ['/images/products/5.jpeg'],
    inventory: 25,
    weight: 150,
    dimensions: { length: 150, width: 80, height: 100 },
    isNewArrival: true,
    isFeatured: true
  }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/layerly';
    await mongoose.connect(mongoUri);
    console.log('Seed: Connected to DB.');

    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    await User.deleteMany({});

    console.log('Seed: Cleared old documents.');

    const adminUser = new User({
      name: 'Layerly Admin',
      email: 'admin@layerly.com',
      password: 'adminpassword123',
      role: 'admin',
      isEmailVerified: true
    });
    await adminUser.save();

    const customerUser = new User({
      name: 'John Doe',
      email: 'john@gmail.com',
      password: 'customerpassword123',
      role: 'customer',
      isEmailVerified: true,
      addresses: [
        {
          street: '123 Luxury Lane, MG Road',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India',
          isDefault: true
        }
      ]
    });
    await customerUser.save();
    console.log('Seed: Created Admin and Customer.');

    const categoryIds = {};
    for (const cat of categoriesData) {
      const dbCat = new Category(cat);
      await dbCat.save();
      categoryIds[cat.name] = dbCat._id.toString();
    }
    console.log('Seed: Categories created.');

    const products = productsData(categoryIds);
    for (const prod of products) {
      const dbProd = new Product(prod);
      await dbProd.save();
    }
    console.log('Seed: Products created.');

    const coupon1 = new Coupon({
      code: 'CRAFT20',
      discountType: 'percentage',
      discountValue: 20,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: 500,
      active: true
    });
    await coupon1.save();

    const coupon2 = new Coupon({
      code: 'FIRST150',
      discountType: 'flat',
      discountValue: 150,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: 1000,
      active: true
    });
    await coupon2.save();
    console.log('Seed: Coupons created.');

    console.log('Database successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Seed execution error:', error);
    process.exit(1);
  }
};

// Execute if run directly
import { fileURLToPath } from 'url';
const nodePath = process.argv[1];
if (nodePath && (nodePath.includes('seeder.js') || nodePath.endsWith('seeder'))) {
  seedDatabase();
}

export { seedDatabase };
