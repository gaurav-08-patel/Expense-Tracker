import React, { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getExpensesByTrackerId } from "../../store/storage";
import ExpenseCard from "../../components/ExpenseCard";

function getExpenseDate(expense) {
    return new Date(expense?.date || expense?.createdAt || 0);
}

function getMonthLabel(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
        return "Unknown";
    }

    return date.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
    });
}

export default function AllExpensesScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const trackerId = Array.isArray(id) ? id[0] : id;
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        let active = true;

        async function fetchExpenses() {
            try {
                if (!trackerId) {
                    if (active) setExpenses([]);
                    return;
                }

                const loaded = await getExpensesByTrackerId(String(trackerId));
                if (!active) {
                    return;
                }

                setExpenses(Array.isArray(loaded) ? loaded : []);
            } catch (err) {
                console.warn("Failed to load all expenses", err);
                if (active) {
                    setExpenses([]);
                }
            }
        }

        fetchExpenses();

        return () => {
            active = false;
        };
    }, [trackerId]);

    const groupedExpenses = useMemo(() => {
        const sorted = [...expenses].sort(
            (a, b) => getExpenseDate(b).getTime() - getExpenseDate(a).getTime(),
        );

        const groupsMap = sorted.reduce((acc, expense) => {
            const key = getMonthLabel(expense?.date || expense?.createdAt);
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(expense);
            return acc;
        }, {});

        return Object.entries(groupsMap).map(([month, items]) => ({
            month,
            items,
        }));
    }, [expenses]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
            <View className="flex-row items-center border-b border-gray-200 py-2">
                <Pressable
                    onPress={() => router.back()}
                    android_ripple={{ color: "#e6e6e6", borderless: true }}
                    className="p-2"
                >
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={24}
                        color="#0f172a"
                    />
                </Pressable>

                <Text className="pl-2 text-[20px] font-semibold text-slate-900">
                    All Expenses
                </Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            >
                {groupedExpenses.length === 0 ? (
                    <View className="rounded-2xl bg-white px-4 py-5">
                        <Text className="text-[15px] text-slate-500">
                            No expenses found for this tracker.
                        </Text>
                    </View>
                ) : (
                    groupedExpenses.map((group) => (
                        <View key={group.month} className="mb-6">
                            <Text className="mb-3 text-[14px] font-semibold text-slate-500">
                                {group.month}
                            </Text>
                            {group.items.map((expense) => (
                                <ExpenseCard
                                    key={expense.id}
                                    expense={expense}
                                />
                            ))}
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
