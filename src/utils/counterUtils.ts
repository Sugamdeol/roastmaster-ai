
/**
 * Utility functions for handling counters in local storage
 */

const ROAST_COUNT_KEY = 'roastgpt-roast-count';
const EGO_CRUSHED_KEY = 'roastgpt-ego-crushed';

// Initialize counter from localStorage or set default value
export const getCounter = (key: string, defaultValue: number = 0): number => {
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      return Number(storedValue);
    }
  } catch (error) {
    console.error('Error accessing local storage:', error);
  }
  return defaultValue;
};

// Save counter value to localStorage
export const saveCounter = (key: string, value: number): void => {
  try {
    localStorage.setItem(key, String(value));
  } catch (error) {
    console.error('Error saving to local storage:', error);
  }
};

// Increment counter and return new value
export const incrementCounter = (key: string, increment: number = 1): number => {
  const currentValue = getCounter(key);
  const newValue = currentValue + increment;
  saveCounter(key, newValue);
  return newValue;
};

// Get roast count
export const getRoastCount = (): number => {
  return getCounter(ROAST_COUNT_KEY);
};

// Increment roast count
export const incrementRoastCount = (): number => {
  return incrementCounter(ROAST_COUNT_KEY);
};

// Get ego crushed count
export const getEgoCrushedCount = (): number => {
  return getCounter(EGO_CRUSHED_KEY);
};

// Increment ego crushed count
export const incrementEgoCrushedCount = (): number => {
  // Randomize the increment between 1-3 to make it more dynamic
  const increment = Math.floor(Math.random() * 3) + 1;
  return incrementCounter(EGO_CRUSHED_KEY, increment);
};
