import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function DetailsScreen() {
    return (
        <View className="flex-1 items-center justify-center bg-slate-950 px-6">
            <View className="w-full rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <Text className="text-2xl font-semibold text-white">
                    Details
                </Text>
                <Text className="mt-2 text-base text-slate-300">
                    This route confirms Expo Router navigation is working.
                </Text>
                <Link
                    href="/"
                    className="mt-6 self-start rounded-full border border-cyan-400 px-5 py-3 text-base font-semibold text-cyan-300"
                >
                    Back Home
                </Link>
            </View>
        </View>
    );
}
