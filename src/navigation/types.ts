import {NavigatorScreenParams} from '@react-navigation/native';

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Deliveries: undefined;
  Settings: undefined;
};

// Entregas Navigator (Stack within tab)
export type EntregasStackParamList = {
  DeliveriesList: undefined;
  DeliveryDetails: {deliveryId: string};
  DeliveryInProgress: {deliveryId: string};
  DeliveryCompleted: {deliveryId: string};
};

// Root Stack Navigator
export type RootStackParamList = {
  // Auth flow
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;

  // Main app
  MainTabs: NavigatorScreenParams<MainTabParamList>;

  // Delivery screens (can be accessed from anywhere)
  DeliveryDetails: {deliveryId: string};
  DeliveryInProgress: {deliveryId: string};
  DeliveryCompleted: {deliveryId: string};

  // Other screens
  Settings: undefined;
};

// Type augmentation for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// Helper type for screen props
export type RootStackScreenProps<T extends keyof RootStackParamList> = {
  navigation: import('@react-navigation/native-stack').NativeStackNavigationProp<
    RootStackParamList,
    T
  >;
  route: import('@react-navigation/native').RouteProp<RootStackParamList, T>;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> = {
  navigation: import('@react-navigation/bottom-tabs').BottomTabNavigationProp<
    MainTabParamList,
    T
  >;
  route: import('@react-navigation/native').RouteProp<MainTabParamList, T>;
};
