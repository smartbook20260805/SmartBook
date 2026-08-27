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
// V7.4 新增交易：切換交易類型欄位
// =====================================

function updateQuickTransactionFields(type) {

    const typeInput =
        document.getElementById("quickType");

    const itemGroup =
        document.getElementById("quickItemGroup");

    const categoryGroup =
        document.getElementById("quickCategoryGroup");

    const accountGroup =
        document.getElementById("quickAccountGroup");

    const advancePersonGroup =
        document.getElementById("quickAdvancePersonGroup");

    const receivablePersonGroup =
        document.getElementById("quickReceivablePersonGroup");

    const expectedReceiveDateGroup =
        document.getElementById("quickExpectedReceiveDateGroup");

    const fromAccountGroup =
        document.getElementById("quickFromAccountGroup");

    const toAccountGroup =
        document.getElementById("quickToAccountGroup");


    if (typeInput) {
        typeInput.value = type;
    }


    // =====================================
    // 先全部恢復成預設狀態
    // =====================================

    if (itemGroup) {
        itemGroup.classList.remove("d-none");
    }

    if (categoryGroup) {
        categoryGroup.classList.remove("d-none");
    }

    if (accountGroup) {
        accountGroup.classList.remove("d-none");
    }

    if (advancePersonGroup) {
        advancePersonGroup.classList.add("d-none");
    }

    if (receivablePersonGroup) {
        receivablePersonGroup.classList.add("d-none");
    }

    if (expectedReceiveDateGroup) {
        expectedReceiveDateGroup.classList.add("d-none");
    }

    if (fromAccountGroup) {
        fromAccountGroup.classList.add("d-none");
    }

    if (toAccountGroup) {
        toAccountGroup.classList.add("d-none");
    }


    // =====================================
    // 代墊
    // =====================================

    if (type === "代墊") {

        if (advancePersonGroup) {
            advancePersonGroup.classList.remove("d-none");
        }

    }


    // =====================================
    // 應收款
    // =====================================

    if (type === "應收款") {

        if (categoryGroup) {
            categoryGroup.classList.add("d-none");
        }

        if (accountGroup) {
            accountGroup.classList.add("d-none");
        }

        if (receivablePersonGroup) {
            receivablePersonGroup.classList.remove("d-none");
        }

        if (expectedReceiveDateGroup) {
            expectedReceiveDateGroup.classList.remove("d-none");
        }

    }


    // =====================================
    // 轉帳
    // =====================================

    if (type === "轉帳") {

        if (itemGroup) {
            itemGroup.classList.add("d-none");
        }

        if (categoryGroup) {
            categoryGroup.classList.add("d-none");
        }

        if (accountGroup) {
            accountGroup.classList.add("d-none");
        }

        if (fromAccountGroup) {
            fromAccountGroup.classList.remove("d-none");
        }

        if (toAccountGroup) {
            toAccountGroup.classList.remove("d-none");
        }

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

    const accountInput =
        document.getElementById(
            "quickAccount"
        );

    const noteInput =
        document.getElementById(
            "quickNote"
        );

    const advancePersonInput =
        document.getElementById(
            "quickAdvancePerson"
        );

    const receivablePersonInput =
        document.getElementById(
            "quickReceivablePerson"
        );

    const expectedReceiveDateInput =
        document.getElementById(
            "quickExpectedReceiveDate"
        );

    const fromAccountInput =
        document.getElementById(
            "quickFromAccount"
        );

    const toAccountInput =
        document.getElementById(
            "quickToAccount"
        );


    if (
        !dateInput ||
        !typeInput ||
        !amountInput
    ) {

        console.error(
            "新增交易欄位不完整"
        );

        return false;

    }


    const date =
        dateInput.value;

    const type =
        typeInput.value;

    const amount =
        Number(
            amountInput.value
        );

    const category =
        categoryInput
            ? categoryInput.value
            : "";

    const item =
        itemInput
            ? itemInput.value.trim()
            : "";

    const account =
        accountInput
            ? accountInput.value
            : "";

    const note =
        noteInput
            ? noteInput.value.trim()
            : "";

    const advancePerson =
        advancePersonInput
            ? advancePersonInput.value.trim()
            : "";

    const receivablePerson =
        receivablePersonInput
            ? receivablePersonInput.value.trim()
            : "";

    const expectedReceiveDate =
        expectedReceiveDateInput
            ? expectedReceiveDateInput.value
            : "";

    const fromAccount =
        fromAccountInput
            ? fromAccountInput.value
            : "";

    const toAccount =
        toAccountInput
            ? toAccountInput.value
            : "";


    // =====================================
    // 基本驗證
    // =====================================

    if (!date) {

        showQuickEntryMessage(
            "請選擇交易日期！",
            "error"
        );

        return false;

    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showQuickEntryMessage(
            "請輸入大於 0 的金額！",
            "error"
        );

        amountInput.focus();

        return false;

    }


    // =====================================
    // 支出 / 收入 / 代墊
    // =====================================

    if (
        type === "支出" ||
        type === "收入" ||
        type === "代墊"
    ) {

        if (!item) {

            showQuickEntryMessage(
                "請輸入交易項目！",
                "error"
            );

            itemInput.focus();

            return false;

        }

    }


    // =====================================
    // 代墊驗證
    // =====================================

    if (
        type === "代墊" &&
        !advancePerson
    ) {

        showQuickEntryMessage(
            "請輸入代墊對象！",
            "error"
        );

        advancePersonInput.focus();

        return false;

    }


    // =====================================
    // 應收款驗證
    // =====================================

    if (type === "應收款") {

        if (!item) {

            showQuickEntryMessage(
                "請輸入交易項目！",
                "error"
            );

            itemInput.focus();

            return false;

        }


        if (!receivablePerson) {

            showQuickEntryMessage(
                "請輸入客戶／欠款人！",
                "error"
            );

            receivablePersonInput.focus();

            return false;

        }

    }


    // =====================================
    // 轉帳驗證
    // =====================================

    if (type === "轉帳") {

        if (
            !fromAccount ||
            !toAccount
        ) {

            showQuickEntryMessage(
                "請選擇轉出與轉入帳戶！",
                "error"
            );

            return false;

        }


        if (
            fromAccount ===
            toAccount
        ) {

            showQuickEntryMessage(
                "轉出帳戶與轉入帳戶不能相同！",
                "error"
            );

            return false;

        }

    }


    const transactions =
        getQuickEntryTransactions();


    // =====================================
    // 建立交易資料
    // =====================================

    const newTransaction = {

        date,

        type,

        category:
            type === "轉帳" ||
            type === "應收款"
                ? ""
                : category,

        item:
            type === "轉帳"
                ? `${fromAccount} → ${toAccount}`
                : item,

        amount,

        note,

        account:
            type === "轉帳" ||
            type === "應收款"
                ? ""
                : account,

        advancePerson:
            type === "代墊"
                ? advancePerson
                : "",

        advanceStatus:
            type === "代墊"
                ? "未收回"
                : "",

        recoveredDate: "",

        receivablePerson:
            type === "應收款"
                ? receivablePerson
                : "",

        expectedReceiveDate:
            type === "應收款"
                ? expectedReceiveDate
                : "",

        receivableStatus:
            type === "應收款"
                ? "未收款"
                : "",

        fromAccount:
            type === "轉帳"
                ? fromAccount
                : "",

        toAccount:
            type === "轉帳"
                ? toAccount
                : ""

    };


    transactions.push(
        newTransaction
    );


    // =====================================
    // 儲存
    // =====================================

    saveQuickEntryTransactions(
        transactions
    );


    console.log(
        "Quick Entry：交易已新增",
        newTransaction
    );


    refreshQuickEntryDashboard();


    showQuickEntryMessage(
        `✅ 已新增 ${type} NT$ ${amount.toLocaleString()}`,
        "success"
    );


    resetQuickEntryForm();


    return true;

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

        const saveAndContinueButton =
    document.getElementById(
        "quickSaveAndContinueBtn"
    );


if (saveAndContinueButton) {

    saveAndContinueButton.addEventListener(
        "click",
        function () {

            const saved =
                addQuickEntryTransaction();

            if (saved) {

                updateQuickTransactionFields(
                    "支出"
                );

            }

        }
    );

}


        // 只有首頁有快速記帳表單才執行
        if (!addButton) {

            return;

        }

        // =====================================
// 儲存交易
// =====================================

addButton.addEventListener(
    "click",
    function () {

        const saved =
            addQuickEntryTransaction();

        if (!saved) {
            return;
        }


        // 儲存成功後關閉 Modal
        const modalElement =
            document.getElementById(
                "quickTransactionModal"
            );

        if (
            modalElement &&
            typeof bootstrap !== "undefined"
        ) {

            const modalInstance =
                bootstrap.Modal.getInstance(
                    modalElement
                );

            if (modalInstance) {

    // 先移除 Modal 內目前的焦點
    if (
        document.activeElement &&
        modalElement.contains(
            document.activeElement
        )
    ) {

        document.activeElement.blur();

    }

    // 再關閉 Modal
    modalInstance.hide();

}

        }

    }
);


        if (
            dateInput &&
            !dateInput.value
        ) {

            dateInput.value =
                getQuickEntryToday();

        }


        updateQuickEntryCategory();

        // =====================================
// V7.4 交易類型按鈕
// =====================================

const typeButtons =
    document.querySelectorAll(
        ".quick-type-btn"
    );


typeButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const selectedType =
                    this.dataset.type;


                // 移除所有 active
                typeButtons.forEach(
                    function (btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                // 目前按鈕 active
                this.classList.add(
                    "active"
                );


                // 切換欄位
                updateQuickTransactionFields(
                    selectedType
                );

            }
        );

    }
);


// 預設顯示支出
updateQuickTransactionFields(
    "支出"
);

    }
);