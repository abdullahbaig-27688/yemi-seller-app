import React, { useState } from "react";
import { View, Text, Button, Modal, TextInput, StyleSheet } from "react-native";

const BankCardPreview = ({ bank }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>
        Holder Name:{" "}
        <Text style={styles.value}>{bank.holderName || "John Doe"}</Text>
      </Text>
      <Text style={styles.label}>
        Bank Name:{" "}
        <Text style={styles.value}>{bank.bankName || "ABC Bank"}</Text>
      </Text>
      <Text style={styles.label}>
        Branch Name:{" "}
        <Text style={styles.value}>{bank.branchName || "Main Branch"}</Text>
      </Text>
      <Text style={styles.label}>
        Account Number:{" "}
        <Text style={styles.value}>{bank.accountNumber || "1234567890"}</Text>
      </Text>
    </View>
  );
};

const BankScreen = () => {
  const [bank, setBank] = useState({
    holderName: "",
    bankName: "",
    branchName: "",
    accountNumber: "",
  });

  const [editData, setEditData] = useState(bank);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSave = () => {
    setBank(editData); // update bank details
    setModalVisible(false); // close modal
  };

  return (
    <View style={{ padding: 20 }}>
      {/* Bank Preview */}
      <BankCardPreview bank={bank} />

      {/* Edit Button */}
      <Button
        title="Edit Bank Info"
        onPress={() => {
          setEditData(bank); // load existing data
          setModalVisible(true);
        }}
      />

      {/* Edit Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <TextInput
            placeholder="Holder Name"
            value={editData.holderName}
            onChangeText={(t) => setEditData({ ...editData, holderName: t })}
            style={styles.input}
          />

          <TextInput
            placeholder="Bank Name"
            value={editData.bankName}
            onChangeText={(t) => setEditData({ ...editData, bankName: t })}
            style={styles.input}
          />

          <TextInput
            placeholder="Branch Name"
            value={editData.branchName}
            onChangeText={(t) => setEditData({ ...editData, branchName: t })}
            style={styles.input}
          />

          <TextInput
            placeholder="Account Number"
            value={editData.accountNumber}
            onChangeText={(t) => setEditData({ ...editData, accountNumber: t })}
            style={styles.input}
            keyboardType="numeric"
          />

          <Button title="Save" onPress={handleSave} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

export default BankScreen;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: 20,
    backgroundColor: "#0a3d62",
    borderRadius: 12,
    marginBottom: 20,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
  value: {
    fontWeight: "700",
  },
  modalContent: {
    padding: 20,
    marginTop: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
});
