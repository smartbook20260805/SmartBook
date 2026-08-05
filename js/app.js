// ===============================
// SmartBook App
// ===============================

const STORAGE_KEY = "transactions";
let editIndex = -1;

// 讀取資料
function getTransactions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

// 儲存資料
function saveTransactions(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Dashboard
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
}
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
// 網頁載入完成
// ===============================
document.addEventListener("DOMContentLoaded", function () {

    loadTransactions();
    updateDashboard();
    loadRecentTransactions();
    loadAdvanceSummary();
    loadMonthlyReport();
    loadCategorySummary();
    loadExpenseChart();
    loadSummaryChart();

    const exportExcelButton =
        document.getElementById("exportExcel");

    if (exportExcelButton) {
        exportExcelButton.addEventListener(
            "click",
            exportTransactionsToExcel
        );
    }

    const searchBtn =
    document.getElementById("searchBtn");

const clearSearchBtn =
    document.getElementById("clearSearchBtn");

if (searchBtn) {
    searchBtn.addEventListener(
        "click",
        filterTransactions
    );
}
const searchKeyword =
    document.getElementById("searchKeyword");

if (searchKeyword) {

    searchKeyword.addEventListener("keypress", function (e) {

        if (e.key === "Enter") {

            filterTransactions();

        }

    });

} 

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

});
const filterIds = [
    "filterType",
    "filterCategory",
    "filterStartDate",
    "filterEndDate"
];

filterIds.forEach(id => {

    const element = document.getElementById(id);

    if (element) {

        element.addEventListener("change", filterTransactions);

    }

});
// ===============================
// 註冊 Service Worker
// ===============================
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