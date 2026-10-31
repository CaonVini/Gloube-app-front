import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../src/presentation/auth/AuthProvider';
import { Button, Muted, Screen } from '../src/presentation/components/ui';

function RootStack() {
  const { status, retryBoot } = useAuth();

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (status === 'error') {
    return (
      <Screen>
        <Muted>Não foi possível conectar ao servidor. Verifique a conexão e a URL da API.</Muted>
        <Button title="Tentar novamente" onPress={retryBoot} />
      </Screen>
    );
  }

  const authed = status === 'authenticated';
  // Stack.Protected: rotas só existem para o estado correspondente (sem "piscar" a tela errada).
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!authed}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={authed}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootStack />
    </AuthProvider>
  );
}
