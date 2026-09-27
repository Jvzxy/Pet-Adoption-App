import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="splash2" />
      <Stack.Screen name="splash3" />
      <Stack.Screen name="get-started" />
      <Stack.Screen name="login-signup" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="home" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="details/[id]" options={{ presentation: 'card' }} />
    </Stack>
  );
}