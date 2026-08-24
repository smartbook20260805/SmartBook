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
// 編輯交易
// ===============================
function editTransaction(index) {

    const transactions = getTransactions();
    const transaction = transactions[index];

    if (!transaction) return;

    document.getElementById("date").value = transaction.date;
    document.getElementById("type").value = transaction.type;
    document.getElementById("category").value = transaction.category || "其他";
    document.getElementById("advancePerson").value =
    transaction.advancePerson || "";

    document.getElementById("advanceStatus").value =
        transaction.advanceStatus || "未收回";

    document.getElementById("recoveredDate").value =
        transaction.recoveredDate || "";

    document.getElementById("item").value = transaction.item;
    document.getElementById("amount").value = transaction.amount;
    document.getElementById("note").value = transaction.note || "";

    editIndex = index;

    const addBtn = document.getElementById("addBtn");

    if (addBtn) {
        addBtn.textContent = "儲存修改";
        addBtn.classList.remove("btn-primary");
        addBtn.classList.add("btn-warning");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

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
        resetForm();
    } else if (editIndex > index) {
        editIndex -= 1;
    }

    loadTransactions();
    updateDashboard();

}
// ===============================
// 清空表單
// ===============================
function resetForm() {

    const dateInput = document.getElementById("date");
    const typeInput = document.getElementById("type");
    const categoryInput = document.getElementById("category");
    const advancePersonInput =
         document.getElementById("advancePerson");

    const advanceStatusInput =
         document.getElementById("advanceStatus");

    const recoveredDateInput =
         document.getElementById("recoveredDate");

    const itemInput = document.getElementById("item");
    const amountInput = document.getElementById("amount");
    const noteInput = document.getElementById("note");
    const addBtn = document.getElementById("addBtn");

    if (dateInput) dateInput.value = "";
    if (typeInput) typeInput.value = "收入";
    if (categoryInput) categoryInput.value = "薪資";
    if (advancePersonInput) advancePersonInput.value = "";

    if (advanceStatusInput) {
        advanceStatusInput.value = "未收回";
    }

    if (recoveredDateInput) {
        recoveredDateInput.value = "";
    }

    if (itemInput) itemInput.value = "";
    if (amountInput) amountInput.value = "";
    if (noteInput) noteInput.value = "";

    editIndex = -1;

    if (addBtn) {
        addBtn.textContent = "新增交易";
        addBtn.classList.remove("btn-warning");
        addBtn.classList.add("btn-primary");
    }

}

// ===============================
// 新增或儲存修改
// ===============================
const addBtn = document.getElementById("addBtn");

if (addBtn) {

    addBtn.addEventListener("click", function () {

        const date = document.getElementById("date").value;
        const type = document.getElementById("type").value;
        const category = document.getElementById("category").value;
        const advancePerson =
            document.getElementById("advancePerson").value.trim();

        const advanceStatus =
            document.getElementById("advanceStatus").value;

        const recoveredDate =
            document.getElementById("recoveredDate").value;

        const item = document.getElementById("item").value.trim();
        const amount = document.getElementById("amount").value;
        const note = document.getElementById("note").value.trim();

        if (!date || !item || !amount) {
            alert("請填寫日期、項目和金額！");
            return;
        }

        if (Number(amount) <= 0) {
            alert("金額必須大於 0！");
            return;
        }

        const transactions = getTransactions();

        const transactionData = {
             date,
             type,
             category,
             advancePerson,
             advanceStatus,
             recoveredDate,
             item,
             amount: Number(amount),
             note
        };

        if (editIndex === -1) {

            transactions.push(transactionData);

        } else {

            transactions[editIndex] = transactionData;

        }

        saveTransactions(transactions);

        loadTransactions();
        updateDashboard();
        resetForm();

    });

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

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

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


    const now =
        new Date();

    const currentYear =
        now.getFullYear();

    const currentMonth =
        now.getMonth();


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


    const now =
        new Date();


    const months = [];


    // 建立最近 6 個月
    for (
        let index = 5;
        index >= 0;
        index--
    ) {

        const date =
            new Date(
                now.getFullYear(),
                now.getMonth() - index,
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

    const now =
        new Date();

    const currentYear =
        now.getFullYear();

    const currentMonth =
        now.getMonth();


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

    const daysPassed =
        now.getDate();


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
// 支出分類統計
// ===============================
function loadCategorySummary() {

    const summaryArea = document.getElementById("categorySummary");

    if (!summaryArea) return;

    const transactions = getTransactions();

    const categoryTotals = {};

    transactions.forEach(transaction => {

        if (transaction.type !== "支出") return;

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

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

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
// ===============================
// 收入 / 支出 / 代墊 長條圖
// ===============================
function loadSummaryChart() {

    const canvas = document.getElementById("summaryChart");

    if (!canvas) return;

    const transactions = getTransactions();

    const now = new Date();

    let income = 0;
    let expense = 0;
    let advance = 0;

    transactions.forEach(t => {

        if (!t.date) return;

        const d = new Date(t.date + "T00:00:00");

        if (
            d.getFullYear() !== now.getFullYear() ||
            d.getMonth() !== now.getMonth()
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
    loadCategorySummary();
    loadExpenseChart();
    loadSummaryChart();

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

    }
);