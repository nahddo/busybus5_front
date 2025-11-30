export async function getSeatPrediction(routeid: number, selectTime: number) {
  const url = `http://<YOUR_BACKEND_URL>/predict_seat?routeid=${routeid}&select_time=${selectTime}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Prediction API error");

  return await response.json();
}

##아직미완성입니다ㅠㅠ
#실시간버스위치는진짜실시간으로버스위치를의미하는줄알았고
#예측값은그냥샤용자가원할때노선이랑시간선택해서예측값볼수있는거를생각했습니다...
