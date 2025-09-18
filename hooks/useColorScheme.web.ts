import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [override, setOverride] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    setHasHydrated(true);
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('themeOverride');
        if (stored === 'light' || stored === 'dark') setOverride(stored);
      } catch {}
    })();
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return override ?? colorScheme ?? 'light';
  }

  return override ?? 'light';
}
