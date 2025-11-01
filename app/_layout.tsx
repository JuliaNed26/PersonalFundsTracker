import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: 'yellow',
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
