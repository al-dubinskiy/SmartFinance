import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View, Text, ActivityIndicator } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message';

import { store, persistor } from './src/store/store';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useTheme } from './src/core/hooks/useTheme';
import firebaseService from './src/core/services/firebase.service';
import { useAppDispatch } from './src/store/hooks';
import { loginSuccess, logout } from './src/store/slices/authSlice';
import { database } from './src/database';
import { seedDefaultCategories } from './src/database/seed';

// Компонент для отслеживания состояния аутентификации
const AuthListener = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChanged((user) => {
      if (user) {
        dispatch(loginSuccess(user));
      } else {
        dispatch(logout());
      }
    });

    return unsubscribe;
  }, [dispatch]);

  return <>{children}</>;
};

// Компонент для инициализации базы данных
const DatabaseInitializer = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    const initDatabase = async () => {
      try {
        // WatermelonDB автоматически подключается при создании экземпляра
        // Просто заполняем начальные категории если нужно
        await seedDefaultCategories();
        setIsReady(true);
      } catch (error) {
        console.error('Database initialization error:', error);
      }
    };

    initDatabase();
  }, []);

  if (!isReady) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: colors.background 
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text.primary, marginTop: 16 }}>
          Initializing database...
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

// Основной компонент приложения
const AppContent = () => {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <NavigationContainer>
        <AuthListener>
          <DatabaseInitializer>
            <RootNavigator />
          </DatabaseInitializer>
        </AuthListener>
      </NavigationContainer>
      <Toast />
    </>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;