import AsyncStorage from "@react-native-async-storage/async-storage";

export type SavedRouteItem = {
  id: string;
  from: string;
  to: string;
  detail: string;
  type: "bus" | "stop";
};

type SavedRoutePayload = Omit<SavedRouteItem, "id">;
type SavedRoutesListener = (routes: SavedRouteItem[]) => void;

const initialRoutes: SavedRouteItem[] = [];

let savedRoutes = initialRoutes;
let currentUserEmail: string | null = null;
const listeners = new Set<SavedRoutesListener>();

/**
 * 사용자별 저장된 경로 데이터를 AsyncStorage에 저장하는 키 생성
 */
const getStorageKey = (email: string): string => {
  return `savedRoutes_${email}`;
};

/**
 * AsyncStorage에서 사용자별 저장된 경로 데이터 로드
 */
const loadSavedRoutesFromStorage = async (email: string): Promise<SavedRouteItem[]> => {
  try {
    const key = getStorageKey(email);
    const data = await AsyncStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("저장된 경로 데이터 로드 실패:", error);
    return [];
  }
};

/**
 * AsyncStorage에 사용자별 저장된 경로 데이터 저장
 */
const saveSavedRoutesToStorage = async (email: string, routes: SavedRouteItem[]): Promise<void> => {
  try {
    const key = getStorageKey(email);
    await AsyncStorage.setItem(key, JSON.stringify(routes));
  } catch (error) {
    console.error("저장된 경로 데이터 저장 실패:", error);
  }
};

/**
 * 사용자별 저장된 경로 데이터 초기화 (로그인 시 호출)
 */
export const loadUserSavedRoutes = async (email: string): Promise<void> => {
  currentUserEmail = email;
  savedRoutes = await loadSavedRoutesFromStorage(email);
  listeners.forEach((listener) => listener(savedRoutes));
};

/**
 * 저장된 경로 데이터 초기화 (로그아웃 시 호출)
 */
export const clearSavedRoutes = (): void => {
  currentUserEmail = null;
  savedRoutes = [];
  listeners.forEach((listener) => listener(savedRoutes));
};

export const getSavedRoutes = (): SavedRouteItem[] => savedRoutes;

const isSameRoute = (a: SavedRouteItem, b: SavedRoutePayload): boolean => {
  return a.from === b.from && a.to === b.to && a.detail === b.detail && a.type === b.type;
};

/**
 * 저장된 경로 추가
 * 현재 로그인한 사용자의 데이터에 추가하고 AsyncStorage에 저장
 */
export const addSavedRoute = async (route: SavedRoutePayload): Promise<SavedRouteItem> => {
  if (!currentUserEmail) {
    console.warn("로그인이 필요합니다.");
    throw new Error("로그인이 필요합니다.");
  }

  const newRoute: SavedRouteItem = {
    id: `route-${Date.now()}`,
    ...route,
  };
  savedRoutes = [newRoute, ...savedRoutes];
  listeners.forEach((listener) => listener(savedRoutes));
  
  // AsyncStorage에 저장
  await saveSavedRoutesToStorage(currentUserEmail, savedRoutes);
  
  return newRoute;
};

/**
 * 저장된 경로 추가 (중복 체크)
 * 현재 로그인한 사용자의 데이터에 추가하고 AsyncStorage에 저장
 */
export const addSavedRouteIfNotExists = async (route: SavedRoutePayload): Promise<{ added: boolean; route: SavedRouteItem }> => {
  if (!currentUserEmail) {
    console.warn("로그인이 필요합니다.");
    throw new Error("로그인이 필요합니다.");
  }

  const existing = savedRoutes.find((item) => isSameRoute(item, route));
  if (existing) {
    return { added: false, route: existing };
  }
  const newRoute = await addSavedRoute(route);
  return { added: true, route: newRoute };
};

export const subscribeSavedRoutes = (listener: SavedRoutesListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * 저장된 경로 삭제
 * 현재 로그인한 사용자의 데이터에서 삭제하고 AsyncStorage에 저장
 */
export const removeSavedRoute = async (id: string): Promise<void> => {
  if (!currentUserEmail) {
    console.warn("로그인이 필요합니다.");
    return;
  }

  savedRoutes = savedRoutes.filter((route) => route.id !== id);
  listeners.forEach((listener) => listener(savedRoutes));
  
  // AsyncStorage에 저장
  await saveSavedRoutesToStorage(currentUserEmail, savedRoutes);
};
