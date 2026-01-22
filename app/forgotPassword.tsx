import ForgotField from "@/components/inputFields";
import PrimaryButton from "@/components/primaryButton";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendResetLink = async () => {
        if (!email.trim()) {
            Alert.alert("Error", "Please enter your email address.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `https://yemi.store/api/v2/seller/auth/forgot-password?identity=${encodeURIComponent(email)}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();
            setLoading(false);

            if (response.ok) {
                Alert.alert(
                    "Success",
                    "Reset link sent! Check your email inbox or spam folder."
                );
                setEmail("");
            } else {
                Alert.alert("Error", data?.message || "Failed to send reset link.");
            }
        } catch (error) {
            setLoading(false);
            Alert.alert("Error", "Something went wrong. Please try again.");
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Background Shapes */}
            <Svg style={styles.midShape} viewBox="0 0 200 200">
                <Path
                    fill="#DCE6FF"
                    d="M47.7,-62.7C62.6,-52.5,77.1,-39.5,83.4,-22.4C89.7,-5.2,87.7,16,75.4,27.9C63.1,39.8,40.5,42.4,21.3,50.6C2,58.9,-13.8,72.9,-30.7,72.8C-47.7,72.8,-65.8,58.8,-75.8,40.3C-85.8,21.7,-87.7,-1.4,-78.7,-18.7C-69.7,-36,-49.9,-47.6,-32.1,-58.1C-14.3,-68.6,1.4,-78,18.8,-80.4C36.2,-82.7,55.2,-77.3,47.7,-62.7Z"
                    transform="translate(100 100)"
                />
            </Svg>

            <View style={styles.topShape} />

            <Svg style={styles.rightShape} viewBox="0 0 200 200">
                <Path
                    fill="#FA8232"
                    d="M47.7,-62.7C62.6,-52.5,77.1,-39.5,83.4,-22.4C89.7,-5.2,87.7,16,75.4,27.9C63.1,39.8,40.5,42.4,21.3,50.6C2,58.9,-13.8,72.9,-30.7,72.8C-47.7,72.8,-65.8,58.8,-75.8,40.3C-85.8,21.7,-87.7,-1.4,-78.7,-18.7C-69.7,-36,-49.9,-47.6,-32.1,-58.1C-14.3,-68.6,1.4,-78,18.8,-80.4C36.2,-82.7,55.2,-77.3,47.7,-62.7Z"
                    transform="translate(100 100)"
                />
            </Svg>

            <Text style={styles.title}>Forgot Password?</Text>

            <View style={styles.instructions}>
                <Text style={styles.instructionText}>
                    1. Enter your email address below.
                </Text>
                <Text style={styles.instructionText}>
                    2. We will send you a temporary link via email.
                </Text>
                <Text style={styles.instructionText}>
                    3. Click the link to reset your password securely.
                </Text>
            </View>

            <ForgotField
                placeholder="Enter email to reset password"
                value={email}
                onChangeText={setEmail}
            />

            <View style={styles.buttonRow}>
                <PrimaryButton
                    title={loading ? "Sending..." : "Send Reset Link"}
                    onPress={handleSendResetLink}
                    disabled={loading}
                />
                <PrimaryButton
                    title="Cancel"
                    onPress={() => router.back()}
                    variant="outline"
                />
            </View>
        </View>
    );
};

export default ForgotPassword;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 16,
    },
    topShape: {
        position: "absolute",
        top: -100,
        left: -70,
        width: 270,
        height: 270,
        backgroundColor: "#FA8232",
        borderBottomRightRadius: 180,
    },
    midShape: {
        position: "absolute",
        width: 300,
        height: 300,
        top: -70,
        left: -25,
    },
    rightShape: {
        position: "absolute",
        right: -120,
        width: 250,
        height: 200,
        marginBottom: 300,
        transform: [{ rotate: "140deg" }],
    },
    title: {
        fontSize: 40,
        fontWeight: "700",
        color: "#202020",
        marginBottom: 20,
        marginTop: 200,
    },
    instructions: {
        marginBottom: 20,
    },
    instructionText: {
        fontSize: 14,
        color: "#666",
        marginBottom: 6,
        lineHeight: 20,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        marginTop: 20,
    },
});
