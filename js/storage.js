// =====================================
// SmartBook Storage Module
// V6.1 Offline Sync
// =====================================

console.log("Storage Module Loaded");


const STORAGE_KEYS = {

    transactions: "transactions",

    monthlyBudget: "monthlyBudget",

    categories: "smartbookCategories",

    pendingCloudSync:
        "smartbookPendingCloudSync",

    lastCloudSync:
        "smartbookLastCloudSync"

};


// 雲端儲存延遲計時器
let cloudSaveTimer = null;


// =====================================
// 待同步狀態
// =====================================

function hasPendingCloudSync() {

    return (
        localStorage.getItem(
            STORAGE_KEYS.pendingCloudSync
        ) === "1"
    );

}


function markPendingCloudSync() {

    localStorage.setItem(
        STORAGE_KEYS.pendingCloudSync,
        "1"
    );

    updateSyncStatus("pending");

    console.log(
        "SmartBook：資料等待雲端同步"
    );

}


// =====================================
// 最後同步時間
// =====================================

function saveLastCloudSyncTime() {

    const now =
        new Date().toISOString();

    localStorage.setItem(
        STORAGE_KEYS.lastCloudSync,
        now
    );

    // 更新畫面上的最後同步時間
    updateLastSyncTimeDisplay();

}


function getLastCloudSyncTime() {

    return localStorage.getItem(
        STORAGE_KEYS.lastCloudSync
    );

}


function updateLastSyncTimeDisplay() {

    const timeElement =
        document.getElementById("lastSyncTime");

    if (!timeElement) return;

    const savedTime =
        getLastCloudSyncTime();

    if (!savedTime) {

        timeElement.textContent =
            "尚未同步";

        return;
    }

    const date =
        new Date(savedTime);

    const timeText =
        date.toLocaleTimeString(
            "zh-TW",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    timeElement.textContent =
        `最後同步 ${timeText}`;
}


function clearPendingCloudSync() {

    localStorage.removeItem(
        STORAGE_KEYS.pendingCloudSync
    );

    // 記錄最後一次成功同步時間
    saveLastCloudSyncTime();

    updateSyncStatus("synced");

    console.log(
        "SmartBook：待同步狀態已清除"
    );

}

function updateSyncStatus(status) {

    const statusElement =
        document.getElementById("syncStatus");

    if (!statusElement) return;


    statusElement.classList.remove(
        "synced",
        "pending",
        "offline"
    );


    if (status === "offline") {

        statusElement.textContent =
            "📴 離線";

        statusElement.classList.add(
            "offline"
        );

        return;

    }


    if (status === "pending") {

        statusElement.textContent =
            "⏳ 等待同步";

        statusElement.classList.add(
            "pending"
        );

        return;

    }


    statusElement.textContent =
        "☁️ 已同步";

    statusElement.classList.add(
        "synced"
    );

}


// =====================================
// 執行 Firebase 雲端同步
// =====================================

async function runCloudSave() {

    // 沒網路
    if (!navigator.onLine) {

        console.log(
            "目前離線，資料已保存在本機"
        );

        markPendingCloudSync();

        return false;

    }


    // Firebase 尚未載入
    if (
        !window.smartbookFirebase ||
        typeof window.smartbookFirebase
            .uploadLocalDataToCloud !==
            "function"
    ) {

        console.log(
            "Firebase 尚未載入，稍後再同步"
        );

        markPendingCloudSync();

        return false;

    }


    // 尚未登入
    const user =
        window.smartbookFirebase
            .getCurrentUser();


    if (!user) {

        console.log(
            "尚未登入，資料保留在本機"
        );

        markPendingCloudSync();

        return false;

    }


    // Firebase 初始化尚未完成
    if (
        typeof window.smartbookFirebase
            .isCloudSyncReady ===
            "function" &&
        !window.smartbookFirebase
            .isCloudSyncReady()
    ) {

        console.log(
            "Firebase 尚未完成初始化，稍後再同步"
        );

        markPendingCloudSync();

        return false;

    }


    try {

        const success =
            await window.smartbookFirebase
                .uploadLocalDataToCloud();


        if (success) {

            clearPendingCloudSync();

            console.log(
                "SmartBook：雲端同步完成"
            );

            return true;

        }


        markPendingCloudSync();

        return false;


    } catch (error) {

        console.error(
            "SmartBook 雲端同步失敗：",
            error
        );

        markPendingCloudSync();

        return false;

    }

}


// =====================================
// 排程 Firebase 雲端備份
// =====================================

function scheduleCloudSave() {

    markPendingCloudSync();

    clearTimeout(
        cloudSaveTimer
    );


    cloudSaveTimer =
        setTimeout(

            function () {

                runCloudSave();

            },

            500

        );

}


// =====================================
// 手動重試待同步資料
// =====================================

async function retryPendingCloudSync() {

    if (
        !hasPendingCloudSync()
    ) {

        return true;

    }


    console.log(
        "SmartBook：發現待同步資料，開始重試"
    );


    return await runCloudSave();

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


// =====================================
// 網路恢復
// =====================================

window.addEventListener(

    "online",

    function () {

        updateSyncStatus("pending");

        console.log(
            "SmartBook：網路已恢復"
        );


        // 稍微延遲，
        // 讓 Firebase 先恢復連線
        setTimeout(
            function () {

                retryPendingCloudSync();

            },
            1000
        );

    }

);


// =====================================
// 網路中斷
// =====================================

window.addEventListener(
    "offline",
    function () {

        updateSyncStatus("offline");

        console.log(
            "SmartBook：目前為離線模式"
        );

    }
);


// =====================================
// Firebase 登入完成後
// 有待同步資料就再嘗試一次
// =====================================

window.addEventListener(

    "smartbook-auth-changed",

    function (event) {

        const user =
            event.detail
                ? event.detail.user
                : null;


        if (!user) {
            return;
        }


        setTimeout(
            function () {

                retryPendingCloudSync();

            },
            1500
        );

    }

);


// =====================================
// 初始化同步狀態顯示
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // =====================================
        // 顯示最後一次成功同步時間
        // =====================================

        updateLastSyncTimeDisplay();


        // =====================================
        // 初始化同步狀態
        // =====================================

        // 沒有網路
        if (!navigator.onLine) {

            updateSyncStatus("offline");

            return;

        }


        // 有尚未同步的資料
        if (hasPendingCloudSync()) {

            updateSyncStatus("pending");

            return;

        }


        // 網路正常且沒有待同步資料
        updateSyncStatus("synced");

    }
);

// =====================================
// Firebase 雲端資料更新成功
// 記錄最後同步時間
// =====================================

window.addEventListener(
    "smartbook-cloud-updated",
    function () {

        saveLastCloudSyncTime();

        updateSyncStatus("synced");

        console.log(
            "SmartBook：已更新最後同步時間"
        );

    }
);