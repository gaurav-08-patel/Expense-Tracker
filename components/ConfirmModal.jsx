import { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, Text, View } from "react-native";

export default function ConfirmModal({
    visible,
    title,
    message,
    confirmText = "Delete",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
}) {
    const [isMounted, setIsMounted] = useState(visible);
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.92)).current;

    useEffect(() => {
        if (visible) {
            setIsMounted(true);
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 9,
                    useNativeDriver: true,
                }),
            ]).start();
            return;
        }

        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 180,
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: 0.92,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsMounted(false);
        });
    }, [visible, opacity, scale]);

    if (!isMounted) {
        return null;
    }

    return (
        <Modal
            visible
            transparent
            animationType="none"
            onRequestClose={onCancel}
        >
            <Animated.View
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.18)",
                    opacity,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 24,
                }}
            >
                <Pressable
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                    onPress={onCancel}
                />
                <Animated.View
                    style={{
                        width: "100%",
                        maxWidth: 360,
                        backgroundColor: "#ffffff",
                        borderRadius: 24,
                        padding: 24,
                        transform: [{ scale }],
                    }}
                >
                    <Text className="text-[20px] font-bold text-slate-950">
                        {title}
                    </Text>
                    <Text className="mt-3 text-[15px] leading-6 text-slate-600">
                        {message}
                    </Text>

                    <View className="mt-6 flex-row justify-end gap-3">
                        <Pressable
                            onPress={onCancel}
                            className="rounded-2xl border border-slate-300 bg-white px-4 py-3"
                        >
                            <Text className="text-[15px] font-semibold text-slate-700">
                                {cancelText}
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={onConfirm}
                            className="rounded-2xl bg-[#EF4444] px-4 py-3"
                        >
                            <Text className="text-[15px] font-semibold text-white">
                                {confirmText}
                            </Text>
                        </Pressable>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}
