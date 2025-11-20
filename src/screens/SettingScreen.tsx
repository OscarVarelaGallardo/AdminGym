// src/screens/SettingsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getGymInfo, updateGymInfo, GymInfo, createGymInfo } from "../api/gym";

export const SettingsScreen: React.FC = () => {
  const { signOut, user } = useAuth();

  const [gymInfo, setGymInfo] = useState<GymInfo | null>(null);
  const [loadingGym, setLoadingGym] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formularios controlados
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [schedule, setSchedule] = useState("");
  const [phone, setPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const loadGymInfo = async () => {
    try {
      if (!user?.id) {
        // sin usuario logueado no tiene sentido cargar info de gym
        setLoadingGym(false);
        return;
      }

      setLoadingGym(true);
      setError(null);

      // 👇 ahora el backend necesita userId como query param
      const data = await getGymInfo(user.id);

      if (!data) {
        // el usuario aún no tiene gym creado
        setGymInfo(null);
        setName("");
        setAddress("");
        setSchedule("");
        setPhone("");
        setLogoUrl("");
        return;
      }

      setGymInfo(data);
      setName(data.name || "");
      setAddress(data.address || "");
      setSchedule(data.schedule || "");
      setPhone(data.phone || "");
      setLogoUrl(data.logoUrl || "");

    } catch (e: any) {
      console.log(e?.response?.data || e.message);
      setError("No se pudo cargar la información del gimnasio.");
    } finally {
      setLoadingGym(false);
    }
  };

  useEffect(() => {
    loadGymInfo();
  }, [user?.id]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validación", "El nombre del gym es obligatorio.");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "No hay usuario autenticado.");
      return;
    }

    console.log("Handle save gym info");
    console.log({ name, address, schedule, phone, logoUrl, user });

    try {
      setSaving(true);
      setError(null);

      const userId = user.id;

      if (!gymInfo) {
        // 👇 crear nuevo gym
        console.log("Creating new gym info");
        const body = {
          name: name.trim(),
          address: address.trim(),
          schedule: schedule.trim(),
          phone: phone.trim(),
          logoUrl: logoUrl.trim(),
          userId, // importante
        };
        console.log("Create gym info body:", body);

        const created = await createGymInfo(body);
        console.log("Created gym info:", created);

        setGymInfo(created);
        Alert.alert("Éxito", "Información del gimnasio creada.");
        return;
      }

      // 👇 actualizar gym existente
      console.log("Updating existing gym info");
      //ver el id del gymInfo que ya tenemos
      console.log("Gym ID:", gymInfo.id);
      const updated = await updateGymInfo( {
        name: name.trim(),
        address: address.trim(),
        schedule: schedule.trim(),
        phone: phone.trim(),
        logoUrl: logoUrl.trim(),
        gymId : gymInfo.id // importante
      });

      setGymInfo(updated);
      Alert.alert("Éxito", "Información del gimnasio actualizada.");
    } catch (e: any) {
      console.log(e?.response?.data || e.message);
      setError("No se pudo guardar la información del gimnasio.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
        
     
        <View style={{ flex: 1 , flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <View style={{ flex: 1 }}>
             <Text style={styles.title}>Ajustes</Text>
            <Text style={styles.subtitle}>
                Administra tu cuenta y la configuración de tu gimnasio.
           </Text>
                </View>
            <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
 
      </View>
      {/* CARD INFO GYM */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Información del gimnasio</Text>
          {loadingGym && <ActivityIndicator size="small" />}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Nombre */}
        <Text style={styles.label}>Nombre del gym *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. GYM Power Center"
          value={name}
          onChangeText={setName}
        />

        {/* Dirección */}
        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Calle, número, colonia, ciudad"
          value={address}
          onChangeText={setAddress}
          multiline
        />

        {/* Horarios */}
        <Text style={styles.label}>Horarios</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Ej. Lun-Vie 6:00–22:00, Sáb 8:00–14:00"
          value={schedule}
          onChangeText={setSchedule}
          multiline
        />

        {/* Teléfono */}
        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          placeholder="10 dígitos"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        {/* Logo URL */}
        <Text style={styles.label}>Logo (URL de imagen)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://..."
          value={logoUrl}
          onChangeText={setLogoUrl}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving || loadingGym}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar cambios</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 🔔 NOTIFICACIONES */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notificaciones</Text>

        <View style={styles.notificationRow}>
          <Text style={styles.notificationLabel}>Activas</Text>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              notificationsEnabled ? styles.toggleOn : styles.toggleOff,
            ]}
            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
          >
            <View
              style={[
                styles.toggleCircle,
                notificationsEnabled ? styles.circleOn : styles.circleOff,
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* CARD CUENTA */}
      
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#6e6e73",
    marginBottom: 26,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardText: {
    fontSize: 13,
    color: "#6e6e73",
    marginTop: 4,
  },
  cardUser: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  
 
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e5ea",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#fafafa",
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#000",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  notificationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  notificationLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  toggleButton: {
    width: 52,
    height: 28,
    borderRadius: 20,
    padding: 2,
    justifyContent: "center",
  },
  toggleOn: {
    backgroundColor: "#34C759",
    alignItems: "flex-end",
  },
  toggleOff: {
    backgroundColor: "#d1d1d6",
    alignItems: "flex-start",
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  circleOn: {
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  circleOff: {
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  logoutFooter: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  paddingHorizontal: 16,
  paddingVertical: 20,
  backgroundColor: "#F5F5F7",
  borderTopWidth: 1,
  borderTopColor: "#e5e5ea",
},

logoutButton: {
  paddingVertical: 14,
  borderRadius: 999,
  backgroundColor: "#000",
  alignItems: "center",
},

logoutText: {
  color: "#fff",
  fontWeight: "600",
  fontSize: 10,
  marginHorizontal: 8
},
});