import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screen Imports
import CartScreen, { CartItem } from './src/screens/shop/CartScreen';
import ChatScreen from './src/screens/user/ChatScreen';
import DetailsScreen from './src/screens/shop/DetailsScreen';
import GetStartedScreen from './src/screens/auth/GetStartedScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import LoginSignupScreen from './src/screens/auth/LoginSignupScreen';
import MainScreen from './src/screens/user/MainScreen';
import ProfileScreen from './src/screens/user/ProfileScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import Splash1Screen from './src/screens/auth/Splash1Screen';
import Splash2Screen from './src/screens/auth/Splash2Screen';
import Splash3Screen from './src/screens/auth/Splash3Screen';
import AdminAddCatScreen from './src/screens/admin/AdminAddCatScreen';
import AddProductScreen from './src/screens/admin/AddProductScreen'; 
import ProductDetailsScreen from './src/screens/shop/ProductDetailsScreen';
import NotificationScreen from './src/screens/user/NotificationScreen';
import FavoritesScreen from './src/screens/user/FavoritesScreen';
import AdoptionFormScreen from './src/screens/shop/AdoptionFormScreen';
import ExplorePetsScreen from './src/screens/shop/ExplorePetsScreen'; 

// Profile Sub-Screens
import SettingsScreen from './src/screens/user/SettingsScreen';
import MyOrdersScreen, { Order } from './src/screens/user/MyOrdersScreen';
import AddressScreen from './src/screens/user/AddressScreen';
import ChangePasswordScreen from './src/screens/shop/ChangePasswordScreen';
import HelpSupportScreen from './src/screens/user/HelpSupportScreen';
import PrivacyPolicyScreen from './src/screens/user/PrivacyPolicyScreen'; 
import TermsOfServiceScreen from './src/screens/user/TermsOfServiceScreen'; 

// Checkout Flow Imports
import PaymentScreen from './src/screens/shop/PaymentScreen';
import AddCardScreen from './src/screens/shop/AddCardScreen';
import OrderConfirmationScreen from './src/screens/shop/OrderConfirmationScreen';
import TrackOrderScreen from './src/screens/shop/TrackOrderScreen'; // <--- NEW IMPORT

import { colors } from './src/constants/theme';
import { AuthProvider } from './src/services/AuthContext';
import { CAT_DATA } from './src/data/cats';

export default function App() {
  const [screen, setScreen] = useState<string>('splash1');
  const [selectedPetId, setSelectedPetId] = useState<string>('1');
  
  // Lifted States
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Load saved cats from device storage on app startup
  useEffect(() => {
    const loadSavedCats = async () => {
      try {
        const stored = await AsyncStorage.getItem('saved_cats');
        if (stored) {
          const parsed = JSON.parse(stored);
          CAT_DATA.length = 0; 
          CAT_DATA.push(...parsed); 
        }
      } catch (e) {
        console.log('Error loading saved cats:', e);
      }
    };
    loadSavedCats();
  }, []);

  const go = (next: string, id?: string) => {
    setScreen(next);
    if (id) {
      setSelectedPetId(id);
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        {screen === 'splash1' && <Splash1Screen go={go} />}
        {screen === 'splash2' && <Splash2Screen go={go} />}
        {screen === 'splash3' && <Splash3Screen go={go} />}
        {screen === 'getStarted' && <GetStartedScreen go={go} />}
        {screen === 'loginSignup' && <LoginSignupScreen go={go} />}
        {screen === 'login' && <LoginScreen go={go} />}
        {screen === 'signup' && <SignUpScreen go={go} />}
        
        {(screen === 'main' || screen === 'home') && (
          <MainScreen go={go} favorites={favorites} toggleFavorite={toggleFavorite} />
        )}
        
        {screen === 'explorePets' && (
          <ExplorePetsScreen go={go} favorites={favorites} toggleFavorite={toggleFavorite} />
        )}
        
        {screen === 'chat' && <ChatScreen go={go} />}
        {screen === 'cart' && (
          <CartScreen go={go} cartItems={cartItems} setCartItems={setCartItems} />
        )}
        {screen === 'profile' && <ProfileScreen go={go} />}
        
        {screen === 'settings' && <SettingsScreen go={go} />}
        {screen === 'myOrders' && <MyOrdersScreen go={go} orders={orders} />}
        {screen === 'address' && <AddressScreen go={go} />}
        {screen === 'changePassword' && <ChangePasswordScreen go={go} />}
        {screen === 'helpSupport' && <HelpSupportScreen go={go} />}
        {screen === 'privacyPolicy' && <PrivacyPolicyScreen go={go} />}
        {screen === 'termsOfService' && <TermsOfServiceScreen go={go} />}
        
        {screen === 'adminAddCat' && <AdminAddCatScreen go={go} />}
        {screen === 'adminAddProduct' && <AddProductScreen go={go} />}
        
        {screen === 'notifications' && <NotificationScreen go={go} />} 
        
        {screen === 'favorites' && (
          <FavoritesScreen go={go} favorites={favorites} toggleFavorite={toggleFavorite} />
        )} 
        
        {screen === 'adoptionForm' && <AdoptionFormScreen go={go} id={selectedPetId} />} 
        
        {screen === 'details' && <DetailsScreen go={go} id={selectedPetId} />}
        {screen === 'productDetails' && (
          <ProductDetailsScreen go={go} productId={selectedPetId} cartItems={cartItems} setCartItems={setCartItems} />
        )}

        {screen === 'payment' && <PaymentScreen go={go} />}
        {screen === 'addCard' && <AddCardScreen go={go} />}
        
        {/* Pass dependencies to Order Confirmation to finalize checkout */}
        {screen === 'orderConfirmation' && (
          <OrderConfirmationScreen 
            go={go} 
            orders={orders} 
            cartItems={cartItems} 
            setCartItems={setCartItems} 
            setOrders={setOrders} 
          />
        )}

        {/* New Screen for animation tracking */}
        {screen === 'trackOrder' && <TrackOrderScreen go={go} />}
        
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mint },
});