import React, { ReactElement, useEffect, useState } from "react";
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomTabBar from "../components/BottomTabBar";
import { NavigateHandler, ScreenName } from "../types/navigation";
import { setSearchIntent } from "../store/searchIntentStore";
import { getSearchHistory, SearchHistoryItem, subscribeSearchHistory } from "../store/searchHistoryStore";
import { setBusSearchNumber } from "../store/busSearchStore";
import { setDepartureStation } from "../store/stationSearchStore";

type FavoriteIconType = "home" | "school" | "work" | "add";

type FavoriteShortcut = {
  id: string;
  label: string;
  icon: FavoriteIconType;
  helper?: string;
};

type SearchProps = {
  currentScreen: ScreenName;
  onNavigate: NavigateHandler;
};

const ICONS = {
  cellular: require("../../assets/images/search/Examples/Cellular Connection.png"),
  wifi: require("../../assets/images/search/Examples/Wifi.png"),
  battery: require("../../assets/images/search/Examples/Battery.png"),
  search: require("../../assets/images/search/Examples/icnSearch.png"),
  searchSecondary: require("../../assets/images/search/Examples/icnSearch-1.png"),
  home: require("../../assets/images/search/Examples/Home.png"),
  book: require("../../assets/images/search/Examples/Book open.png"),
  union: require("../../assets/images/search/Examples/Union.png"),
};

const FAVORITE_SHORTCUTS: FavoriteShortcut[] = [
  { id: "home", label: "집", icon: "home" },
  { id: "school", label: "학교", icon: "school" },
  { id: "work", label: "직장", icon: "work", helper: "추가" },
  { id: "add", label: "추가", icon: "add" },
];

/**
 * SearchScreen
 * 정류장/버스 검색 화면을 Figma 디자인 기반으로 구성한다.
 */
const SearchScreen = ({ currentScreen, onNavigate }: SearchProps): ReactElement => {
  const [recentItems, setRecentItems] = useState<SearchHistoryItem[]>(getSearchHistory());

  useEffect(() => {
    const unsubscribe = subscribeSearchHistory(setRecentItems);
    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={styles.safe_area}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <StatusHeader />
        <ScrollView
          contentContainerStyle={styles.scroll_content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SearchBar onNavigate={onNavigate} />
          <FavoriteSection />
          <RecentSection items={recentItems} onNavigate={onNavigate} />
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
 * SearchBar
 * 상단 검색 영역을 렌더링한다. 누르면 상세 검색 화면으로 이동.
 */
const SearchBar = ({ onNavigate }: { onNavigate: NavigateHandler }): ReactElement => {
  return (
    <View style={styles.search_bar}>
      <TouchableOpacity
        style={styles.search_box}
        activeOpacity={0.85}
        onPress={() => {
          setSearchIntent("default");
          onNavigate("searching");
        }}
      >
        <Image source={ICONS.search} style={styles.search_icon} resizeMode="contain" />
        <Text style={styles.search_placeholder}>정류장·버스 검색</Text>
      </TouchableOpacity>
      <View style={styles.avatar}>
        <Text style={styles.avatar_text}>나</Text>
      </View>
    </View>
  );
};

/**
 * FavoriteSection
 * 즐겨찾는 장소 카드
 */
const FavoriteSection = (): ReactElement => {
  return (
    <View style={styles.section}>
      <View style={styles.section_header}>
        <Text style={styles.section_title}>즐겨찾기</Text>
        <TouchableOpacity activeOpacity={0.8}>
          <Text style={styles.section_link}>더보기</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.favorite_container}>
        <View style={styles.favorite_grid}>
          {FAVORITE_SHORTCUTS.map((shortcut) => (
            <View key={shortcut.id} style={styles.favorite_card}>
              <View style={styles.favorite_icon_wrapper}>
                <FavoriteIcon icon={shortcut.icon} />
              </View>
              <Text style={styles.favorite_label}>{shortcut.label}</Text>
              {shortcut.helper ? <Text style={styles.favorite_helper}>{shortcut.helper}</Text> : null}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const FavoriteIcon = ({ icon }: { icon: FavoriteIconType }): ReactElement => {
  switch (icon) {
    case "home":
      return <Image source={ICONS.home} style={styles.favorite_icon_image} resizeMode="contain" />;
    case "school":
      return <Image source={ICONS.book} style={styles.favorite_icon_image} resizeMode="contain" />;
    case "work":
      return (
        <View style={styles.briefcase}>
          <View style={styles.briefcase_handle} />
          <View style={styles.briefcase_divider} />
        </View>
      );
    case "add":
    default:
      return (
        <View style={styles.plus_icon}>
          <View style={styles.plus_line_vertical} />
          <View style={styles.plus_line_horizontal} />
        </View>
      );
  }
};

/**
 * RecentSection
 * 최근 검색/경로 리스트
 */
const RecentSection = ({
  items,
  onNavigate,
}: {
  items: SearchHistoryItem[];
  onNavigate: NavigateHandler;
}): ReactElement => {
  const handleRecentPress = (item: SearchHistoryItem) => {
    setSearchIntent("default");
    if (item.type === "bus") {
      setBusSearchNumber(item.title);
      onNavigate("bus_search");
    } else {
      setDepartureStation(item.title);
      onNavigate("station_search");
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.section_title}>Recent</Text>
      <View style={styles.recent_list}>
        {items.length === 0 ? (
          <View style={styles.recent_empty_state}>
            <Text style={styles.recent_empty_text}>최근 검색 기록이 없습니다</Text>
          </View>
        ) : (
          items.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.recent_row, index !== items.length - 1 && styles.recent_row_divider]}
              activeOpacity={0.85}
              onPress={() => handleRecentPress(item)}
            >
              <View style={styles.recent_icon_wrapper}>
                <Image source={ICONS.searchSecondary} style={styles.recent_icon} resizeMode="contain" />
              </View>
              <View style={styles.recent_texts}>
                <Text style={styles.recent_title}>{item.title}</Text>
                <Text style={styles.recent_subtitle}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
};

const COLOR = {
  labelPrimary: "#000000",
  blueAccent: "#4C6CFB",
  blueCircle: "#5B7BFF",
  gray30: "#EBEBEB",
  gray80: "#6C6C6C",
  gray60: "#868782",
  grayBorder: "#E9E9E9",
  grayBg: "#F7F7F6",
  recentIconBg: "#F0F0F5",
  card: "#FFFFFF",
};

const styles = StyleSheet.create({
  safe_area: {
    flex: 1,
    backgroundColor: COLOR.grayBg,
  },
  container: {
    flex: 1,
    backgroundColor: COLOR.grayBg,
    paddingHorizontal: 24,
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
    color: COLOR.labelPrimary,
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
  search_bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 20,
    marginBottom: 18,
  },
  search_box: {
    flexDirection: "row",
    alignItems: "center",
    width: 296,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E9E9E9",
    paddingHorizontal: 6,
    gap: 4,
  },
  search_icon: {
    width: 20,
    height: 20,
  },
  search_placeholder: {
    flex: 1,
    fontSize: 17,
    color: "#6C6C6C",
    fontFamily: "Pretendard",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#C7C7CB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar_text: {
    color: "#F7F7F6",
    fontWeight: "600",
    fontFamily: "Pretendard",
  },
  section: {
    marginBottom: 28,
  },
  section_header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  section_title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLOR.labelPrimary,
  },
  section_link: {
    fontSize: 15,
    color: COLOR.blueAccent,
    fontWeight: "600",
  },
  favorite_container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "#EEF0F5",
  },
  favorite_grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  favorite_card: {
    width: 70,
    alignItems: "center",
  },
  favorite_icon_wrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F6F7FA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  favorite_icon_image: {
    width: 30,
    height: 30,
    tintColor: "#4e6bf4",
  },
  favorite_label: {
    fontSize: 15,
    fontWeight: "600",
    color: COLOR.labelPrimary,
  },
  favorite_helper: {
    marginTop: 1,
    fontSize: 12,
    color: COLOR.gray60,
  },
  briefcase: {
    width: 32,
    height: 24,
    borderWidth: 2,
    borderColor: "#4e6bf4",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  briefcase_handle: {
    position: "absolute",
    top: -8,
    width: 18,
    height: 10,
    borderWidth: 2,
    borderColor: "#4e6bf4",
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  briefcase_divider: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "#4e6bf4",
    bottom: 8,
  },
  plus_icon: {
    width: 26,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  plus_line_vertical: {
    position: "absolute",
    width: 2,
    height: 20,
    backgroundColor: COLOR.blueAccent,
    borderRadius: 1,
  },
  plus_line_horizontal: {
    position: "absolute",
    height: 2,
    width: 20,
    backgroundColor: COLOR.blueAccent,
    borderRadius: 1,
  },
  recent_list: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLOR.grayBorder,
  },
  recent_empty_state: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  recent_empty_text: {
    fontSize: 14,
    color: COLOR.gray60,
    fontFamily: "Pretendard",
  },
  recent_row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 14,
  },
  recent_row_divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#eceff3",
  },
  recent_icon_wrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#eff1f7",
    alignItems: "center",
    justifyContent: "center",
  },
  recent_icon: {
    width: 20,
    height: 20,
    tintColor: "#7d8698",
  },
  recent_texts: {
    flex: 1,
  },
  recent_title: {
    fontSize: 17,
    fontWeight: "600",
    color: COLOR.labelPrimary,
    marginBottom: 4,
  },
  recent_subtitle: {
    fontSize: 13,
    color: COLOR.gray60,
  },
});

export default SearchScreen;
