export interface CatItem {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender: string;
  location: string;
  price: string;
  description: string;
  imageUri: string;
  weight?: string;
  height?: string;
  health?: string;
}

export const CAT_DATA: CatItem[] = [
  {
    id: '1',
    name: 'Snow',
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
];
