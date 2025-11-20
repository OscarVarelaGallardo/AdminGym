import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { createClient } from "../api/users";

interface AddClientModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: () => void; // para refrescar listas/dashboard si quieres
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  visible,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setError(null);

  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createClient({
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        password: password.trim() || null,
      });

      resetForm();
      onClose();
      onCreated && onCreated();
    } catch (e: any) {
      console.log(e?.response?.data || e.message);
      setError("No se pudo crear el cliente. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Nuevo cliente</Text>
            <Text style={styles.subtitle}>
              Registra un nuevo cliente para tu gimnasio.
            </Text>

            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Juan Pérez"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="correo@ejemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />


            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="10 dígitos"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Contraseña inicial"
              value={password}
              onChangeText={setPassword}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text 
                 
                  style={styles.buttonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    color: "#6e6e73",
    marginTop: 4,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#f6f6f6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  error: {
    color: "#FF3B30",
    marginTop: 8,
    fontSize: 12,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 18,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    minWidth: 100,
    alignItems: "center",
  },
  buttonPrimary: {
    backgroundColor: "#000",
  },
  buttonSecondary: {
    backgroundColor: "#f2f2f7",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  buttonTextSecondary: {
    color: "#000",
  },
});