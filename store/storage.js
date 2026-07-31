import AsyncStorage from "@react-native-async-storage/async-storage";

export const TRACKERS_KEY = "trackers";
export const EXPENSES_KEY = "expenses";

export async function getValue(key) {
    try {
        return await AsyncStorage.getItem(key);
    } catch (error) {
        console.warn(`Failed to read storage key: ${key}`, error);
        return null;
    }
}

export async function setValue(key, value) {
    try {
        await AsyncStorage.setItem(key, value);
    } catch (error) {
        console.warn(`Failed to write storage key: ${key}`, error);
    }
}

export async function removeValue(key) {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.warn(`Failed to remove storage key: ${key}`, error);
    }
}

export async function loadTrackers() {
    const value = await getValue(TRACKERS_KEY);

    if (!value) {
        return [];
    }

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn("Failed to parse saved trackers", error);
        return [];
    }
}

export async function saveTrackers(trackers) {
    await setValue(TRACKERS_KEY, JSON.stringify(trackers));
}

export async function getExpensesByTrackerId(trackerId) {
    const value = await getValue(EXPENSES_KEY);

    if (!value) {
        return [];
    }

    try {
        const parsed = JSON.parse(value);
        const expenses = Array.isArray(parsed) ? parsed : [];
        return expenses.filter((expense) => expense.trackerId === trackerId);
    } catch (error) {
        console.warn(
            `Failed to parse saved expenses for tracker ${trackerId}`,
            error,
        );
        return [];
    }
}

export async function getMoneySpent(trackerId) {
    const expenses = await getExpensesByTrackerId(trackerId);
    return expenses.reduce(
        (total, expense) => total + Number(expense.amount || 0),
        0,
    );
}

export async function getExpensesCount(trackerId) {
    const expenses = await getExpensesByTrackerId(trackerId);
    return expenses.length;
}

export async function addNewTracker(tracker) {
    const trackers = await loadTrackers();
    trackers.unshift(tracker);
    await saveTrackers(trackers);
}

export async function addNewExpense(expense) {
    const value = await getValue(EXPENSES_KEY);
    const expenses = value ? JSON.parse(value) : [];
    const nextExpenses = Array.isArray(expenses) ? expenses : [];
    nextExpenses.unshift(expense);
    await setValue(EXPENSES_KEY, JSON.stringify(nextExpenses));
}
