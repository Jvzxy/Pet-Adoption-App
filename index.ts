import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import { registerRootComponent } from 'expo';

// Global error handler to prevent release APK crash on unhandled errors
declare const ErrorUtils: {
  getGlobalHandler: () => (error: Error, isFatal?: boolean) => void;
  setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
} | undefined;

if (typeof ErrorUtils !== 'undefined') {
  const defaultHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    console.error('Captured by global error handler:', error?.message, error?.stack, 'isFatal:', isFatal);
    if (__DEV__ && defaultHandler) {
      defaultHandler(error, isFatal);
    }
  });
}

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
