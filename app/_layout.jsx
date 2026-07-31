import "../global.css";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
                <SafeAreaProvider>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: "#f8fafc" },
                        }}
                    />
                </SafeAreaProvider>
            </View>
        </GestureHandlerRootView>
    );
}
