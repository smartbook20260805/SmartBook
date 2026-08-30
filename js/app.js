// =====================================
// SmartBook Core Module
// =====================================

console.log("SmartBook Core Loaded");

let editIndex = -1;

// ===============================
// Dashboard
// ===============================
function updateDashboard() {

    const incomeCard = document.getElementById("incomeTotal");
    const expenseCard = document.getElementById("expenseTotal");
    const balanceCard = document.getElementById("balanceTotal");
    const advanceCard = document.getElementById("advanceTotal");

    if (!incomeCard) return;

    const transactions = getTransactions();

    let income = 0;
    let expense = 0;
    let advance = 0;

    transactions.forEach(transaction => {

        const amount = Number(transaction.amount) || 0;

        if (transaction.type === "收入") {
            income += amount;
        }

        if (transaction.type === "支出") {
            expense += amount;
        }

        // 只統計尚未收回的代墊
        if (
            transaction.type === "代墊" &&
            transaction.advanceStatus !== "已收回"
        ) {
            advance += amount;
        }

    });

    incomeCard.textContent =
        "NT$ " + income.toLocaleString();

    expenseCard.textContent =
        "NT$ " + expense.toLocaleString();

    advanceCard.textContent =
        "NT$ " + advance.toLocaleString();

    balanceCard.textContent =
        "NT$ " + (income - expense - advance).toLocaleString();
}
// ===============================
// 載入交易列表
// ===============================
function loadTransactions() {

    const table = document.getElementById("transactionList");

    if (!table) return;

    table.innerHTML = "";

    const transactions = getTransactions();

    transactions.forEach((transaction, index) => {

        const row = document.createElement("tr");

        row.innerHTML = `
             <td>${transaction.date}</td>
             <td>${transaction.type}</td>
             <td>${transaction.category || "其他"}</td>
             <td>${transaction.advancePerson || "-"}</td>
             <td>${transaction.advanceStatus || "未收回"}</td>
             <td>${transaction.recoveredDate || "-"}</td>
             <td>${transaction.item}</td>
             <td>NT$ ${Number(transaction.amount).toLocaleString()}</td>
             <td>${transaction.note || ""}</td>
             <td>
                 <button
                    type="button"
                    class="btn btn-warning btn-sm me-1"
                    onclick="editTransaction(${index})">
                    ✏️
                 </button>

                 <button
                     type="button"
                     class="btn btn-danger btn-sm"
                     onclick="deleteTransaction(${index})">
                     🗑️
                </button>
             </td>
 `;

        table.appendChild(row);

    });

}
// ===============================
// 搜尋與篩選交易
// ===============================
function filterTransactions() {

    const keyword =
        document.getElementById("searchKeyword")?.value
            .trim()
            .toLowerCase() || "";

    const filterType =
        document.getElementById("filterType")?.value || "";

    const filterCategory =
        document.getElementById("filterCategory")?.value || "";

    const startDate =
        document.getElementById("filterStartDate")?.value || "";

    const endDate =
        document.getElementById("filterEndDate")?.value || "";

    const transactions = getTransactions();

    const filteredTransactions = transactions
        .map((transaction, originalIndex) => ({
            transaction,
            originalIndex
        }))
        .filter(({ transaction }) => {

            const searchableText = [
                transaction.item,
                transaction.note,
                transaction.advancePerson,
                transaction.category
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const keywordMatch =
                !keyword || searchableText.includes(keyword);

            const typeMatch =
                !filterType || transaction.type === filterType;

            const categoryMatch =
                !filterCategory ||
                (transaction.category || "其他") === filterCategory;

            const startDateMatch =
                !startDate || transaction.date >= startDate;

            const endDateMatch =
                !endDate || transaction.date <= endDate;

            return (
                keywordMatch &&
                typeMatch &&
                categoryMatch &&
                startDateMatch &&
                endDateMatch
            );
        });

    displayFilteredTransactions(filteredTransactions);
}
// ===============================
// 顯示篩選後交易
// ===============================
function displayFilteredTransactions(filteredTransactions) {

    const table = document.getElementById("transactionList");

    if (!table) return;

    table.innerHTML = "";

    if (filteredTransactions.length === 0) {

    table.innerHTML = `
        <tr>
            <td colspan="10" class="text-center py-5">

                <h5>🔍 找不到符合條件的交易</h5>

                <p class="text-muted mb-0">
                    請修改搜尋條件後再試一次
                </p>

            </td>
        </tr>
    `;

    return;
}

    filteredTransactions.forEach(
        ({ transaction, originalIndex }) => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${transaction.date}</td>
                <td>${transaction.type}</td>
                <td>${transaction.category || "其他"}</td>
                <td>${transaction.advancePerson || "-"}</td>
                <td>${transaction.advanceStatus || "-"}</td>
                <td>${transaction.recoveredDate || "-"}</td>
                <td>${transaction.item}</td>
                <td>
                    NT$ ${Number(transaction.amount).toLocaleString()}
                </td>
                <td>${transaction.note || ""}</td>
                <td>
                    <button
                        type="button"
                        class="btn btn-warning btn-sm me-1"
                        onclick="editTransaction(${originalIndex})">
                        ✏️
                    </button>

                    <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        onclick="deleteTransaction(${originalIndex})">
                        🗑️
                    </button>
                </td>
            `;

            table.appendChild(row);
        }
    );
}

// ===============================
// V7.4 編輯交易
// 使用新版交易 Modal
// ===============================

function editTransaction(index) {

    const transactions =
        getTransactions();

    const transaction =
        transactions[index];

    if (!transaction) {
        return;
    }


    // 記住正在修改哪一筆
    editIndex = index;


    const type =
        transaction.type || "支出";


    // ===============================
    // 切換 Modal 到正確交易類型
    // ===============================

    if (
        typeof updateQuickTransactionFields ===
        "function"
    ) {

        updateQuickTransactionFields(
            type
        );

    }


    // ===============================
    // 更新上方類型按鈕 active
    // ===============================

    const typeButtons =
        document.querySelectorAll(
            ".quick-type-btn"
        );

    typeButtons.forEach(
        function (button) {

            button.classList.toggle(
                "active",
                button.dataset.type === type
            );

        }
    );


    // ===============================
    // 取得新版欄位
    // ===============================

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


    // ===============================
    // 帶入原交易資料
    // ===============================

    if (dateInput) {
        dateInput.value =
            transaction.date || "";
    }

    if (typeInput) {
        typeInput.value =
            type;
    }

    if (categoryInput) {
        categoryInput.value =
            transaction.category || "其他";
    }

    if (itemInput) {
        itemInput.value =
            type === "轉帳"
                ? ""
                : transaction.item || "";
    }

    if (amountInput) {
        amountInput.value =
            transaction.amount || "";
    }

    if (accountInput) {
        accountInput.value =
            transaction.account || "現金";
    }

    if (noteInput) {
        noteInput.value =
            transaction.note || "";
    }

    if (advancePersonInput) {
        advancePersonInput.value =
            transaction.advancePerson || "";
    }

    if (receivablePersonInput) {
        receivablePersonInput.value =
            transaction.receivablePerson || "";
    }

    if (expectedReceiveDateInput) {
        expectedReceiveDateInput.value =
            transaction.expectedReceiveDate || "";
    }

    if (fromAccountInput) {
        fromAccountInput.value =
            transaction.fromAccount || "現金";
    }

    if (toAccountInput) {
        toAccountInput.value =
            transaction.toAccount || "銀行";
    }


    // ===============================
    // Modal 改成修改模式
    // ===============================

    const modalElement =
        document.getElementById(
            "quickTransactionModal"
        );

    if (!modalElement) {

        console.error(
            "找不到 quickTransactionModal"
        );

        return;

    }


    const modalTitle =
        modalElement.querySelector(
            ".modal-title"
        );

    if (modalTitle) {

        modalTitle.textContent =
            "修改交易";

    }


    const saveButton =
        document.getElementById(
            "quickAddBtn"
        );

    if (saveButton) {

        saveButton.textContent =
            "儲存修改";

        saveButton.classList.remove(
            "btn-primary"
        );

        saveButton.classList.add(
            "btn-warning"
        );

    }


    // 修改時先隱藏「儲存並繼續新增」
    const continueButton =
        document.getElementById(
            "quickSaveAndContinueBtn"
        );

    if (continueButton) {

        continueButton.classList.add(
            "d-none"
        );

    }


    // ===============================
    // 開啟 Modal
    // ===============================

    if (
        typeof bootstrap !==
        "undefined"
    ) {

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );

        modal.show();

    }

}

// ===============================
// 刪除交易
// ===============================
function deleteTransaction(index) {

    const confirmed = confirm("確定要刪除這筆交易嗎？");

    if (!confirmed) return;

    const transactions = getTransactions();

    transactions.splice(index, 1);

    saveTransactions(transactions);

    if (editIndex === index) {

    editIndex = -1;

} else if (editIndex > index) {

    editIndex -= 1;

}

    loadTransactions();
    updateDashboard();

}


// ===============================
// 最近交易（Dashboard）
// ===============================
function loadRecentTransactions() {

    const recentArea = document.getElementById("recentTransactions");

    if (!recentArea) return;

    const transactions = getTransactions();

    if (transactions.length === 0) {
        recentArea.innerHTML = "<p>尚無資料</p>";
        return;
    }

    const recentTransactions = transactions
        .slice()
        .reverse()
        .slice(0, 5);

    recentArea.innerHTML = `
        <div class="table-responsive">
            <table class="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>日期</th>
                        <th>類型</th>
                        <th>項目</th>
                        <th>金額</th>
                    </tr>
                </thead>

                <tbody>
                    ${recentTransactions.map(transaction => `
                        <tr>
                            <td>${transaction.date}</td>
                            <td>${transaction.type}</td>
                            <td>${transaction.category || "其他"}</td>
                            <td>${transaction.item}</td> 
                            <td>
                                NT$ ${Number(transaction.amount).toLocaleString()}
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;

}

// ===============================
// 每人尚未收回代墊統計
// ===============================
function loadAdvanceSummary() {

    const summaryArea = document.getElementById("advanceSummary");

    if (!summaryArea) return;

    const transactions = getTransactions();
    const personTotals = {};

    transactions.forEach(transaction => {

        const isUnrecoveredAdvance =
            transaction.type === "代墊" &&
            transaction.advanceStatus !== "已收回";

        if (!isUnrecoveredAdvance) return;

        const person =
            transaction.advancePerson?.trim() || "未填寫對象";

        const amount = Number(transaction.amount) || 0;

        personTotals[person] =
            (personTotals[person] || 0) + amount;
    });

    const entries = Object.entries(personTotals);

    if (entries.length === 0) {
        summaryArea.innerHTML = "<p>尚無未收回代墊</p>";
        return;
    }

    entries.sort((a, b) => b[1] - a[1]);

    summaryArea.innerHTML = `
        <div class="table-responsive">
            <table class="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>對象</th>
                        <th>尚未收回金額</th>
                    </tr>
                </thead>

                <tbody>
                    ${entries.map(([person, total]) => `
                        <tr>
                            <td>${person}</td>
                            <td>NT$ ${total.toLocaleString()}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

// ===============================
// 應收款統計
// ===============================
function loadReceivableSummary() {

    const summaryArea =
        document.getElementById(
            "receivableSummary"
        );

    if (!summaryArea) return;


    const transactions =
        getTransactions();


    let pendingTotal = 0;
    let receivedTotal = 0;
    let pendingCount = 0;


    const receivables =
        transactions.filter(
            function (transaction) {

                return (
                    transaction.type ===
                    "應收款"
                );

            }
        );


    receivables.forEach(
        function (transaction) {

            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                transaction.receivableStatus ===
                "已收款"
            ) {

                receivedTotal +=
                    amount;

            } else {

                pendingTotal +=
                    amount;

                pendingCount++;

            }

        }
    );


    if (receivables.length === 0) {

        summaryArea.innerHTML = `
            <p class="text-muted mb-0">
                尚無應收款資料
            </p>
        `;

        return;

    }


    summaryArea.innerHTML = `

        <div class="row g-3 mb-4">

            <div class="col-md-4">

                <div class="border rounded p-3">

                    <small class="text-muted">
                        待收總額
                    </small>

                    <div class="fw-bold mt-1">
                        NT$ ${pendingTotal.toLocaleString()}
                    </div>

                </div>

            </div>


            <div class="col-md-4">

                <div class="border rounded p-3">

                    <small class="text-muted">
                        未收款筆數
                    </small>

                    <div class="fw-bold mt-1">
                        ${pendingCount} 筆
                    </div>

                </div>

            </div>


            <div class="col-md-4">

                <div class="border rounded p-3">

                    <small class="text-muted">
                        已收款總額
                    </small>

                    <div class="fw-bold mt-1">
                        NT$ ${receivedTotal.toLocaleString()}
                    </div>

                </div>

            </div>

        </div>


        <div class="table-responsive">

            <table
                class="
                    table
                    table-bordered
                    table-hover
                    align-middle
                "
            >

                <thead>

                    <tr>

                        <th>客戶／欠款人</th>

                        <th>項目</th>

                        <th>金額</th>

                        <th>建立日期</th>

                        <th>實際收款日</th>

                        <th>狀態</th>

                        <th>操作</th>

                    </tr>

                </thead>


                <tbody>

                    ${receivables
                        .map(
                            function (
                                transaction
                            ) {

                                const status =
                                    transaction.receivableStatus ||
                                    "未收款";


                                return `

                                    <tr>

                                        <td>
                                            ${
                                                transaction.receivablePerson ||
                                                "未填寫"
                                            }
                                        </td>

                                        <td>
                                            ${
                                                transaction.item ||
                                                "-"
                                            }
                                        </td>

                                        <td>
                                            NT$ ${Number(
                                                transaction.amount
                                            ).toLocaleString()}
                                        </td>

                                        <td>
                                            ${
                                                transaction.date ||
                                                "-"
                                            }
                                        </td>

                                        <td>
    ${
        transaction.receivedDate ||
        "-"
    }
</td>

                                        <td>

                                            ${
                                                status ===
                                                "已收款"
                                                    ? "✅ 已收款"
                                                    : "⏳ 未收款"
                                            }

                                        </td>

                                        <td>

                                            ${
    status === "已收款"
        ? `
            <button
                type="button"
                class="btn btn-outline-secondary btn-sm"
                onclick="undoReceivableReceived(${transactions.indexOf(transaction)})"
            >
                取消已收款
            </button>
        `
        : `
            <button
                type="button"
                class="btn btn-success btn-sm"
                onclick="markReceivableReceived(${transactions.indexOf(transaction)})"
            >
                標記已收款
            </button>
        `
}

                                        </td>

                                    </tr>

                                `;

                            }
                        )
                        .join("")}

                </tbody>

            </table>

        </div>

    `;

}

// ===============================
// 標記應收款為已收款
// ===============================
function markReceivableReceived(index) {

    const transactions = getTransactions();

    if (!transactions[index]) {
        return;
    }

    const transaction = transactions[index];

    if (transaction.type !== "應收款") {
        return;
    }


    // 預設為今天
    const today =
        new Date().toISOString().split("T")[0];


    // 讓使用者輸入實際收款日期
    const receivedDate = prompt(
        "請輸入實際收款日期（YYYY-MM-DD）",
        today
    );


    // 按取消就不做任何修改
    if (receivedDate === null) {
        return;
    }


    // 日期不能空白
    if (!receivedDate.trim()) {

        alert("請輸入實際收款日期");

        return;
    }


    transaction.receivableStatus = "已收款";
    transaction.receivedDate = receivedDate.trim();


    saveTransactions(transactions);

    loadTransactions();
    loadReceivableSummary();
    updateDashboard();
}


// ===============================
// 取消應收款已收款狀態
// ===============================
function undoReceivableReceived(index) {

    const transactions = getTransactions();

    if (!transactions[index]) {
        return;
    }

    const transaction = transactions[index];

    if (transaction.type !== "應收款") {
        return;
    }

    const confirmed = confirm(
        "確定要將這筆應收款改回「未收款」嗎？"
    );

    if (!confirmed) {
        return;
    }

    transaction.receivableStatus = "未收款";
    transaction.receivedDate = "";

    saveTransactions(transactions);

    loadTransactions();
    loadReceivableSummary();
    updateDashboard();
}


// ===============================
// 本月報表
// ===============================
function loadMonthlyReport() {
         
    const incomeElement = document.getElementById("reportIncome");
    const expenseElement = document.getElementById("reportExpense");
    const advanceElement = document.getElementById("reportAdvance");
    const balanceElement = document.getElementById("reportBalance");
    const tableArea = document.getElementById("reportTable");

    if (!incomeElement) return;

    const transactions = getTransactions();

   const reportDate =
    typeof selectedReportDate !== "undefined"
        ? selectedReportDate
        : new Date();

const currentYear =
    reportDate.getFullYear();

const currentMonth =
    reportDate.getMonth();

    const monthlyTransactions = transactions.filter(transaction => {

        if (!transaction.date) return false;

        const transactionDate = new Date(transaction.date + "T00:00:00");

        return (
            transactionDate.getFullYear() === currentYear &&
            transactionDate.getMonth() === currentMonth
        );
    });

    let income = 0;
    let expense = 0;
    let advance = 0;

    monthlyTransactions.forEach(transaction => {

        const amount = Number(transaction.amount) || 0;

        if (transaction.type === "收入") {
            income += amount;
        }

        if (transaction.type === "支出") {
            expense += amount;
        }

        if (
            transaction.type === "代墊" &&
            transaction.advanceStatus !== "已收回"
        ) {
            advance += amount;
        }

    });

    incomeElement.textContent =
        "NT$ " + income.toLocaleString();

    expenseElement.textContent =
        "NT$ " + expense.toLocaleString();

    advanceElement.textContent =
        "NT$ " + advance.toLocaleString();

    balanceElement.textContent =
        "NT$ " + (income - expense - advance).toLocaleString();

    if (monthlyTransactions.length === 0) {
        tableArea.innerHTML = "<p>本月尚無交易資料</p>";
        return;
    }

    tableArea.innerHTML = `
        <div class="table-responsive">
            <table class="table table-bordered table-hover">
                <thead>
                    <tr>
                        <th>日期</th>
                        <th>類型</th>
                        <th>分類</th>
                        <th>對象</th>
                        <th>項目</th>
                        <th>金額</th>
                    </tr>
                </thead>

                <tbody>
                    ${monthlyTransactions.map(transaction => `
                        <tr>
                            <td>${transaction.date}</td>
                            <td>${transaction.type}</td>
                            <td>${transaction.category || "其他"}</td>
                            <td>${transaction.advancePerson || "-"}</td>
                            <td>${transaction.item}</td>
                            <td>
                                NT$ ${Number(transaction.amount).toLocaleString()}
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

// ===============================
// V7.0 本月 vs 上月財務比較
// ===============================

function loadMonthComparison() {

    const currentExpenseElement =
        document.getElementById(
            "currentMonthExpense"
        );

    const previousExpenseElement =
        document.getElementById(
            "previousMonthExpense"
        );

    const expenseComparisonElement =
        document.getElementById(
            "expenseComparison"
        );

    const currentIncomeElement =
        document.getElementById(
            "currentMonthIncome"
        );

    const previousIncomeElement =
        document.getElementById(
            "previousMonthIncome"
        );

    const incomeComparisonElement =
        document.getElementById(
            "incomeComparison"
        );


    // 不是報表頁就不執行
    if (
        !currentExpenseElement ||
        !previousExpenseElement ||
        !expenseComparisonElement ||
        !currentIncomeElement ||
        !previousIncomeElement ||
        !incomeComparisonElement
    ) {
        return;
    }


    const transactions =
        getTransactions();


    const reportDate =
    typeof selectedReportDate !== "undefined"
        ? selectedReportDate
        : new Date();

const currentYear =
    reportDate.getFullYear();

const currentMonth =
    reportDate.getMonth();


    // 上個月
    const previousDate =
        new Date(
            currentYear,
            currentMonth - 1,
            1
        );

    const previousYear =
        previousDate.getFullYear();

    const previousMonth =
        previousDate.getMonth();


    let currentExpense = 0;

    let previousExpense = 0;

    let currentIncome = 0;

    let previousIncome = 0;


    transactions.forEach(
        function (transaction) {

            if (!transaction.date) {
                return;
            }


            const transactionDate =
                new Date(
                    transaction.date +
                    "T00:00:00"
                );


            const year =
                transactionDate
                    .getFullYear();

            const month =
                transactionDate
                    .getMonth();

            const amount =
                Number(
                    transaction.amount
                ) || 0;


            // 本月
            if (
                year === currentYear &&
                month === currentMonth
            ) {

                if (
                    transaction.type ===
                    "支出"
                ) {
                    currentExpense +=
                        amount;
                }

                if (
                    transaction.type ===
                    "收入"
                ) {
                    currentIncome +=
                        amount;
                }

            }


            // 上月
            if (
                year === previousYear &&
                month === previousMonth
            ) {

                if (
                    transaction.type ===
                    "支出"
                ) {
                    previousExpense +=
                        amount;
                }

                if (
                    transaction.type ===
                    "收入"
                ) {
                    previousIncome +=
                        amount;
                }

            }

        }
    );


    // ===============================
    // 顯示金額
    // ===============================

    currentExpenseElement.textContent =
        "NT$ " +
        currentExpense.toLocaleString();

    previousExpenseElement.textContent =
        "NT$ " +
        previousExpense.toLocaleString();

    currentIncomeElement.textContent =
        "NT$ " +
        currentIncome.toLocaleString();

    previousIncomeElement.textContent =
        "NT$ " +
        previousIncome.toLocaleString();


    // ===============================
    // 支出比較
    // ===============================

    renderMonthComparisonResult(
        currentExpense,
        previousExpense,
        expenseComparisonElement,
        "支出"
    );


    // ===============================
    // 收入比較
    // ===============================

    renderMonthComparisonResult(
        currentIncome,
        previousIncome,
        incomeComparisonElement,
        "收入"
    );

}


// ===============================
// 月份比較文字
// ===============================

function renderMonthComparisonResult(
    currentValue,
    previousValue,
    element,
    type
) {

    if (!element) {
        return;
    }


    // 上月沒有資料
    if (previousValue === 0) {

        if (currentValue === 0) {

            element.innerHTML =
                `<span class="text-muted">
                    本月與上月皆無${type}資料
                </span>`;

        } else {

            element.innerHTML =
                `<span class="text-primary">
                    本月新增 ${type}
                    NT$ ${currentValue.toLocaleString()}
                </span>`;

        }

        return;

    }


    const difference =
        currentValue -
        previousValue;


    const percentage =
        (
            difference /
            previousValue
        ) * 100;


    // 完全相同
    if (difference === 0) {

        element.innerHTML =
            `<span class="text-muted">
                ➖ 與上月相同
            </span>`;

        return;

    }


    // 增加
    if (difference > 0) {

        const className =
            type === "支出"
                ? "text-danger"
                : "text-success";


        element.innerHTML =
            `<span class="${className}">
                ↑ 比上月增加
                ${Math.abs(percentage).toFixed(1)}%
                （NT$ ${Math.abs(difference).toLocaleString()}）
            </span>`;

        return;

    }


    // 減少
    const className =
        type === "支出"
            ? "text-success"
            : "text-danger";


    element.innerHTML =
        `<span class="${className}">
            ↓ 比上月減少
            ${Math.abs(percentage).toFixed(1)}%
            （NT$ ${Math.abs(difference).toLocaleString()}）
        </span>`;

}


// ===============================
// V7.0 最近 6 個月財務趨勢
// ===============================


function loadSixMonthTrendChart() {

    const canvas =
        document.getElementById(
            "sixMonthTrendChart"
        );

    if (!canvas) return;

    if (typeof Chart === "undefined") {

        console.error(
            "Chart.js 尚未成功載入"
        );

        return;

    }


    const transactions =
        getTransactions();


    const reportDate =
    typeof selectedReportDate !== "undefined"
        ? selectedReportDate
        : new Date();


    const months = [];


    // 建立最近 6 個月
    for (
        let index = 5;
        index >= 0;
        index--
    ) {

        const date =
    new Date(
        reportDate.getFullYear(),
        reportDate.getMonth() - index,
        1
    );


        months.push({

            year:
                date.getFullYear(),

            month:
                date.getMonth(),

            label:
                `${date.getMonth() + 1}月`,

            income: 0,

            expense: 0,

            balance: 0

        });

    }


    // ===============================
    // 統計交易
    // ===============================

    transactions.forEach(
        function (transaction) {

            if (!transaction.date) {
                return;
            }


            const transactionDate =
                new Date(
                    transaction.date +
                    "T00:00:00"
                );


            const targetMonth =
                months.find(
                    function (monthData) {

                        return (
                            monthData.year ===
                                transactionDate
                                    .getFullYear() &&

                            monthData.month ===
                                transactionDate
                                    .getMonth()
                        );

                    }
                );


            if (!targetMonth) {
                return;
            }


            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                transaction.type ===
                "收入"
            ) {

                targetMonth.income +=
                    amount;

            }


            if (
                transaction.type ===
                "支出"
            ) {

                targetMonth.expense +=
                    amount;

            }

        }
    );


    // ===============================
    // 計算餘額
    // ===============================

    months.forEach(
        function (monthData) {

            monthData.balance =
                monthData.income -
                monthData.expense;

        }
    );


    const labels =
        months.map(
            function (monthData) {

                return monthData.label;

            }
        );


    const incomeData =
        months.map(
            function (monthData) {

                return monthData.income;

            }
        );


    const expenseData =
        months.map(
            function (monthData) {

                return monthData.expense;

            }
        );


    const balanceData =
        months.map(
            function (monthData) {

                return monthData.balance;

            }
        );


    // 舊圖表存在就先刪除
    const existingChart =
        Chart.getChart(canvas);


    if (existingChart) {

        existingChart.destroy();

    }


    // ===============================
    // 建立折線圖
    // ===============================

    new Chart(

        canvas,

        {

            type: "line",

            data: {

                labels,

                datasets: [

                    {
                        label: "收入",
                        data: incomeData,
                        tension: 0.3
                    },

                    {
                        label: "支出",
                        data: expenseData,
                        tension: 0.3
                    },

                    {
                        label: "餘額",
                        data: balanceData,
                        tension: 0.3
                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {

                    mode: "index",

                    intersect: false

                },

                plugins: {

                    legend: {

                        position: "bottom"

                    },

                    tooltip: {

                        callbacks: {

                            label:
                                function (context) {

                                    const value =
                                        Number(
                                            context.raw
                                        ) || 0;


                                    return (
                                        context.dataset.label +
                                        "：NT$ " +
                                        value.toLocaleString()
                                    );

                                }

                        }

                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            callback:
                                function (value) {

                                    return (
                                        "NT$ " +
                                        Number(value)
                                            .toLocaleString()
                                    );

                                }

                        }

                    }

                }

            }

        }

    );

}


// ===============================
// V7.0 本月財務分析摘要
// ===============================

function loadFinancialSummary() {

    const topCategoryElement =
        document.getElementById("topExpenseCategory");

    const topCategoryAmountElement =
        document.getElementById("topExpenseCategoryAmount");

    const largestExpenseElement =
        document.getElementById("largestExpense");

    const largestExpenseItemElement =
        document.getElementById("largestExpenseItem");

    const averageDailyExpenseElement =
        document.getElementById("averageDailyExpense");

    const budgetUsageRateElement =
        document.getElementById("budgetUsageRate");

    const budgetUsageDetailElement =
        document.getElementById("budgetUsageDetail");


    // 不是報表頁就不執行
    if (
        !topCategoryElement ||
        !topCategoryAmountElement ||
        !largestExpenseElement ||
        !largestExpenseItemElement ||
        !averageDailyExpenseElement ||
        !budgetUsageRateElement ||
        !budgetUsageDetailElement
    ) {
        return;
    }


    const transactions =
        getTransactions();

    const reportDate =
    typeof selectedReportDate !== "undefined"
        ? selectedReportDate
        : new Date();

const currentYear =
    reportDate.getFullYear();

const currentMonth =
    reportDate.getMonth();


    let totalExpense = 0;

    let largestExpense = 0;

    let largestExpenseItem = "";

    const categoryTotals = {};


    transactions.forEach(function (transaction) {

        if (
            transaction.type !== "支出" ||
            !transaction.date
        ) {
            return;
        }


        const transactionDate =
            new Date(
                transaction.date +
                "T00:00:00"
            );


        if (
            transactionDate.getFullYear() !== currentYear ||
            transactionDate.getMonth() !== currentMonth
        ) {
            return;
        }


        const amount =
            Number(transaction.amount) || 0;

        const category =
            transaction.category || "其他";


        // 本月總支出
        totalExpense += amount;


        // 分類統計
        categoryTotals[category] =
            (categoryTotals[category] || 0) +
            amount;


        // 最大單筆支出
        if (amount > largestExpense) {

            largestExpense =
                amount;

            largestExpenseItem =
                transaction.item || "未填寫項目";

        }

    });


    // ===============================
    // 最高支出分類
    // ===============================

    const categoryEntries =
        Object.entries(categoryTotals);

    if (categoryEntries.length > 0) {

        categoryEntries.sort(
            function (a, b) {
                return b[1] - a[1];
            }
        );


        const [
            topCategory,
            topAmount
        ] = categoryEntries[0];


        topCategoryElement.textContent =
            topCategory;

        topCategoryAmountElement.textContent =
            "NT$ " +
            topAmount.toLocaleString();

    } else {

        topCategoryElement.textContent =
            "尚無資料";

        topCategoryAmountElement.textContent =
            "NT$ 0";

    }


    // ===============================
    // 最大單筆支出
    // ===============================

    largestExpenseElement.textContent =
        "NT$ " +
        largestExpense.toLocaleString();


    largestExpenseItemElement.textContent =
        largestExpense > 0
            ? largestExpenseItem
            : "尚無資料";


    // ===============================
    // 每日平均支出
    // 以本月目前經過天數計算
    // ===============================

    const today =
    new Date();

let daysPassed;

const isCurrentMonth =
    currentYear === today.getFullYear() &&
    currentMonth === today.getMonth();

if (isCurrentMonth) {

    // 當月：用今天是幾號
    daysPassed =
        today.getDate();

} else {

    // 歷史月份：用該月完整天數
    daysPassed =
        new Date(
            currentYear,
            currentMonth + 1,
            0
        ).getDate();

}


    const averageDailyExpense =
        daysPassed > 0
            ? totalExpense / daysPassed
            : 0;


    averageDailyExpenseElement.textContent =
        "NT$ " +
        Math.round(
            averageDailyExpense
        ).toLocaleString();


    // ===============================
    // 預算使用率
    // ===============================

    const monthlyBudget =
        typeof getBudget === "function"
            ? getBudget()
            : Number(
                localStorage.getItem(
                    "monthlyBudget"
                )
            ) || 0;


    if (monthlyBudget <= 0) {

        budgetUsageRateElement.textContent =
            "未設定";

        budgetUsageDetailElement.textContent =
            "請先設定每月預算";

        return;

    }


    const usageRate =
        (
            totalExpense /
            monthlyBudget
        ) * 100;


    budgetUsageRateElement.textContent =
        usageRate.toFixed(1) +
        "%";


    budgetUsageDetailElement.textContent =
        `NT$ ${totalExpense.toLocaleString()} / NT$ ${monthlyBudget.toLocaleString()}`;

}

// ===============================
// V7.0 自動財務建議
// ===============================

function loadFinancialAdvice() {

    const adviceArea =
        document.getElementById(
            "financialAdvice"
        );

    if (!adviceArea) {
        return;
    }


    const transactions =
        getTransactions();

    const reportDate =
    typeof selectedReportDate !== "undefined"
        ? selectedReportDate
        : new Date();

const currentYear =
    reportDate.getFullYear();

const currentMonth =
    reportDate.getMonth();


    const previousDate =
        new Date(
            currentYear,
            currentMonth - 1,
            1
        );

    const previousYear =
        previousDate.getFullYear();

    const previousMonth =
        previousDate.getMonth();


    let currentExpense = 0;
    let previousExpense = 0;

    const categoryTotals = {};


    transactions.forEach(
        function (transaction) {

            if (
                !transaction.date ||
                transaction.type !== "支出"
            ) {
                return;
            }


            const transactionDate =
                new Date(
                    transaction.date +
                    "T00:00:00"
                );

            const year =
                transactionDate
                    .getFullYear();

            const month =
                transactionDate
                    .getMonth();

            const amount =
                Number(
                    transaction.amount
                ) || 0;


            // 本月
            if (
                year === currentYear &&
                month === currentMonth
            ) {

                currentExpense +=
                    amount;


                const category =
                    transaction.category ||
                    "其他";


                categoryTotals[category] =
                    (
                        categoryTotals[category] ||
                        0
                    ) + amount;

            }


            // 上月
            if (
                year === previousYear &&
                month === previousMonth
            ) {

                previousExpense +=
                    amount;

            }

        }
    );


    const adviceList = [];


    // ===============================
    // 1. 本月 vs 上月支出
    // ===============================

    if (previousExpense > 0) {

        const difference =
            currentExpense -
            previousExpense;

        const percentage =
            (
                difference /
                previousExpense
            ) * 100;


        if (percentage >= 20) {

            adviceList.push(
                `⚠️ 本月支出比上月增加 ${percentage.toFixed(1)}%，建議留意近期支出。`
            );

        }
        else if (percentage > 0) {

            adviceList.push(
                `📈 本月支出比上月增加 ${percentage.toFixed(1)}%。`
            );

        }
        else if (percentage <= -10) {

            adviceList.push(
                `✅ 本月支出比上月減少 ${Math.abs(percentage).toFixed(1)}%，支出控制有改善。`
            );

        }
        else {

            adviceList.push(
                "➖ 本月支出與上月差異不大。"
            );

        }

    }
    else if (currentExpense > 0) {

        adviceList.push(
            "ℹ️ 上月沒有支出資料，目前無法進行完整月度比較。"
        );

    }


    // ===============================
    // 2. 最高支出分類
    // ===============================

    const categoryEntries =
        Object.entries(
            categoryTotals
        );


    if (categoryEntries.length > 0) {

        categoryEntries.sort(
            function (a, b) {

                return b[1] - a[1];

            }
        );


        const [
            topCategory,
            topAmount
        ] = categoryEntries[0];


        const categoryRate =
            currentExpense > 0
                ? (
                    topAmount /
                    currentExpense
                ) * 100
                : 0;


        adviceList.push(
            `🏆 本月最高支出分類是「${topCategory}」，占本月支出 ${categoryRate.toFixed(1)}%。`
        );

    }


    // ===============================
    // 3. 預算使用率
    // ===============================

    const monthlyBudget =
        typeof getBudget === "function"
            ? getBudget()
            : Number(
                localStorage.getItem(
                    "monthlyBudget"
                )
            ) || 0;


    if (monthlyBudget > 0) {

        const usageRate =
            (
                currentExpense /
                monthlyBudget
            ) * 100;


        if (usageRate >= 100) {

            adviceList.push(
                `🚨 本月預算已使用 ${usageRate.toFixed(1)}%，目前已超出設定預算。`
            );

        }
        else if (usageRate >= 80) {

            adviceList.push(
                `⚠️ 本月預算已使用 ${usageRate.toFixed(1)}%，接近預算上限。`
            );

        }
        else if (usageRate >= 50) {

            adviceList.push(
                `💡 本月預算已使用 ${usageRate.toFixed(1)}%，目前仍在可控範圍。`
            );

        }
        else {

            adviceList.push(
                `✅ 本月預算使用率為 ${usageRate.toFixed(1)}%，目前預算狀況良好。`
            );

        }

    }
    else {

        adviceList.push(
            "🎯 尚未設定每月預算，可到系統設定新增預算。"
        );

    }


    // ===============================
    // 4. 每日平均支出
    // ===============================

    const today =
    new Date();

let daysPassed;

const isCurrentMonth =
    currentYear === today.getFullYear() &&
    currentMonth === today.getMonth();

if (isCurrentMonth) {

    // 目前月份：計算到今天
    daysPassed =
        today.getDate();

} else {

    // 歷史月份：使用該月完整天數
    daysPassed =
        new Date(
            currentYear,
            currentMonth + 1,
            0
        ).getDate();

}


    const averageDailyExpense =
        daysPassed > 0
            ? currentExpense /
              daysPassed
            : 0;


    adviceList.push(
        `📅 本月目前每日平均支出約 NT$ ${Math.round(averageDailyExpense).toLocaleString()}。`
    );


    // ===============================
    // 顯示結果
    // ===============================

    if (adviceList.length === 0) {

        adviceArea.innerHTML = `
            <p class="text-muted mb-0">
                目前資料不足，暫時無法產生財務建議。
            </p>
        `;

        return;

    }


    adviceArea.innerHTML = `
        <ul class="mb-0">
            ${adviceList
                .map(
                    function (advice) {

                        return `
                            <li class="mb-2">
                                ${advice}
                            </li>
                        `;

                    }
                )
                .join("")}
        </ul>
    `;

}

// ===============================
// V7.1 報表月份選擇器
// ===============================

let selectedReportDate =
    new Date();


function formatReportMonthValue(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    return `${year}-${month}`;

}

// ===============================
// V7.1 更新報表月份標題
// ===============================

function updateReportMonthTitles() {

    const year =
        selectedReportDate.getFullYear();

    const month =
        selectedReportDate.getMonth() + 1;

    const monthText =
        `${year}年${month}月`;


    // ===============================
    // 上一個月
    // ===============================

    const previousDate =
        new Date(
            year,
            selectedReportDate.getMonth() - 1,
            1
        );

    const previousYear =
        previousDate.getFullYear();

    const previousMonth =
        previousDate.getMonth() + 1;

    const previousMonthText =
        `${previousYear}年${previousMonth}月`;


    // ===============================
    // 四張主要卡片
    // ===============================

    const incomeTitle =
        document.getElementById(
            "reportIncomeTitle"
        );

    const expenseTitle =
        document.getElementById(
            "reportExpenseTitle"
        );

    const advanceTitle =
        document.getElementById(
            "reportAdvanceTitle"
        );

    const balanceTitle =
        document.getElementById(
            "reportBalanceTitle"
        );


    if (incomeTitle) {
        incomeTitle.textContent =
            `${monthText}收入`;
    }

    if (expenseTitle) {
        expenseTitle.textContent =
            `${monthText}支出`;
    }

    if (advanceTitle) {
        advanceTitle.textContent =
            `${monthText}代墊`;
    }

    if (balanceTitle) {
        balanceTitle.textContent =
            `${monthText}餘額`;
    }


    // ===============================
    // 本月 vs 上月
    // ===============================

    const comparisonTitle =
        document.getElementById(
            "monthComparisonTitle"
        );

    if (comparisonTitle) {

        comparisonTitle.textContent =
            `${monthText} vs ${previousMonthText}`;

    }


    // ===============================
    // 財務分析
    // ===============================

    const financialSummaryTitle =
        document.getElementById(
            "financialSummaryTitle"
        );

    if (financialSummaryTitle) {

        financialSummaryTitle.textContent =
            `${monthText}財務分析`;

    }


    // ===============================
    // 交易紀錄
    // ===============================

    const reportTableTitle =
        document.getElementById(
            "reportTableTitle"
        );

    if (reportTableTitle) {

        reportTableTitle.textContent =
            `${monthText}交易`;

    }

}


function updateReportMonthInput() {

    const monthInput =
        document.getElementById(
            "reportMonth"
        );

    if (!monthInput) {
        return;
    }

    // 顯示目前選擇的月份
    monthInput.value =
        formatReportMonthValue(
            selectedReportDate
        );

    // 更新標題
    if (
        typeof updateReportMonthTitles ===
        "function"
    ) {
        updateReportMonthTitles();
    }

    // 控制「下個月」按鈕
    const nextMonthBtn =
        document.getElementById(
            "nextMonthBtn"
        );

    if (!nextMonthBtn) {
        return;
    }

    const now =
        new Date();

    const currentYear =
        now.getFullYear();

    const currentMonth =
        now.getMonth();

    const selectedYear =
        selectedReportDate.getFullYear();

    const selectedMonth =
        selectedReportDate.getMonth();

    // 只有選到真正目前月份時才停用
    nextMonthBtn.disabled =
        (
            selectedYear === currentYear &&
            selectedMonth === currentMonth
        );

}


// 上個月
function goToPreviousReportMonth() {

    selectedReportDate =
        new Date(
            selectedReportDate.getFullYear(),
            selectedReportDate.getMonth() - 1,
            1
        );

   updateReportMonthInput();

loadMonthlyReport();
loadMonthComparison();
loadFinancialSummary();
loadFinancialAdvice();
loadCategorySummary();
loadExpenseChart();
loadSummaryChart();
loadSixMonthTrendChart();
loadCategoryBudgetUsage();
loadUnbudgetedExpenseWarning();
loadBudgetHealth();

}


// 下個月
function goToNextReportMonth() {

    const now =
        new Date();

    const currentMonthDate =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

    const nextDate =
        new Date(
            selectedReportDate.getFullYear(),
            selectedReportDate.getMonth() + 1,
            1
        );

    // 不允許超過目前月份
    if (nextDate > currentMonthDate) {
        return;
    }

    selectedReportDate =
        nextDate;

    updateReportMonthInput();

    loadMonthlyReport();
    loadMonthComparison();
    loadFinancialSummary();
    loadFinancialAdvice();
    loadCategorySummary();
    loadExpenseChart();
    loadSummaryChart();
    loadSixMonthTrendChart();
    loadCategoryBudgetUsage();
    loadUnbudgetedExpenseWarning();
    loadBudgetHealth();

}



// ===============================
// 支出分類統計
// ===============================
function loadCategorySummary() {

    const summaryArea = document.getElementById("categorySummary");

    if (!summaryArea) return;

    const transactions = getTransactions();
    const reportDate =
    typeof selectedReportDate !== "undefined"
        ? selectedReportDate
        : new Date();

const currentYear =
    reportDate.getFullYear();

const currentMonth =
    reportDate.getMonth();

    const categoryTotals = {};

    transactions.forEach(transaction => {

    if (transaction.type !== "支出") return;
    if (!transaction.date) return;

    const transactionDate =
        new Date(
            transaction.date +
            "T00:00:00"
        );

    if (
        transactionDate.getFullYear() !== currentYear ||
        transactionDate.getMonth() !== currentMonth
    ) {
        return;
    }

        const category = transaction.category || "其他";

        const amount = Number(transaction.amount) || 0;

        categoryTotals[category] =
            (categoryTotals[category] || 0) + amount;

    });

    const entries = Object.entries(categoryTotals);

    if (entries.length === 0) {

        summaryArea.innerHTML =
            "<p>尚無支出資料</p>";

        return;

    }

    entries.sort((a, b) => b[1] - a[1]);

    summaryArea.innerHTML = `
        <table class="table table-bordered">

            <thead>

                <tr>

                    <th>分類</th>
                    <th>金額</th>

                </tr>

            </thead>

            <tbody>

                ${entries.map(([category, total]) => `

                    <tr>

                        <td>${category}</td>

                        <td>
                            NT$ ${total.toLocaleString()}
                        </td>

                    </tr>

                `).join("")}

            </tbody>

        </table>
    `;

}
// ===============================
// 匯出 Excel
// ===============================
function exportTransactionsToExcel() {

    const transactions = getTransactions();

    if (transactions.length === 0) {
        alert("目前沒有交易資料可以匯出！");
        return;
    }

    const excelData = transactions.map(transaction => ({
        日期: transaction.date || "",
        類型: transaction.type || "",
        分類: transaction.category || "其他",
        代墊對象: transaction.advancePerson || "",
        代墊狀態: transaction.advanceStatus || "",
        收回日期: transaction.recoveredDate || "",
        項目: transaction.item || "",
        金額: Number(transaction.amount) || 0,
        備註: transaction.note || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet["!cols"] = [
        { wch: 12 },
        { wch: 10 },
        { wch: 12 },
        { wch: 14 },
        { wch: 12 },
        { wch: 12 },
        { wch: 18 },
        { wch: 12 },
        { wch: 24 }
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "交易紀錄"
    );

    const today = new Date();

    const fileDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    XLSX.writeFile(
        workbook,
        `SmartBook_${fileDate}.xlsx`
    );
}
// ===============================
// 本月支出分類圓餅圖
// ===============================
function loadExpenseChart() {

    const chartCanvas = document.getElementById("expenseChart");

    if (!chartCanvas) return;

    if (typeof Chart === "undefined") {
        console.error("Chart.js 尚未成功載入");
        return;
    }

    const transactions = getTransactions();

    const reportDate =
    typeof selectedReportDate !== "undefined"
        ? selectedReportDate
        : new Date();

const currentYear =
    reportDate.getFullYear();

const currentMonth =
    reportDate.getMonth();

    const categoryTotals = {};

    transactions.forEach(transaction => {

        if (transaction.type !== "支出") return;
        if (!transaction.date) return;

        const transactionDate =
            new Date(transaction.date + "T00:00:00");

        const isCurrentMonth =
            transactionDate.getFullYear() === currentYear &&
            transactionDate.getMonth() === currentMonth;

        if (!isCurrentMonth) return;

        const category =
            transaction.category || "其他";

        const amount =
            Number(transaction.amount) || 0;

        categoryTotals[category] =
            (categoryTotals[category] || 0) + amount;

    });

    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);

    if (labels.length === 0) {

        chartCanvas.style.display = "none";

        const message = document.createElement("p");
        message.id = "expenseChartMessage";
        message.textContent = "本月尚無支出資料，新增支出後才會顯示圓餅圖。";

        chartCanvas.parentElement.appendChild(message);
        return;
    }

    chartCanvas.style.display = "block";

    const existingChart = Chart.getChart(chartCanvas);

if (existingChart) {
    existingChart.destroy();
}

new Chart(chartCanvas, {
    type: "pie",

    data: {
        labels: labels,

        datasets: [{
            label: "本月支出",
            data: values
        }]
    },

    options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                position: "bottom"
            },

            tooltip: {
                callbacks: {
                    label: function (context) {
                        const value = Number(context.raw) || 0;

                        return `${context.label}：NT$ ${value.toLocaleString()}`;
                    }
                }
            }
        }
    }
});
} // 

// =====================================
// V7.4 本月預算健康度
// =====================================

function loadBudgetHealth() {

    const healthArea =
        document.getElementById(
            "budgetHealth"
        );

    if (!healthArea) {
        return;
    }


    const transactions =
        typeof getTransactions === "function"
            ? getTransactions()
            : [];


    const reportDate =
        typeof selectedReportDate !== "undefined"
            ? selectedReportDate
            : new Date();


    const reportYear =
        reportDate.getFullYear();

    const reportMonth =
        reportDate.getMonth();


    // =====================================
    // 讀取分類預算
    // =====================================

    let categoryBudgets = {};

    try {

        categoryBudgets =
            JSON.parse(
                localStorage.getItem(
                    "smartbookCategoryBudgets"
                ) || "{}"
            );

    } catch (error) {

        console.error(
            "讀取分類預算失敗：",
            error
        );

        categoryBudgets = {};

    }


    const budgetEntries =
        Object.entries(
            categoryBudgets
        );


    if (budgetEntries.length === 0) {

        healthArea.innerHTML = `
            <p class="text-muted mb-0">
                尚未設定分類預算，無法分析預算健康度。
            </p>
        `;

        return;

    }


    // =====================================
    // 分類預算總額
    // =====================================

    const totalBudget =
        budgetEntries.reduce(
            function (
                total,
                [category, amount]
            ) {

                return total +
                    (
                        Number(amount) ||
                        0
                    );

            },
            0
        );


    // =====================================
    // 計算有設定預算分類的實際支出
    // =====================================

    let totalSpent = 0;


    transactions.forEach(
        function (transaction) {

            if (
                transaction.type !== "支出" ||
                !transaction.date
            ) {
                return;
            }


            const transactionDate =
                new Date(
                    transaction.date +
                    "T00:00:00"
                );


            if (
                transactionDate.getFullYear() !== reportYear ||
                transactionDate.getMonth() !== reportMonth
            ) {
                return;
            }


            const category =
                transaction.category ||
                "其他";


            // 只有設定分類預算的支出才計入
            if (
                !Object.prototype.hasOwnProperty.call(
                    categoryBudgets,
                    category
                )
            ) {
                return;
            }


            totalSpent +=
                Number(
                    transaction.amount
                ) || 0;

        }
    );


    const budgetUsageRate =
        totalBudget > 0
            ? (
                totalSpent /
                totalBudget
            ) * 100
            : 0;


    // =====================================
    // 計算月份時間進度
    // =====================================

    const now =
        new Date();

    const isCurrentMonth =
        reportYear === now.getFullYear() &&
        reportMonth === now.getMonth();


    let monthProgressRate = 100;


    if (isCurrentMonth) {

        const daysInMonth =
            new Date(
                reportYear,
                reportMonth + 1,
                0
            ).getDate();


        monthProgressRate =
            (
                now.getDate() /
                daysInMonth
            ) * 100;

    }


    // =====================================
    // 健康度判斷
    // =====================================

    let healthIcon = "🟢";
    let healthTitle = "預算健康";
    let healthMessage =
        "目前支出速度在合理範圍內。";


    if (budgetUsageRate >= 100) {

        healthIcon = "🔴";
        healthTitle = "預算警示";
        healthMessage =
            "目前已超出分類預算，建議檢查本月主要支出。";

    } else if (
        isCurrentMonth &&
        budgetUsageRate >
            monthProgressRate + 15
    ) {

        healthIcon = "🔴";
        healthTitle = "支出速度偏高";
        healthMessage =
            "目前預算使用速度明顯高於月份進度，建議控制接下來的支出。";

    } else if (
        budgetUsageRate >= 80 ||
        (
            isCurrentMonth &&
            budgetUsageRate >
                monthProgressRate
        )
    ) {

        healthIcon = "🟡";
        healthTitle = "注意支出";
        healthMessage =
            "目前支出速度較快，建議留意接下來的預算使用。";

    }


    // =====================================
    // 顯示健康度
    // =====================================

    healthArea.innerHTML = `

        <div class="mb-3">

            <h5 class="mb-2">
                ${healthIcon}
                ${healthTitle}
            </h5>

            <p class="mb-0">
                ${healthMessage}
            </p>

        </div>


        <div class="row g-3">

            <div class="col-6">

                <div
                    class="
                        border
                        rounded
                        p-3
                        h-100
                    "
                >

                    <small class="text-muted">
                        ${
                            isCurrentMonth
                                ? "本月時間進度"
                                : "月份進度"
                        }
                    </small>

                    <div class="fw-bold mt-1">
                        ${monthProgressRate.toFixed(1)}%
                    </div>

                </div>

            </div>


            <div class="col-6">

                <div
                    class="
                        border
                        rounded
                        p-3
                        h-100
                    "
                >

                    <small class="text-muted">
                        預算使用率
                    </small>

                    <div class="fw-bold mt-1">
                        ${budgetUsageRate.toFixed(1)}%
                    </div>

                </div>

            </div>

        </div>

    `;

}


// =====================================
// V7.3 分類預算使用率
// =====================================

function loadCategoryBudgetUsage() {

    const usageArea =
        document.getElementById(
            "categoryBudgetUsage"
        );

    if (!usageArea) {
        return;
    }


    const transactions =
        typeof getTransactions === "function"
            ? getTransactions()
            : [];


    const reportDate =
        typeof selectedReportDate !== "undefined"
            ? selectedReportDate
            : new Date();


    const currentYear =
        reportDate.getFullYear();

    const currentMonth =
        reportDate.getMonth();


    // =====================================
    // 讀取分類預算
    // =====================================

    let categoryBudgets = {};

    try {

        categoryBudgets =
            JSON.parse(
                localStorage.getItem(
                    "smartbookCategoryBudgets"
                ) || "{}"
            );

    } catch (error) {

        console.error(
            "讀取分類預算失敗：",
            error
        );

        categoryBudgets = {};

    }


    const budgetEntries =
        Object.entries(
            categoryBudgets
        );


    if (budgetEntries.length === 0) {

        usageArea.innerHTML = `
            <p class="text-muted mb-0">
                尚未設定分類預算。
            </p>
        `;

        return;

    }


    // =====================================
    // 統計目前選擇月份的分類支出
    // =====================================

    const categoryExpenses = {};


    transactions.forEach(
        function (transaction) {

            if (
                transaction.type !== "支出" ||
                !transaction.date
            ) {
                return;
            }


            const transactionDate =
                new Date(
                    transaction.date +
                    "T00:00:00"
                );


            if (
                transactionDate.getFullYear() !== currentYear ||
                transactionDate.getMonth() !== currentMonth
            ) {
                return;
            }


            const category =
                transaction.category ||
                "其他";


            const amount =
                Number(
                    transaction.amount
                ) || 0;


            categoryExpenses[category] =
                (
                    categoryExpenses[category] ||
                    0
                ) + amount;

        }
    );


    // =====================================
    // 建立畫面
    // =====================================

    usageArea.innerHTML =
        budgetEntries
            .map(
                function ([
                    category,
                    budgetValue
                ]) {

                    const budget =
                        Number(
                            budgetValue
                        ) || 0;


                    const spent =
                        Number(
                            categoryExpenses[
                                category
                            ]
                        ) || 0;


                    const remaining =
                        budget -
                        spent;


                    const usageRate =
                        budget > 0
                            ? (
                                spent /
                                budget
                            ) * 100
                            : 0;


                    const progressWidth =
                        Math.min(
                            usageRate,
                            100
                        );


                    let statusText = "";

                    let progressClass =
                        "bg-success";


                    if (usageRate >= 100) {

                        statusText =
                            " 🚨 已超出預算";

                        progressClass =
                            "bg-danger";

                    } else if (
                        usageRate >= 80
                    ) {

                        statusText =
                            " ⚠️ 接近預算上限";

                        progressClass =
                            "bg-warning";

                    } else {

                        statusText =
                            " ✅ 預算正常";

                    }


                    const remainingText =
                        remaining >= 0
                            ? `剩餘 NT$ ${remaining.toLocaleString()}`
                            : `超支 NT$ ${Math.abs(remaining).toLocaleString()}`;


                    return `
                        <div class="mb-4">

                            <div
                                class="
                                    d-flex
                                    justify-content-between
                                    align-items-center
                                    flex-wrap
                                    gap-2
                                    mb-2
                                "
                            >

                                <strong>
                                    ${category}
                                </strong>

                                <span>
                                    ${usageRate.toFixed(1)}%
                                    ${statusText}
                                </span>

                            </div>


                            <div class="mb-2">

                                NT$ ${spent.toLocaleString()}
                                /
                                NT$ ${budget.toLocaleString()}

                            </div>


                            <div
                                class="progress mb-2"
                                style="height: 12px;"
                            >

                                <div
                                    class="
                                        progress-bar
                                        ${progressClass}
                                    "
                                    role="progressbar"
                                    style="width: ${progressWidth}%;"
                                    aria-valuenow="${progressWidth}"
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                >
                                </div>

                            </div>


                            <small
                                class="${
                                    remaining >= 0
                                        ? "text-muted"
                                        : "text-danger"
                                }"
                            >
                                ${remainingText}
                            </small>

                        </div>
                    `;

                }
            )
            .join("");

}

// =====================================
// V7.3 未設定預算的支出提醒
// =====================================

function loadUnbudgetedExpenseWarning() {

    const warningArea =
        document.getElementById(
            "unbudgetedExpenseWarning"
        );

    if (!warningArea) {
        return;
    }


    const transactions =
        typeof getTransactions === "function"
            ? getTransactions()
            : [];


    const reportDate =
        typeof selectedReportDate !== "undefined"
            ? selectedReportDate
            : new Date();


    const currentYear =
        reportDate.getFullYear();

    const currentMonth =
        reportDate.getMonth();


    // ===============================
    // 讀取分類預算
    // ===============================

    let categoryBudgets = {};

    try {

        categoryBudgets =
            JSON.parse(
                localStorage.getItem(
                    "smartbookCategoryBudgets"
                ) || "{}"
            );

    } catch (error) {

        console.error(
            "讀取分類預算失敗：",
            error
        );

        categoryBudgets = {};

    }


    // ===============================
    // 統計未設定預算的分類支出
    // ===============================

    const unbudgetedExpenses = {};


    transactions.forEach(
        function (transaction) {

            if (
                transaction.type !== "支出" ||
                !transaction.date
            ) {
                return;
            }


            const transactionDate =
                new Date(
                    transaction.date +
                    "T00:00:00"
                );


            if (
                transactionDate.getFullYear() !== currentYear ||
                transactionDate.getMonth() !== currentMonth
            ) {
                return;
            }


            const category =
                transaction.category ||
                "其他";


            const amount =
                Number(
                    transaction.amount
                ) || 0;


            // 已有分類預算就不列入
            if (
                Object.prototype.hasOwnProperty.call(
                    categoryBudgets,
                    category
                )
            ) {
                return;
            }


            unbudgetedExpenses[category] =
                (
                    unbudgetedExpenses[category] ||
                    0
                ) + amount;

        }
    );


    const entries =
        Object.entries(
            unbudgetedExpenses
        );


    // ===============================
    // 全部都有設定預算
    // ===============================

    if (entries.length === 0) {

        warningArea.innerHTML = `
            <div class="text-success">
                ✅ 目前這個月份的支出分類都有設定預算。
            </div>
        `;

        return;

    }


    // ===============================
    // 計算未設定預算總額
    // ===============================

    const totalUnbudgeted =
        entries.reduce(
            function (
                total,
                [category, amount]
            ) {

                return total +
                    (
                        Number(amount) ||
                        0
                    );

            },
            0
        );


    // 金額高到低排序
    entries.sort(
        function (a, b) {

            return (
                Number(b[1]) -
                Number(a[1])
            );

        }
    );


    // ===============================
    // 顯示
    // ===============================

    warningArea.innerHTML = `

        <h5 class="mb-3">
            ⚠️ 未設定預算的支出
        </h5>

        <div class="table-responsive">

            <table
                class="
                    table
                    table-sm
                    align-middle
                    mb-3
                "
            >

                <thead>

                    <tr>

                        <th>
                            分類
                        </th>

                        <th class="text-end">
                            支出
                        </th>

                        <th class="text-end">
                            操作
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${entries
                        .map(
                            function ([
                                category,
                                amount
                            ]) {

                                return `
                                    <tr>

                                        <td>
                                            ${category}
                                        </td>

                                        <td class="text-end">
                                            NT$ ${Number(amount).toLocaleString()}
                                        </td>

                                        <td class="text-end">

    <a
    href="setting.html?budgetCategory=${encodeURIComponent(category)}#categoryBudgetSection"
    class="btn btn-outline-primary btn-sm"
>
    🎯 設定預算
</a>

</td>

                                    </tr>
                                `;

                            }
                        )
                        .join("")}

                </tbody>

            </table>

        </div>


        <div class="alert alert-warning mb-0">

            本月共有

            <strong>
                NT$ ${totalUnbudgeted.toLocaleString()}
            </strong>

            的支出尚未設定分類預算。

        </div>
    `;

}

// ===============================
// 收入 / 支出 / 代墊 長條圖
// ===============================
function loadSummaryChart() {

    const canvas = document.getElementById("summaryChart");

    if (!canvas) return;

    const transactions = getTransactions();

    const reportDate =
    typeof selectedReportDate !== "undefined"
        ? selectedReportDate
        : new Date();

    let income = 0;
    let expense = 0;
    let advance = 0;

    transactions.forEach(t => {

        if (!t.date) return;

        const d = new Date(t.date + "T00:00:00");

        if (
            d.getFullYear() !== reportDate.getFullYear() ||
            d.getMonth() !== reportDate.getMonth()
        ) {
            return;
        }

        const amount = Number(t.amount) || 0;

        if (t.type === "收入") {
            income += amount;
        }

        if (t.type === "支出") {
            expense += amount;
        }

        if (
            t.type === "代墊" &&
            t.advanceStatus !== "已收回"
        ) {
            advance += amount;
        }

    });

    const existingChart = Chart.getChart(canvas);

if (existingChart) {
    existingChart.destroy();
}

new Chart(canvas, {

        type: "bar",

        data: {

            labels: [
                "收入",
                "支出",
                "代墊"
            ],

            datasets: [{

                label: "本月金額",

                data: [
                    income,
                    expense,
                    advance
                ]

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: false

                }

            }

        }

    });

}
// ===============================
// 匯出 JSON 備份
// ===============================
function exportBackup() {

    const transactions = getTransactions();

    const backupData = {
        app: "SmartBook",
        version: "V6.5",
        exportedAt: new Date().toISOString(),
        transactions
    };

    const jsonText = JSON.stringify(
        backupData,
        null,
        2
    );

    const blob = new Blob(
        [jsonText],
        { type: "application/json" }
    );

    const downloadUrl =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    const today = new Date();

    const fileDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    link.href = downloadUrl;

    link.download =
        `smartbook_backup_${fileDate}.json`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(downloadUrl);
}

// ===============================
// 網頁載入完成
// ===============================
document.addEventListener("DOMContentLoaded", function () {

    // 載入各頁面資料
    loadTransactions();
    updateDashboard();
    loadRecentTransactions();
    loadAdvanceSummary();
    loadMonthlyReport();
    loadMonthComparison();
    loadSixMonthTrendChart();
    loadFinancialSummary();
    loadFinancialAdvice();
    loadCategorySummary();
    loadExpenseChart();
    loadSummaryChart();
    loadCategoryBudgetUsage();
    loadUnbudgetedExpenseWarning();
    loadBudgetHealth();
    loadReceivableSummary();


    // Excel 匯出
    const exportExcelButton =
        document.getElementById("exportExcel");

    if (exportExcelButton) {
        exportExcelButton.addEventListener(
            "click",
            exportTransactionsToExcel
        );
    }

    // 搜尋按鈕
    const searchBtn =
        document.getElementById("searchBtn");

    if (searchBtn) {
        searchBtn.addEventListener(
            "click",
            filterTransactions
        );
    }

    // 按 Enter 搜尋
    const searchKeyword =
        document.getElementById("searchKeyword");

    if (searchKeyword) {
        searchKeyword.addEventListener(
            "keypress",
            function (event) {

                if (event.key === "Enter") {
                    filterTransactions();
                }

            }
        );
    }

    // 清除搜尋
    const clearSearchBtn =
        document.getElementById("clearSearchBtn");

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener(
            "click",
            function () {

                document.getElementById("searchKeyword").value = "";
                document.getElementById("filterType").value = "";
                document.getElementById("filterCategory").value = "";
                document.getElementById("filterStartDate").value = "";
                document.getElementById("filterEndDate").value = "";

                loadTransactions();
            }
        );
    }

    // 改變篩選條件時自動搜尋
    const filterIds = [
        "filterType",
        "filterCategory",
        "filterStartDate",
        "filterEndDate"
    ];

    filterIds.forEach(function (id) {

        const element = document.getElementById(id);

        if (element) {
            element.addEventListener(
                "change",
                filterTransactions
            );
        }

    });

});


const reportMonthInput =
    document.getElementById(
        "reportMonth"
    );

const previousMonthBtn =
    document.getElementById(
        "previousMonthBtn"
    );

const nextMonthBtn =
    document.getElementById(
        "nextMonthBtn"
    );


if (reportMonthInput) {

    updateReportMonthInput();

    reportMonthInput.addEventListener(
        "change",
        function () {

            if (!this.value) {
                return;
            }

            const [year, month] =
                this.value
                    .split("-")
                    .map(Number);

            selectedReportDate =
                new Date(
                    year,
                    month - 1,
                    1
                );

            updateReportMonthInput();

            loadMonthlyReport();
            loadMonthComparison();
            loadFinancialSummary();
            loadFinancialAdvice();
            loadCategorySummary();
            loadExpenseChart();
            loadSummaryChart();
            loadSixMonthTrendChart();
            loadCategoryBudgetUsage();
            loadUnbudgetedExpenseWarning();
            loadBudgetHealth();

        }
    );

}

if (previousMonthBtn) {

    previousMonthBtn.addEventListener(
        "click",
        goToPreviousReportMonth
    );

}

if (nextMonthBtn) {

    nextMonthBtn.addEventListener(
        "click",
        goToNextReportMonth
    );

}


// ===============================
// 註冊 Service Worker
// ===============================
/*
if ("serviceWorker" in navigator) {

    window.addEventListener("load", function () {

        navigator.serviceWorker
            .register("./service-worker.js")
            .then(() => {
                console.log("Service Worker 註冊成功");
            })
            .catch(error => {
                console.error("Service Worker 註冊失敗：", error);
            });

    });

}
*/
// ===============================
// 返回頁面時重新整理畫面資料
// ===============================
window.addEventListener("pageshow", function () {

    loadTransactions();
    updateDashboard();
    loadRecentTransactions();
    loadAdvanceSummary();
    loadReceivableSummary();

    loadMonthlyReport();
    loadMonthComparison();
    loadSixMonthTrendChart();

    loadCategorySummary();

    if (typeof loadExpenseChart === "function") {
        loadExpenseChart();
    }

    if (typeof loadSummaryChart === "function") {
        loadSummaryChart();
    }

});

// ===============================
// Firebase Google 登入介面
// ===============================

// 更新登入畫面
function updateFirebaseAuthUI(user) {

    const userEmail =
        document.getElementById("userEmail");

    const loginBtn =
        document.getElementById("loginBtn");

    const logoutBtn =
        document.getElementById("logoutBtn");

    // 其他頁面沒有登入元件時，直接略過
    if (!userEmail || !loginBtn || !logoutBtn) {
        return;
    }

    if (user) {

        userEmail.textContent =
            user.email || "已登入";

        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";

    } else {

        userEmail.textContent = "尚未登入";

        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";

    }

}


// Firebase 雲端資料更新後，重新整理各區塊
function refreshSmartBookAfterCloudSync() {

    if (typeof loadTransactions === "function") {
        loadTransactions();
    }

    if (typeof updateDashboard === "function") {
        updateDashboard();
    }

    if (typeof loadRecentTransactions === "function") {
        loadRecentTransactions();
    }

    if (typeof loadAdvanceSummary === "function") {
        loadAdvanceSummary();
    }

    // ===============================
    // 報表
    // ===============================

    if (typeof loadMonthlyReport === "function") {
        loadMonthlyReport();
    }

    // V7.0 本月 vs 上月
    if (typeof loadMonthComparison === "function") {
        loadMonthComparison();
    }

    // V7.0 最近 6 個月財務趨勢
    if (typeof loadSixMonthTrendChart === "function") {
        loadSixMonthTrendChart();
    }

    if (typeof loadFinancialSummary === "function") {
    loadFinancialSummary();
    }

    if (typeof loadFinancialAdvice === "function") {
    loadFinancialAdvice();
    }

    if (typeof loadCategorySummary === "function") {
        loadCategorySummary();
    }

    if (typeof loadExpenseChart === "function") {
        loadExpenseChart();
    }

    if (typeof loadSummaryChart === "function") {
        loadSummaryChart();
    }

    // ===============================
    // 預算
    // ===============================

    if (typeof updateBudgetDashboard === "function") {
        updateBudgetDashboard();
    }

    // ===============================
    // 分類
    // ===============================

    if (typeof refreshCategorySelects === "function") {
        refreshCategorySelects();
    }

    // ===============================
    // Dashboard 分析
    // ===============================

    if (typeof refreshDashboardAnalytics === "function") {
        refreshDashboardAnalytics();
    }

    // ===============================
    // 行事曆
    // ===============================

    if (typeof refreshCalendar === "function") {
        refreshCalendar();
    }

    if (
    typeof loadCategoryBudgetUsage ===
    "function"
    ) {
    loadCategoryBudgetUsage();
}


    if (
    typeof loadUnbudgetedExpenseWarning ===
    "function"
) {
    loadUnbudgetedExpenseWarning();
}  


     if (
    typeof loadBudgetHealth ===
    "function"
) {
    loadBudgetHealth();
}


}


// 綁定登入與登出按鈕
document.addEventListener(
    "DOMContentLoaded",
    function () {

        const loginBtn =
            document.getElementById("loginBtn");

        const logoutBtn =
            document.getElementById("logoutBtn");

        if (loginBtn) {

            loginBtn.addEventListener(
                "click",
                async function () {

                    if (
                        !window.smartbookFirebase ||
                        typeof window.smartbookFirebase
                            .signInWithGoogle !== "function"
                    ) {
                        alert(
                            "Firebase 尚未載入完成，請稍後再試。"
                        );

                        return;
                    }

                    loginBtn.disabled = true;
                    loginBtn.textContent = "登入中...";

                    try {

                        await window.smartbookFirebase
                            .signInWithGoogle();

                    } catch (error) {

                        console.error(
                            "Google 登入錯誤：",
                            error
                        );

                        if (
                            error.code ===
                            "auth/popup-closed-by-user"
                        ) {
                            alert("Google 登入視窗已關閉。");
                        } else if (
                            error.code ===
                            "auth/popup-blocked"
                        ) {
                            alert(
                                "瀏覽器封鎖了登入視窗，請允許彈出式視窗後再試。"
                            );
                        } else if (
                            error.code ===
                            "auth/unauthorized-domain"
                        ) {
                            alert(
                                "目前網站網址尚未加入 Firebase 授權網域。"
                            );
                        } else {
                            alert(
                                "Google 登入失敗，請查看 Console 錯誤訊息。"
                            );
                        }

                    } finally {

                        loginBtn.disabled = false;
                        loginBtn.textContent = "Google 登入";

                    }

                }
            );

        }


        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                async function () {

                    if (
                        !window.smartbookFirebase ||
                        typeof window.smartbookFirebase
                            .signOutGoogle !== "function"
                    ) {
                        return;
                    }

                    const confirmed =
                        window.confirm(
                            "確定要登出 Google 帳號嗎？"
                        );

                    if (!confirmed) return;

                    logoutBtn.disabled = true;
                    logoutBtn.textContent = "登出中...";

                    try {

                        await window.smartbookFirebase
                            .signOutGoogle();

                    } catch (error) {

                        console.error(
                            "Google 登出錯誤：",
                            error
                        );

                        alert("登出失敗，請稍後再試。");

                    } finally {

                        logoutBtn.disabled = false;
                        logoutBtn.textContent = "登出";

                    }

                }
            );

        }


        // Firebase 若已載入，先取得目前登入狀態
        if (
            window.smartbookFirebase &&
            typeof window.smartbookFirebase
                .getCurrentUser === "function"
        ) {
            updateFirebaseAuthUI(
                window.smartbookFirebase
                    .getCurrentUser()
            );
        }

    }
);


// Firebase 登入狀態改變
window.addEventListener(
    "smartbook-auth-changed",
    function (event) {

        const user =
            event.detail
                ? event.detail.user
                : null;

        updateFirebaseAuthUI(user);

    }
);


// Firebase 雲端資料下載完成
window.addEventListener(
    "smartbook-cloud-updated",
    function () {

        console.log(
            "收到 Firebase 雲端更新，重新整理 SmartBook"
        );

        refreshSmartBookAfterCloudSync();

        if (
            typeof loadReceivableSummary ===
            "function"
        ) {
            loadReceivableSummary();
        }

    }
);