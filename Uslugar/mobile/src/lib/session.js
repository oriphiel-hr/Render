import AsyncStorage from '@react-native-async-storage/async-storage';

export const SESSION_KEYS = ['token', 'user', 'apiBaseUrl'];

export async function readSession() {
  const entries = await AsyncStorage.multiGet(SESSION_KEYS);
  return Object.fromEntries(entries);
}

export async function writeSession({ token, user, apiBaseUrl }) {
  await AsyncStorage.multiSet([
    ['token', token || ''],
    ['user', JSON.stringify(user || {})],
    ['apiBaseUrl', apiBaseUrl || '']
  ]);
}

export async function clearSession() {
  await AsyncStorage.multiRemove(SESSION_KEYS);
}

export async function writeUser(user) {
  await AsyncStorage.setItem('user', JSON.stringify(user || {}));
}
