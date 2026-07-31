import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TrackerCard from "../components/TrackerCard";
import { getValue } from "../store/storage";

export default function HomeScreen() {
    const [trackers, setTrackers] = useState([]);
    const [loading, setLoading] = useState(true);
    const addButtonScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        let active = true;

        async function loadTrackers() {
            try {
                const value = await getValue("trackers");
                const parsed = value ? JSON.parse(value) : [];
                if (active) {
                    setTrackers(Array.isArray(parsed) ? parsed : []);
                }
            } catch (error) {
                console.warn("Failed to load trackers", error);
                if (active) {
                    setTrackers([]);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadTrackers();

        return () => {
            active = false;
        };
    }, []);

    return (
        <View className="flex-1 bg-slate-50">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 140 }}
                className="flex-1"
            >
                <View className="border-b border-slate-200 bg-white px-5 pb-5 pt-4 shadow-sm">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                            <Image
                                source={require("../public/logo.png")}
                                resizeMode="contain"
                                style={{ width: 34, height: 34 }}
                            />
                            <Text className="text-[22px] font-bold text-blue-900">
                                ExpenseTracker
                            </Text>
                        </View>

                        <Pressable className="h-11 w-11 items-center justify-center rounded-full">
                            <MaterialCommunityIcons
                                name="bell-outline"
                                size={30}
                                color="#0f172a"
                            />
                        </Pressable>
                    </View>
                </View>

                <View className="px-5 pt-8">
                    <Text className="text-[34px] font-semibold text-slate-950">
                        My Trackers
                    </Text>
                    <Text className="mt-2 text-[18px] text-slate-500">
                        {trackers.length} active trackers
                    </Text>

                    <View className="mt-8">
                        {loading ? (
                            <View className="items-center justify-center py-20">
                                <ActivityIndicator
                                    size="large"
                                    color="#2563eb"
                                />
                            </View>
                        ) : trackers.length > 0 ? (
                            trackers.map((tracker) => (
                                <TrackerCard key={tracker.id} data={tracker} />
                            ))
                        ) : (
                            <View className="rounded-[28px] bg-white px-6 py-10">
                                <Text className="text-center text-[18px] text-slate-500">
                                    No trackers found.
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            <Pressable
                onPressIn={() => {
                    Animated.spring(addButtonScale, {
                        toValue: 0.94,
                        useNativeDriver: true,
                        speed: 20,
                        bounciness: 0,
                    }).start();
                }}
                onPressOut={() => {
                    Animated.spring(addButtonScale, {
                        toValue: 1,
                        useNativeDriver: true,
                        speed: 20,
                        bounciness: 0,
                    }).start();
                }}
                className="absolute bottom-24 left-5"
            >
                <Animated.View
                    style={{ transform: [{ scale: addButtonScale }] }}
                    className="h-[74px] w-[74px] items-center justify-center rounded-full bg-cyan-700 shadow-lg"
                >
                    <MaterialCommunityIcons
                        name="plus"
                        size={42}
                        color="#ffffff"
                    />
                </Animated.View>
            </Pressable>
        </View>
    );
}
