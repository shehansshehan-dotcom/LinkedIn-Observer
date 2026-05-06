import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock chrome storage for development preview
const mockStorage = {
  data: {} as Record<string, any>,
  get: (keys: string | string[] | Record<string, any> | null) => {
    return new Promise((resolve) => {
      if (typeof keys === 'string') {
        resolve({ [keys]: mockStorage.data[keys] });
      } else if (Array.isArray(keys)) {
        const result: Record<string, any> = {};
        keys.forEach(k => result[k] = mockStorage.data[k]);
        resolve(result);
      } else {
        resolve(mockStorage.data);
      }
    });
  },
  set: (items: Record<string, any>) => {
    return new Promise<void>((resolve) => {
      Object.assign(mockStorage.data, items);
      resolve();
    });
  }
};

export const chromeShim = {
  storage: {
    local: typeof chrome !== 'undefined' && chrome.storage ? chrome.storage.local : mockStorage
  },
  runtime: {
    sendMessage: (msg: any) => {
      console.log('Mock sendMessage:', msg);
      return Promise.resolve({ status: 'ok' });
    }
  }
};
