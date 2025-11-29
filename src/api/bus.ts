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
  /**
   * TODO(백엔드 개발자용):
   * - 실제 엔드포인트 URL을 확인하여 경로를 수정하세요.
   *   예) /bus/realtime/ 또는 /bus/route/{routeid}/ 등
   * - 현재는 /bus/realtime/ 로 가정합니다.
   * - 쿼리 파라미터로 routeid, service_date, time_slot을 전달합니다.
   */
  const response = await api_client.get<BusRealtimeData[]>("/bus/realtime/", {
    params: {
      routeid,
      service_date,
      time_slot,
    },
  });

  return response.data;
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
  /**
   * TODO(백엔드 개발자용):
   * - 실제 엔드포인트 URL을 확인하여 경로를 수정하세요.
   *   예) /station/realtime/ 또는 /station/{stationid}/ 등
   * - 현재는 /station/realtime/ 로 가정합니다.
   * - 쿼리 파라미터로 stationid, service_date, time_slot을 전달합니다.
   */
  const response = await api_client.get<BusRealtimeData[]>("/station/realtime/", {
    params: {
      stationid,
      service_date,
      time_slot,
    },
  });

  return response.data;
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

