// =====================================
// SmartBook Budget Module
// =====================================

console.log("Budget Module Loaded");


// =====================================
// 取得每月預算
// 統一走 storage.js
// =====================================

function getMonthlyBudget() {

    if (typeof getBudget === "function") {
        return getBudget();
    }

    console.warn(
        "找不到 getBudget()，回傳 0"
    );

    return 0;

}


// =====================================
// 顯示設定頁目前預算
// =====================================

function loadBudgetSetting() {

    const budgetInput =
        document.getElementById(
            "monthlyBudget"
        );

    if (!budgetInput) return;

    const currentBudget =
        getMonthlyBudget();

    if (currentBudget > 0) {

        budgetInput.value =
            currentBudget;

    }

}


// =====================================
// 儲存預算
// =====================================

function saveMonthlyBudget() {

    const budgetInput =
        document.getElementById(
            "monthlyBudget"
        );

    const savedMessage =
        document.getElementById(
            "budgetSavedMessage"
        );

    if (!budgetInput) return;


    const budget =
        Number(
            budgetInput.value
        );


    if (
        !Number.isFinite(budget) ||
        budget <= 0
    ) {

        alert(
            "請輸入大於 0 的預算金額！"
        );

        return;

    }


    // =====================================
    // 統一走 storage.js
    // storage.js 再負責 Firebase
    // =====================================

    if (
        typeof saveBudget ===
        "function"
    ) {

        saveBudget(budget);

    } else {

        console.error(
            "找不到 saveBudget()，預算無法儲存"
        );

        return;

    }


    console.log(
        "Budget：預算已儲存",
        budget
    );


    // 顯示成功訊息
    if (savedMessage) {

        savedMessage.style.display =
            "block";

        setTimeout(
            function () {

                savedMessage.style.display =
                    "none";

            },
            2500
        );

    }


    // 更新首頁預算
    updateBudgetDashboard();

}


// =====================================
// 計算本月支出
// =====================================

function getCurrentMonthExpense() {

    let transactions = [];


    if (
        typeof getTransactions ===
        "function"
    ) {

        transactions =
            getTransactions();

    } else {

        console.warn(
            "找不到 getTransactions()"
        );

        return 0;

    }


    const now =
        new Date();

    const currentYear =
        now.getFullYear();

    const currentMonth =
        now.getMonth();

    let monthlyExpense = 0;


    transactions.forEach(
        function (transaction) {

            if (
                transaction.type !==
                    "支出" ||
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
                transactionDate
                    .getFullYear() ===
                    currentYear &&

                transactionDate
                    .getMonth() ===
                    currentMonth
            ) {

                monthlyExpense +=
                    Number(
                        transaction.amount
                    ) || 0;

            }

        }
    );


    return monthlyExpense;

}


// =====================================
// 更新首頁預算
// =====================================

function updateBudgetDashboard() {

    const budgetStatus =
        document.getElementById(
            "budgetStatus"
        );

    const budgetProgress =
        document.getElementById(
            "budgetProgress"
        );

    const budgetAlert =
        document.getElementById(
            "budgetAlert"
        );


    if (!budgetStatus) return;


    const budget =
        getMonthlyBudget();


    // 尚未設定預算
    if (budget <= 0) {

        budgetStatus.innerHTML =
            "尚未設定";

        if (budgetProgress) {

            budgetProgress.style.width =
                "0%";

            budgetProgress.textContent =
                "";

        }

        if (budgetAlert) {

            budgetAlert.innerHTML =
                "";

        }

        return;

    }


    const monthlyExpense =
        getCurrentMonthExpense();

    const remaining =
        budget -
        monthlyExpense;

    const percentage =
        (monthlyExpense / budget) *
        100;

    const displayPercentage =
        Math.min(
            percentage,
            100
        );


    // =====================================
    // 預算文字
    // =====================================

    budgetStatus.innerHTML = `
        <strong>預算：</strong>
        NT$ ${budget.toLocaleString()}<br>

        <strong>已使用：</strong>
        NT$ ${monthlyExpense.toLocaleString()}<br>

        <strong>剩餘：</strong>
        NT$ ${remaining.toLocaleString()}<br>

        <strong>使用率：</strong>
        ${percentage.toFixed(1)}%
    `;


    if (!budgetProgress) {
        return;
    }


    // =====================================
    // 進度條
    // =====================================

    budgetProgress.style.width =
        displayPercentage +
        "%";


    budgetProgress.textContent =
        percentage >= 8
            ? percentage
                .toFixed(1) +
              "%"
            : "";


    budgetProgress.classList.remove(
        "bg-success",
        "bg-warning",
        "bg-danger"
    );


    // =====================================
    // 預算提醒
    // =====================================

    if (percentage < 80) {

        budgetProgress
            .classList
            .add(
                "bg-success"
            );


        if (budgetAlert) {

            budgetAlert.className =
                "mt-3 small text-success";

            budgetAlert.innerHTML =
                "✅ 本月預算使用正常";

        }

    }

    else if (percentage < 100) {

        budgetProgress
            .classList
            .add(
                "bg-warning"
            );


        if (budgetAlert) {

            budgetAlert.className =
                "mt-3 small text-warning";

            budgetAlert.innerHTML =
                "⚠️ 已使用 " +
                percentage.toFixed(1) +
                "%，請注意支出";

        }

    }

    else {

        budgetProgress
            .classList
            .add(
                "bg-danger"
            );


        if (budgetAlert) {

            budgetAlert.className =
                "mt-3 small text-danger";

            budgetAlert.innerHTML =
                "🚨 已超出預算 NT$ " +
                Math.abs(
                    remaining
                ).toLocaleString();

        }

    }

}


// =====================================
// 頁面載入
// =====================================

document.addEventListener(

    "DOMContentLoaded",

    function () {

        loadBudgetSetting();

        updateBudgetDashboard();


        const saveBudgetBtn =
            document.getElementById(
                "saveBudgetBtn"
            );


        if (saveBudgetBtn) {

            saveBudgetBtn
                .addEventListener(

                    "click",

                    saveMonthlyBudget

                );

        }

    }

);


// =====================================
// 返回頁面時重新整理
// =====================================

window.addEventListener(

    "pageshow",

    function () {

        loadBudgetSetting();

        updateBudgetDashboard();

    }

);


// =====================================
// Firebase 雲端更新後重新整理預算
// =====================================

window.addEventListener(

    "smartbook-cloud-updated",

    function () {

        loadBudgetSetting();

        updateBudgetDashboard();

    }

);