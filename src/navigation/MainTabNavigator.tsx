import React from 'react';
import {StyleSheet, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {HomeScreen} from '../screens/home';
import {SettingsScreen} from '../screens/profile';
import {colors} from '../design-system/theme/colors';
import {typography} from '../design-system/theme/typography';
import {MainTabParamList} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Deliveries placeholder screen (will be replaced with actual screen)
const DeliveriesScreen = () => {
  const {useDeliveries} = require('../shared/hooks');
  const {DeliveryCard} = require('../shared/components');
  const {SafeAreaView} = require('react-native-safe-area-context');
  const {ScrollView, RefreshControl, Text} = require('react-native');

  const {
    deliveries,
    isRefreshing,
    refresh,
  } = useDeliveries();

  const deliveryListItems = deliveries.map((d: any) => ({
    id: d.id,
    trackingNumber: d.trackingNumber,
    status: d.status,
    priority: d.priority,
    customerName: d.customer.name,
    destinationAddress: d.destination.address,
    scheduledDate: d.scheduledDate,
    estimatedDeliveryTime: d.estimatedDeliveryTime,
  }));

  return (
    <SafeAreaView style={styles.deliveriesContainer} edges={['top']}>
      <View style={styles.deliveriesHeader}>
        <Text style={styles.deliveriesTitle}>Entregas</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.deliveriesContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }>
        {deliveryListItems.map((item: any) => (
          <DeliveryCard key={item.id} delivery={item} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

// Define tab icon outside render function
const getTabBarIcon = (route: {name: string}, focused: boolean, color: string, size: number) => {
  let iconName: string;

  switch (route.name) {
    case 'Home':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Deliveries':
      iconName = focused ? 'cube' : 'cube-outline';
      break;
    case 'Settings':
      iconName = focused ? 'settings' : 'settings-outline';
      break;
    default:
      iconName = 'help-outline';
  }

  return <Icon name={iconName} size={size} color={color} />;
};

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color, size}) => getTabBarIcon(route, focused, color, size),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[500],
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
        }}
      />
      <Tab.Screen
        name="Deliveries"
        component={DeliveriesScreen}
        options={{
          tabBarLabel: 'Entregas',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Ajustes',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    ...typography.textStyles.captionSmall,
    fontWeight: '500',
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  // Deliveries screen styles
  deliveriesContainer: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  deliveriesHeader: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  deliveriesTitle: {
    ...typography.textStyles.h4,
    color: colors.text.primary,
  },
  deliveriesContent: {
    padding: 16,
    paddingBottom: 32,
  },
});

export default MainTabNavigator;
