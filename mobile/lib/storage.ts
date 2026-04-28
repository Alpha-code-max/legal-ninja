import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "ln_token";
const GUEST_KEY = "ln_guest";

export const getToken    = (): Promise<string | null> => SecureStore.getItemAsync(TOKEN_KEY);
export const setToken    = (t: string): Promise<void>  => SecureStore.setItemAsync(TOKEN_KEY, t);
export const deleteToken = (): Promise<void>           => SecureStore.deleteItemAsync(TOKEN_KEY);
export const isGuest     = async (): Promise<boolean>  => !!(await SecureStore.getItemAsync(GUEST_KEY));
export const setGuest    = (v: boolean): Promise<void> => v ? SecureStore.setItemAsync(GUEST_KEY, "1") : SecureStore.deleteItemAsync(GUEST_KEY);
export const clearGuest  = (): Promise<void>           => SecureStore.deleteItemAsync(GUEST_KEY);

export const storage = {
  getToken:    (): Promise<string | null> => SecureStore.getItemAsync(TOKEN_KEY),
  setToken:    (t: string): Promise<void>  => SecureStore.setItemAsync(TOKEN_KEY, t),
  deleteToken: (): Promise<void>           => SecureStore.deleteItemAsync(TOKEN_KEY),

  isGuest:    async (): Promise<boolean>  => !!(await SecureStore.getItemAsync(GUEST_KEY)),
  setGuest:   (v: boolean): Promise<void> => v ? SecureStore.setItemAsync(GUEST_KEY, "1") : SecureStore.deleteItemAsync(GUEST_KEY),
  clearGuest: (): Promise<void>           => SecureStore.deleteItemAsync(GUEST_KEY),

  get:    (key: string): Promise<string | null>          => SecureStore.getItemAsync(key),
  set:    (key: string, value: string): Promise<void>    => SecureStore.setItemAsync(key, value),
  delete: (key: string): Promise<void>                   => SecureStore.deleteItemAsync(key),
};
