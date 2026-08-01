import { Text, View } from "react-native";
import { CATEGORIES } from "../constants/categories";
import CategoryIcon from "./CategoryIcon";

function formatCurrency(amount) {
    return `-₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function formatExpenseDate(value) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const datePart = date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
    });

    const timePart = date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    return `${datePart}, ${timePart}`;
}

function hexToRgba(hex, alpha = 0.14) {
    const value = (hex || "").replace("#", "");

    if (value.length !== 6) {
        return "rgba(107,114,128,0.14)";
    }

    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function ExpenseCard({ expense }) {
    const category = CATEGORIES.find((item) => item.id === expense?.categoryId);
    const iconColor = category?.color || "#6B7280";
    const dateLabel = formatExpenseDate(expense?.date || expense?.createdAt);

    return (
        <View className="mb-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[0px_6px_18px_rgba(15,23,42,0.06)]">
            <View className="flex-row items-center">
                <View
                    style={{ backgroundColor: hexToRgba(iconColor, 0.16) }}
                    className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                >
                    <CategoryIcon
                        categoryId={expense?.category || "other"}
                        size={18}
                    />
                </View>

                <View className="flex-1 pr-3">
                    <Text
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        className="text-[17px] font-medium leading-5 text-slate-900"
                    >
                        {expense?.description || "Untitled expense"}
                    </Text>
                    <Text className="mt-1 text-[14px] text-slate-500">
                        {dateLabel}
                    </Text>
                </View>

                <Text className="text-[16px] font-semibold text-[#dc2626]">
                    {formatCurrency(expense?.amount)}
                </Text>
            </View>
        </View>
    );
}
