import React, { ReactElement, useMemo, useRef, useState } from "react";
import { Animated, Image, PanResponder, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomTabBar from "../components/BottomTabBar";
import { NavigateHandler, ScreenName } from "../types/navigation";
import { addFavorite } from "../store/favoriteStore";
import { getSearchIntent, setSearchIntent } from "../store/searchIntentStore";
import { setRouteLocation } from "../store/routeSelectionStore";
import { setBusSearchNumber } from "../store/busSearchStore";
import { setDepartureStation } from "../store/stationSearchStore";
import { addSearchHistory } from "../store/searchHistoryStore";

type SearchingProps = {
  currentScreen: ScreenName;
  onNavigate: NavigateHandler;
};

type SearchResult = {
  id: string;
  title: string;
  description: string;
  type: "bus" | "station";
};

const ICONS = {
  cellular: require("../../assets/images/search/Examples/Cellular Connection.png"),
  wifi: require("../../assets/images/search/Examples/Wifi.png"),
  battery: require("../../assets/images/search/Examples/Battery.png"),
  search: require("../../assets/images/search/Examples/icnSearch.png"),
  searchSecondary: require("../../assets/images/search/Examples/icnSearch-1.png"),
  plus: require("../../assets/images/bookmark/icnPlus2.png"),
  bus: require("../../assets/images/searching/bus.png"),
  pin: require("../../assets/images/searching/pin.png"),
};

const BUS_RESULTS: SearchResult[] = [
  { id: "bus-3302", title: "3302", description: "3개의 경로가 있습니다", type: "bus" },
  { id: "bus-3201", title: "3201", description: "290m 거리, 뗏골마을앞", type: "bus" },
  { id: "bus-500-1", title: "500-1", description: "잠실 방향 버스", type: "bus" },
];

const STATION_RESULTS: SearchResult[] = [
  { id: "station-tt", title: "뗏골마을앞", description: "용인시 처인구", type: "station" },
  { id: "station-yangjae", title: "양재역", description: "2번 출구 앞", type: "station" },
  { id: "station-gangnam", title: "강남역", description: "신분당선 환승", type: "station" },
];

const ADD_ACTION_WIDTH = 78;

const SearchingScreen = ({ currentScreen, onNavigate }: SearchingProps): ReactElement => {
  const [query, setQuery] = useState("");
  const currentIntent = getSearchIntent();
  const isAddMode = currentIntent === "add_favorite";
  const isEndpointSelection = currentIntent === "select_origin" || currentIntent === "select_destination";

  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();

  const filteredBus = useMemo(() => {
    if (!normalizedQuery) return BUS_RESULTS;
    return BUS_RESULTS.filter(
      (item) =>
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const filteredStations = useMemo(() => {
    if (!normalizedQuery) return STATION_RESULTS;
    return STATION_RESULTS.filter(
      (item) =>
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const handleSubmit = () => {
    if (!normalizedQuery) return;
    if (isAddMode || isEndpointSelection) {
      return;
    }
    if (/^[0-9]+$/.test(normalizedQuery)) {
      addSearchHistory({
        title: trimmedQuery,
        description: "버스 검색",
        type: "bus",
      });
      setBusSearchNumber(trimmedQuery);
      onNavigate("bus_search");
    } else {
      addSearchHistory({
        title: trimmedQuery,
        description: "정류장 검색",
        type: "station",
      });
      setDepartureStation(trimmedQuery);
      onNavigate("station_search");
    }
    setSearchIntent("default");
  };

  const handleAddResultToFavorite = (result: SearchResult) => {
    addFavorite({
      label: result.title,
      type: result.type === "bus" ? "bus" : "stop",
    });
    setSearchIntent("default");
    onNavigate("bookmark");
  };

  const handleResultPress = (result: SearchResult) => {
    if (isAddMode) {
      return;
    }

    if (isEndpointSelection) {
      setRouteLocation(currentIntent === "select_origin" ? "origin" : "destination", {
        title: result.title,
        description: result.description,
      });
      setSearchIntent("default");
      onNavigate("home");
      return;
    }

    addSearchHistory({
      title: result.title,
      description: result.description,
      type: result.type,
    });

    if (result.type === "bus") {
      setBusSearchNumber(result.title);
      onNavigate("bus_search");
    } else {
      setDepartureStation(result.title);
      onNavigate("station_search");
    }
    setSearchIntent("default");
  };

  return (
    <SafeAreaView style={styles.safe_area}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <StatusHeader />
        <View style={styles.search_row}>
          <View style={styles.search_box}>
            <Image source={ICONS.search} style={styles.search_icon} resizeMode="contain" />
            <TextInput
              style={styles.search_input}
              placeholder={isEndpointSelection ? "정류장 검색" : "정류장·버스 검색"}
              placeholderTextColor="#6C6C6C"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSubmit}
              returnKeyType="search"
              autoFocus
            />
          </View>
          <TouchableOpacity
            style={styles.cancel_button}
            onPress={() => {
              setSearchIntent("default");
              onNavigate("search");
            }}
          >
            <Text style={styles.cancel_text}>취소</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll_content} showsVerticalScrollIndicator={false}>
          {!isEndpointSelection && (
            <ResultSection
              title="버스"
              results={filteredBus}
              onItemPress={handleResultPress}
              onAddFavorite={handleAddResultToFavorite}
              showAddAction={isAddMode}
            />
          )}
          <ResultSection
            title="정류장"
            results={filteredStations}
            onItemPress={handleResultPress}
            onAddFavorite={handleAddResultToFavorite}
            showAddAction={isAddMode}
          />
        </ScrollView>
        <BottomTabBar currentScreen={currentScreen} onNavigate={onNavigate} />
      </View>
    </SafeAreaView>
  );
};

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

const ResultSection = ({
  title,
  results,
  onItemPress,
  onAddFavorite,
  showAddAction,
}: {
  title: string;
  results: SearchResult[];
  onItemPress: (result: SearchResult) => void;
  onAddFavorite: (result: SearchResult) => void;
  showAddAction: boolean;
}): ReactElement => {
  return (
    <View style={styles.result_section}>
      <Text style={styles.section_title}>{title}</Text>
      <View style={styles.result_card}>
        {results.map((result, index) => (
          <SwipeableResultRow
            key={result.id}
            showAddAction={showAddAction}
            onAdd={() => onAddFavorite(result)}
            showDivider={index !== results.length - 1}
          >
            <TouchableOpacity
              style={styles.result_row}
              activeOpacity={0.85}
              onPress={() => onItemPress(result)}
            >
              <View style={styles.result_icon_wrapper}>
                <Image
                  source={result.type === "bus" ? ICONS.bus : ICONS.pin}
                  style={styles.result_icon_image}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.result_texts}>
                <Text style={styles.result_title}>{result.title}</Text>
                <Text style={styles.result_subtitle}>{result.description}</Text>
              </View>
              <Image source={ICONS.searchSecondary} style={styles.result_arrow} resizeMode="contain" />
            </TouchableOpacity>
          </SwipeableResultRow>
        ))}
      </View>
    </View>
  );
};

const SwipeableResultRow = ({
  children,
  showAddAction,
  onAdd,
  showDivider,
}: {
  children: ReactElement;
  showAddAction: boolean;
  onAdd: () => void;
  showDivider: boolean;
}): ReactElement => {
  if (!showAddAction) {
    return <View style={[styles.result_row_container, showDivider && styles.result_row_divider]}>{children}</View>;
  }

  const translateX = useRef(new Animated.Value(0)).current;
  const isOpenRef = useRef(false);

  const animateRow = (toValue: number) => {
    Animated.timing(translateX, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      isOpenRef.current = toValue !== 0;
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        let translation = gestureState.dx;
        if (isOpenRef.current) {
          translation -= -ADD_ACTION_WIDTH;
        }
        const clamped = Math.max(-ADD_ACTION_WIDTH, Math.min(0, translation));
        translateX.setValue(clamped);
      },
      onPanResponderRelease: (_, gestureState) => {
        let translation = gestureState.dx;
        if (isOpenRef.current) {
          translation -= -ADD_ACTION_WIDTH;
        }
        const shouldOpen = translation < -ADD_ACTION_WIDTH / 2 || gestureState.vx < -0.5;
        animateRow(shouldOpen ? -ADD_ACTION_WIDTH : 0);
      },
      onPanResponderTerminate: () => {
        animateRow(0);
      },
    })
  ).current;

  const handleAdd = () => {
    animateRow(0);
    onAdd();
  };

  return (
    <View style={styles.result_swipe_container}>
      <TouchableOpacity style={styles.result_add_action} activeOpacity={0.9} onPress={handleAdd}>
        <Image source={ICONS.plus} style={styles.result_add_icon} resizeMode="contain" />
      </TouchableOpacity>
      <Animated.View
        style={[
          styles.result_swipeable_content,
          showDivider && styles.result_row_divider,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  safe_area: {
    flex: 1,
    backgroundColor: "#F7F7F6",
  },
  container: {
    flex: 1,
    backgroundColor: "#F7F7F6",
    paddingHorizontal: 24,
  },
  scroll_content: {
    paddingBottom: 140,
    gap: 28,
  },
  status_bar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 18,
  },
  status_time: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
    fontFamily: "Pretendard",
  },
  status_icons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  status_icon: {
    width: 18,
    height: 12,
  },
  status_battery: {
    width: 27,
    height: 13,
  },
  search_row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
    gap: 12,
  },
  search_box: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9E9E9",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    gap: 8,
  },
  search_icon: {
    width: 18,
    height: 18,
  },
  search_input: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
    fontFamily: "Pretendard",
    padding: 0,
  },
  cancel_button: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  cancel_text: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
    fontFamily: "Pretendard",
  },
  result_section: {
    gap: 12,
  },
  section_title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6C6C6C",
    fontFamily: "Pretendard",
  },
  result_card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EC",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  result_swipe_container: {
    width: "100%",
    position: "relative",
  },
  result_swipeable_content: {
    backgroundColor: "#FFFFFF",
  },
  result_row_container: {
    width: "100%",
  },
  result_row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 14,
  },
  result_row_divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF3",
  },
  result_icon_wrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EBEBEB",
    alignItems: "center",
    justifyContent: "center",
  },
  result_icon_image: {
    width: 20,
    height: 20,
    tintColor: "#007AFF",
  },
  result_texts: {
    flex: 1,
  },
  result_title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
    fontFamily: "Pretendard",
  },
  result_subtitle: {
    fontSize: 13,
    color: "#6C6C6C",
    fontFamily: "Pretendard",
  },
  result_arrow: {
    width: 16,
    height: 16,
    tintColor: "#A4A7B0",
  },
  result_add_action: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: ADD_ACTION_WIDTH,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  result_add_icon: {
    width: 20,
    height: 20,
    tintColor: "#FFFFFF",
  },
});

export default SearchingScreen;

