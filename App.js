import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import "./global.css";

export default function App() {
    return (
        <View className="flex-1 items-center justify-center bg-slate-950 px-6">
            <View className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <Text className="text-2xl font-semibold text-white">
                    Expense Tracker
                </Text>
                <Text className="mt-2 text-base text-slate-300">
                    NativeWind v4 is configured and working with Expo.
                </Text>
            </View>
            <StatusBar style="light" />
        </View>
    );
}
