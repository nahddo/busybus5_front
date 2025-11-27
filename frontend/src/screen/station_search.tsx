import React, { ReactElement, useEffect, useState } from "react";
import { Image, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomTabBar from "../components/BottomTabBar";
import { NavigateHandler, ScreenName } from "../types/navigation";
import {
  getStationSearchState,
  setDepartureStation,
  subscribeStationSearch,
} from "../store/stationSearchStore";

type StationSearchProps = {
  currentScreen: ScreenName;
  onNavigate: NavigateHandler;
};

const ICONS = {
  cellular: require("../../assets/images/station_search/Examples/Cellular Connection.png"),
  wifi: require("../../assets/images/station_search/Examples/Wifi.png"),
  battery: require("../../assets/images/station_search/Examples/Battery.png"),
  bookmark: require("../../assets/images/station_search/Examples/Bookmark.png"),
  home: require("../../assets/images/station_search/Examples/Home.png"),
  search: require("../../assets/images/station_search/Examples/Search.png"),
  user: require("../../assets/images/station_search/Examples/User.png"),
  mapPin: require("../../assets/images/station_search/Examples/Map pin.png"),
  directionsBus: require("../../assets/images/station_search/Examples/directions_bus.png"),
  icon: require("../../assets/images/station_search/Examples/icon.png"),
};

type TimeSlot = "6:00" | "6:30" | "7:00" | "7:30" | "8:00" | "8:30";

const TIME_TABS: Array<{ id: TimeSlot; label: string }> = [
  { id: "6:00", label: "6:00" },
  { id: "6:30", label: "6:30" },
  { id: "7:00", label: "7:00" },
  { id: "7:30", label: "7:30" },
  { id: "8:00", label: "8:00" },
  { id: "8:30", label: "8:30" },
];

// 혼잡도 색상 정의
const CONGESTION_COLORS = {
  empty: "#78A2FF",    // 널널함 (파란색)
  normal: "#00D578",    // 보통 (초록색)
  crowded: "#FBBF4C",   // 혼잡 (노란색)
  veryCrowded: "#F55858", // 매우 혼잡 (빨간색)
};

// 각 버스별 정류장 혼잡도 데이터 (시간대별)
type CongestionLevel = "empty" | "normal" | "crowded" | "veryCrowded";

type BusRouteData = {
  id: string;
  number: string;
  station: string;
  busPosition: number;
  myPosition: number;
  congestionByTime: Record<TimeSlot, CongestionLevel[]>;
};

const BUS_ROUTES_DATA: BusRouteData[] = [
  {
    id: "1",
    number: "3302",
    station: "잠실",
    busPosition: 2,
    myPosition: 4,
    congestionByTime: {
      "6:00": ["empty", "empty", "empty", "normal", "normal", "crowded", "crowded", "normal"],
      "6:30": ["empty", "empty", "normal", "normal", "crowded", "veryCrowded", "veryCrowded", "crowded"],
      "7:00": ["empty", "normal", "normal", "crowded", "veryCrowded", "veryCrowded", "veryCrowded", "crowded"],
      "7:30": ["normal", "normal", "crowded", "veryCrowded", "veryCrowded", "veryCrowded", "crowded", "normal"],
      "8:00": ["normal", "crowded", "veryCrowded", "veryCrowded", "veryCrowded", "crowded", "normal", "empty"],
      "8:30": ["crowded", "veryCrowded", "veryCrowded", "veryCrowded", "crowded", "normal", "empty", "empty"],
    },
  },
  {
    id: "2",
    number: "9600",
    station: "강남",
    busPosition: 3,
    myPosition: 4,
    congestionByTime: {
      "6:00": ["empty", "empty", "normal", "normal", "normal", "empty", "empty", "empty"],
      "6:30": ["empty", "normal", "normal", "crowded", "crowded", "normal", "empty", "normal"],
      "7:00": ["empty", "normal", "crowded", "veryCrowded", "crowded", "normal", "empty", "normal"],
      "7:30": ["normal", "crowded", "veryCrowded", "veryCrowded", "crowded", "normal", "normal", "normal"],
      "8:00": ["crowded", "veryCrowded", "veryCrowded", "crowded", "normal", "normal", "normal", "empty"],
      "8:30": ["veryCrowded", "veryCrowded", "crowded", "normal", "normal", "empty", "empty", "empty"],
    },
  },
  {
    id: "3",
    number: "3201",
    station: "양재",
    busPosition: 1,
    myPosition: 4,
    congestionByTime: {
      "6:00": ["empty", "empty", "empty", "normal", "normal", "normal", "empty", "empty"],
      "6:30": ["empty", "empty", "normal", "normal", "crowded", "crowded", "normal", "empty"],
      "7:00": ["empty", "normal", "normal", "crowded", "veryCrowded", "crowded", "normal", "empty"],
      "7:30": ["normal", "normal", "crowded", "veryCrowded", "veryCrowded", "crowded", "normal", "normal"],
      "8:00": ["normal", "crowded", "veryCrowded", "veryCrowded", "crowded", "normal", "normal", "empty"],
      "8:30": ["crowded", "veryCrowded", "veryCrowded", "crowded", "normal", "normal", "empty", "empty"],
    },
  },
];

const COLOR = {
  bg: "#F7F7F6",
  card: "#FFFFFF",
  blue: "#007AFF",
  red: "#F55858",
  blueLight: "#78A2FF",
  grayDark: "#868782",
  grayLight: "#E6E6E6",
  textPrimary: "#000000",
  textSecondary: "#1E1E1E",
  border: "rgba(84, 84, 86, 0.34)",
  chipBg: "rgba(120, 120, 128, 0.12)",
  routeLine: "#E6E6E6",
  myPositionBg: "#000000",
};

/**
 * StationSearchScreen
 * 정류장 검색 화면을 Figma 디자인 기반으로 구성한다.
 */
const StationSearchScreen = ({ currentScreen, onNavigate }: StationSearchProps): ReactElement => {
  const [selectedTime, setSelectedTime] = useState<TimeSlot>("6:30");
  const [departureStationValue, setDepartureStationValue] = useState(
    getStationSearchState().departureStation
  );

  useEffect(() => {
    const unsubscribe = subscribeStationSearch((state) => {
      setDepartureStationValue(state.departureStation);
    });
    return unsubscribe;
  }, []);

  const handleDepartureChange = (value: string) => {
    setDepartureStationValue(value);
    setDepartureStation(value);
  };

  return (
    <SafeAreaView style={styles.safe_area}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <StatusHeader />
        <ScrollView contentContainerStyle={styles.scroll_content} showsVerticalScrollIndicator={false}>
          <DepartureField value={departureStationValue} onChange={handleDepartureChange} />
          <TimeFilterTabs selectedTime={selectedTime} onTimeSelect={setSelectedTime} />
          <BusRoutesSection selectedTime={selectedTime} />
        </ScrollView>
        <BottomTabBar currentScreen={currentScreen} onNavigate={onNavigate} />
      </View>
    </SafeAreaView>
  );
};

/**
 * StatusHeader
 * 상단 상태바 구성
 */
const StatusHeader = (): ReactElement => {
  return (
    <View style={styles.status_bar}>
      <Text style={styles.status_time}>9:41</Text>
      <View style={styles.status_icons}>
        <Image source={ICONS.cellular} style={styles.status_icon} resizeMode="contain" />
        <Image source={ICONS.wifi} style={styles.status_icon} resizeMode="contain" />
        <Image source={ICONS.battery} style={styles.status_battery} resizeMode="contain" />
      </View>
    </View>
  );
};

/**
 * DepartureField
 * 출발 정류장 검색 입력 필드
 */
const DepartureField = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}): ReactElement => {
  return (
    <View style={styles.departure_field}>
      <View style={styles.departure_content}>
        <Text style={styles.departure_title}>출발 정류장</Text>
        <TextInput
          style={styles.departure_input}
          value={value}
          onChangeText={onChange}
          placeholder="정류장 검색"
          placeholderTextColor={COLOR.grayDark}
        />
      </View>
    </View>
  );
};

/**
 * TimeFilterTabs
 * 시간 필터 탭 (6:00, 6:30, 7:00, 7:30, 8:00, 8:30)
 * 시간대 선택 시 하얀색 배경과 #007AFF 텍스트 색상으로 표시
 */
const TimeFilterTabs = ({
  selectedTime,
  onTimeSelect,
}: {
  selectedTime: TimeSlot;
  onTimeSelect: (time: TimeSlot) => void;
}): ReactElement => {
  return (
    <View style={styles.time_filter_wrapper}>
      <View style={styles.time_filter_container}>
        {TIME_TABS.map((tab) => {
          const isActive = tab.id === selectedTime;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.time_tab, isActive && styles.time_tab_active]}
              activeOpacity={0.8}
              onPress={() => onTimeSelect(tab.id)}
            >
              <Text style={[styles.time_tab_label, isActive && styles.time_tab_label_active]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

/**
 * BusRoutesSection
 * 버스 노선 카드들
 * 선택된 시간대에 따라 혼잡도 데이터를 표시
 */
const BusRoutesSection = ({ selectedTime }: { selectedTime: TimeSlot }): ReactElement => {
  const routes = BUS_ROUTES_DATA.map((route) => ({
    ...route,
    congestion: route.congestionByTime[selectedTime],
  }));

  return (
    <View style={styles.bus_routes_section}>
      {routes.map((route) => (
        <BusRouteCard key={route.id} route={route} />
      ))}
    </View>
  );
};

/**
 * BusRouteCard
 * 개별 버스 노선 카드 (혼잡도 표시 포함)
 */
const BusRouteCard = ({
  route,
}: {
  route: {
    id: string;
    number: string;
    station: string;
    congestion: CongestionLevel[];
    busPosition: number;
    myPosition: number;
  };
}): ReactElement => {
  return (
    <View style={styles.bus_card}>
      {/* 버스 번호와 정류장명 */}
      <View style={styles.bus_header}>
        <Text style={styles.bus_number}>{route.number}</Text>
        <Text style={styles.bus_station}>{route.station}</Text>
      </View>

      {/* 노선 시각화 영역 */}
      <View style={styles.route_visualization}>
        {/* 혼잡도 표시 영역 */}
        <View style={styles.congestion_area}>
          {/* 연결선 */}
          <View style={styles.route_line} />
          
          {/* 혼잡도 원들 */}
          <View style={styles.congestion_dots_container}>
            {route.congestion.map((level, index) => {
              const isBusPosition = index === route.busPosition;
              const isMyPosition = index === route.myPosition;
              const color = CONGESTION_COLORS[level as keyof typeof CONGESTION_COLORS];

              return (
                <View key={index} style={styles.congestion_dot_wrapper}>
                  {/* 혼잡도 원 */}
                  <View
                    style={[
                      styles.congestion_dot,
                      { backgroundColor: color },
                    ]}
                  />
                  
                  {/* 버스 위치 표시 - directions_bus.png 아이콘을 원 위에 표시 */}
                  {isBusPosition && (
                    <View style={styles.bus_position_indicator}>
                      <Image source={ICONS.directionsBus} style={styles.bus_position_icon} resizeMode="contain" />
                    </View>
                  )}
                  
                  {/* 내 위치 표시 - Map pin.png 아이콘을 원 위에 표시 */}
                  {isMyPosition && (
                    <View style={styles.my_position_indicator}>
                      <Image source={ICONS.mapPin} style={styles.my_position_icon} resizeMode="contain" />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safe_area: {
    flex: 1,
    backgroundColor: COLOR.bg,
  },
  container: {
    flex: 1,
    backgroundColor: COLOR.bg,
    paddingHorizontal: 26,
  },
  scroll_content: {
    paddingBottom: 140,
  },
  status_bar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  status_time: {
    fontSize: 17,
    fontWeight: "600",
    color: COLOR.textPrimary,
    fontFamily: "SF Pro",
  },
  status_icons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  status_icon: {
    width: 19,
    height: 12,
  },
  status_battery: {
    width: 27,
    height: 13,
  },
  departure_field: {
    marginBottom: 20,
  },
  departure_content: {
    borderBottomWidth: 0.3,
    borderBottomColor: COLOR.border,
    paddingTop: 11,
    paddingBottom: 11,
    paddingLeft: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  departure_title: {
    fontSize: 17,
    fontWeight: "600",
    color: COLOR.textPrimary,
    fontFamily: "SF Pro",
    letterSpacing: -0.43,
    width: 100,
    lineHeight: 22,
  },
  departure_input: {
    fontSize: 17,
    fontWeight: "400",
    color: COLOR.textSecondary,
    fontFamily: "SF Pro",
    letterSpacing: -0.43,
    lineHeight: 22,
    flex: 1,
    padding: 0,
  },
  time_filter_wrapper: {
    marginBottom: 24,
  },
  time_filter_container: {
    backgroundColor: COLOR.chipBg,
    borderRadius: 50,
    padding: 4,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  time_tab: {
    flex: 1,
    height: 33,
    alignItems: "center",
    justifyContent: "center",
  },
  time_tab_active: {
    backgroundColor: COLOR.card,
    borderRadius: 100,
  },
  time_tab_label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#090909",
    fontFamily: "SF Pro",
    lineHeight: 20,
    letterSpacing: -0.23,
  },
  time_tab_label_active: {
    fontSize: 15,
    fontWeight: "700",
    color: "#007AFF",
  },
  bus_routes_section: {
    gap: 21,
  },
  bus_card: {
    height: 146,
    borderRadius: 10,
    backgroundColor: COLOR.card,
    paddingTop: 15,
    paddingLeft: 17,
    paddingRight: 17,
    position: "relative",
    overflow: "hidden",
  },
  bus_header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  bus_number: {
    fontSize: 24,
    fontWeight: "600",
    color: COLOR.textPrimary,
    fontFamily: "Pretendard",
    marginRight: 8,
  },
  bus_station: {
    fontSize: 15,
    fontWeight: "600",
    color: COLOR.grayDark,
    fontFamily: "Pretendard",
  },
  route_visualization: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    position: "relative",
    marginTop: 8,
  },
  congestion_area: {
    width: "100%",
    height: 54,
    position: "relative",
    justifyContent: "center",
  },
  route_line: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLOR.routeLine,
    top: "50%",
    marginTop: -1.5,
    zIndex: 1,
  },
  congestion_dots_container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
    paddingHorizontal: 8,
    position: "relative",
    zIndex: 2,
  },
  congestion_dot_wrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 40,
    zIndex: 3,
  },
  congestion_dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLOR.card,
    zIndex: 2,
  },
  bus_position_indicator: {
    position: "absolute",
    top: -14,
    left: "50%",
    marginLeft: -12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  bus_position_icon: {
    width: 24,
    height: 24,
    tintColor: COLOR.textPrimary,
  },
  my_position_indicator: {
    position: "absolute",
    top: -14,
    left: "50%",
    marginLeft: -12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 6,
  },
  my_position_icon: {
    width: 24,
    height: 24,
    tintColor: COLOR.textPrimary,
  },
});

export default StationSearchScreen;
