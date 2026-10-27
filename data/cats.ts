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
  traits?: string[];
  variations?: { size: string; price: number }[];
}


export let CAT_DATA: CatItem[] = [];