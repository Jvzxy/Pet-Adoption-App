import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ConsentBanner from './src/components/ConsentBanner';

// Screen Imports
import CartScreen from './src/screens/shop/CartScreen';
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
import AdminPetsScreen from './src/screens/admin/AdminPetsScreen';
import AddProductScreen from './src/screens/admin/AddProductScreen'; 
import AdminDeliveriesScreen from './src/screens/admin/AdminDeliveriesScreen';
import AdminAdoptionsScreen from './src/screens/admin/AdminAdoptionsScreen';
import DriverDeliveriesScreen from './src/screens/admin/DriverDeliveriesScreen';
import DriverMapScreen from './src/screens/admin/DriverMapScreen';
import ProductDetailsScreen from './src/screens/shop/ProductDetailsScreen';
import NotificationScreen from './src/screens/user/NotificationScreen';
import FavoritesScreen from './src/screens/user/FavoritesScreen';
import AdoptionFormScreen from './src/screens/shop/AdoptionFormScreen';
import ExplorePetsScreen from './src/screens/shop/ExplorePetsScreen'; 

// Profile Sub-Screens
import SettingsScreen from './src/screens/user/SettingsScreen';
import MyOrdersScreen, { Order } from './src/screens/user/MyOrdersScreen';
import AddressScreen from './src/screens/user/AddressScreen';
import ChangePasswordScreen from './src/screens/auth/ChangePasswordScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import HelpSupportScreen from './src/screens/user/HelpSupportScreen';
import LegalScreen from './src/screens/user/LegalScreen';

// Checkout Flow Imports
import PaymentScreen from './src/screens/shop/PaymentScreen';
import AddCardScreen from './src/screens/shop/AddCardScreen';
import OrderConfirmationScreen from './src/screens/shop/OrderConfirmationScreen';
import TrackOrderScreen from './src/screens/shop/TrackOrderScreen';
import type { PaymentMethod } from './src/services/paymentMethods';

import { AuthProvider, useAuth } from './src/services/AuthContext';
import { AppDataProvider, useAppData } from './src/services/AppDataContext';
import { AppPreferencesProvider, useAppPreferences, type AppColors } from './src/services/AppPreferencesContext';

function AdminRoute({
  go,
  children,
}: {
  go: (next: string) => void;
  children: React.ReactNode;
}) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.accessMessage}>
        <Text style={styles.accessMessageText}>Checking administrator access...</Text>
      </View>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <View style={styles.accessMessage}>
        <Text style={styles.accessMessageTitle}>Administrator access required</Text>
        <Text style={styles.accessMessageText}>
          This account does not currently have an admin profile. Run the latest supabase/schema.sql in the Supabase SQL Editor, then sign in again.
        </Text>
        <Pressable style={styles.accessMessageButton} onPress={() => go('profile')}>
          <Text style={styles.accessMessageButtonText}>Back to profile</Text>
        </Pressable>
      </View>
    );
  }

  return <>{children}</>;
}

function DriverRoute({
  go,
  children,
}: {
  go: (next: string) => void;
  children: React.ReactNode;
}) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.accessMessage}>
        <Text style={styles.accessMessageText}>Checking driver access...</Text>
      </View>
    );
  }

  if (user?.role !== 'driver') {
    return (
      <View style={styles.accessMessage}>
        <Text style={styles.accessMessageTitle}>Driver access required</Text>
        <Text style={styles.accessMessageText}>
          This account is not registered as a delivery driver. Ask an administrator to assign the driver role in Supabase.
        </Text>
        <Pressable style={styles.accessMessageButton} onPress={() => go('profile')}>
          <Text style={styles.accessMessageButtonText}>Back to profile</Text>
        </Pressable>
      </View>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <AppPreferencesProvider>
        <ThemedApp />
      </AppPreferencesProvider>
    </AuthProvider>
  );
}

function ThemedApp() {
  const { colors, loading } = useAppPreferences();
  const styles = createStyles(colors);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <AppDataProvider>
          <AppRouter />
          {loading && (
            <View style={[styles.preferenceLoading, StyleSheet.absoluteFill]}>
              <ActivityIndicator size="large" color={colors.ink} />
            </View>
          )}
        </AppDataProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

function AppRouter() {
  const [screen, setScreen] = useState<string>('splash1');
  const [selectedPetId, setSelectedPetId] = useState<string>('1');
  const [addressReturnTo, setAddressReturnTo] = useState('profile');
  const [legalReturnTo, setLegalReturnTo] = useState('settings');
  const [showConsentPreferences, setShowConsentPreferences] = useState(false);
  const hasAuthenticatedUser = useRef(false);
  const { user, loading: authLoading } = useAuth();
  const { favorites, cartItems, setCartItems, toggleFavorite } = useAppData();
  const [orders, setOrders] = useState<Order[]>([]);
  const [completedCheckoutOrder, setCompletedCheckoutOrder] = useState<Order | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('cod');

  useEffect(() => {
    if (authLoading) return;

    // Removed 'legal' from this list so authenticated users can view the policies
    const authScreens = new Set([
      'splash1',
      'splash2',
      'splash3',
      'getStarted',
      'loginSignup',
      'login',
      'signup',
      'forgotPassword'
    ]);

    if (user) {
      hasAuthenticatedUser.current = true;
      if (authScreens.has(screen)) setScreen('main');
      return;
    }

    if (hasAuthenticatedUser.current || !authScreens.has(screen)) {
      setScreen('login');
    }
  }, [authLoading, screen, user]);

  const go = (next: string, id?: string) => {
    if (next === 'address') setAddressReturnTo(screen);
    if (next === 'legal') setLegalReturnTo(screen);
    if (next === 'payment') setCompletedCheckoutOrder(null);
    setScreen(next);
    if (id) {
      setSelectedPetId(id);
    }
  };

  return (
    <>
        {screen === 'splash1' && <Splash1Screen go={go} />}
        {screen === 'splash2' && <Splash2Screen go={go} />}
        {screen === 'splash3' && <Splash3Screen go={go} />}
        {screen === 'getStarted' && <GetStartedScreen go={go} />}
        {screen === 'loginSignup' && <LoginSignupScreen go={go} />}
        {screen === 'login' && <LoginScreen go={go} />}
        {screen === 'forgotPassword' && <ForgotPasswordScreen go={go} />}
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
        
        {screen === 'settings' && (
          <SettingsScreen
            go={go}
            onManagePrivacyChoices={() => setShowConsentPreferences(true)}
          />
        )}
        {screen === 'myOrders' && (
          user?.role === 'user'
            ? <MyOrdersScreen go={go} />
            : <ProfileScreen go={go} />
        )}
        {screen === 'address' && <AddressScreen go={go} returnTo={addressReturnTo} />}
        {screen === 'changePassword' && <ChangePasswordScreen go={go} />}
        {screen === 'helpSupport' && <HelpSupportScreen go={go} />}
        {screen === 'legal' && <LegalScreen go={go} returnTo={legalReturnTo} />}
        
        {screen === 'adminAddCat' && (
          <AdminRoute go={go}>
            <AdminAddCatScreen go={go} />
          </AdminRoute>
        )}
        {screen === 'adminPets' && (
          <AdminRoute go={go}>
            <AdminPetsScreen go={go} />
          </AdminRoute>
        )}
        {screen === 'adminAddProduct' && (
          <AdminRoute go={go}>
            <AddProductScreen go={go} />
          </AdminRoute>
        )}
        {screen === 'adminDeliveries' && (
          <AdminRoute go={go}>
            <AdminDeliveriesScreen go={go} />
          </AdminRoute>
        )}
        {screen === 'adminAdoptions' && (
          <AdminRoute go={go}>
            <AdminAdoptionsScreen go={go} />
          </AdminRoute>
        )}
        {screen === 'driverDeliveries' && (
          <DriverRoute go={go}>
            <DriverDeliveriesScreen go={go} />
          </DriverRoute>
        )}
        {screen === 'driverMap' && (
          <DriverRoute go={go}>
            <DriverMapScreen go={go} orderId={selectedPetId} />
          </DriverRoute>
        )}
        
        {screen === 'notifications' && <NotificationScreen go={go} />} 
        
        {screen === 'favorites' && (
          <FavoritesScreen go={go} favorites={favorites} toggleFavorite={toggleFavorite} />
        )} 
        
        {screen === 'adoptionForm' && <AdoptionFormScreen go={go} id={selectedPetId} />} 
        
        {screen === 'details' && <DetailsScreen go={go} id={selectedPetId} />}
        {screen === 'productDetails' && (
          <ProductDetailsScreen go={go} productId={selectedPetId} />
        )}

        {screen === 'payment' && (
          <PaymentScreen
            go={go}
            onPaymentComplete={(order) => {
              setCompletedCheckoutOrder(order);
              setOrders((previous) => [order, ...previous.filter((item) => item.id !== order.id)]);
            }}
            selectedPaymentMethod={selectedPaymentMethod}
            setSelectedPaymentMethod={setSelectedPaymentMethod}
          />
        )}
        {screen === 'addCard' && <AddCardScreen go={go} />}
        
        {screen === 'orderConfirmation' && (
          <OrderConfirmationScreen 
            go={go} 
            orders={orders} 
            cartItems={cartItems} 
            setCartItems={setCartItems} 
            setOrders={setOrders} 
            paymentMethod={selectedPaymentMethod}
            initialOrder={completedCheckoutOrder}
          />
        )}

        {screen === 'trackOrder' && <TrackOrderScreen go={go} orderId={selectedPetId} />}

        <ConsentBanner
          onOpenPolicies={() => go('legal')}
          forceVisible={showConsentPreferences}
          onChoiceSaved={() => setShowConsentPreferences(false)}
        />
    </>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  preferenceLoading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  accessMessage: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28, backgroundColor: colors.background },
  accessMessageTitle: { marginBottom: 8, color: colors.ink, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  accessMessageText: { color: colors.ink, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  accessMessageButton: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, backgroundColor: colors.isDark ? colors.mint : colors.ink },
  accessMessageButtonText: { color: colors.isDark ? colors.ink : '#FFFFFF', fontWeight: '800' },
});