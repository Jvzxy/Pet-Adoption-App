import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screen Imports
import CartScreen from './screens/CartScreen';
import ChatScreen from './screens/ChatScreen';
import DetailsScreen from './screens/DetailsScreen';
import GetStartedScreen from './screens/GetStartedScreen';
import LoginScreen from './screens/LoginScreen';
import LoginSignupScreen from './screens/LoginSignupScreen';
import MainScreen from './screens/MainScreen';
import ProfileScreen from './screens/ProfileScreen';
import SignUpScreen from './screens/SignUpScreen';
import Splash1Screen from './screens/Splash1Screen';
import Splash2Screen from './screens/Splash2Screen';
import Splash3Screen from './screens/Splash3Screen';
import AdminAddCatScreen from './screens/AdminAddCatScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import NotificationScreen from './screens/NotificationScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import AdoptionFormScreen from './screens/AdoptionFormScreen'; // <-- Added AdoptionFormScreen import

// Checkout Flow Imports
import PaymentScreen from './screens/PaymentScreen';
import AddCardScreen from './screens/AddCardScreen';
import OrderConfirmationScreen from './screens/OrderConfirmationScreen';

import { colors } from './constants/theme';
import { AuthProvider } from './services/AuthContext';
import { CAT_DATA } from './data/cats';

export default function App() {
  const [screen, setScreen] = useState<string>('splash1');
  const [selectedPetId, setSelectedPetId] = useState<string>('1');

  // Load saved cats from device storage on app startup
  useEffect(() => {
    const loadSavedCats = async () => {
      try {
        const stored = await AsyncStorage.getItem('saved_cats');
        if (stored) {
          const parsed = JSON.parse(stored);
          CAT_DATA.length = 0; // Clear defaults
          CAT_DATA.push(...parsed); // Populate with stored cats
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

  return (
    <AuthProvider>
      <View style={styles.container}>
        {screen === 'splash1' && <Splash1Screen go={go} />}
        {screen === 'splash2' && <Splash2Screen go={go} />}
        {screen === 'splash3' && <Splash3Screen go={go} />}
        {screen === 'getStarted' && <GetStartedScreen go={go} />}
        {screen === 'loginSignup' && <LoginSignupScreen go={go} />}
        {screen === 'login' && <LoginScreen go={go} />}
        {screen === 'signup' && <SignUpScreen go={go} />}
        {(screen === 'main' || screen === 'home') && <MainScreen go={go} />}
        {screen === 'chat' && <ChatScreen go={go} />}
        {screen === 'cart' && <CartScreen go={go} />}
        {screen === 'profile' && <ProfileScreen go={go} />}
        {screen === 'adminAddCat' && <AdminAddCatScreen go={go} />}
        
        {/* Added Routes */}
        {screen === 'notifications' && <NotificationScreen go={go} />} 
        {screen === 'favorites' && <FavoritesScreen go={go} />} 
        {screen === 'adoptionForm' && <AdoptionFormScreen go={go} id={selectedPetId} />} 
        
        {/* Detail Screens */}
        {screen === 'details' && <DetailsScreen go={go} id={selectedPetId} />}
        {screen === 'productDetails' && <ProductDetailsScreen go={go} productId={selectedPetId} />}

        {/* Checkout Flow Screens */}
        {screen === 'payment' && <PaymentScreen go={go} />}
        {screen === 'addCard' && <AddCardScreen go={go} />}
        {screen === 'orderConfirmation' && <OrderConfirmationScreen go={go} />}
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mint,
  },
});