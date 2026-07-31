import AsyncStorage from "@react-native-async-storage/async-storage";

const TRACKERS_KEY = "trackers";
const EXPENSES_KEY = "expenses";


async function getValue(key) {
    try {
        const value = await AsyncStorage.getItem(key);
        return value;
    } catch (error) {
        console.warn(`Failed to read storage key: ${key}`, error);
        return null;
    }
}

export async function saveExpenses(expenses) {
    await setValue(EXPENSES_KEY, JSON.stringify(expenses));
}
export async function saveTrackers(trackers) {
    await setValue(TRACKERS_KEY, JSON.stringify(trackers));
}


export async function getExpensesByTrackerId(trackerId) {
    const values = await getValue(EXPENSES_KEY);

    if (!values) {
        return [];
    }

    try {
        const parsed = JSON.parse(values);
        let filtered = parsed.filter(expense => expense.trackerId === trackerId);
        return filtered;
    } catch (error) {
        console.warn(
            `Failed to parse saved expenses for tracker ${trackerId}`,
            error,
        );
        return [];
    }
}

export async function getTrackersCount() {
    const values = await getValue(TRACKERS_KEY);
    if (!values) {
        return 0;
    }
    const parsed = JSON.parse(values);
    return parsed.length;
}

export async function addNewTracker(tracker) {
    const values = await getValue(TRACKERS_KEY);
    const parsed = JSON.parse(values);
    parsed.unshift(tracker);
    await saveTrackers(parsed);
}

export async function addNewExpense(expense) {
    const values = await getValue(EXPENSES_KEY);
    const parsed = JSON.parse(values);
    parsed.unshift(expense);
    await saveExpenses(parsed);
}

console.log("hello");
(async () => {
    const expenses = await getExpensesByTrackerId("a1b2c3");
    console.log("t",expenses);

})();

export { TRACKERS_KEY, EXPENSES_KEY };
