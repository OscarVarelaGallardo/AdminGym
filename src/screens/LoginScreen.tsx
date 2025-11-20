// src/screens/LoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export const LoginScreen: React.FC = () => {
  const { signIn, loading, error } = useAuth();
  const [email, setEmail] = useState("oscar@example.com"); // para probar rápido
  const [password, setPassword] = useState("123456");

  const handleLogin = async () => {
    await signIn(email, password);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Gym Sub App</Text>
        <Text style={styles.subtitle}>Panel de administración</Text>
         
        <View style={styles.form}>
       
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />

          {error && <Text style={styles.error}>{error}</Text>}
              <View style={{ alignItems: "center" }}>
              <Image
                  source={require("../../assets/google-icon.png")}
                  accessibilityLabel="Google Icon"
                  style={{ width: 34, height: 34, marginBottom: 16 }}
                />
                </View>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.helper}>
           Olvide mi contraseña
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {

   //abarcar toda la pantalla
    flex: 1,
    backgroundColor: "#f2f2f7",

   

  
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6e6e73",
    marginBottom: 32,
  },
  form: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    width: "100%",
    height: 350,
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    color: "#3a3a3c",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d1d6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    backgroundColor: "#fdfdfd",
  },
  button: {
    backgroundColor: "#000000",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  error: {
    color: "#ff3b30",
    marginBottom: 8,
  },
  helper: {
    textAlign: "center",
    marginTop: 16,
    color: "#8e8e93",
  },
});