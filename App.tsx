// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { Feather } from "@expo/vector-icons";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { LoginScreen } from "./src/screens/LoginScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ClientsScreen } from "./src/screens/ClientsScreen";
import { ClientDetailScreen } from "./src/screens/ClientDetailScreen";
import { MembershipsScreen } from "./src/screens/MembershipsScreen";
import { SettingsScreen } from "./src/screens/SettingScreen";

export type RootStackParamList = {
  Login: undefined;
  AppTabs: undefined;
};

export type ClientsStackParamList = {
  ClientsList: undefined;
  ClientDetail: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const ClientsStack = createNativeStackNavigator<ClientsStackParamList>();

const ClientsStackNavigator = () => (
  <ClientsStack.Navigator screenOptions={{ headerShown: false }}>
    <ClientsStack.Screen
      name="ClientsList"
      component={ClientsScreen}
      options={{ title: "Clientes" }}
    />
    <ClientsStack.Screen
      name="ClientDetail"
      component={ClientDetailScreen}
      options={({ route }) => ({ title: route.params.name })}
    />
  </ClientsStack.Navigator>
);

const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#8e8e93",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#e5e5ea",
          height: 60,
          paddingBottom: 10,
          borderRadius: 12,
          position: "absolute",
          marginHorizontal: 16,
          marginBottom: 26,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 25,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="ClientsTab"
        component={ClientsStackNavigator}
        options={{
          title: "Clientes",
          tabBarIcon: ({ color }) => (
            <Feather name="users" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="MembershipsTab"
        component={MembershipsScreen}
        options={{
          title: "Membresías",
          tabBarIcon: ({ color }) => (
            <Feather name="tag" size={22} color={color} />
          ),
        }}
      /><Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Feather name="settings" size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
    

  );
};

const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user == null ? (
          <RootStack.Screen name="Login" component={LoginScreen} />
        ) : (
          <RootStack.Screen name="AppTabs" component={AppTabs} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}