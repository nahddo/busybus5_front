export type ScreenName = "home" | "bookmark" | "search" | "searching" | "station_search" | "bus_search";

export type NavigateHandler = (screen: ScreenName) => void;

