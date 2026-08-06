// =====================================
// SmartBook Storage Module
// =====================================

console.log("Storage Module Loaded");

const STORAGE_KEYS = {

    transactions: "transactions",

    monthlyBudget: "monthlyBudget",

    categories: "smartbookCategories"

};

// ===============================
// 交易資料
// ===============================

function getTransactions() {

    try {

        const data =
            localStorage.getItem(
                STORAGE_KEYS.transactions
            );

        return data
            ? JSON.parse(data)
            : [];

    } catch (error) {

        console.error(
            "讀取交易資料失敗",
            error
        );

        return [];

    }

}

function saveTransactions(data) {

    localStorage.setItem(
        STORAGE_KEYS.transactions,
        JSON.stringify(data)
    );

    if (
        window.smartbookFirebase &&
        typeof window.smartbookFirebase
            .queueCloudSave === "function"
    ) {
        window.smartbookFirebase
            .queueCloudSave();
    }

}

// ===============================
// 每月預算
// ===============================

function getBudget() {

    return Number(

        localStorage.getItem(

            STORAGE_KEYS.monthlyBudget

        )

    ) || 0;

}

function saveBudget(value) {

    localStorage.setItem(
        STORAGE_KEYS.monthlyBudget,
        String(value)
    );

    if (
        window.smartbookFirebase &&
        typeof window.smartbookFirebase
            .queueCloudSave === "function"
    ) {
        window.smartbookFirebase
            .queueCloudSave();
    }

}

// ===============================
// 分類
// ===============================

function getCategoryStorage() {

    try {

        const data =
            localStorage.getItem(
                STORAGE_KEYS.categories
            );

        return data
            ? JSON.parse(data)
            : [];

    } catch {

        return [];

    }

}

function saveCategoryStorage(data) {

    localStorage.setItem(
        STORAGE_KEYS.categories,
        JSON.stringify(data)
    );

    if (
        window.smartbookFirebase &&
        typeof window.smartbookFirebase
            .queueCloudSave === "function"
    ) {
        window.smartbookFirebase
            .queueCloudSave();
    }

}