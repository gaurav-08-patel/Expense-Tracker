import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Modal, Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getExpensesCount, getMoneySpent } from "../store/storage";
import { router } from "expo-router";

function formatCurrency(amount) {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function getProgressTheme(percentage) {
    if (percentage >= 90) {
        return {
            accent: "#b91c1c",
            accentSoft: "#FFDAD6",
            badgeText: "#991b1b",
            badgeBorder: "#fecaca",
            track: "#fecaca",
        };
    }

    if (percentage >= 60) {
        return {
            accent: "#f97316",
            accentSoft: "#FFEDD5",
            badgeText: "#c2410c",
            badgeBorder: "#fed7aa",
            track: "#e5e7eb",
        };
    }

    return {
        accent: "#15803d",
        accentSoft: "#91F78E",
        badgeText: "#166534",
        badgeBorder: "#bbf7d0",
        track: "#e5e7eb",
    };
}

export default function TrackerCard({ data, onMenuPress = () => {} }) {
    const [spent, setSpent] = useState(0);
    const [expenseCount, setExpenseCount] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    const menuButtonRef = useRef(null);
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let active = true;

        async function loadTrackerStats() {
            const [spentTotal, countTotal] = await Promise.all([
                getMoneySpent(data.id),
                getExpensesCount(data.id),
            ]);

            if (!active) {
                return;
            }

            setSpent(spentTotal);
            setExpenseCount(countTotal);
        }

        loadTrackerStats();

        return () => {
            active = false;
        };
    }, [data]);

    const progress = useMemo(() => {
        if (!data.initialAmount) {
            return 0;
        }

        return Math.min((spent / data.initialAmount) * 100, 100);
    }, [spent, data.initialAmount]);

    const theme = getProgressTheme(progress);
    const barWidth = progress >= 100 ? "100%" : `${progress}%`;

    useEffect(() => {
        if (menuOpen) {
            setMenuVisible(true);
            Animated.timing(opacity, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 180,
                useNativeDriver: true,
            }).start(() => {
                setMenuVisible(false);
            });
        }
    }, [menuOpen, opacity]);

    function onPress() {
        // pass important fields as route params to ensure they arrive reliably
        router.push({
            pathname: `/tracker/${data.id}`,
            params: {
                title: data.title,
                moneySpent: spent,
                barWidth,
                initialAmount: data.initialAmount,
                // pass minimal theme pieces
                themeAccent: theme.accent,
                themeTrack: theme.track,
                themeName: data.themeName || "",
            },
        });
    }

    return (
        <View
            style={{ borderRadius: 22, overflow: "hidden" }}
            className="mb-4 rounded-[22px] bg-white border border-gray-200 shadow-[0px_10px_24px_rgba(15,23,42,0.08)]"
        >
            <Pressable
                onPress={onPress}
                disabled={menuOpen}
                android_ripple={{ color: "#e6e6e6", borderless: false }}
                style={({ pressed: isPressed }) => [
                    {
                        transform: [{ scale: isPressed ? 0.98 : 1 }],
                        backgroundColor: isPressed ? "#f8fafc" : "#ffffff",
                        cursor: "pointer",
                    },
                ]}
                className="px-5 py-5"
            >
                <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                        <Text className="text-[19px] font-semibold text-slate-950">
                            {data.title}
                        </Text>
                        {data.isPinned ? (
                            <View
                                className="mt-1 flex-row items-center rounded-full bg-blue-50 px-3 py-1"
                                style={{ width: 80 }}
                            >
                                <MaterialCommunityIcons
                                    name="pin-outline"
                                    size={14}
                                    color="#2563eb"
                                />
                                <Text className="ml-1 text-[12px] font-semibold text-[#2563eb]">
                                    Pinned
                                </Text>
                            </View>
                        ) : null}
                        <Text className="text-[13px] text-slate-500 mt-2">
                            {expenseCount} expenses recorded
                        </Text>
                    </View>

                    <View
                        ref={menuButtonRef}
                        style={{ overflow: "hidden", borderRadius: 999 }}
                        className="h-9 w-9 rounded-full"
                    >
                        <Pressable
                            onPress={() => {
                                if (menuOpen) {
                                    setMenuOpen(false);
                                    return;
                                }

                                menuButtonRef.current?.measureInWindow(
                                    (x, y, width, height) => {
                                        setMenuPosition({
                                            x,
                                            y,
                                            width,
                                            height,
                                        });
                                        setMenuOpen(true);
                                    },
                                );
                            }}
                            android_ripple={{
                                color: "#e6e7eb",
                                borderless: false,
                            }}
                            style={({ pressed: isPressed }) => [
                                {
                                    backgroundColor: isPressed
                                        ? "#e5e7eb"
                                        : "transparent",
                                    transform: [
                                        { scale: isPressed ? 0.96 : 1 },
                                    ],
                                    cursor: "pointer",
                                    flex: 1,
                                    alignItems: "center",
                                    justifyContent: "center",
                                },
                            ]}
                            className="h-9 w-9 flex justify-center items-center"
                        >
                            <MaterialCommunityIcons
                                name="dots-vertical"
                                size={24}
                                color="#334155"
                            />
                        </Pressable>
                    </View>
                </View>

                <Text className="mt-2.5 text-[12px] font-medium tracking-[1.5px] text-slate-500">
                    SPENT
                </Text>

                <View className="mt-2 flex-row items-end justify-between gap-3">
                    <Text className="flex-1 text-[23px] font-bold text-slate-950">
                        {formatCurrency(spent)}
                        <Text className="text-[16px] font-[400] text-slate-600">
                            {" "}
                            / {formatCurrency(data.initialAmount)}
                        </Text>
                    </Text>

                    <View
                        style={{
                            backgroundColor: theme.accentSoft,
                            borderColor: theme.badgeBorder,
                        }}
                        className="rounded-3xl border px-3 py-0.5"
                    >
                        <Text
                            style={{ color: theme.badgeText }}
                            className="text-[13px] font-semibold"
                        >
                            {Math.round(progress)} %
                        </Text>
                    </View>
                </View>

                <View
                    style={{ backgroundColor: theme.track }}
                    className="mt-3 h-[10px] overflow-hidden rounded-full"
                >
                    <View
                        style={{
                            backgroundColor: theme.accent,
                            width: barWidth,
                        }}
                        className="h-full rounded-full"
                    />
                </View>
            </Pressable>

            <Modal
                visible={menuVisible}
                transparent
                animationType="none"
                onRequestClose={() => setMenuOpen(false)}
            >
                <Animated.View
                    style={{
                        flex: 1,
                        backgroundColor: "transparent",
                        opacity,
                    }}
                >
                    <Pressable
                        style={{ flex: 1 }}
                        onPress={() => setMenuOpen(false)}
                    />
                    <View
                        style={{
                            position: "absolute",
                            top: menuPosition.y + menuPosition.height,
                            left: Math.max(12, menuPosition.x - 120),
                            width: 160,
                            overflow: "hidden",
                        }}
                        className="rounded-[18px] border border-slate-200 bg-white shadow-[0px_20px_35px_rgba(15,23,42,0.08)]"
                    >
                        <Pressable
                            onPress={() => {
                                setMenuOpen(false);
                                onMenuPress({
                                    type: data.isPinned ? "unpin" : "pin",
                                });
                            }}
                            android_ripple={{
                                color: "#e5e7eb",
                                borderless: false,
                            }}
                            className="rounded-[14px] px-4 py-3"
                        >
                            <View className="flex-row items-center gap-3">
                                <MaterialCommunityIcons
                                    name={data.isPinned ? "pin-off" : "pin"}
                                    size={18}
                                    color="#334155"
                                />
                                <Text className="text-[14px] text-slate-900">
                                    {data.isPinned ? "Unpin" : "Pin"}
                                </Text>
                            </View>
                        </Pressable>

                        <Pressable
                            onPress={() => {
                                setMenuOpen(false);
                                onMenuPress({ type: "delete" });
                            }}
                            android_ripple={{
                                color: "#fde8e8",
                                borderless: false,
                            }}
                            className="mt-1 rounded-[14px] px-4 py-3"
                        >
                            <View className="flex-row items-center gap-3">
                                <MaterialCommunityIcons
                                    name="trash-can-outline"
                                    size={18}
                                    color="#b91c1c"
                                />
                                <Text className="text-[14px] font-semibold text-[#b91c1c]">
                                    Delete
                                </Text>
                            </View>
                        </Pressable>
                    </View>
                </Animated.View>
            </Modal>
        </View>
    );
}
