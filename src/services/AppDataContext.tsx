import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { supabase } from './supabaseClient';
import type { CatItem } from '../data/cats';
import type { CartItem } from '../screens/shop/CartScreen';

interface AppDataContextValue {
  catalogItems: CatItem[];
  favorites: string[];
  cartItems: CartItem[];
  loading: boolean;
  refreshCatalog: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function mapCatalogRow(row: Record<string, unknown>): CatItem {
  const rowType = row.type === 'pet' ? 'pet' : 'product';
  const rawVariations = Array.isArray(row.variations) ? row.variations : [];
  const variations = rawVariations
    .filter((variation): variation is Record<string, unknown> =>
      typeof variation === 'object' && variation !== null,
    )
    .map((variation) => ({
        size: String(variation.size ?? 'Standard'),
        price: Number(variation.price),
      }))
    .filter((variation) => Number.isFinite(variation.price) && variation.price >= 0);
  const price = Number(row.price ?? 0);
  const category = rowType === 'pet'
    ? 'Pet'
    : row.category === 'Accessories' ? 'Accessories' : 'Toys';

  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    category,
    type: rowType,
    breed: asOptionalString(row.breed),
    age: asOptionalString(row.age),
    gender: asOptionalString(row.gender),
    location: asOptionalString(row.location),
    price: row.type === 'pet'
      ? price === 0 ? 'Free' : `₱${price.toFixed(2)}`
      : variations.length
        ? `From ₱${Math.min(...variations.map((item) => item.price)).toFixed(2)}`
        : `₱${price.toFixed(2)}`,
    description: String(row.description ?? ''),
    imageUri: String(row.image_url ?? ''),
    weight: asOptionalString(row.weight),
    height: asOptionalString(row.height),
    health: asOptionalString(row.health),
    traits: Array.isArray(row.traits)
      ? row.traits.filter((trait): trait is string => typeof trait === 'string')
      : [],
    variations,
  };
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [catalogItems, setCatalogItems] = useState<CatItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartItems, setCartItemsState] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);
  const cartRef = useRef<CartItem[]>([]);
  const cartWriteQueue = useRef<Promise<void>>(Promise.resolve());

  const refreshCatalog = useCallback(async () => {
    const { data, error } = await supabase
      .from('catalog_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Could not load catalog:', error.message);
      throw error;
    }

    setCatalogItems((data ?? []).map((row) => mapCatalogRow(row)));
  }, []);

  useEffect(() => {
    let active = true;
    userIdRef.current = user?.id ?? null;
    cartRef.current = [];
    setCartItemsState([]);
    setFavorites([]);
    setLoading(true);

    const loadData = async () => {
      const catalogResult = await supabase
        .from('catalog_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (catalogResult.error) throw catalogResult.error;
      if (!active || userIdRef.current !== (user?.id ?? null)) return;

      setCatalogItems((catalogResult.data ?? []).map((row) => mapCatalogRow(row)));
      if (!user) {
        setFavorites([]);
        setCartItemsState([]);
        setLoading(false);
        return;
      }

      const [favoriteResult, cartResult] = await Promise.all([
        supabase.from('favorites').select('catalog_item_id'),
        supabase
          .from('cart_items')
          .select('catalog_item_id, variant, quantity, selected, catalog_items(*)'),
      ]);

      const queryError = favoriteResult.error || cartResult.error;
      if (queryError) throw queryError;
      if (!active || userIdRef.current !== user.id) return;

      setFavorites((favoriteResult.data ?? []).map((row) => row.catalog_item_id));

      const loadedCart = (cartResult.data ?? []).flatMap((row) => {
        const joined = row.catalog_items;
        const product = (Array.isArray(joined) ? joined[0] : joined) as Record<string, unknown> | null;
        if (!product || product.type !== 'product' || !product.available) return [];

        const variants = Array.isArray(product.variations) ? product.variations : [];
        const variantIndex = Math.max(0, variants.findIndex((item: Record<string, unknown>) => item.size === row.variant));
        const selectedVariant = variants[variantIndex];
        const price = selectedVariant ? Number(selectedVariant.price) : Number(product.price);

        return [{
          id: `${product.id}-${variantIndex}`,
          title: String(product.name ?? ''),
          subtitle: `Size: ${row.variant}`,
          price,
          image: String(product.image_url ?? ''),
          selected: row.selected === true,
          quantity: Number(row.quantity),
        }];
      });

      cartRef.current = loadedCart;
      setCartItemsState(loadedCart);
      setLoading(false);
    };

    void loadData().catch((error: unknown) => {
      console.error('Could not load account data:', error);
      if (active) {
        setLoading(false);
        Alert.alert(
          'Account data unavailable',
          error instanceof Error ? error.message : 'Could not load your account data from Supabase.',
        );
      }
    });

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`catalog-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'catalog_items' }, () => {
        void refreshCatalog().catch((error: unknown) => {
          console.error('Could not refresh the catalog:', error);
          Alert.alert(
            'Catalog refresh failed',
            error instanceof Error ? error.message : 'Could not refresh catalog items from Supabase.',
          );
        });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refreshCatalog, user]);

  const persistCart = useCallback((nextItems: CartItem[], ownerId: string) => {
    const databaseItems = nextItems.map((item) => {
      const separator = item.id.lastIndexOf('-');
      const catalogItemId = separator > 0 ? item.id.slice(0, separator) : item.id;
      return {
        catalog_item_id: catalogItemId,
        variant: item.subtitle.replace(/^Size:\s*/, '') || 'Standard',
        quantity: item.quantity,
        selected: item.selected,
      };
    });

    cartWriteQueue.current = cartWriteQueue.current
      .catch(() => undefined)
      .then(async () => {
        if (userIdRef.current !== ownerId) return;
        const { error } = await supabase.rpc('save_my_cart', { p_items: databaseItems });
        if (error) throw error;
      })
      .catch((error: unknown) => {
        console.error('Could not save cart:', error);
        Alert.alert('Cart not saved', error instanceof Error ? error.message : 'Could not save your cart.');
      });
  }, []);

  const setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>> = useCallback((action) => {
    const nextItems = typeof action === 'function'
      ? (action as (previous: CartItem[]) => CartItem[])(cartRef.current)
      : action;

    cartRef.current = nextItems;
    setCartItemsState(nextItems);
    const ownerId = userIdRef.current;
    if (ownerId) persistCart(nextItems, ownerId);
  }, [persistCart]);

  const toggleFavorite = useCallback(async (id: string) => {
    if (!userIdRef.current) {
      Alert.alert('Sign in required', 'Sign in to save favorites to your account.');
      return;
    }

    const ownerId = userIdRef.current;
    const wasFavorite = favorites.includes(id);
    setFavorites((previous) => wasFavorite
      ? previous.filter((itemId) => itemId !== id)
      : [...previous, id]);

    const result = wasFavorite
      ? await supabase.from('favorites').delete().eq('user_id', ownerId).eq('catalog_item_id', id)
      : await supabase.from('favorites').insert({ user_id: ownerId, catalog_item_id: id });

    if (result.error) {
      console.error('Could not update favorite:', result.error.message);
      setFavorites((previous) => wasFavorite
        ? [...previous, id]
        : previous.filter((itemId) => itemId !== id));
      Alert.alert('Favorite not saved', result.error.message);
    }
  }, [favorites]);

  return (
    <AppDataContext.Provider
      value={{ catalogItems, favorites, cartItems, loading, refreshCatalog, toggleFavorite, setCartItems }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within an AppDataProvider');
  return context;
}
