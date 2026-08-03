import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Pressable,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
    Keyboard,
    Dimensions,
    PanResponder,
    BackHandler,
} from "react-native";
import { addNewTracker } from "../store/storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

function generateId() {
    try {
        // try to use uuid if installed
        // eslint-disable-next-line global-require
        const { v4: uuidv4 } = require("uuid");
        return uuidv4();
    } catch (e) {
        // fallback to timestamp + random
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
    }
}

export default function NewTrackerModal({ visible, onClose, onCreated }) {
    const slide = useRef(new Animated.Value(0)).current; // 0 = hidden, 1 = visible
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [titleError, setTitleError] = useState("");
    const [amountError, setAmountError] = useState("");
    const windowHeight = Dimensions.get("window").height;
    const pan = useRef(new Animated.Value(0)).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_evt, gestureState) => {
                // only start responder for downward drags (prevent upward dragging)
                return gestureState.dy > 5;
            },
            onPanResponderMove: (_evt, gestureState) => {
                // clamp to non-negative so sheet does not move upward
                const dy = Math.max(gestureState.dy, 0);
                pan.setValue(dy);
            },
            onPanResponderRelease: (_evt, gestureState) => {
                const { dy, vy } = gestureState;
                const shouldClose = dy > 150 || vy > 1.2;
                if (shouldClose) {
                    // animate out then call onClose
                    Animated.parallel([
                        Animated.timing(pan, {
                            toValue: windowHeight,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(slide, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                    ]).start(() => {
                        pan.setValue(0);
                        onClose && onClose();
                    });
                } else {
                    // snap back
                    Animated.timing(pan, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }).start();
                }
            },
        }),
    ).current;

    useEffect(() => {
        if (visible) {
            // reset pan when opening
            pan.setValue(0);
        }

        Animated.timing(slide, {
            toValue: visible ? 1 : 0,
            duration: 320,
            useNativeDriver: true,
        }).start(() => {
            if (!visible) {
                setTitle("");
                setAmount("");
                setTitleError("");
                setAmountError("");
                setSubmitting(false);
                pan.setValue(0);
            }
        });
    }, [visible, slide]);

    useEffect(() => {
        if (!visible) {
            return undefined;
        }

        const subscription = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                onClose && onClose();
                return true;
            },
        );

        return () => subscription.remove();
    }, [visible, onClose]);

    const translateYBase = slide.interpolate({
        inputRange: [0, 1],
        outputRange: [windowHeight, 0],
    });

    const translateYRaw = Animated.add(translateYBase, pan);
    // clamp so translateY never goes above 0 (sheet can't move upward)
    const translateY = translateYRaw.interpolate
        ? translateYRaw.interpolate({
              inputRange: [-1000, 0, windowHeight],
              outputRange: [0, 0, windowHeight],
              extrapolate: "clamp",
          })
        : translateYRaw;

    function countWords(text) {
        if (!text) return 0;
        return text.trim().split(/\s+/).filter(Boolean).length;
    }

    async function handleCreate() {
        setTitleError("");
        setAmountError("");

        const words = countWords(title);
        if (words === 0) {
            setTitleError("Please enter a tracker title.");
            return;
        }
        if (words > 30) {
            setTitleError("Tracker title cannot exceed 30 words.");
            return;
        }

        const cleaned = (amount || "").toString().replace(/[^0-9.]/g, "");
        const initialAmount = Number(cleaned) || 0;
        if (initialAmount <= 0) {
            setAmountError("Initial amount must be greater than 0.");
            return;
        }

        const now = new Date().toISOString();
        const newTracker = {
            id: generateId(),
            title: title.trim(),
            initialAmount: initialAmount,
            createdAt: now,
            updatedAt: now,
        };

        try {
            setSubmitting(true);
            await addNewTracker(newTracker);
            if (onCreated) onCreated(newTracker);
            onClose();
        } catch (err) {
            console.warn("Failed to create tracker", err);
            setAmountError("Failed to create tracker. Try again.");
            setSubmitting(false);
        }
    }

    return (
        <>
            {visible ? (
                <TouchableWithoutFeedback
                    onPress={() => {
                        Keyboard.dismiss();
                        onClose();
                    }}
                >
                    <View className="absolute inset-0 z-40 bg-black opacity-30" />
                </TouchableWithoutFeedback>
            ) : null}

            <Animated.View
                pointerEvents={visible ? "auto" : "none"}
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    transform: [{ translateY }],
                    zIndex: 50,
                }}
            >
                <View className="flex-1 justify-end">
                    <View
                        style={{
                            transform: [],
                        }}
                        className="bg-white rounded-t-3xl px-6 pb-6 pt-1 shadow-lg h-[90%]"
                    >
                        <View {...panResponder.panHandlers}>
                            <View className="w-full items-center mt-2">
                                <Animated.View
                                    style={{
                                        width: 64,
                                        height: 6,
                                        borderRadius: 4,
                                        backgroundColor: "#E6E6E6",
                                    }}
                                />
                            </View>
                            <View className="justify-center pt-2">
                                <Text className="text-[20px] font-bold text-center text-[#24389C]">
                                    New Tracker
                                </Text>
                            </View>
                        </View>

                        <View className="mt-4 rounded-xl bg-[#ECFDF5] px-6 py-6">
                            <View className="items-center">
                                <View className="h-16 w-16 rounded-full bg-[#BBF7D0] items-center justify-center">
                                    <MaterialCommunityIcons
                                        name="wallet"
                                        size={28}
                                        color="#166534"
                                    />
                                </View>
                                <Text className="mt-3 text-[14px] font-semibold text-[#24389C]">
                                    PLAN AHEAD
                                </Text>
                            </View>
                        </View>

                        <View className="mt-6 flex-1">
                            <Text className="text-[14px] text-slate-700 mb-2">
                                Tracker Title
                            </Text>
                            <TextInput
                                value={title}
                                onChangeText={(t) => {
                                    setTitle(t);
                                    if (titleError) setTitleError("");
                                }}
                                placeholder="e.g. Goa Trip, Monthly Groceries"
                                className="bg-gray-50 rounded-xl px-4 py-5 text-[16px]"
                                placeholderTextColor="#cbd5e1"
                            />
                            {titleError ? (
                                <Text className="mt-2 text-[13px] text-red-600">
                                    {titleError}
                                </Text>
                            ) : null}

                            <Text className="mt-6 text-[14px] text-slate-700 mb-2">
                                Initial Amount
                            </Text>
                            <View className="bg-gray-50 rounded-xl px-4 flex-row items-center">
                                <Text className="text-[20px] text-[#006E1C]">
                                    ₹
                                </Text>
                                <TextInput
                                    value={amount}
                                    onChangeText={(v) => {
                                        setAmount(v);
                                        if (amountError) setAmountError("");
                                    }}
                                    placeholder="0.00"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="numeric"
                                    className="ml text-[26px] font-semibold flex-1 text-gray-500"
                                />
                            </View>
                            {amountError ? (
                                <Text className="mt-2 text-[13px] text-red-600">
                                    {amountError}
                                </Text>
                            ) : (
                                <Text className="mt-2 text-[13px] text-slate-400">
                                    You can add expenses to this tracker anytime
                                    after creating it.
                                </Text>
                            )}
                        </View>

                        <Pressable
                            onPress={handleCreate}
                            disabled={submitting}
                            className="mb-2 rounded-3xl bg-green-700 px-5 py-4 flex-row items-center justify-center gap-3"
                        >
                            <Text className="text-white text-[18px] font-semibold">
                                {submitting ? "Creating..." : "Create Tracker"}
                            </Text>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={30}
                                color="#fff"
                            />
                        </Pressable>
                    </View>
                </View>
            </Animated.View>
        </>
    );
}
