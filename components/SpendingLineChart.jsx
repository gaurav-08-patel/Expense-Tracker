import React, { useMemo } from "react";
import { View, Text, Dimensions, Pressable } from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width - 32; // account for padding in layout

function startOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    return new Date(d.setDate(diff));
}

function bucketWeek(expenses, refDate = new Date()) {
    const start = startOfWeek(refDate);
    const buckets = Array.from({ length: 7 }, (_, i) => {
        const dt = new Date(start);
        dt.setDate(start.getDate() + i);
        return {
            date: dt,
            label: dt.toLocaleDateString(undefined, { weekday: "short" }),
            total: 0,
        };
    });

    (expenses || []).forEach((e) => {
        const d = new Date(e.date || e.createdAt);
        for (let b of buckets) {
            if (
                d.getFullYear() === b.date.getFullYear() &&
                d.getMonth() === b.date.getMonth() &&
                d.getDate() === b.date.getDate()
            ) {
                b.total += Number(e.amount || 0);
                break;
            }
        }
    });

    return buckets;
}

function bucketMonth(expenses, refDate = new Date()) {
    const d = new Date(refDate);
    const year = d.getFullYear();
    const month = d.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const buckets = Array.from({ length: daysInMonth }, (_, i) => ({
        label: String(i + 1),
        total: 0,
    }));

    (expenses || []).forEach((e) => {
        const ed = new Date(e.date || e.createdAt);
        if (ed.getFullYear() !== year || ed.getMonth() !== month) return;
        const day = ed.getDate();
        buckets[day - 1].total += Number(e.amount || 0);
    });

    return buckets;
}

export default function SpendingLineChart({ expenses = [], mode = "week" , onModeChange}) {
    const refDate = useMemo(() => {
        if (!expenses || expenses.length === 0) return new Date();
        const latest = expenses.reduce((a, b) =>
            new Date(a.date || a.createdAt) > new Date(b.date || b.createdAt)
                ? a
                : b,
        );
        return new Date(latest.date || latest.createdAt);
    }, [expenses]);

    const buckets = useMemo(
        () =>
            mode === "week"
                ? bucketWeek(expenses, refDate)
                : bucketMonth(expenses, refDate),
        [expenses, mode, refDate],
    );

    const labels = buckets.map((b, i) =>
        mode === "week"
            ? b.label
            : i % Math.ceil(buckets.length / 6) === 0
              ? b.label
              : "",
    );
    const data = buckets.map((b) => Math.round(b.total));

    const maxY = Math.max(...data, 10);

    const chartData = {
        labels,
        datasets: [
            {
                data,
                color: (opacity = 1) => `rgba(59,130,246,${opacity})`,
                strokeWidth: 2,
            },
        ],
    };

    const chartConfig = {
        // subtle gray gradient background
        backgroundGradientFrom: "#ffffff",
        backgroundGradientFromOpacity: 1,
        backgroundGradientTo: "#ffffff",
        backgroundGradientToOpacity: 1,
        // line color (blue) and label/grid colors softened
        color: (opacity = 1) => `rgba(59,130,246,${opacity})`,
        labelColor: (opacity = 1) => `rgba(148,163,184,${opacity})`,
        propsForDots: {
            r: "3",
            strokeWidth: "0",
        },
        propsForBackgroundLines: {
            stroke: "#e6eef6",
        },
        useShadowColorFromDataset: false,
    };

    return (
        <View className="mt-6">
            <View className="flex-row items-center justify-between mb-3">
                <Text className="text-[16px] font-semibold text-slate-900">
                    Spending Trend
                </Text>
                <View className="flex-row bg-gray-100 rounded-lg p-1">
                    <Pressable
                        onPress={() => onModeChange && onModeChange("week")}
                        className="px-3 py-1 rounded-lg"
                    >
                        <Text
                            className={`text-sm ${mode === "week" ? "text-slate-900 font-semibold" : "text-slate-500"}`}
                        >
                            Week
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => onModeChange && onModeChange("month")}
                        className="px-3 py-1 rounded-lg"
                    >
                        <Text
                            className={`text-sm ${mode === "month" ? "text-slate-900 font-semibold" : "text-slate-500"}`}
                        >
                            Month
                        </Text>
                    </Pressable>
                </View>
            </View>
            <LineChart
                data={chartData}
                width={screenWidth}
                height={180}
                yAxisSuffix=""
                yAxisInterval={1}
                chartConfig={chartConfig}
                bezier
                withInnerLines={true}
                withOuterLines={false}
                withDots={true}
                withShadow={false}
                fromZero={true}
                style={{
                    borderRadius: 8,
                    paddingRight: 60,
                    // move chart content a bit right so first (Monday) point is visible
                    paddingLeft: 14,
                    backgroundColor: 'transparent',
                    marginLeft: -14
                }}
                segments={4}
            />
        </View>
    );
}
