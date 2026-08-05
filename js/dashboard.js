// =====================================
// SmartBook Dashboard Module
// =====================================

console.log("Dashboard Module Loaded");

const DASHBOARD_STORAGE_KEY = "transactions";

// 取得交易資料
function getDashboardTransactions() {
    try {
        const savedData =
            localStorage.getItem(DASHBOARD_STORAGE_KEY);

        return savedData
            ? JSON.parse(savedData)
            : [];

    } catch (error) {
        console.error("讀取 Dashboard 資料失敗：", error);
        return [];
    }
}

// 取得本月支出分類 Top 5
function getMonthlyExpenseTopFive() {
    const transactions =
        getDashboardTransactions();

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const categoryTotals = {};

    transactions.forEach(function (transaction) {
        if (
            transaction.type !== "支出" ||
            !transaction.date
        ) {
            return;
        }

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

    return Object.entries(categoryTotals)
        .sort(function (a, b) {
            return b[1] - a[1];
        })
        .slice(0, 5);
}

// 顯示本月支出 Top 5
function loadExpenseTopFive() {
    const area =
        document.getElementById("expenseTopFive");

    if (!area) return;

    const topFive =
        getMonthlyExpenseTopFive();

    if (topFive.length === 0) {
        area.innerHTML = `
            <p class="empty-message">
                本月尚無支出資料
            </p>
        `;
        return;
    }

    const medals = [
        "🥇",
        "🥈",
        "🥉",
        "④",
        "⑤"
    ];

    area.innerHTML = topFive
        .map(function ([category, total], index) {
            return `
                <div class="expense-rank-item">

                    <div class="expense-rank-left">

                        <span class="expense-rank-medal">
                            ${medals[index]}
                        </span>

                        <span class="expense-rank-category">
                            ${category}
                        </span>

                    </div>

                    <strong class="expense-rank-amount">
                        NT$ ${total.toLocaleString()}
                    </strong>

                </div>
            `;
        })
        .join("");
}

// 頁面載入
document.addEventListener(
    "DOMContentLoaded",
    function () {
        loadExpenseTopFive();
    }
);

// 從其他頁面返回首頁時更新
window.addEventListener(
    "pageshow",
    loadExpenseTopFive
);