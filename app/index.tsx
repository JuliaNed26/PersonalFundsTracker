import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { Link, router } from 'expo-router';

export default function HomePage() {
  return (
    <View>
      <Text>HomePage</Text>
      <Link href="/user">
        <Text>Go to user page</Text>
      </Link>
      <Pressable onPress={() => router.push('/user')}>
        <Text>Go to user page 2</Text>
      </Pressable>
    </View>
  );
}
