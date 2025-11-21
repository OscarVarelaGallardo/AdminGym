// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from "react";
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
import { Feather } from "@expo/vector-icons";
// (Si ahorita no quieres usar Google, puedes comentar estas imports y el botón)
// import * as WebBrowser from "expo-web-browser";
// import * as Google from "expo-auth-session/providers/google";
// import { makeRedirectUri } from "expo-auth-session";

// WebBrowser.maybeCompleteAuthSession();

export const LoginScreen: React.FC = () => {
  const { signIn, loading, error } = useAuth();

  const [email, setEmail] = useState("oscar@example.com");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);

  // Deshabilitar login si faltan campos
  const isLoginDisabled = !email.trim() || !password.trim() || loading;

  const handleLogin = async () => {
    if (isLoginDisabled) return;
    await signIn(email.trim(), password);
  };

  // --------------------------
  // Si más adelante quieres volver a activar Google, aquí reusamos:
  // --------------------------
  /*
  const WEB_CLIENT_ID =
    "74716403659-2v6joni4eg5ubnmm33cima5lag1u34lp.apps.googleusercontent.com";

  const redirectUri = makeRedirectUri({ useProxy: true });

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    expoClientId: WEB_CLIENT_ID,
    iosClientId: WEB_CLIENT_ID,
    androidClientId: WEB_CLIENT_ID,
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      console.log("✅ Google auth success:", authentication);
      // Aquí conectarías con tu backend
    } else if (response?.type === "error") {
      console.log("❌ Google auth error:", response);
    }
  }, [response]);

  const handleGoogleLogin = () => {
    promptAsync();
  };
  */

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        {/* HEADER / LOGO */}
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <Image
              source={require("../../assets/gymsub.png")} // 🔁 cambia el nombre si tu logo se llama distinto
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>GymSub</Text>
          <Text style={styles.appSubtitle}>Panel de administración</Text>
        </View>

        {/* CARD FORM */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Iniciar sesión</Text>
          <Text style={styles.formSubtitle}>
            Usa tu cuenta de administrador para gestionar tu gimnasio.
          </Text>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="tucorreo@ejemplo.com"
            placeholderTextColor="#b0b0b5"
          />

          {/* Password + toggle */}
          <View style={styles.passwordRow}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            secureTextEntry={!showPassword}
            placeholder="••••••••"
            placeholderTextColor="#b0b0b5"
          />

          <TouchableOpacity
            style={styles.showPasswordButton}
            onPress={() => setShowPassword((prev) => !prev)}
          >
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              size={16}
              color="#6e6e73"
            />
          </TouchableOpacity>
        </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Botón login normal */}
          <TouchableOpacity
            style={[
              styles.button,
              isLoginDisabled && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoginDisabled}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o continúa con</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Botón Google (solo UI, lógica opcional arriba) */}
          <TouchableOpacity
            style={styles.googleButton}
            // onPress={handleGoogleLogin}
            // disabled={!request}
          >
            <Image
              source={require("../../assets/google-icon.png")}
              accessibilityLabel="Google Icon"
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Google</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <Text style={styles.helper}>¿Olvidaste tu contraseña?</Text>
        <Text style={styles.footerNote}>GymSub · Admin · v1.0.0</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505", // fondo oscuro para hacer contraste con la tarjeta
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#d9d0d0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logo: {
    
    //hacerlo redondo
    width: 90,
    height: 90,
    borderRadius: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
  },
  appSubtitle: {
    fontSize: 14,
    color: "#a1a1a6",
    marginTop: 4,
  },
  form: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 12,
    color: "#6e6e73",
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: "#3a3a3c",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d1d6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    backgroundColor: "#fdfdfd",
    fontSize: 14,
    color: "#111111",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  showPasswordButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  showPasswordText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#007aff",
  },
  button: {
    backgroundColor: "#000000",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  errorBox: {
    backgroundColor: "#FFECEC",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
  },
  helper: {
    textAlign: "center",
    marginTop: 16,
    color: "#d1d1d6",
    fontSize: 12,
  },
  footerNote: {
    textAlign: "center",
    marginTop: 4,
    color: "#6e6e73",
    fontSize: 11,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e5ea",
  },
  dividerText: {
    marginHorizontal: 8,
    color: "#8e8e93",
    fontSize: 11,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d1d6",
    paddingVertical: 10,
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  googleIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3a3a3c",
  },
});