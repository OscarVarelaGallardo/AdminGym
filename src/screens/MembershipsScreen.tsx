// src/screens/MembershipsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import {
  getMemberships,
  createMembership,
  Membership,
} from "../api/memberships";

export const MembershipsScreen: React.FC = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("30");
  const [price, setPrice] = useState("499");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const loadMemberships = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMemberships();
      setMemberships(data);
    } catch (e: any) {
      console.log(e?.response?.data || e.message);
      setError("No se pudieron cargar las membresías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemberships();
  }, []);

  const handleOpenModal = () => {
    setName("");
    setDuration("30");
    setPrice("499");
    setDescription("");
    setModalVisible(true);
  };

  const handleSaveMembership = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }
    const d = parseInt(duration, 10);
    const p = parseFloat(price);

    if (isNaN(d) || isNaN(p)) {
      Alert.alert("Error", "Duración y precio deben ser numéricos");
      return;
    }

    try {
      setSaving(true);
      await createMembership({
        name: name.trim(),
        description: description.trim() || undefined,
        durationDays: d,
        price: p,
      });
      setModalVisible(false);
      loadMemberships();
    } catch (e: any) {
      console.log(e?.response?.data || e.message);
      Alert.alert("Error", "No se pudo crear la membresía");
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }: { item: Membership }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.info}>
        {item.durationDays} días · ${item.price.toFixed(2)}
      </Text>
      {item.description ? (
        <Text style={styles.description}>{item.description}</Text>
      ) : null}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.helper}>Cargando membresías…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMemberships}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Membresías</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleOpenModal}>
          <Text style={styles.addButtonText}>+ Nueva</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>
        Planes disponibles en el sistema del gym
      </Text>

      {memberships.length === 0 ? (
        <View style={styles.centeredInside}>
          <Text style={styles.helper}>
            No hay membresías. Crea la primera con el botón "Nueva".
          </Text>
        </View>
      ) : (
        <FlatList
          data={memberships}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}

      {/* Modal para crear membresía */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva membresía</Text>

            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Mensual Básica"
            />

            <Text style={styles.label}>Duración (días)</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
            />

            <Text style={styles.label}>Precio</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.input, { height: 70 }]}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveMembership}
                disabled={saving}
              >
                <Text style={styles.saveText}>
                  {saving ? "Guardando..." : "Guardar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  centered: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    alignItems: "center",
    justifyContent: "center",
  },
  centeredInside: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: "#6e6e73",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  info: {
    fontSize: 13,
    color: "#6e6e73",
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: "#8e8e93",
    marginTop: 4,
  },
  helper: {
    marginTop: 4,
    color: "#6e6e73",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  error: {
    color: "#ff3b30",
    fontSize: 14,
    marginBottom: 8,
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
  addButton: {
    backgroundColor: "#000000",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: "#3a3a3c",
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d1d6",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fdfdfd",
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 8,
  },
  modalButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#d1d1d6",
  },
  saveButton: {
    backgroundColor: "#000000",
  },
  cancelText: {
    color: "#3a3a3c",
  },
  saveText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});