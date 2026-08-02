import AsyncStorage from "@react-native-async-storage/async-storage";

export const TRACKERS_KEY = "trackers";
export const EXPENSES_KEY = "expenses";

export async function getValue(key) {
    try {
        const value = await AsyncStorage.getItem(key);
        if (key === TRACKERS_KEY && value) {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    const sorted = [...parsed].sort(
                        (a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0),
                    );
                    return JSON.stringify(sorted);
                }
            } catch (error) {
                // fall back to raw value if parsing fails
            }
        }
        return value;
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

(async () => {
    await AsyncStorage.setItem(
        "trackers",
        JSON.stringify([
            {
                id: "trk_001",
                title: "Goa Trip",
                initialAmount: 15000,
                isPinned: true,
                createdAt: "2026-07-01T10:00:00.000Z",
                updatedAt: "2026-07-20T18:30:00.000Z",
            },
            {
                id: "trk_002",
                title: "Monthly Groceries",
                initialAmount: 8000,
                isPinned: false,
                createdAt: "2026-07-01T09:00:00.000Z",
                updatedAt: "2026-07-28T14:00:00.000Z",
            },
            {
                id: "trk_003",
                title: "Office Supplies",
                initialAmount: 3000,
                isPinned: false,
                createdAt: "2026-07-10T11:15:00.000Z",
                updatedAt: "2026-07-25T16:45:00.000Z",
            },
            {
                id: "trk_004",
                title: "Diwali Shopping",
                initialAmount: 12000,
                isPinned: true,
                createdAt: "2026-07-22T08:00:00.000Z",
                updatedAt: "2026-07-30T19:20:00.000Z",
            },
        ]),
    );

    await AsyncStorage.setItem(
        "expenses",
        JSON.stringify([
            {
                id: "exp_101",
                trackerId: "trk_001",
                amount: 3500,
                description: "Flight tickets (return)",
                category: "travel",
                date: "2026-07-02T06:30:00.000Z",
                createdAt: "2026-07-02T06:35:00.000Z",
            },
            {
                id: "exp_102",
                trackerId: "trk_001",
                amount: 2200,
                description: "Beach resort - 2 nights",
                category: "bills",
                date: "2026-07-15T14:00:00.000Z",
                createdAt: "2026-07-15T14:10:00.000Z",
            },
            {
                id: "exp_103",
                trackerId: "trk_001",
                amount: 850,
                description: "Dinner at beach shack",
                category: "food",
                date: "2026-07-15T20:00:00.000Z",
                createdAt: "2026-07-15T20:05:00.000Z",
            },
            {
                id: "exp_104",
                trackerId: "trk_001",
                amount: 600,
                description: "Scooter rental - 2 days",
                category: "transport",
                date: "2026-07-16T09:00:00.000Z",
                createdAt: "2026-07-16T09:05:00.000Z",
            },
            {
                id: "exp_105",
                trackerId: "trk_001",
                amount: 1300,
                description: "Water sports - parasailing",
                category: "entertainment",
                date: "2026-07-17T11:30:00.000Z",
                createdAt: "2026-07-17T11:35:00.000Z",
            },
            {
                id: "exp_201",
                trackerId: "trk_002",
                amount: 1850,
                description: "Big Bazaar - weekly groceries",
                category: "food",
                date: "2026-07-05T17:00:00.000Z",
                createdAt: "2026-07-05T17:10:00.000Z",
            },
            {
                id: "exp_202",
                trackerId: "trk_002",
                amount: 420,
                description: "Vegetables and fruits - local market",
                category: "food",
                date: "2026-07-12T08:30:00.000Z",
                createdAt: "2026-07-12T08:35:00.000Z",
            },
            {
                id: "exp_203",
                trackerId: "trk_002",
                amount: 1970,
                description: "Monthly grocery restock",
                category: "food",
                date: "2026-07-19T18:00:00.000Z",
                createdAt: "2026-07-19T18:15:00.000Z",
            },
            {
                id: "exp_204",
                trackerId: "trk_002",
                amount: 1000,
                description: "Milk and dairy subscription",
                category: "food",
                date: "2026-07-27T07:00:00.000Z",
                createdAt: "2026-07-27T07:05:00.000Z",
            },
            {
                id: "exp_301",
                trackerId: "trk_003",
                amount: 650,
                description: "Printer ink cartridges",
                category: "study",
                date: "2026-07-11T10:00:00.000Z",
                createdAt: "2026-07-11T10:05:00.000Z",
            },
            {
                id: "exp_302",
                trackerId: "trk_003",
                amount: 390,
                description: "Notebooks and pens - bulk pack",
                category: "study",
                date: "2026-07-18T13:20:00.000Z",
                createdAt: "2026-07-18T13:25:00.000Z",
            },
            {
                id: "exp_303",
                trackerId: "trk_003",
                amount: 800,
                description: "New desk organizer",
                category: "other",
                date: "2026-07-24T15:45:00.000Z",
                createdAt: "2026-07-24T15:50:00.000Z",
            },
            {
                id: "exp_401",
                trackerId: "trk_004",
                amount: 2500,
                description: "New clothes for family",
                category: "shopping",
                date: "2026-07-25T16:00:00.000Z",
                createdAt: "2026-07-25T16:10:00.000Z",
            },
            {
                id: "exp_402",
                trackerId: "trk_004",
                amount: 800,
                description: "Diyas and decorations",
                category: "shopping",
                date: "2026-07-28T12:00:00.000Z",
                createdAt: "2026-07-28T12:05:00.000Z",
            },
            {
                id: "exp_403",
                trackerId: "trk_004",
                amount: 1000,
                description: "Sweets and gift boxes",
                category: "gifts",
                date: "2026-07-30T19:00:00.000Z",
                createdAt: "2026-07-30T19:20:00.000Z",
            },
        ]),
    );
})();
