import axios from "axios";

//  Android 에뮬레이터에서 Django 서버(localhost)에 접근할 때 필수
const BASE_URL = "http://10.0.2.2:8000";

export async function fetchLiveBus(routeId, stations) {
  try {
    const res = await axios.post(`${BASE_URL}/api/bus/realtime/`, {
      routeId,
      stations,
    });

    return res.data;
  } catch (err) {
    console.error("실시간 버스 조회 실패:", err);
    throw err;
  }
}
