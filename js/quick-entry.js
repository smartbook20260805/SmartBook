// =====================================
// SmartBook Quick Entry Module
// =====================================

console.log("Quick Entry Module Loaded");

const QUICK_ENTRY_STORAGE_KEY = "transactions";

// 取得交易資料
function getQuickEntryTransactions() {
    try {
        const savedData =
            localStorage.getItem(QUICK_ENTRY_STORAGE_KEY);

        return savedData
            ? JSON.parse(savedData)
            : [];

    } catch (error) {
        console.error("讀取交易資料失敗：", error);
        return [];
    }
}

// 儲存交易資料
function saveQuickEntryTransactions(transactions) {
    localStorage.setItem(
        QUICK_ENTRY_STORAGE_KEY,
        JSON.stringify(transactions)
    );
}

// 取得今天日期 YYYY-MM-DD
function getQuickEntryToday() {
    const today = new Date();

    const year = today.getFullYear();
    const month =
        String(today.getMonth() + 1).padStart(2, "0");
    const day =
        String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// 顯示操作訊息
function showQuickEntryMessage(message, type) {
    const messageArea =
        document.getElementById("quickEntryMessage");

    if (!messageArea) return;

    messageArea.className =
        type === "success"
            ? "alert alert-success mt-3"
            : "alert alert-danger mt-3";

    messageArea.textContent = message;
    messageArea.style.display = "block";

    window.clearTimeout(
        showQuickEntryMessage.timeoutId
    );

    showQuickEntryMessage.timeoutId =
        window.setTimeout(function () {
            messageArea.style.display = "none";
        }, 2500);
}

// 依照類型切換預設分類
function updateQuickEntryCategory() {
    const typeInput =
        document.getElementById("quickType");

    const categoryInput =
        document.getElementById("quickCategory");

    if (!typeInput || !categoryInput) return;

    const incomeCategories = [
        "薪資",
        "獎金",
        "其他"
    ];

    const expenseCategories = [
        "餐飲",
        "交通",
        "購物",
        "娛樂",
        "醫療",
        "其他"
    ];

    const categories =
        typeInput.value === "收入"
            ? incomeCategories
            : expenseCategories;

    categoryInput.innerHTML = "";

    categories.forEach(function (category) {
        const option =
            document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryInput.appendChild(option);
    });
}

// 清空快速記帳欄位
function resetQuickEntryForm() {
    const dateInput =
        document.getElementById("quickDate");

    const typeInput =
        document.getElementById("quickType");

    const itemInput =
        document.getElementById("quickItem");

    const amountInput =
        document.getElementById("quickAmount");

    if (dateInput) {
        dateInput.value = getQuickEntryToday();
    }

    if (typeInput) {
        typeInput.value = "支出";
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

// 更新首頁所有資料
function refreshQuickEntryDashboard() {

    if (typeof updateDashboard === "function") {
        updateDashboard();
    }

    if (typeof loadRecentTransactions === "function") {
        loadRecentTransactions();
    }

    if (typeof loadAdvanceSummary === "function") {
        loadAdvanceSummary();
    }

    if (typeof updateBudgetDashboard === "function") {
        updateBudgetDashboard();
    }

    // ⭐ 更新本月支出 Top5
    if (typeof loadExpenseTopFive === "function") {
        loadExpenseTopFive();
    }

    if (typeof loadSevenDayTrendChart === "function") {
        loadSevenDayTrendChart();
    }

}

// 新增快速交易
function addQuickEntryTransaction() {
    const dateInput =
        document.getElementById("quickDate");

    const typeInput =
        document.getElementById("quickType");

    const categoryInput =
        document.getElementById("quickCategory");

    const itemInput =
        document.getElementById("quickItem");

    const amountInput =
        document.getElementById("quickAmount");

    if (
        !dateInput ||
        !typeInput ||
        !categoryInput ||
        !itemInput ||
        !amountInput
    ) {
        console.error("快速記帳欄位不完整");
        return;
    }

    const date = dateInput.value;
    const type = typeInput.value;
    const category = categoryInput.value;
    const item = itemInput.value.trim();
    const amount = Number(amountInput.value);

    if (!date) {
        showQuickEntryMessage(
            "請選擇交易日期！",
            "error"
        );
        return;
    }

    if (!item) {
        showQuickEntryMessage(
            "請輸入交易項目！",
            "error"
        );
        itemInput.focus();
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
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
        date: date,
        type: type,
        category: category,
        advancePerson: "",
        advanceStatus: "",
        recoveredDate: "",
        item: item,
        amount: amount,
        note: ""
    };

    transactions.push(newTransaction);

    saveQuickEntryTransactions(transactions);

    refreshQuickEntryDashboard();

    showQuickEntryMessage(
        `✅ 已新增「${item}」NT$ ${amount.toLocaleString()}`,
        "success"
    );

    resetQuickEntryForm();
}

// 頁面載入
document.addEventListener(
    "DOMContentLoaded",
    function () {
        const dateInput =
            document.getElementById("quickDate");

        const typeInput =
            document.getElementById("quickType");

        const itemInput =
            document.getElementById("quickItem");

        const amountInput =
            document.getElementById("quickAmount");

        const addButton =
            document.getElementById("quickAddBtn");

        // 只有首頁存在快速記帳表單時才執行
        if (!addButton) return;

        if (dateInput && !dateInput.value) {
            dateInput.value = getQuickEntryToday();
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

        // 在項目或金額欄按 Enter 也能新增
        [itemInput, amountInput].forEach(
            function (input) {
                if (!input) return;

                input.addEventListener(
                    "keydown",
                    function (event) {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            addQuickEntryTransaction();
                        }
                    }
                );
            }
        );
    }
);