import React, { useState, useEffect } from "react";
import { useRoute, useRouter } from "expo-router";
import { Text, View, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getExpensesByTrackerId } from "../../store/storage";
import SpendingLineChart from "../../components/SpendingLineChart";
import ExpenseCard from "../../components/ExpenseCard";
import NewExpenseModal from "../../components/NewExpenseModal";

function formatCurrency(amount) {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

export default function TrackerDetailsScreen() {
    const route = useRoute();
    const router = useRouter();

    const id = route.params?.id;
    // data may be passed as `params.data` or flattened in `params` depending on router.push usage
    const params = route.params || {};
    const data = params.data || params || {};

    // Polling fallback: fetch expenses immediately on mount and every 2s
    const [expenses, setExpenses] = useState([]);
    const [mode, setMode] = useState("week");
    const [expenseModalVisible, setExpenseModalVisible] = useState(false);

    useEffect(() => {
        let active = true;
        let timer;

        async function fetchExpenses() {
            try {
                if (!id) return;
                const exp = await getExpensesByTrackerId(String(id));
                if (!active) return;
                setExpenses(exp);
            } catch (err) {
                console.warn("Failed to load expenses", err);
            }
        }

        // initial fetch
        fetchExpenses();

        // poll while screen is mounted
        timer = setInterval(fetchExpenses, 2000);

        return () => {
            active = false;
            if (timer) clearInterval(timer);
        };
    }, [id]);

    const initial = Number(data.initialAmount || data.initial || 0);
    const spent = Number(data.moneySpent || 0);
    const left = initial - spent;

    // derive percentage from passed barWidth or compute
    let percent = (spent / initial) * 100;

    const theme =
        data.theme ||
        (data.themeAccent || data.themeTrack
            ? { accent: data.themeAccent, track: data.themeTrack }
            : { accent: "#15803d", track: "#e5e7eb" });
    const recentExpenses = expenses.slice(0, 5);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
            <View className="flex-row items-center justify-between  py-2 border-b border-gray-200 ">
                <View className="flex-row items-center">
                    <Pressable
                        onPress={() => router.back()}
                        android_ripple={{
                            color: "#e6e6e6",
                            borderless: true,
                        }}
                        className="p-2"
                    >
                        <MaterialCommunityIcons
                            name="arrow-left"
                            size={24}
                            color="#0f172a"
                        />
                    </Pressable>

                    <View style={{ maxWidth: 260 }} className="pl-2">
                        <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            className="text-[20px] font-semibold text-slate-900"
                        >
                            {data.title || "Tracker"}
                        </Text>
                    </View>
                </View>

                <Pressable
                    onPress={() => {
                    }}
                    android_ripple={{ color: "#e6e6e6", borderless: true }}
                    className="p-2"
                >
                    <MaterialCommunityIcons
                        name="dots-vertical"
                        size={26}
                        color="#334155"
                    />
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={{
                    padding: 16,
                    paddingTop: 12,
                    paddingBottom: 136,
                }}
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-6 rounded-[18px] bg-white border border-gray-200 p-5 shadow-[0px_12px_30px_rgba(15,23,42,0.06)]">
                    <View className="flex-row items-start justify-between">
                        <View style={{ flex: 1 }}>
                            <View className="flex-row justify-between">
                                <View>
                                    <Text className="text-[13px] text-slate-500">
                                        Initial
                                    </Text>
                                    <Text className="text-[16px] font-semibold text-slate-900 mt-1">
                                        {formatCurrency(initial)}
                                    </Text>
                                </View>

                                <View>
                                    <Text className="text-[13px] text-slate-500">
                                        Spent
                                    </Text>
                                    <Text className="text-[16px] font-semibold text-rose-600 mt-1">
                                        {formatCurrency(spent)}
                                    </Text>
                                </View>

                                <View>
                                    <Text className="text-[13px] text-slate-500">
                                        Left
                                    </Text>
                                    <Text className="text-[16px] font-semibold text-green-600 mt-1">
                                        {formatCurrency(left)}
                                    </Text>
                                </View>
                            </View>

                            <View className="mt-4">
                                <View
                                    style={{ backgroundColor: theme.track }}
                                    className="h-[10px] rounded-full overflow-hidden"
                                >
                                    <View
                                        style={{
                                            backgroundColor: theme.accent,
                                            width:
                                                data.barWidth ||
                                                `${Math.round(data.barWidth)}`,
                                        }}
                                        className="h-full rounded-full"
                                    />
                                </View>

                                <View className="mt-3 flex-row items-center justify-between">
                                    <Text className="text-[13px] text-slate-500">
                                        {Math.round(percent)}% Budget Used
                                    </Text>
                                    <Text className="text-[13px] text-slate-500">
                                        {data.themeName || ""}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <SpendingLineChart
                    expenses={expenses}
                    mode={mode}
                    onModeChange={setMode}
                />

                <View className="mt-6">
                    <View className="mb-3 flex-row items-center justify-between">
                        <Text className="text-[16px] font-semibold text-slate-900">
                            Recent Expenses
                        </Text>
                        <View className="overflow-hidden rounded-lg">
                            <Pressable
                                onPress={() => {
                                    router.push({
                                        pathname: "/tracker/all-expenses",
                                        params: { id: String(id || "") },
                                    });
                                }}
                                android_ripple={{
                                    color: "#e8edff",
                                    borderless: false,
                                }}
                                className="px-2 py-1"
                            >
                                <Text className="text-[15px] font-medium text-[#324BBA]">
                                    View all
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    {recentExpenses.length > 0 ? (
                        recentExpenses.map((expense) => (
                            <ExpenseCard key={expense.id} expense={expense} />
                        ))
                    ) : (
                        <View className="rounded-2xl bg-white px-4 py-5">
                            <Text className="text-[16px] text-slate-500">
                                No expenses yet.
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <View className="absolute bottom-4 left-0 right-0 px-4 pb-5 pt-3">
                <View className="rounded-[18px] shadow-[0px_12px_24px_rgba(34,197,94,0.22)]">
                    <View className="overflow-hidden rounded-[18px]">
                        <Pressable
                            onPress={() => setExpenseModalVisible(true)}
                            android_ripple={{
                                color: "#b7f7b5",
                                borderless: false,
                            }}
                            className="h-[64px] flex-row items-center justify-center bg-[#8EF08D]"
                        >
                            <View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-[#006E1C]">
                                <MaterialCommunityIcons
                                    name="plus"
                                    size={20}
                                    color="#ffffff"
                                />
                            </View>
                            <Text className="text-[18px] font-semibold text-[#154D22]">
                                Add Expense
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            <NewExpenseModal
                visible={expenseModalVisible}
                trackerId={String(id || "")}
                trackerName={data.title || "Tracker"}
                leftAmount={left}
                onClose={() => setExpenseModalVisible(false)}
                onCreated={(expense) => {
                    setExpenses((current) => [expense, ...current]);
                }}
            />
        </SafeAreaView>
    );
}
