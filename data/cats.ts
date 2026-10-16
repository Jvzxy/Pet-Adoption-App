export interface CatItem {
  id: string;
  name: string;
  category: 'Breed' | 'Toys' | 'Accessories';
  type: 'pet' | 'product';
  breed?: string;
  age?: string;
  gender?: string;
  location?: string;
  price: string;
  description: string;
  imageUri: string;
  weight?: string;
  height?: string;
  health?: string;
  variations?: { size: string; price: number }[];
}

export const CAT_DATA: CatItem[] = [
  // --- PETS (Category: Breed) ---
  {
    id: '1',
    name: 'Snow',
    category: 'Breed',
    type: 'pet',
    breed: 'British Shorthair',
    age: '2 months',
    gender: 'Male',
    location: 'Cagayan de Oro City',
    price: '$250',
    description:
      'Snow is a calm, playful, and gentle British Shorthair kitten. Loves cozy naps and soft cuddles.',
    imageUri:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    name: 'Luna',
    category: 'Breed',
    type: 'pet',
    breed: 'Tabby Kitten',
    age: '3 months',
    gender: 'Female',
    location: 'Cagayan de Oro City',
    price: '$180',
    description:
      'Luna is full of energetic curiosity! She loves chasing string toys and greeting everyone with soft meows.',
    imageUri:
      'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    name: 'Shadow',
    category: 'Breed',
    type: 'pet',
    breed: 'Bombay Cat',
    age: '4 months',
    gender: 'Male',
    location: 'Cagayan de Oro City',
    price: '$220',
    description:
      'Shadow has a sleek black coat and striking golden eyes. Very affectionate and loyal companion.',
    imageUri:
      'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    name: 'Bella',
    category: 'Breed',
    type: 'pet',
    breed: 'Persian White',
    age: '2.5 months',
    gender: 'Female',
    location: 'Cagayan de Oro City',
    price: '$300',
    description:
      'Bella is a fluffy, high-maintenance beauty who loves lap lounging and gentle grooming sessions.',
    imageUri:
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '5',
    name: 'Oliver',
    category: 'Breed',
    type: 'pet',
    breed: 'Scottish Fold',
    age: '3.5 months',
    gender: 'Male',
    location: 'Cagayan de Oro City',
    price: '$280',
    description:
      'Oliver has signature folded ears and an adorable round face. Super friendly with kids and other pets.',
    imageUri:
      'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '6',
    name: 'Cleo',
    category: 'Breed',
    type: 'pet',
    breed: 'Siamese Purebred',
    age: '5 months',
    gender: 'Female',
    location: 'Cagayan de Oro City',
    price: '$310',
    description:
      'Cleo is vocal, highly intelligent, and loves being the center of attention wherever she goes.',
    imageUri:
      'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=800&q=80',
  },

  // --- PRODUCTS (Category: Accessories) ---
  {
    id: '7',
    name: 'Friskies',
    category: 'Accessories',
    type: 'product',
    price: '₱300.00',
    description:
      'Purina Friskies Gravy Swirlers is a dry cat food formula featuring the savory flavors of chicken and salmon, with savory chicken-flavored gravy baked directly into every crunchy kibble piece. Formulated to deliver 100% complete and balanced nutrition for cats of all life stages (from kittens to adults), it combines the crunch of dry kibble with the rich taste of wet gravy.',
    imageUri:
      'https://m.media-amazon.com/images/I/81M1v8uLgCL.jpg',
    variations: [
      { size: 'Small', price: 300.0 },
      { size: 'Medium', price: 800.0 },
      { size: 'Large', price: 1300.0 },
    ],
  },
  {
    id: '8',
    name: 'Cute Pink Collar',
    category: 'Accessories',
    type: 'product',
    price: '₱350.00',
    description: 'Adjustable cute pink collar with bell for safety and style.',
    imageUri:
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80',
    variations: [
      { size: 'Small', price: 350.0 },
      { size: 'Medium', price: 450.0 },
    ],
  },

  // --- PRODUCTS (Category: Toys) ---
  {
    id: '9',
    name: 'Feather Wand Toy',
    category: 'Toys',
    type: 'product',
    price: '₱250.00',
    description: 'Interactive teaser wand toy to keep your kitten active and entertained for hours.',
    imageUri:
      'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=800&q=80',
    variations: [
      { size: 'Standard', price: 250.0 },
    ],
  },
];