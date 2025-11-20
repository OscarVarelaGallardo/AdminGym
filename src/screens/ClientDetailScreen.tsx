// src/screens/ClientDetailScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import {
  createPayment,
  getPaymentsByUser,
  Payment,
  PaymentMethod,
} from "../api/payments";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ClientsStackParamList } from "../../App";
import {
  registerAccess,
  getUserAccessLogs,
  AccessLog,
  AccessType,
} from "../api/access";
import {
  UserMembership,
  getCurrentMembershipForUser,
  assignMembership,
} from "../api/subscriptions";
import { getMemberships, Membership } from "../api/memberships";

type Props = NativeStackScreenProps<ClientsStackParamList, "ClientDetail">;

export const ClientDetailScreen: React.FC<Props> = ({ route }) => {
  const { id, name, email, phone } = route.params;
 const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [paymentReference, setPaymentReference] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [savingAccess, setSavingAccess] = useState(false);

  const [currentSub, setCurrentSub] = useState<UserMembership | null>(null);
  const [loadingSub, setLoadingSub] = useState(true);

  // Para asignar membresía
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedMembershipId, setSelectedMembershipId] = useState<number | null>(
    null
  );
  const [savingMembership, setSavingMembership] = useState(false);
 const loadPayments = async () => {
    try {
      setLoadingPayments(true);
      const list = await getPaymentsByUser(id);
      console.log("Pagos cargados:", list);
      setPayments(list);
    } catch (e: any) {
      console.log("Error cargando pagos:", e?.response?.data || e.message);
    } finally {
      setLoadingPayments(false);
    }
  };
    useEffect(() => {
    loadAccessLogs();
    loadCurrentMembership();
    loadPayments();
  }, []);
    const openPaymentModal = () => {
    // si tiene membresía actual, sugerimos el precio
    if (currentSub?.membership?.price) {
      setPaymentAmount(currentSub.membership.price.toString());
    } else {
      setPaymentAmount("");
    }
    setPaymentMethod("CASH");
    setPaymentReference("");
    setPaymentModalVisible(true);
  };
    const handleSavePayment = async () => {
    const amountNumber = parseFloat(paymentAmount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      Alert.alert("Error", "Monto inválido");
      return;
    }

    try {
      setSavingPayment(true);
      await createPayment({
        userId: id,
        userMembershipId: currentSub?.id,
        amount: amountNumber,
        method: paymentMethod,
        reference: paymentReference.trim() || undefined,
      });
      setPaymentModalVisible(false);
      Alert.alert("Listo", "Pago registrado correctamente");
      loadPayments();
    } catch (e: any) {
      console.log("Error createPayment:", e?.response?.data || e.message);
      Alert.alert("Error", "No se pudo registrar el pago");
    } finally {
      setSavingPayment(false);
    }
  };
  const loadAccessLogs = async () => {
    try {
      setLoadingAccess(true);
      const logs = await getUserAccessLogs(id);
      setAccessLogs(logs);
    } catch (e: any) {
      console.log(e?.response?.data || e.message);
    } finally {
      setLoadingAccess(false);
    }
  };

  const loadCurrentMembership = async () => {
    try {
      setLoadingSub(true);
      const sub = await getCurrentMembershipForUser(id);
      setCurrentSub(sub);
    } catch (e: any) {
      // Si no tiene membresía activa, lo dejamos en null
      console.log("No hay membresía activa o error:", e?.response?.data || e.message);
      setCurrentSub(null);
    } finally {
      setLoadingSub(false);
    }
  };

  const loadMemberships = async () => {
    try {
      const list = await getMemberships();
      setMemberships(list);
      if (list.length > 0) {
        setSelectedMembershipId(list[0].id);
      }
    } catch (e: any) {
      console.log("Error cargando membresías:", e?.response?.data || e.message);
      Alert.alert("Error", "No se pudieron cargar las membresías");
    }
  };

  useEffect(() => {
    loadAccessLogs();
    loadCurrentMembership();
  }, []);

  const handleRegisterAccess = async (type: AccessType) => {
    try {
      setSavingAccess(true);
      await registerAccess({
        userId: id,
        type,
        source: "APP_MOBILE",
      });
      Alert.alert(
        "Acceso registrado",
        type === "ENTRY" ? "Entrada registrada" : "Salida registrada"
      );
      loadAccessLogs();
    } catch (e: any) {
      console.log(e?.response?.data || e.message);
      Alert.alert("Error", "No se pudo registrar el acceso");
    } finally {
      setSavingAccess(false);
    }
  };

  const openAssignMembershipModal = async () => {
    await loadMemberships();
    setAssignModalVisible(true);
  };

  const handleAssignMembership = async () => {
    if (!selectedMembershipId) {
      Alert.alert("Error", "Selecciona una membresía");
      return;
    }

    try {
      setSavingMembership(true);
      const sub = await assignMembership({
        userId: id,
        membershipId: selectedMembershipId,
        autoRenew: true,
      });
      setCurrentSub(sub);
      setAssignModalVisible(false);
      Alert.alert("Listo", "Membresía asignada correctamente");
    } catch (e: any) {
      console.log("Error assignMembership:", e?.response?.data || e.message);
      Alert.alert("Error", "No se pudo asignar la membresía");
    } finally {
      setSavingMembership(false);
    }
  };

  const renderAccess = (log: AccessLog) => {
    const date = new Date(log.accessTime);
    const timeStr = date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View key={log.id} style={styles.accessItem}>
        <Text style={styles.accessType}>
          {log.type === "ENTRY" ? "Entrada" : "Salida"}
        </Text>
        <Text style={styles.accessTime}>{timeStr}</Text>
        {log.source ? (
          <Text style={styles.accessSource}>{log.source}</Text>
        ) : null}
      </View>
    );
  };

  const initial = name.charAt(0).toUpperCase();

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString();
  };

  return (
    <ScrollView style={styles.container}>
      {/* CABECERA */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
          {phone ? <Text style={styles.phone}>{phone}</Text> : null}
        </View>
      </View>

      {/* MEMBRESÍA ACTUAL */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Membresía actual</Text>
        <TouchableOpacity
          style={styles.assignButton}
          onPress={openAssignMembershipModal}
        >
          <Text style={styles.assignText}>
            {currentSub ? "Cambiar" : "Asignar"}
          </Text>
        </TouchableOpacity>
      </View>

      {loadingSub ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator />
          <Text style={styles.helper}>Cargando membresía…</Text>
        </View>
      ) : currentSub ? (
        <View style={styles.membershipCard}>
          <Text style={styles.membershipName}>
            {currentSub.membership.name}
          </Text>
          <Text style={styles.membershipInfo}>
            {currentSub.membership.durationDays} días · $
            {currentSub.membership.price.toFixed(2)}
          </Text>
          <Text style={styles.membershipInfo}>
            Estado: {currentSub.status === "ACTIVE" ? "Activa ✔" : currentSub.status}
          </Text>
          <Text style={styles.membershipInfo}>
            Inicio: {formatDate(currentSub.startDate)} · Fin:{" "}
            {formatDate(currentSub.endDate)}
          </Text>
          <Text style={styles.membershipInfo}>
            Renovación automática: {currentSub.autoRenew ? "Sí" : "No"}
          </Text>
        </View>
      ) : (
        <Text style={styles.helper}>
          Este cliente aún no tiene una membresía asignada.
        </Text>
      )}
    {/* PAGOS */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Pagos recientes</Text>
        <TouchableOpacity
          style={styles.assignButton}
          onPress={openPaymentModal}
        >
          <Text style={styles.assignText}>Registrar pago</Text>
        </TouchableOpacity>
      </View>

      {loadingPayments ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator />
          <Text style={styles.helper}>Cargando pagos…</Text>
        </View>
      ) : payments.length === 0 ? (
        <Text style={styles.helper}>
          Aún no hay pagos registrados para este cliente.
        </Text>
      ) : (
        <View style={styles.paymentsList}>
          {payments.slice(0, 5).map((p) => {
            const d = new Date(p.createdAt);
            const dateStr = d.toLocaleDateString()
            const dateHours = d.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <View key={p.id} style={styles.paymentItem}>
                <View>
                  <Text style={styles.paymentAmount}>
                    ${p.amount.toFixed(2)}
                  </Text>
                  <Text style={styles.paymentMethod}>{p.method}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.paymentDate}>{dateStr}</Text>
                  <Text style={styles.paymentDate}>{dateHours}</Text>
                  {p.reference ? (
                    <Text style={styles.paymentRef}>Ref: {p.reference}</Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      )}
      {/* MODAL PARA REGISTRAR PAGO */}
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Registrar pago</Text>

            <Text style={styles.label}>Monto</Text>
            <TextInput
              style={styles.input}
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="decimal-pad"
              placeholder="499"
            />

            <Text style={styles.label}>Método</Text>
            <View style={styles.paymentMethodRow}>
              {(["CASH", "CARD", "TRANSFER", "OTHER"] as PaymentMethod[]).map(
                (m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.methodChip,
                      paymentMethod === m && styles.methodChipActive,
                    ]}
                    onPress={() => setPaymentMethod(m)}
                  >
                    <Text
                      style={[
                        styles.methodChipText,
                        paymentMethod === m && styles.methodChipTextActive,
                      ]}
                    >
                      {m === "CASH"
                        ? "Efectivo"
                        : m === "CARD"
                        ? "Tarjeta"
                        : m === "TRANSFER"
                        ? "Transferencia"
                        : "Otro"}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <Text style={styles.label}>Referencia (opcional)</Text>
            <TextInput
              style={styles.input}
              value={paymentReference}
              onChangeText={setPaymentReference}
              placeholder="RECIBO-0001"
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setPaymentModalVisible(false)}
                disabled={savingPayment}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSavePayment}
                disabled={savingPayment}
              >
                <Text style={styles.saveText}>
                  {savingPayment ? "Guardando..." : "Guardar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* ACCIONES DE ACCESO */}
      <Text style={styles.sectionTitle}>Acciones rápidas</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.entryButton]}
          onPress={() => handleRegisterAccess("ENTRY")}
          disabled={savingAccess}
        >
          <Text style={styles.actionText}>
            {savingAccess ? "Guardando..." : "Registrar ENTRADA"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.exitButton]}
          onPress={() => handleRegisterAccess("EXIT")}
          disabled={savingAccess}
        >
          <Text style={styles.actionText}>
            {savingAccess ? "Guardando..." : "Registrar SALIDA"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ACCESOS RECIENTES */}
      <Text style={styles.sectionTitle}>Accesos recientes</Text>
      {loadingAccess ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator />
          <Text style={styles.helper}>Cargando accesos…</Text>
        </View>
      ) : accessLogs.length === 0 ? (
        <Text style={styles.helper}>Aún no hay accesos registrados.</Text>
      ) : (
        <View style={styles.accessList}>
          {accessLogs.slice(0, 10).map(renderAccess)}
        </View>
      )}

      {/* MODAL PARA ASIGNAR MEMBRESÍA */}
      <Modal
        visible={assignModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Asignar membresía</Text>

            {memberships.length === 0 ? (
              <Text style={styles.helper}>
                No hay membresías disponibles. Crea alguna en la pestaña
                "Membresías".
              </Text>
            ) : (
              memberships.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={styles.membershipOption}
                  onPress={() => setSelectedMembershipId(m.id)}
                >
                  <View style={styles.radioOuter}>
                    {selectedMembershipId === m.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <View>
                    <Text style={styles.membershipOptionName}>{m.name}</Text>
                    <Text style={styles.membershipOptionInfo}>
                      {m.durationDays} días · ${m.price.toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setAssignModalVisible(false)}
                disabled={savingMembership}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAssignMembership}
                disabled={savingMembership || memberships.length === 0}
              >
                <Text style={styles.saveText}>
                  {savingMembership ? "Asignando..." : "Asignar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    paddingHorizontal: 16,
    paddingTop: 86,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e5e5ea",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d1d6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: "#fefefe",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
  },
  email: {
    fontSize: 14,
    color: "#6e6e73",
  },
  phone: {
    fontSize: 14,
    color: "#8e8e93",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  assignButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d1d6",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  assignText: {
    fontSize: 13,
    color: "#007aff",
    fontWeight: "500",
  },
  membershipCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  membershipName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  membershipInfo: {
    fontSize: 13,
    color: "#6e6e73",
  },
  actionsRow: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  entryButton: {
    backgroundColor: "#34C759",
  },
  exitButton: {
    backgroundColor: "#FF3B30",
  },
  actionText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  loadingBox: {
    paddingVertical: 16,
    alignItems: "center",
  },
  helper: {
    marginTop: 4,
    color: "#6e6e73",
  },
  accessList: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  accessItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e5ea",
  },
  accessType: {
    fontWeight: "600",
  },
  accessTime: {
    color: "#6e6e73",
  },
  accessSource: {
    color: "#8e8e93",
    fontSize: 12,
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
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    color: "#000000",
    
  },
  membershipOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#000",
  },
  membershipOptionName: {
    fontSize: 14,
    fontWeight: "600",
  },
  membershipOptionInfo: {
    fontSize: 12,
    color: "#6e6e73",
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
    paymentsList: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e5ea",
  },
  paymentAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
 
  paymentMethod: {
    fontSize: 12,
    color: "#6e6e73",
  },
  paymentDate: {
    fontSize: 12,
    color: "#6e6e73",
  },
  paymentRef: {
    fontSize: 11,
    color: "#8e8e93",
  },
  paymentMethodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
    marginTop: 4,
  },
  methodChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d1d6",
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  methodChipActive: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  methodChipText: {
    fontSize: 12,
    color: "#3a3a3c",
  },
  methodChipTextActive: {
    color: "#ffffff",
  },
});