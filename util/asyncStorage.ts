import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to store data with types for value and key
const storeData = async (value: string, key: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.log(e);
  }
};

// Function to retrieve data, returns a promise with string or null
const getData = async (key: string): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value; // value can be null if the key doesn't exist
  } catch (e) {
    console.log(e);
    return null; // Return null in case of an error
  }
};

export { storeData, getData };
