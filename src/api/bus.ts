import api_client from "./client";

/**
 * 버스 실시간 데이터 타입 정의
 * 백엔드에서 받는 데이터 구조에 맞춤
 */
export type BusRealtimeData = {
  service_date: string;          // 서비스 날짜 (예: "2025-11-05")
  arrival_time: string;          // 도착 시간 (예: "2025-11-05 8:01")
  vehid1: string;                // 버스 ID (예: "230010040")
  station_num: string;           // 정류장 번호 (예: "2")
  remainseat_at_arrival: number; // 도착 시 잔여 좌석 수 (예: 40)
  routeid: string;              // 노선 ID (예: "234001736")
  routename: string;             // 노선 이름/번호 (예: "3302")
  stationid: string;            // 정류장 ID (예: "234000384")
  crowded_level: number;         // 혼잡도 레벨 (1-4, 1=여유, 2=보통, 3=혼잡, 4=매우혼잡)
};

/**
 * 버스 노선별 실시간 데이터 조회
 * @param routeid 노선 ID (예: "234001736")
 * @param service_date 서비스 날짜 (예: "2025-11-05")
 * @param time_slot 시간대 (예: "8:00")
 * @returns 해당 노선의 모든 정류장별 실시간 데이터 배열
 */
export const getBusRealtimeData = async (
  routeid: string,
  service_date: string,
  time_slot: string
): Promise<BusRealtimeData[]> => {
  try {
    const response = await api_client.get<BusRealtimeData[]>("/bus/realtime/", {
      params: {
        routeid,
        service_date,
        time_slot,
      },
    });

    return response.data;
  } catch (error: any) {
    // 에러 발생 시 빈 배열 반환 (프론트엔드가 에러 없이 동작하도록)
    console.error("버스 실시간 데이터 조회 실패:", error);
    return [];
  }
};

/**
 * 정류장별 실시간 데이터 조회
 * @param stationid 정류장 ID (예: "234000384")
 * @param service_date 서비스 날짜 (예: "2025-11-05")
 * @param time_slot 시간대 (예: "8:00")
 * @returns 해당 정류장을 지나가는 모든 버스의 실시간 데이터 배열
 */
export const getStationRealtimeData = async (
  stationid: string,
  service_date: string,
  time_slot: string
): Promise<BusRealtimeData[]> => {
  try {
    const response = await api_client.get<BusRealtimeData[]>("/station/realtime/", {
      params: {
        stationid,
        service_date,
        time_slot,
      },
    });

    return response.data;
  } catch (error: any) {
    // 에러 발생 시 빈 배열 반환 (프론트엔드가 에러 없이 동작하도록)
    console.error("정류장 실시간 데이터 조회 실패:", error);
    return [];
  }
};

/**
 * 혼잡도 레벨을 문자열로 변환
 * @param level 혼잡도 레벨 (1-4)
 * @returns 혼잡도 문자열 ("empty" | "normal" | "crowded" | "veryCrowded")
 */
export const getCongestionLevel = (level: number): "empty" | "normal" | "crowded" | "veryCrowded" => {
  switch (level) {
    case 1:
      return "empty";      // 여유
    case 2:
      return "normal";     // 보통
    case 3:
      return "crowded";    // 혼잡
    case 4:
      return "veryCrowded"; // 매우 혼잡
    default:
      return "normal";
  }
};

/**
 * 좌석 예측 API 응답 타입
 */
export type PredictSeatResponse = {
  routeid: number;
  select_time: number;
  predictions: {
    routeid: number;
    station_num: number;
    slot_index: number;
    remainseat_pred: number;
  }[];
  error?: string;
};

export const predictSeat = async (
  routeid: number,
  select_time: number   // 0~7
): Promise<PredictSeatResponse> => {
  try {
    const response = await api_client.get<PredictSeatResponse>("/predict-seat/", {
      params: {
        routeid,
        select_time,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};
