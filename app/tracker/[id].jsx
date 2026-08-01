import React from "react";
import { useRoute, useRouter } from "expo-router";
import { Text, View, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
    console.log("data", id);

    const initial = Number(data.initialAmount || data.initial || 0);
    const spent = Number(data.moneySpent || 0);
    const left = initial - spent;

    // derive percentage from passed barWidth or compute
    let percent = 0;
    if (typeof data.barWidth === "string" && data.barWidth.includes("%")) {
        percent = Number(data.barWidth.replace("%", "")) || 0;
    } else if (initial > 0) {
        percent = Math.min((spent / initial) * 100, 100);
    }

    const theme =
        data.theme ||
        (data.themeAccent || data.themeTrack
            ? { accent: data.themeAccent, track: data.themeTrack }
            : { accent: "#15803d", track: "#e5e7eb" });

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
                        /* placeholder for menu action */
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
                contentContainerStyle={{ padding: 16, paddingTop: 12 }}
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
                                                `${Math.round(percent)}%`,
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

                {/* Placeholder for additional sections (analytics, recent expenses) */}
            </ScrollView>
        </SafeAreaView>
    );
}
