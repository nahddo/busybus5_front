import React, { ReactElement, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getRouteIdsByRouteNm, getRouteStops, RouteStop } from "../data";
import { getBusRealtimeData, BusRealtimeData } from "../api/bus";

const ICONS = {
  reload: require("../../assets/images/station_search/Examples/reload.png"),
};

const COLOR = {
  bg: "#F7F7F6",
  card: "#FFFFFF",
  textPrimary: "#000000",
  border: "rgba(84,84,86,0.3)",
};

const BusRealtimeScreen = (): ReactElement => {
  const [busNumber, setBusNumber] = useState("3302");
  const [realtimeData, setRealtimeData] = useState<BusRealtimeData[]>([]);
  const [stops, setStops] = useState<RouteStop[]>([]);

  const fetchRealtime = async () => {
    const ids = getRouteIdsByRouteNm(busNumber);
    if (ids.length === 0) {
      setRealtimeData([]);
      return;
    }

    const routeId = ids[0];
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    try {
      const data = await getBusRealtimeData(routeId, dateStr, "7:00");
      setRealtimeData(data);
    } catch {
      setRealtimeData([]);
    }
  };

  useEffect(() => {
    setStops(getRouteStops(busNumber, 0));
  }, [busNumber]);

  useEffect(() => {
    fetchRealtime();
  }, [busNumber]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR.bg }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>실시간 버스 위치</Text>

        <View style={styles.row}>
          <TextInput
            value={busNumber}
            onChangeText={setBusNumber}
            placeholder="버스 번호"
            style={styles.input}
          />
          <TouchableOpacity onPress={fetchRealtime} style={styles.reload}>
            <Image source={ICONS.reload} style={{ width: 24, height: 24 }} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ marginTop: 20 }}>
          {stops.map((stop) => {
            const rt = realtimeData.find((d) => Number(d.station_num) === stop.order);
            const busHere = rt ? "🚌" : "·";

            return (
              <View key={stop.stationId} style={styles.stopRow}>
                <Text>{busHere}</Text>
                <Text style={{ marginLeft: 12 }}>{stop.stationName}</Text>
              </View>
            );
          })}
        </ScrollView>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.border,
    padding: 8,
  },
  reload: { padding: 8, marginLeft: 12 },
  stopRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
});

export default BusRealtimeScreen;
