import { useState, useCallback } from 'react';
import type { CVData } from '../types/cv.types';
import { defaultCV } from '../data/defaultCV';

export function useLocalStorage(): [CVData, (data: CVData) => void] {
  const [data, setDataState] = useState<CVData>(defaultCV);

  const setData = useCallback((newData: CVData) => {
    setDataState(newData);
  }, []);

  return [data, setData];
}
