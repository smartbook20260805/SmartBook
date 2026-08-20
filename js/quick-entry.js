// =====================================
// SmartBook Quick Entry Module
// =====================================

console.log("Quick Entry Module Loaded");


// =====================================
// 取得快速記帳交易資料
// 統一使用 storage.js
// =====================================

function getQuickEntryTransactions() {

    if (typeof getTransactions === "function") {

        return getTransactions();

    }

    console.warn(
        "找不到 getTransactions()，回傳空陣列"
    );

    return [];

}


// =====================================
// 儲存快速記帳交易資料
// 統一使用 storage.js
// =====================================

function saveQuickEntryTransactions(transactions) {

    if (typeof saveTransactions === "function") {

        saveTransactions(transactions);

        return;

    }

    console.error(
        "找不到 saveTransactions()，快速記帳無法儲存"
    );

}


// =====================================
// 取得今天日期 YYYY-MM-DD
// =====================================

function getQuickEntryToday() {

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// =====================================
// 顯示操作訊息
// =====================================

function showQuickEntryMessage(
    message,
    type
) {

    const messageArea =
        document.getElementById(
            "quickEntryMessage"
        );

    if (!messageArea) return;


    messageArea.className =
        type === "success"
            ? "alert alert-success mt-3"
            : "alert alert-danger mt-3";


    messageArea.textContent =
        message;

    messageArea.style.display =
        "block";


    window.clearTimeout(
        showQuickEntryMessage.timeoutId
    );


    showQuickEntryMessage.timeoutId =
        window.setTimeout(
            function () {

                messageArea.style.display =
                    "none";

            },
            2500
        );

}


// =====================================
// 更新快速記帳分類
// =====================================

function updateQuickEntryCategory() {

    const categoryInput =
        document.getElementById(
            "quickCategory"
        );

    if (!categoryInput) return;


    let categories = [];


    if (
        typeof getCategories ===
        "function"
    ) {

        categories =
            getCategories();

    }


    if (
        !Array.isArray(categories) ||
        categories.length === 0
    ) {

        categories = [
            "餐飲",
            "交通",
            "購物",
            "娛樂",
            "醫療",
            "薪資",
            "獎金",
            "其他"
        ];

    }


    categoryInput.innerHTML = "";


    categories.forEach(
        function (category) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category;

            option.textContent =
                category;

            categoryInput.appendChild(
                option
            );

        }
    );

}


// =====================================
// 清空快速記帳欄位
// =====================================

function resetQuickEntryForm() {

    const dateInput =
        document.getElementById(
            "quickDate"
        );

    const typeInput =
        document.getElementById(
            "quickType"
        );

    const itemInput =
        document.getElementById(
            "quickItem"
        );

    const amountInput =
        document.getElementById(
            "quickAmount"
        );


    if (dateInput) {

        dateInput.value =
            getQuickEntryToday();

    }


    if (typeInput) {

        typeInput.value =
            "支出";

    }


    updateQuickEntryCategory();


    if (itemInput) {

        itemInput.value = "";

    }


    if (amountInput) {

        amountInput.value = "";

    }


    if (itemInput) {

        itemInput.focus();

    }

}


// =====================================
// 更新首頁資料
// =====================================

function refreshQuickEntryDashboard() {

    if (
        typeof updateDashboard ===
        "function"
    ) {

        updateDashboard();

    }


    if (
        typeof loadRecentTransactions ===
        "function"
    ) {

        loadRecentTransactions();

    }


    if (
        typeof loadAdvanceSummary ===
        "function"
    ) {

        loadAdvanceSummary();

    }


    if (
        typeof updateBudgetDashboard ===
        "function"
    ) {

        updateBudgetDashboard();

    }


    if (
        typeof refreshDashboardAnalytics ===
        "function"
    ) {

        refreshDashboardAnalytics();

    }


    if (
        typeof refreshCalendar ===
        "function"
    ) {

        refreshCalendar();

    }

}


// =====================================
// 新增快速交易
// =====================================

function addQuickEntryTransaction() {

    const dateInput =
        document.getElementById(
            "quickDate"
        );

    const typeInput =
        document.getElementById(
            "quickType"
        );

    const categoryInput =
        document.getElementById(
            "quickCategory"
        );

    const itemInput =
        document.getElementById(
            "quickItem"
        );

    const amountInput =
        document.getElementById(
            "quickAmount"
        );


    if (
        !dateInput ||
        !typeInput ||
        !categoryInput ||
        !itemInput ||
        !amountInput
    ) {

        console.error(
            "快速記帳欄位不完整"
        );

        return;

    }


    const date =
        dateInput.value;

    const type =
        typeInput.value;

    const category =
        categoryInput.value;

    const item =
        itemInput.value.trim();

    const amount =
        Number(
            amountInput.value
        );


    // 日期檢查
    if (!date) {

        showQuickEntryMessage(
            "請選擇交易日期！",
            "error"
        );

        return;

    }


    // 項目檢查
    if (!item) {

        showQuickEntryMessage(
            "請輸入交易項目！",
            "error"
        );

        itemInput.focus();

        return;

    }


    // 金額檢查
    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showQuickEntryMessage(
            "請輸入大於 0 的金額！",
            "error"
        );

        amountInput.focus();

        return;

    }


    const transactions =
        getQuickEntryTransactions();


    const newTransaction = {

        date,
        type,
        category,

        advancePerson: "",

        advanceStatus: "",

        recoveredDate: "",

        item,

        amount,

        note: ""

    };


    transactions.push(
        newTransaction
    );


    // 統一走 storage.js
    // storage.js 再負責 Firebase
    saveQuickEntryTransactions(
        transactions
    );


    console.log(
        "Quick Entry：交易已新增"
    );


    refreshQuickEntryDashboard();


    showQuickEntryMessage(
        `✅ 已新增「${item}」NT$ ${amount.toLocaleString()}`,
        "success"
    );


    resetQuickEntryForm();

}


// =====================================
// 頁面載入
// =====================================

document.addEventListener(

    "DOMContentLoaded",

    function () {

        const dateInput =
            document.getElementById(
                "quickDate"
            );

        const typeInput =
            document.getElementById(
                "quickType"
            );

        const itemInput =
            document.getElementById(
                "quickItem"
            );

        const amountInput =
            document.getElementById(
                "quickAmount"
            );

        const addButton =
            document.getElementById(
                "quickAddBtn"
            );


        // 只有首頁有快速記帳表單才執行
        if (!addButton) {

            return;

        }


        if (
            dateInput &&
            !dateInput.value
        ) {

            dateInput.value =
                getQuickEntryToday();

        }


        updateQuickEntryCategory();


        if (typeInput) {

            typeInput.addEventListener(

                "change",

                updateQuickEntryCategory

            );

        }


        addButton.addEventListener(

            "click",

            addQuickEntryTransaction

        );


        // 項目 / 金額按 Enter 直接新增
        [
            itemInput,
            amountInput
        ].forEach(

            function (input) {

                if (!input) return;


                input.addEventListener(

                    "keydown",

                    function (event) {

                        if (
                            event.key ===
                            "Enter"
                        ) {

                            event.preventDefault();

                            addQuickEntryTransaction();

                        }

                    }

                );

            }

        );

    }

);