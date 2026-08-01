import { useEffect, useMemo, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getExpensesCount, getMoneySpent } from "../store/storage";

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

export default function TrackerCard({
    data,
    onPress = () => {},
    onMenuPress = () => {},
}) {
    const [spent, setSpent] = useState(0);
    const [expenseCount, setExpenseCount] = useState(0);

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
    }, [data.id]);

    const progress = useMemo(() => {
        if (!data.initialAmount) {
            return 0;
        }

        return Math.min((spent / data.initialAmount) * 100, 100);
    }, [spent, data.initialAmount]);

    const theme = getProgressTheme(progress);
    const barWidth = progress >= 100 ? "100%" : `${progress}%`;

    return (
        <View
            style={{ borderRadius: 22, overflow: "hidden" }}
            className="mb-6 rounded-[22px] bg-white border border-gray-200 shadow-[0px_12px_30px_rgba(15,23,42,0.1)]"
        >
            <Pressable
                onPress={onPress}
                android_ripple={{ color: "#e6e6e6", borderless: false }}
                style={({ pressed: isPressed }) => [
                    {
                        transform: [{ scale: isPressed ? 0.98 : 1 }],
                        backgroundColor: isPressed ? "#f8fafc" : "#ffffff",
                        cursor: "pointer",
                    },
                ]}
                className="px-6 py-6"
            >
                <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-4">
                        <Text className="text-[22px] font-semibold text-slate-950">
                            {data.title}
                        </Text>
                        <Text className="text-[15px] text-slate-500">
                            {expenseCount} expenses recorded
                        </Text>
                    </View>

                    <View
                        style={{ overflow: "hidden", borderRadius: 999 }}
                        className="h-10 w-10 rounded-full"
                    >
                        <Pressable
                            onPress={onMenuPress}
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
                            className="h-10 w-10 flex justify-center items-center"
                        >
                            <MaterialCommunityIcons
                                name="dots-vertical"
                                size={28}
                                color="#334155"
                            />
                        </Pressable>
                    </View>
                </View>

                <Text className="mt-3 text-[13px] font-medium tracking-[2px] text-slate-500">
                    SPENT
                </Text>

                <View className="mt-2 flex-row items-end justify-between gap-3">
                    <Text className="flex-1 text-[29px] font-bold text-slate-950">
                        {formatCurrency(spent)}
                        <Text className="text-[20px] font-[400] text-slate-600">
                            {" "}
                            / {formatCurrency(data.initialAmount)}
                        </Text>
                    </Text>

                    <View
                        style={{
                            backgroundColor: theme.accentSoft,
                            borderColor: theme.badgeBorder,
                        }}
                        className="rounded-3xl border px-4 py-0.5"
                    >
                        <Text
                            style={{ color: theme.badgeText }}
                            className="text-[15px] font-semibold"
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
        </View>
    );
}
