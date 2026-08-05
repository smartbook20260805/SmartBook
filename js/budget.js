// =====================================
// SmartBook Budget Module
// =====================================

console.log("Budget Module Loaded");

const BUDGET_STORAGE_KEY = "monthlyBudget";
const TRANSACTION_STORAGE_KEY = "transactions";

// 讀取每月預算
function getMonthlyBudget() {
    return Number(
        localStorage.getItem(BUDGET_STORAGE_KEY)
    ) || 0;
}

// 顯示設定頁目前預算
function loadBudgetSetting() {
    const budgetInput =
        document.getElementById("monthlyBudget");

    if (!budgetInput) return;

    const currentBudget = getMonthlyBudget();

    if (currentBudget > 0) {
        budgetInput.value = currentBudget;
    }
}

// 儲存每月預算
function saveMonthlyBudget() {
    const budgetInput =
        document.getElementById("monthlyBudget");

    const savedMessage =
        document.getElementById("budgetSavedMessage");

    if (!budgetInput) return;

    const budget = Number(budgetInput.value);

    if (!Number.isFinite(budget) || budget <= 0) {
        alert("請輸入大於 0 的預算金額！");
        return;
    }

    localStorage.setItem(
        BUDGET_STORAGE_KEY,
        String(budget)
    );

    if (savedMessage) {
        savedMessage.style.display = "block";

        setTimeout(function () {
            savedMessage.style.display = "none";
        }, 2500);
    }

    updateBudgetDashboard();
}

// 計算本月支出
function getCurrentMonthExpense() {
    const transactions =
        JSON.parse(
            localStorage.getItem(TRANSACTION_STORAGE_KEY)
        ) || [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let monthlyExpense = 0;

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

        monthlyExpense +=
            Number(transaction.amount) || 0;
    });

    return monthlyExpense;
}

// 更新首頁預算卡片
function updateBudgetDashboard() {
    const budgetStatus =
        document.getElementById("budgetStatus");

    const budgetProgress =
        document.getElementById("budgetProgress");

    if (!budgetStatus) return;

    const budget = getMonthlyBudget();

    if (budget <= 0) {
        budgetStatus.innerHTML = "尚未設定";

        if (budgetProgress) {
            budgetProgress.style.width = "0%";
            budgetProgress.textContent = "";
        }

        return;
    }

    const monthlyExpense = getCurrentMonthExpense();
    const remaining = budget - monthlyExpense;
    const percentage = (monthlyExpense / budget) * 100;
    const displayPercentage = Math.min(percentage, 100);

    let remainingText = `
        <strong>剩餘：</strong>
        NT$ ${remaining.toLocaleString()}
    `;

    if (remaining < 0) {
        remainingText = `
            <strong class="text-danger">
                已超支：
            </strong>
            <span class="text-danger">
                NT$ ${Math.abs(remaining).toLocaleString()}
            </span>
        `;
    }

    budgetStatus.innerHTML = `
        <strong>預算：</strong>
        NT$ ${budget.toLocaleString()}<br>

        <strong>已使用：</strong>
        NT$ ${monthlyExpense.toLocaleString()}<br>

        ${remainingText}<br>

        <strong>使用率：</strong>
        ${percentage.toFixed(1)}%
    `;

    if (!budgetProgress) return;

    budgetProgress.style.width =
        displayPercentage + "%";

    budgetProgress.textContent =
        percentage >= 8
            ? percentage.toFixed(1) + "%"
            : "";

    budgetProgress.classList.remove(
        "bg-success",
        "bg-warning",
        "bg-danger"
    );

    if (percentage < 80) {
        budgetProgress.classList.add("bg-success");
    } else if (percentage < 100) {
        budgetProgress.classList.add("bg-warning");
    } else {
        budgetProgress.classList.add("bg-danger");
    }
}

// 頁面載入
document.addEventListener(
    "DOMContentLoaded",
    function () {
        loadBudgetSetting();
        updateBudgetDashboard();

        const saveBudgetBtn =
            document.getElementById("saveBudgetBtn");

        if (saveBudgetBtn) {
            saveBudgetBtn.addEventListener(
                "click",
                saveMonthlyBudget
            );
        }
    }
);

// 從其他頁面返回首頁時更新
window.addEventListener(
    "pageshow",
    updateBudgetDashboard
);