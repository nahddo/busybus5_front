import AsyncStorage from "@react-native-async-storage/async-storage";

export type FavoriteItem = {
  id: string;
  label: string;
  type: "bus" | "stop";
};

type FavoritePayload = Omit<FavoriteItem, "id">;
type FavoriteListener = (items: FavoriteItem[]) => void;

const initialFavorites: FavoriteItem[] = [];

let favorites = initialFavorites;
let currentUserEmail: string | null = null;
const listeners = new Set<FavoriteListener>();

/**
 * 사용자별 즐겨찾기 데이터를 AsyncStorage에 저장하는 키 생성
 */
const getStorageKey = (email: string): string => {
  return `favorites_${email}`;
};

/**
 * AsyncStorage에서 사용자별 즐겨찾기 데이터 로드
 */
const loadFavoritesFromStorage = async (email: string): Promise<FavoriteItem[]> => {
  try {
    const key = getStorageKey(email);
    const data = await AsyncStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("즐겨찾기 데이터 로드 실패:", error);
    return [];
  }
};

/**
 * AsyncStorage에 사용자별 즐겨찾기 데이터 저장
 */
const saveFavoritesToStorage = async (email: string, items: FavoriteItem[]): Promise<void> => {
  try {
    const key = getStorageKey(email);
    await AsyncStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error("즐겨찾기 데이터 저장 실패:", error);
  }
};

/**
 * 사용자별 즐겨찾기 데이터 초기화 (로그인 시 호출)
 */
export const loadUserFavorites = async (email: string): Promise<void> => {
  currentUserEmail = email;
  favorites = await loadFavoritesFromStorage(email);
  notify();
};

/**
 * 즐겨찾기 데이터 초기화 (로그아웃 시 호출)
 */
export const clearFavorites = (): void => {
  currentUserEmail = null;
  favorites = [];
  notify();
};

const notify = () => {
  listeners.forEach((listener) => listener(favorites));
};

export const getFavorites = (): FavoriteItem[] => favorites;

export const subscribeFavorites = (listener: FavoriteListener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/**
 * 즐겨찾기 추가
 * 현재 로그인한 사용자의 데이터에 추가하고 AsyncStorage에 저장
 */
export const addFavorite = async (item: FavoritePayload): Promise<FavoriteItem> => {
  if (!currentUserEmail) {
    console.warn("로그인이 필요합니다.");
    throw new Error("로그인이 필요합니다.");
  }

  const existing = favorites.find((fav) => fav.label === item.label && fav.type === item.type);
  if (existing) {
    return existing;
  }

  const newFavorite: FavoriteItem = {
    id: `fav-${Date.now()}`,
    ...item,
  };
  favorites = [newFavorite, ...favorites];
  notify();
  
  // AsyncStorage에 저장
  await saveFavoritesToStorage(currentUserEmail, favorites);
  
  return newFavorite;
};

/**
 * 즐겨찾기 삭제
 * 현재 로그인한 사용자의 데이터에서 삭제하고 AsyncStorage에 저장
 */
export const removeFavorite = async (id: string): Promise<void> => {
  if (!currentUserEmail) {
    console.warn("로그인이 필요합니다.");
    return;
  }

  favorites = favorites.filter((fav) => fav.id !== id);
  notify();
  
  // AsyncStorage에 저장
  await saveFavoritesToStorage(currentUserEmail, favorites);
};
