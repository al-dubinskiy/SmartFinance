import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

// Конфигурация Google Sign-In
GoogleSignin.configure({
  webClientId: Platform.select({
    ios: 'YOUR_IOS_CLIENT_ID', // Из GoogleService-Info.plist
    android: 'YOUR_ANDROID_CLIENT_ID', // Из google-services.json
  }),
});

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserProfile {
  displayName?: string;
  photoURL?: string;
}

class FirebaseService {
  // Регистрация по email/пароль
  async signUpWithEmail({ email, password }: UserCredentials, profile?: UserProfile) {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // Обновляем профиль если нужно
      if (profile?.displayName) {
        await userCredential.user.updateProfile({
          displayName: profile.displayName,
          photoURL: profile.photoURL || null,
        });
      }
      
      return {
        user: this.mapFirebaseUser(userCredential.user),
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleFirebaseError(error),
      };
    }
  }

  // Вход по email/пароль
  async signInWithEmail({ email, password }: UserCredentials) {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      
      return {
        user: this.mapFirebaseUser(userCredential.user),
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleFirebaseError(error),
      };
    }
  }

  // Вход через Google
  async signInWithGoogle() {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      return {
        user: this.mapFirebaseUser(userCredential.user),
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleFirebaseError(error),
      };
    }
  }

  // Сброс пароля
  async resetPassword(email: string) {
    try {
      await auth().sendPasswordResetEmail(email);
      return {
        success: true,
        message: 'Password reset email sent',
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleFirebaseError(error),
      };
    }
  }

  // Выход
  async signOut() {
    try {
      await auth().signOut();
      await GoogleSignin.signOut();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.handleFirebaseError(error),
      };
    }
  }

  // Текущий пользователь
  getCurrentUser() {
    const user = auth().currentUser;
    return user ? this.mapFirebaseUser(user) : null;
  }

  // Слушатель изменения состояния аутентификации
  onAuthStateChanged(callback: (user: any | null) => void) {
    return auth().onAuthStateChanged((user) => {
      callback(user ? this.mapFirebaseUser(user) : null);
    });
  }

  // Маппинг Firebase пользователя в нашего User
  private mapFirebaseUser(user: FirebaseAuthTypes.User) {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: user.metadata.creationTime || new Date().toISOString(),
    };
  }

  // Обработка ошибок Firebase
  private handleFirebaseError(error: any): string {
    const code = error.code;
    
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password';
      case 'auth/too-many-requests':
        return 'Too many attempts. Try again later';
      default:
        return error.message || 'An error occurred';
    }
  }
}

export default new FirebaseService();