// =====================================
// SmartBook Storage Module
// =====================================

console.log("Storage Module Loaded");

const STORAGE_KEYS = {
    transactions: "transactions",
    monthlyBudget: "monthlyBudget",
    categories: "smartbookCategories"
};

// 雲端儲存延遲計時器
let cloudSaveTimer = null;


// =====================================
// 排程 Firebase 雲端備份
// =====================================

function scheduleCloudSave() {

    // 避免短時間內連續上傳很多次
    clearTimeout(cloudSaveTimer);

    cloudSaveTimer = setTimeout(
        async function () {

            if (
                !window.smartbookFirebase ||
                typeof window.smartbookFirebase
                    .uploadLocalDataToCloud !== "function"
            ) {
                console.log(
                    "Firebase 尚未載入，僅儲存本機資料"
                );

                return;
            }

            const user =
                window.smartbookFirebase
                    .getCurrentUser();

            if (!user) {
                console.log(
                    "尚未登入，僅儲存本機資料"
                );

                return;
            }

            try {

                await window.smartbookFirebase
                    .uploadLocalDataToCloud();

            } catch (error) {

                console.error(
                    "SmartBook 雲端同步失敗：",
                    error
                );

            }

        },
        500
    );

}


// =====================================
// 交易資料
// =====================================

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
            "讀取交易資料失敗：",
            error
        );

        return [];

    }

}


function saveTransactions(data) {

    try {

        localStorage.setItem(
            STORAGE_KEYS.transactions,
            JSON.stringify(data)
        );

        console.log(
            "交易資料已儲存到本機"
        );

        scheduleCloudSave();

    } catch (error) {

        console.error(
            "儲存交易資料失敗：",
            error
        );

    }

}


// =====================================
// 每月預算
// =====================================

function getBudget() {

    try {

        return Number(
            localStorage.getItem(
                STORAGE_KEYS.monthlyBudget
            )
        ) || 0;

    } catch (error) {

        console.error(
            "讀取預算失敗：",
            error
        );

        return 0;

    }

}


function saveBudget(value) {

    try {

        localStorage.setItem(
            STORAGE_KEYS.monthlyBudget,
            String(value)
        );

        console.log(
            "預算已儲存到本機"
        );

        scheduleCloudSave();

    } catch (error) {

        console.error(
            "儲存預算失敗：",
            error
        );

    }

}


// =====================================
// 分類
// =====================================

function getCategoryStorage() {

    try {

        const data =
            localStorage.getItem(
                STORAGE_KEYS.categories
            );

        return data
            ? JSON.parse(data)
            : [];

    } catch (error) {

        console.error(
            "讀取分類失敗：",
            error
        );

        return [];

    }

}


function saveCategoryStorage(data) {

    try {

        localStorage.setItem(
            STORAGE_KEYS.categories,
            JSON.stringify(data)
        );

        console.log(
            "分類已儲存到本機"
        );

        scheduleCloudSave();

    } catch (error) {

        console.error(
            "儲存分類失敗：",
            error
        );

    }

}