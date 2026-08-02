import { useEffect, useRef, useState } from "react";
import {
    Animated,
    BackHandler,
    Dimensions,
    Keyboard,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    ScrollView,
    TouchableWithoutFeedback,
    View,
    PanResponder,
} from "react-native";
import DateTimePicker, {
    DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { addNewExpense } from "../store/storage";
import { CATEGORIES } from "../constants/categories";
import CategoryIcon from "./CategoryIcon";

function generateId() {
    try {
        // eslint-disable-next-line global-require
        const { v4: uuidv4 } = require("uuid");
        return `exp_${uuidv4()}`;
    } catch (error) {
        return `exp_${Math.random().toString(36).slice(2, 7)}${Date.now()
            .toString(36)
            .slice(-4)}`;
    }
}

function countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
}

function isSameCalendarDay(firstDate, secondDate) {
    if (!firstDate || !secondDate) return false;

    return (
        firstDate.getFullYear() === secondDate.getFullYear() &&
        firstDate.getMonth() === secondDate.getMonth() &&
        firstDate.getDate() === secondDate.getDate()
    );
}

function formatDateLabel(value) {
    if (!value) return "Today";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Today";
    }

    const today = new Date();
    if (isSameCalendarDay(date, today)) {
        return "Today";
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function NewExpenseModal({
    visible,
    onClose,
    onCreated,
    trackerId,
    trackerName,
    leftAmount = 0,
}) {
    const slide = useRef(new Animated.Value(0)).current;
    const pan = useRef(new Animated.Value(0)).current;
    const windowHeight = Dimensions.get("window").height;
    const defaultCategoryId = CATEGORIES[0]?.id || "other";

    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] =
        useState(defaultCategoryId);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [categoryListVisible, setCategoryListVisible] = useState(false);
    const [categoryDropdownPos, setCategoryDropdownPos] = useState(null);
    const [showInlineDatePicker, setShowInlineDatePicker] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [amountError, setAmountError] = useState("");
    const [descriptionError, setDescriptionError] = useState("");
    const [trackerError, setTrackerError] = useState("");

    const categoryFieldRef = useRef(null);

    const selectedCategory =
        CATEGORIES.find((category) => category.id === selectedCategoryId) ||
        CATEGORIES.find((category) => category.id === defaultCategoryId) ||
        CATEGORIES[0];

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_evt, gestureState) => {
                return gestureState.dy > 5;
            },
            onPanResponderMove: (_evt, gestureState) => {
                const dy = Math.max(gestureState.dy, 0);
                pan.setValue(dy);
            },
            onPanResponderRelease: (_evt, gestureState) => {
                const { dy, vy } = gestureState;
                const shouldClose = dy > 150 || vy > 1.2;
                if (shouldClose) {
                    Animated.parallel([
                        Animated.timing(pan, {
                            toValue: windowHeight,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(slide, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                    ]).start(() => {
                        pan.setValue(0);
                        onClose && onClose();
                    });
                } else {
                    Animated.timing(pan, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }).start();
                }
            },
        }),
    ).current;

    useEffect(() => {
        if (visible) {
            pan.setValue(0);
            setSelectedDate(new Date());
            setSelectedCategoryId(defaultCategoryId);
            setCategoryListVisible(false);
            setCategoryDropdownPos(null);
            setShowInlineDatePicker(false);
        }

        Animated.timing(slide, {
            toValue: visible ? 1 : 0,
            duration: 320,
            useNativeDriver: true,
        }).start(() => {
            if (!visible) {
                setAmount("");
                setDescription("");
                setAmountError("");
                setDescriptionError("");
                setTrackerError("");
                setSubmitting(false);
                setCategoryListVisible(false);
                setCategoryDropdownPos(null);
                setShowInlineDatePicker(false);
                pan.setValue(0);
            }
        });
    }, [visible, slide, defaultCategoryId, pan]);

    useEffect(() => {
        if (!visible) {
            return undefined;
        }

        const subscription = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                onClose && onClose();
                return true;
            },
        );

        return () => subscription.remove();
    }, [visible, onClose]);

    const translateYBase = slide.interpolate({
        inputRange: [0, 1],
        outputRange: [windowHeight, 0],
    });

    const translateYRaw = Animated.add(translateYBase, pan);
    const translateY = translateYRaw.interpolate
        ? translateYRaw.interpolate({
              inputRange: [-1000, 0, windowHeight],
              outputRange: [0, 0, windowHeight],
              extrapolate: "clamp",
          })
        : translateYRaw;

    function handleDatePress() {
        Keyboard.dismiss();

        if (Platform.OS === "android") {
            DateTimePickerAndroid.open({
                value: selectedDate,
                mode: "date",
                display: "default",
                maximumDate: new Date(),
                onValueChange: (_event, pickedDate) => {
                    if (pickedDate) {
                        setSelectedDate(pickedDate);
                    }
                },
            });
            return;
        }

        setShowInlineDatePicker((current) => !current);
    }

    function handleCategoryFieldPress() {
        Keyboard.dismiss();
        setShowInlineDatePicker(false);

        if (categoryListVisible) {
            setCategoryListVisible(false);
            return;
        }

        if (categoryFieldRef.current?.measureInWindow) {
            categoryFieldRef.current.measureInWindow((x, y, width, height) => {
                setCategoryDropdownPos({ x, y: y + height, width });
                setCategoryListVisible(true);
            });
        } else {
            setCategoryListVisible(true);
        }
    }

    async function handleCreateExpense() {
        setAmountError("");
        setDescriptionError("");
        setTrackerError("");

        if (!trackerId) {
            setTrackerError("Tracker information is missing.");
            return;
        }

        const cleanedAmount = (amount || "").toString().replace(/[^0-9.]/g, "");
        const parsedAmount = Number(cleanedAmount);
        if (!parsedAmount || parsedAmount <= 0) {
            setAmountError("Amount must be greater than 0.");
            return;
        }

        const trimmedDescription = description.trim();
        if (!trimmedDescription) {
            setDescriptionError("Please add a short description.");
            return;
        }
        const availableAmount = Number(leftAmount || 0);
        if (parsedAmount > availableAmount) {
            setAmountError("You cannot spend more than what you have left.");
            return;
        }
        if (countWords(trimmedDescription) > 16) {
            setDescriptionError("Description must be 16 words or fewer.");
            return;
        }

        const now = new Date().toISOString();
        const expense = {
            id: generateId(),
            trackerId: String(trackerId),
            amount: parsedAmount,
            description: trimmedDescription,
            category: selectedCategoryId || defaultCategoryId,
            date: selectedDate.toISOString(),
            createdAt: now,
        };

        try {
            setSubmitting(true);
            await addNewExpense(expense);
            if (onCreated) {
                onCreated(expense);
            }
            onClose && onClose();
        } catch (error) {
            console.warn("Failed to create expense", error);
            setTrackerError("Failed to save expense. Try again.");
            setSubmitting(false);
        }
    }

    return (
        <>
            {visible ? (
                <TouchableWithoutFeedback
                    onPress={() => {
                        Keyboard.dismiss();
                        onClose && onClose();
                    }}
                >
                    <View className="absolute inset-0 z-40 bg-black opacity-30" />
                </TouchableWithoutFeedback>
            ) : null}

            <Animated.View
                pointerEvents={visible ? "auto" : "none"}
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    transform: [{ translateY }],
                    zIndex: 50,
                }}
            >
                <View className="flex-1 justify-end">
                    <View className="h-[90%] rounded-t-3xl bg-white px-6 pb-6 pt-1 shadow-lg">
                        <View {...panResponder.panHandlers}>
                            <View className="mt-2 w-full items-center">
                                <Animated.View
                                    style={{
                                        width: 64,
                                        height: 6,
                                        borderRadius: 4,
                                        backgroundColor: "#E6E6E6",
                                    }}
                                />
                            </View>

                            <View className="flex-row items-start justify-between pt-3">
                                <View className="pr-3">
                                    <Text className="text-[20px] font-bold text-[#24389C]">
                                        Add Expense
                                    </Text>
                                    <Text className="mt-1 text-[13px] text-slate-500">
                                        to {trackerName || "Tracker"}
                                    </Text>
                                </View>

                                <Pressable
                                    onPress={() => onClose && onClose()}
                                    android_ripple={{
                                        color: "#e6e6e6",
                                        borderless: true,
                                    }}
                                    className="rounded-full p-2"
                                >
                                    <MaterialCommunityIcons
                                        name="close"
                                        size={24}
                                        color="#475569"
                                    />
                                </Pressable>
                            </View>
                        </View>

                        <View className="mt-4 flex-1">
                            <ScrollView
                                style={{ flex: 1 }}
                                nestedScrollEnabled={true}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 132 }}
                            >
                                <View className="items-center py-4">
                                    <Text className="text-[14px] font-medium text-slate-500">
                                        Amount Spent
                                    </Text>

                                    <View className="mt-3 flex-row items-center justify-center">
                                        <Text className="mr-2 text-[28px] font-semibold text-[#324BBA]">
                                            ₹
                                        </Text>
                                        <TextInput
                                            value={amount}
                                            onChangeText={(text) => {
                                                setAmount(
                                                    text.replace(
                                                        /[^0-9.]/g,
                                                        "",
                                                    ),
                                                );
                                                if (amountError)
                                                    setAmountError("");
                                                if (trackerError)
                                                    setTrackerError("");
                                            }}
                                            placeholder="0.00"
                                            keyboardType="decimal-pad"
                                            maxLength={10}
                                            className="min-w-[150px] text-center text-[34px] font-semibold text-slate-900"
                                            placeholderTextColor="#cbd5e1"
                                        />
                                    </View>

                                    {amountError ? (
                                        <Text className="mt-2 text-[13px] text-rose-500">
                                            {amountError}
                                        </Text>
                                    ) : null}

                                    {trackerError ? (
                                        <Text className="mt-2 text-[13px] text-rose-500">
                                            {trackerError}
                                        </Text>
                                    ) : null}
                                </View>

                                <View className="mt-2">
                                    <Text className="mb-2 text-[14px] text-slate-700">
                                        Description
                                    </Text>
                                    <View className="flex-row items-center rounded-2xl bg-gray-50 px-4 py-2">
                                        <MaterialCommunityIcons
                                            name="file-document-outline"
                                            size={20}
                                            color="#94a3b8"
                                            style={{ marginTop: 1 }}
                                        />
                                        <TextInput
                                            value={description}
                                            onChangeText={(text) => {
                                                setDescription(text);
                                                if (descriptionError) {
                                                    setDescriptionError("");
                                                }
                                            }}
                                            placeholder="What did you spend this on?"
                                            placeholderTextColor="#94a3b8"
                                            className="ml-3 flex-1 text-[16px] text-slate-900"
                                            multiline
                                            numberOfLines={2}
                                            textAlignVertical="top"
                                        />
                                    </View>
                                    {descriptionError ? (
                                        <Text className="mt-2 text-[13px] text-rose-500">
                                            {descriptionError}
                                        </Text>
                                    ) : null}
                                </View>

                                <View className="mt-5 flex-row gap-3">
                                    <View className="relative flex-1 z-20">
                                        <Text className="mb-2 text-[14px] text-slate-700">
                                            Category
                                        </Text>
                                        <Pressable
                                            ref={categoryFieldRef}
                                            onPress={handleCategoryFieldPress}
                                            className="flex-row items-center justify-between rounded-2xl bg-gray-50 px-4 py-4"
                                        >
                                            <View className="flex-row items-center">
                                                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-white">
                                                    <CategoryIcon
                                                        categoryId={
                                                            selectedCategoryId ||
                                                            defaultCategoryId
                                                        }
                                                        size={18}
                                                    />
                                                </View>
                                                <Text className="text-[15px] text-slate-700">
                                                    {selectedCategory?.label ||
                                                        "Select category"}
                                                </Text>
                                            </View>

                                            <MaterialCommunityIcons
                                                name={
                                                    categoryListVisible
                                                        ? "chevron-up"
                                                        : "chevron-down"
                                                }
                                                size={22}
                                                color="#94a3b8"
                                            />
                                        </Pressable>
                                    </View>

                                    <View className="relative flex-1 z-10">
                                        <Text className="mb-2 text-[14px] text-slate-700">
                                            Date
                                        </Text>
                                        <Pressable
                                            onPress={handleDatePress}
                                            className="flex-row items-center justify-between rounded-2xl bg-gray-50 px-4 py-4"
                                        >
                                            <View className="flex-row items-center">
                                                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-white">
                                                    <MaterialCommunityIcons
                                                        name="calendar-outline"
                                                        size={18}
                                                        color="#64748b"
                                                    />
                                                </View>
                                                <Text className="text-[15px] text-slate-700">
                                                    {formatDateLabel(
                                                        selectedDate,
                                                    )}
                                                </Text>
                                            </View>

                                            <MaterialCommunityIcons
                                                name="chevron-down"
                                                size={22}
                                                color="#94a3b8"
                                            />
                                        </Pressable>

                                        {showInlineDatePicker ? (
                                            <View className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                                <DateTimePicker
                                                    value={selectedDate}
                                                    mode="date"
                                                    display="spinner"
                                                    maximumDate={new Date()}
                                                    onValueChange={(
                                                        _event,
                                                        dateValue,
                                                    ) => {
                                                        if (dateValue) {
                                                            setSelectedDate(
                                                                dateValue,
                                                            );
                                                        }
                                                    }}
                                                />

                                                <View className="flex-row justify-end border-t border-slate-100 px-4 py-3">
                                                    <Pressable
                                                        onPress={() =>
                                                            setShowInlineDatePicker(
                                                                false,
                                                            )
                                                        }
                                                    >
                                                        <Text className="text-[15px] font-semibold text-[#324BBA]">
                                                            Done
                                                        </Text>
                                                    </Pressable>
                                                </View>
                                            </View>
                                        ) : null}
                                    </View>
                                </View>
                            </ScrollView>
                        </View>

                        <View className="absolute bottom-0 left-0 right-0 bg-white px-6 pb-6 pt-4">
                            <View className="rounded-[18px] shadow-[0px_12px_24px_rgba(34,197,94,0.22)]">
                                <View className="overflow-hidden rounded-[18px]">
                                    <Pressable
                                        onPress={handleCreateExpense}
                                        disabled={submitting}
                                        android_ripple={{
                                            color: "#b7f7b5",
                                            borderless: false,
                                        }}
                                        className={`h-[64px] flex-row items-center justify-center bg-[#8EF08D] ${
                                            submitting ? "opacity-70" : ""
                                        }`}
                                    >
                                        <View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-[#006E1C]">
                                            <MaterialCommunityIcons
                                                name="plus"
                                                size={20}
                                                color="#ffffff"
                                            />
                                        </View>
                                        <Text className="text-[18px] font-semibold text-[#154D22]">
                                            {submitting
                                                ? "Saving..."
                                                : "Add Expense"}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Animated.View>

            <Modal
                visible={categoryListVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCategoryListVisible(false)}
            >
                <TouchableWithoutFeedback
                    onPress={() => setCategoryListVisible(false)}
                >
                    <View style={{ flex: 1 }}>
                        {categoryDropdownPos ? (
                            <View
                                style={{
                                    position: "absolute",
                                    left: categoryDropdownPos.x,
                                    top: categoryDropdownPos.y + 8,
                                    width: categoryDropdownPos.width,
                                }}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
                            >
                                <ScrollView
                                    nestedScrollEnabled={true}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={true}
                                    style={{ height: 240 }}
                                >
                                    {CATEGORIES.map((category) => (
                                        <Pressable
                                            key={category.id}
                                            onPress={() => {
                                                setSelectedCategoryId(
                                                    category.id,
                                                );
                                                setCategoryListVisible(false);
                                            }}
                                            className={`flex-row items-center px-4 py-3 ${
                                                category.id ===
                                                (selectedCategoryId ||
                                                    defaultCategoryId)
                                                    ? "bg-blue-50"
                                                    : "bg-white"
                                            }`}
                                        >
                                            <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-slate-50">
                                                <CategoryIcon
                                                    categoryId={category.id}
                                                    size={18}
                                                />
                                            </View>
                                            <Text className="flex-1 text-[15px] text-slate-800">
                                                {category.label}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </ScrollView>
                            </View>
                        ) : null}
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
}
