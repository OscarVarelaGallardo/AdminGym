// src/screens/HomeScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getDashboardSummary, DashboardSummary } from "../api/dashboard";
import { useNavigation } from "@react-navigation/native";

export const HomeScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<any>();

  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔄 Animación de la bolita (gira cuando refreshing = true)
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (refreshing) {
      // loop infinito mientras refreshing sea true
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      // reseteamos
      spinValue.stopAnimation(() => {
        spinValue.setValue(0);
      });
    }
  }, [refreshing, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleRefresh = async () => {
    console.log("🌀 onRefresh disparado"); // para que veas que sí entra
    setRefreshing(true);
    try {
      setError(null);
      const data = await getDashboardSummary();
      console.log("Data refreshed:", data);
      setSummary(data);
    } catch (e: any) {
      console.log(e?.response?.data || e.message);
      setError("No se pudo cargar el resumen del dashboard");
    } finally {
      setRefreshing(false);
    }
  };

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (e: any) {
      console.log(e?.response?.data || e.message);
      setError("No se pudo cargar el resumen del dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const firstName = user?.name?.split(" ")[0] || user?.name || "Admin";

  const formatMoney = (amount?: number) =>
    typeof amount === "number"
      ? `$${amount.toLocaleString("es-MX", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`
      : "-";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
      alwaysBounceVertical={true}
      bounces={true}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="transparent" // oculto el spinner nativo
          colors={["transparent"]}
        />
      }
    >
      {/* 🔵 Bolita animada para el pull-to-refresh */}
      <View style={styles.pullContainer}>
       
         
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <View style={styles.pullCircle}>
                <Text style={styles.pullText}>⟳</Text>
              </View>
            </Animated.View>
      
       
      </View>

      {/* HEADER */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Hola, {firstName} </Text>
          <Text style={styles.subtitle}>Resumen de tu gimnasio</Text>
        </View>
        <TouchableOpacity style={styles.avatar} onPress={signOut}>
          <Text style={styles.avatarText}>
            {firstName.charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ESTADO DE CARGA / ERROR */}
      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator />
          <Text style={styles.helper}>Cargando resumen…</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSummary}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SOLO RENDERIZAMOS TARJETAS SI YA HAY SUMMARY */}
      {summary && !loading && (
        <>
          {/* RESUMEN HOY */}
          <Text style={styles.sectionTitle}>Hoy</Text>
          <View style={styles.row}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Entradas</Text>
              <Text style={styles.cardValue}>{summary.entriesToday}</Text>
              <Text style={styles.cardHint}>Personas que han entrado</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Ingresos</Text>
              <Text style={styles.cardValue}>
                {formatMoney(summary.paymentsTodayAmount)}
              </Text>
              <Text style={styles.cardHint}>Pagos registrados hoy</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Nuevos clientes</Text>
              <Text style={styles.cardValue}>{summary.newClientsToday}</Text>
              <Text style={styles.cardHint}>Altas del día</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Por vencer (7 días)</Text>
              <Text style={styles.cardValue}>
                {summary.expiringMembershipsNext7Days}
              </Text>
              <Text style={styles.cardHint}>Membresías por renovar</Text>
            </View>
          </View>

          {/* ESTADO GENERAL */}
          <Text style={styles.sectionTitle}>Estado general</Text>
          <View style={styles.largeCard}>
            <View style={styles.largeCardRow}>
              <View>
                <Text style={styles.largeCardLabel}>Clientes activos</Text>
                <Text style={styles.largeCardValue}>
                  {summary.activeClients}
                </Text>
              </View>
              <View>
                <Text style={styles.largeCardLabel}>Ingresos del mes</Text>
                <Text style={styles.largeCardValue}>
                  {formatMoney(summary.paymentsThisMonthAmount)}
                </Text>
              </View>
            </View>
            <Text style={styles.largeCardHint}>
              Este es el resumen de la actividad del mes en tu gym.
            </Text>
          </View>
        </>
      )}

      {/* ACCIONES RÁPIDAS */}
      <Text style={styles.sectionTitle}>Accesos rápidos</Text>
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate("ClientsTab")}
        >
          <Text style={styles.quickEmoji}>👥</Text>
          <Text style={styles.quickTitle}>Clientes</Text>
          <Text style={styles.quickHint}>Ver y administrar clientes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate("MembershipsTab")}
        >
          <Text style={styles.quickEmoji}>🏷️</Text>
          <Text style={styles.quickTitle}>Membresías</Text>
          <Text style={styles.quickHint}>Planes y precios</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate("ClientsTab")}
        >
          <Text style={styles.quickEmoji}>➕</Text>
          <Text style={styles.quickTitle}>Nuevo cliente</Text>
          <Text style={styles.quickHint}>Registra desde la lista</Text>
        </TouchableOpacity>

      <View style={[styles.quickActionCard, { opacity: 0.4 }]}>
          <Text style={styles.quickEmoji}>📊</Text>
          <Text style={styles.quickTitle}>Reportes</Text>
          <Text style={styles.quickHint}>Funcionalidad futura</Text>
        </View>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    paddingHorizontal: 16,
    paddingTop: 66,
  },
  // 🔵 Pull-to-refresh (bolita)
  pullContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    marginTop: -16,
    marginBottom: 8,
  },
  pullCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",

  },
  pullText: {
    alignSelf: "center",
    textAlign: "center",
    color: "#cecccc",
    fontSize: 28,
    fontWeight: "600",
    lineHeight: 28,

  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: "#6e6e73",
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 18,
  },
  loadingBox: {
    alignItems: "center",
    marginVertical: 16,
  },
  helper: {
    marginTop: 4,
    color: "#6e6e73",
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "#FFECEC",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
  },
  retryButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  retryText: {
    color: "#FF3B30",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardLabel: {
    fontSize: 12,
    color: "#6e6e73",
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
  },
  cardHint: {
    fontSize: 12,
    color: "#8e8e93",
    marginTop: 4,
  },
  largeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  largeCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  largeCardLabel: {
    fontSize: 13,
    color: "#6e6e73",
  },
  largeCardValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  largeCardHint: {
    fontSize: 12,
    color: "#8e8e93",
    marginTop: 4,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  quickEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  quickHint: {
    fontSize: 12,
    color: "#8e8e93",
    marginTop: 2,
  },
});