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
import NewTrackerModal from "../components/NewTrackerModal";
import { getValue, saveTrackers } from "../store/storage";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
    const [trackers, setTrackers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNew, setShowNew] = useState(false);
    const addButtonScale = useRef(new Animated.Value(1)).current;

    async function handleTrackerMenuAction(action, trackerId) {
        setTrackers((currentTrackers) => {
            const updatedTrackers = currentTrackers.map((tracker) => {
                if (tracker.id !== trackerId) {
                    return tracker;
                }

                if (action.type === "pin") {
                    return { ...tracker, isPinned: true };
                }

                if (action.type === "unpin") {
                    return { ...tracker, isPinned: false };
                }

                return tracker;
            });

            if (action.type === "delete") {
                const filtered = updatedTrackers.filter(
                    (tracker) => tracker.id !== trackerId,
                );
                saveTrackers(filtered);
                return filtered;
            }

            const sorted = [...updatedTrackers].sort(
                (a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0),
            );
            saveTrackers(sorted);
            return sorted;
        });
    }

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
        let interval = setInterval(() => loadTrackers(), 2000);

        return () => {
            if (interval) clearInterval(interval);
            active = false;
        };
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <View className="flex-1 bg-[#F8F9FA]">
                <View className="border-b border-slate-200 bg-[#F8F9FA] px-4 pb-2 shadow-sm">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <Image
                                source={require("../public/logo.png")}
                                resizeMode="cover"
                                style={{ width: 52, height: 52 }}
                                className="-ml-2"
                            />
                            <Text className="text-[22px] font-bold text-blue-900">
                                ExpenseTracker
                            </Text>
                        </View>
                    </View>
                </View>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 140 }}
                    className="flex-1"
                >
                    <View className="px-4 pt-4">
                        <Text className="text-[28px] font-semibold text-slate-950">
                            My Trackers
                        </Text>
                        <Text className="mt-1 text-[15px] text-slate-500">
                            {trackers.length} active trackers
                        </Text>

                        <View className="mt-6">
                            {loading ? (
                                <View className="items-center justify-center py-20">
                                    <ActivityIndicator
                                        size="large"
                                        color="#2563eb"
                                    />
                                </View>
                            ) : trackers.length > 0 ? (
                                trackers.map((tracker) => (
                                    <TrackerCard
                                        key={tracker.id}
                                        data={tracker}
                                        onMenuPress={(action) =>
                                            handleTrackerMenuAction(
                                                action,
                                                tracker.id,
                                            )
                                        }
                                    />
                                ))
                            ) : (
                                <View className="rounded-[24px] bg-white px-5 py-8">
                                    <Text className="text-center text-[16px] font-medium text-slate-800">
                                        No trackers found.
                                    </Text>
                                    <Text className="mt-2 text-center text-[15px] text-slate-500">
                                        Add a new tracker to get started.
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
                        setShowNew(true);
                    }}
                    className="absolute bottom-8 right-5"
                >
                    <Animated.View
                        style={{ transform: [{ scale: addButtonScale }] }}
                        className="h-[74px] w-[74px] items-center justify-center rounded-full bg-[#5D6FD4] shadow-lg"
                    >
                        <MaterialCommunityIcons
                            name="plus"
                            size={42}
                            color="#ffffff"
                        />
                    </Animated.View>
                </Pressable>
                <NewTrackerModal
                    visible={showNew}
                    onClose={() => setShowNew(false)}
                    onCreated={(newTracker) =>
                        setTrackers((s) => [newTracker, ...s])
                    }
                />
            </View>
        </SafeAreaView>
    );
}
