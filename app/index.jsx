import { Text, View } from "react-native";

export default function HomeScreen() {
    return (
        <View className="flex-1 bg-slate-950 px-6 justify-center">
            <View className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
                <Text className="text-3xl font-bold text-white">
                    Expense Trackerr
                </Text>
                <Text className="mt-3 text-base leading-6 text-slate-300">
                    Fresh Expo SDK 56 app with Expo Router and NativeWind v4.
                </Text>
               
            </View>
        </View>
    );
}
