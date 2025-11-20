// src/screens/ClientsScreen.tsx
import React, { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { AddClientModal } from "../components/AddClientModal";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { getUsers, GymUser } from "../api/users";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ClientsStackParamList } from "../../App";

export const ClientsScreen: React.FC = () => {
  const [clients, setClients] = useState<GymUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<ClientsStackParamList>>();

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setClients(data);
    } catch (e: any) {
      console.log(e?.response?.data || e.message);
      setError("No se pudieron cargar los clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handlePressClient = (client: GymUser) => {
    navigation.navigate("ClientDetail", {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
    });
  };

  const renderItem = ({ item }: { item: GymUser }) => {
    const initial = item.name?.charAt(0)?.toUpperCase() || "?";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePressClient(item)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          {item.email ? <Text style={styles.email}>{item.email}</Text> : null}
          {item.phone ? <Text style={styles.phone}>{item.phone}</Text> : null}
        </View>
        <Feather name="arrow-right" size={20} color="#c7c7cc" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.helper}>Cargando clientes…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadClients}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (clients.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.helper}>No hay clientes aún.</Text>
        <Text style={styles.helper}>
          Agrega tu primer cliente para empezar a registrar accesos.
        </Text>

        <TouchableOpacity
          style={[styles.quickActionCard, { marginTop: 16 }]}
          onPress={() => setShowAddClientModal(true)}
        >
          <Text style={styles.quickEmoji}>➕</Text>
        
       
        </TouchableOpacity>

        <AddClientModal
          visible={showAddClientModal}
          onClose={() => setShowAddClientModal(false)}
          onCreated={loadClients}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con botón de "Nuevo cliente" */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 36,
          marginBottom: 8,
        }}
      >
        <Text style={styles.title}>Clientes</Text>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => setShowAddClientModal(true)}
        >
          <Text style={styles.quickEmoji}>➕</Text>
         
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Toca un cliente para ver su detalle y registrar acceso
      </Text>

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 8 }}
      />

      {/* Modal para crear cliente */}
      <AddClientModal
        visible={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        onCreated={loadClients}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  centered: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6e6e73",
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e5e5ea",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontWeight: "600",
    fontSize: 18,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  email: {
    fontSize: 13,
    color: "#6e6e73",
  },
  phone: {
    fontSize: 13,
    color: "#8e8e93",
  },
  helper: {
    marginTop: 8,
    color: "#6e6e73",
    textAlign: "center",
  },
  error: {
    color: "#ff3b30",
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d1d6",
  },
  retryText: {
    color: "#007aff",
    fontWeight: "500",
  },
  quickActionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    alignItems: "flex-start",
    maxWidth: 180,
  },
  quickEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  quickHint: {
    fontSize: 11,
    color: "#8e8e93",
    marginTop: 2,
  },
});