import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme() {
  const system = useRNColorScheme();
  const [override, setOverride] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('themeOverride');
        if (stored === 'light' || stored === 'dark') setOverride(stored);
      } catch {}
    })();
  }, []);

  return override ?? (system ?? 'light');
}
