import React, { ReactElement, useEffect, useState } from "react";
import { Image, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import BottomTabBar from "../components/BottomTabBar";
import { NavigateHandler, ScreenName } from "../types/navigation";
import { getBusSearchState, setBusSearchNumber, subscribeBusSearch } from "../store/busSearchStore";

type BusSearchProps = {
  currentScreen: ScreenName;
  onNavigate: NavigateHandler;
};

const ICONS = {
  cellular: require("../../assets/images/bus_search/Cellular Connection.png"),
  wifi: require("../../assets/images/bus_search/Wifi.png"),
  battery: require("../../assets/images/bus_search/Battery.png"),
  bookmark: require("../../assets/images/bus_search/Bookmark.png"),
  home: require("../../assets/images/bus_search/Home.png"),
  search: require("../../assets/images/bus_search/Search.png"),
  user: require("../../assets/images/bus_search/User.png"),
  directionsBus: require("../../assets/images/bus_search/directions_bus.png"),
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

// 정류장 데이터 (위에서 아래로)
const STATIONS = [
  { id: "1", name: "추자동차고지입구", seats: 45, congestion: "empty" },
  { id: "2", name: "고산별빛초교", seats: 44, congestion: "empty" },
  { id: "3", name: "금호베스트빌", seats: 42, congestion: "normal" },
  { id: "4", name: "고산하늘초교", seats: 38, congestion: "normal" },
  { id: "5", name: "더샵센트럴포레", seats: 34, congestion: "crowded" },
  { id: "6", name: "태전힐스테이트7지구", seats: 33, congestion: "veryCrowded" },
  { id: "7", name: "한아람초등학교", seats: 21, congestion: "veryCrowded" },
  { id: "8", name: "태전힐스테이트5지구", seats: 18, congestion: "crowded" },
  { id: "9", name: "태전이편한세상2차정문", seats: 5, congestion: "normal" },
  { id: "10", name: "태전효성해링턴플레이스", seats: 0, congestion: "empty" },
];

const TIMELINE_LINE_WIDTH = 5;
const TIMELINE_DOT_SIZE = 16;
const TIMELINE_LINE_OFFSET = 22; // timelineContainer 내부에서 회색 라인이 위치할 X 좌표
const TIMELINE_TEXT_SPACING = 12;
const TIMELINE_TEXT_OFFSET = TIMELINE_LINE_OFFSET + TIMELINE_DOT_SIZE / 2 + TIMELINE_TEXT_SPACING;

/**
 * 잔여 좌석 수에 따라 색상을 반환한다.
 * - 여유(>=35) : 파란색
 * - 보통(>=25) : 초록색
 * - 혼잡(>=10) : 노란색
 * - 매우 혼잡(<10) : 빨간색
 */
const getSeatColor = (seats: number): string => {
  if (seats >= 35) return "#4680FF";
  if (seats >= 25) return "#00D578";
  if (seats >= 10) return "#FBBF4C";
  return "#F55858";
};

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
  sliderLine: "#E6E6E6",
};

/**
 * BusSearchScreen
 * 버스 검색 화면을 Figma 디자인 기반으로 구성한다.
 */
const BusSearchScreen = ({ currentScreen, onNavigate }: BusSearchProps): ReactElement => {
  const [busNumber, setBusNumber] = useState(getBusSearchState().busNumber);
  const [selectedTime, setSelectedTime] = useState<TimeSlot>("6:30");

  useEffect(() => {
    const unsubscribe = subscribeBusSearch((state) => {
      setBusNumber(state.busNumber);
    });
    return unsubscribe;
  }, []);

  const handleBusNumberChange = (value: string) => {
    setBusNumber(value);
    setBusSearchNumber(value);
  };

  return (
    <SafeAreaView style={styles.safe_area}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <StatusHeader />
        <ScrollView contentContainerStyle={styles.scroll_content} showsVerticalScrollIndicator={false}>
          <BusNumberField busNumber={busNumber} onBusNumberChange={handleBusNumberChange} />
          <TimeFilterTabs selectedTime={selectedTime} onTimeSelect={setSelectedTime} />
          <BusSeatsVisualization />
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
 * BusNumberField
 * 버스 번호 입력 필드 (스크롤 가능)
 */
const BusNumberField = ({
  busNumber,
  onBusNumberChange,
}: {
  busNumber: string;
  onBusNumberChange: (value: string) => void;
}): ReactElement => {
  return (
    <View style={styles.bus_number_field}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bus_number_scroll_content}
      >
        <View style={styles.bus_number_content}>
          <Text style={styles.bus_number_title}>버스 번호</Text>
          <TextInput
            style={styles.bus_number_input}
            value={busNumber}
            onChangeText={onBusNumberChange}
            placeholder="버스 번호 입력"
            placeholderTextColor={COLOR.grayDark}
          />
        </View>
      </ScrollView>
    </View>
  );
};

/**
 * TimeFilterTabs
 * 시간 필터 탭 (6:00, 6:30, 7:00, 7:30, 8:00, 8:30)
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
 * BusSeatsVisualization
 * 버스 좌석/혼잡도 시각화 (Vertical Area Shape)
 * y축: 정류장 목록(카테고리), x축: 잔여좌석(연속값)
 */
const BusSeatsVisualization = (): ReactElement => {
  // 각 정류장의 높이 (일직선 배치를 위해)
  const stationHeight = 48;
  const MAX_WIDTH = 70; // 그래프 최대 너비 (60~80px 범위)
  const totalHeight = STATIONS.length * stationHeight; // 전체 높이
  
  // 최대 좌석 수 (전체 좌석 수)
  const maxSeats = 45; // STATIONS의 최대값 또는 고정값
  
  // 각 정류장의 좌표 계산
  // y: 타임라인의 점들과 정확히 일치 (정류장 중앙)
  // x: 잔여좌석 수에 비례하여 계산
  const points: Array<{ x: number; y: number; seats: number }> = STATIONS.map((station, index) => {
    const y = index * stationHeight + stationHeight / 2; // 정류장 중앙 (타임라인과 일치)
    // x_i = (remainingSeats_i / maxSeats) * MAX_WIDTH
    const x = maxSeats > 0 ? (station.seats / maxSeats) * MAX_WIDTH : 0;
    return { x, y, seats: station.seats };
  });
  
  // Area Chart Path 생성 (직선 연결)
  const createAreaPath = (): string => {
    if (points.length === 0) return "";
    
    const firstY = points[0].y;
    const lastY = points[points.length - 1].y;
    
    // 1) M 0, y0 - 왼쪽 위 시작점
    let path = `M 0 ${firstY}`;
    
    // 2) L x0, y0 - 첫 정류장 좌석 값까지 이동
    path += ` L ${points[0].x} ${points[0].y}`;
    
    // 3) L x1, y1 ... L xN, yN - 각 정류장 좌석 값까지 직선 연결
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    // 4) L 0, yN - 마지막 정류장에서 왼쪽 경계로 이동
    path += ` L 0 ${lastY}`;
    
    // 5) L 0, y0 - 왼쪽 경계를 타고 위로 올라와 닫기
    path += ` L 0 ${firstY}`;
    
    // 6) Z - 닫기
    path += ` Z`;
    
    return path;
  };
  
  const areaPath = createAreaPath();
  
  const gradientStops = (() => {
    if (points.length === 0) {
      return [
        { offset: "0%", color: getSeatColor(0) },
        { offset: "100%", color: getSeatColor(0) },
      ];
    }

    const stops = points.map((point) => ({
      offset: `${((point.y / totalHeight) * 100).toFixed(2)}%`,
      color: getSeatColor(point.seats),
    }));

    return [
      { offset: "0%", color: getSeatColor(points[0].seats) },
      ...stops,
      { offset: "100%", color: getSeatColor(points[points.length - 1].seats) },
    ];
  })();

  return (
    <View style={styles.visualization_container}>
      <View style={styles.visualization_card}>
        {/* 전체 레이아웃: 가로 방향 3컬럼 */}
        <View style={styles.main_row}>
          {/* [0] seatsAreaContainer: 좌석 수 그라디언트 면 */}
          <View style={[styles.seats_area_container, { height: totalHeight, width: MAX_WIDTH }]}>
            <Svg width={MAX_WIDTH} height={totalHeight} style={styles.svg_container}>
              <Defs>
                {/* 수직 그라데이션 (위에서 아래로) */}
              <LinearGradient id="congestionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                {gradientStops.map((stop, index) => (
                    <Stop
                      key={index}
                      offset={stop.offset}
                      stopColor={stop.color}
                    />
                  ))}
                </LinearGradient>
              </Defs>
              {/* Area Chart Path - 2차원 면 그래프 */}
              <Path
                d={areaPath}
                fill="url(#congestionGradient)"
              fillOpacity={0.5}
                stroke="none"
              />
            </Svg>
          </View>

          {/* [1] yAxisLabelContainer: y축 라벨 (45석, 44석...) */}
          <View style={[styles.y_axis_label_container, { height: totalHeight }]}>
            {STATIONS.map((station, index) => {
              const y = index * stationHeight + stationHeight / 2; // 정류장 중앙 (타임라인과 일치)
              return (
                <Text
                  key={station.id}
                  style={[
                    styles.y_axis_label,
                    {
                      position: "absolute",
                      top: y - 12, // 텍스트 중앙 정렬 (lineHeight 24 기준)
                    },
                  ]}
                >
                  {station.seats}석
                </Text>
              );
            })}
          </View>

          {/* [2] timelineContainer: 회색 세로 라인 + 정류장 원 + 버스 아이콘 + 정류장 이름 */}
          <View style={[styles.timeline_container, { height: totalHeight }]}>
            {/* 회색 세로 라인 */}
            <View style={styles.timeline_line} />
            
            {/* 정류장 정보 */}
            {STATIONS.map((station, index) => {
              const color = getSeatColor(station.seats);
              const isBusPosition = index === 1 || index === 5; // 버스 위치
              const y = index * stationHeight + stationHeight / 2; // 정류장 중앙

              return (
                <View
                  key={station.id}
                  style={[
                    styles.station_row,
                    {
                      position: "absolute",
                      top: y - 24, // 텍스트 중앙 정렬 (lineHeight 24 기준)
                    },
                  ]}
                >
                  {/* 정류장 원 */}
                  <View style={styles.timeline_dot_wrapper}>
                    <View style={[styles.station_circle, { backgroundColor: color }]} />
                    {isBusPosition && (
                      <View style={styles.bus_icon_wrapper}>
                        <Image source={ICONS.directionsBus} style={styles.bus_icon} resizeMode="contain" />
                      </View>
                    )}
                  </View>
                  
                  {/* 정류장 이름 */}
                  <Text style={styles.station_text}>{station.name}</Text>
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
  bus_number_field: {
    marginBottom: 20,
  },
  bus_number_scroll_content: {
    flexGrow: 1,
  },
  bus_number_content: {
    borderBottomWidth: 0.3,
    borderBottomColor: COLOR.border,
    paddingTop: 11,
    paddingBottom: 11,
    paddingLeft: 16,
    flexDirection: "row",
    alignItems: "center",
    minWidth: "100%",
  },
  bus_number_title: {
    fontSize: 17,
    fontWeight: "600",
    color: COLOR.textPrimary,
    fontFamily: "SF Pro",
    letterSpacing: -0.43,
    width: 100,
    lineHeight: 22,
  },
  bus_number_input: {
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
  visualization_container: {
    marginBottom: 24,
  },
  visualization_card: {
    backgroundColor: COLOR.card,
    borderRadius: 10,
    padding: 20,
    minHeight: 500,
    width: "130%",
  },
  main_row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  // [0] seatsAreaContainer: 좌석 수 그라디언트 면
  seats_area_container: {
    width: 70, // 60~80px 범위
    position: "relative",
    zIndex: 0, // 맨 뒤
  },
  svg_container: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  // [1] yAxisLabelContainer: y축 라벨
  y_axis_label_container: {
    width: 45, // 40~50px
    position: "relative",
    paddingRight: 8,
  },
  y_axis_label: {
    fontSize: 13,
    color: COLOR.textPrimary,
    fontFamily: "Inter-Regular",
    lineHeight: 24,
    textAlign: "right", // 오른쪽 정렬
    width: "100%",
  },
  // [2] timelineContainer: 타임라인
  timeline_container: {
    flex: 1,
    position: "relative",
    paddingLeft: TIMELINE_TEXT_OFFSET,
  },
  timeline_line: {
    position: "absolute",
    left: TIMELINE_LINE_OFFSET,
    width: TIMELINE_LINE_WIDTH,
    height: "100%",
    backgroundColor: "#E6E6E6",
    zIndex: 1, // seatsAreaContainer 위, 정류장 원/아이콘/텍스트 아래
  },
  station_row: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    left: 0,
    right: 0,
    paddingLeft: TIMELINE_TEXT_OFFSET,
    zIndex: 2, // 맨 앞
    position: "absolute",
    width: "100%",
  },
  timeline_dot_wrapper: {
    position: "absolute",
    width: TIMELINE_DOT_SIZE,
    height: TIMELINE_DOT_SIZE,
    alignItems: "center",
    justifyContent: "center",
    left: TIMELINE_LINE_OFFSET + TIMELINE_LINE_WIDTH / 2 - TIMELINE_DOT_SIZE / 2,
    top: (48 - TIMELINE_DOT_SIZE) / 2,
  },
  station_circle: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  bus_icon_wrapper: {
    position: "absolute",
    left: -2,
    top: -2,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  bus_icon: {
    width: 20,
    height: 20,
    tintColor: COLOR.textPrimary,
  },
  station_text: {
    flex: 1,
    fontSize: 13,
    color: COLOR.textPrimary,
    fontFamily: "Inter-Regular",
    lineHeight: 24,
    textAlign: "left",
  },
});

export default BusSearchScreen;
