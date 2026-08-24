// =====================================
// SmartBook V7.2
// 年度財務報表
// =====================================

console.log(
    "SmartBook V7.2 Annual Report Loaded"
);


// =====================================
// 目前選擇的年度
// =====================================

const today =
    new Date();

const currentYear =
    today.getFullYear();

let selectedAnnualYear =
    currentYear;


// =====================================
// 建立年份選單
// =====================================

function initializeYearSelector() {

    const yearSelect =
        document.getElementById(
            "reportYear"
        );

    if (!yearSelect) {
        return;
    }


    yearSelect.innerHTML = "";


    // 顯示目前年度往前 10 年
    for (
        let year = currentYear;
        year >= currentYear - 10;
        year--
    ) {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            year;

        option.textContent =
            `${year} 年`;

        yearSelect.appendChild(
            option
        );

    }


    yearSelect.value =
        selectedAnnualYear;

}


// =====================================
// 更新年度畫面
// =====================================

function updateAnnualYearDisplay() {

    const yearSelect =
        document.getElementById(
            "reportYear"
        );

    const title =
        document.getElementById(
            "annualSummaryTitle"
        );

    const nextYearBtn =
        document.getElementById(
            "nextYearBtn"
        );


    if (yearSelect) {

        yearSelect.value =
            selectedAnnualYear;

    }


    if (title) {

        title.textContent =
            `${selectedAnnualYear} 年財務摘要`;

    }


    // 目前年度不能再往未來
    if (nextYearBtn) {

        nextYearBtn.disabled =
            selectedAnnualYear >=
            currentYear;

    }

}

// =====================================
// 載入年度財務摘要
// =====================================

function loadAnnualSummary() {

    const incomeElement =
        document.getElementById(
            "annualIncome"
        );

    const expenseElement =
        document.getElementById(
            "annualExpense"
        );

    const advanceElement =
        document.getElementById(
            "annualAdvance"
        );

    const balanceElement =
        document.getElementById(
            "annualBalance"
        );


    // 不是年度報表頁就不執行
    if (
        !incomeElement ||
        !expenseElement ||
        !advanceElement ||
        !balanceElement
    ) {
        return;
    }


    // 讀取 SmartBook 現有交易資料
    const transactions =
        typeof getTransactions === "function"
            ? getTransactions()
            : [];


    let annualIncome = 0;
    let annualExpense = 0;
    let annualAdvance = 0;


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


            // 只計算目前選擇的年度
            if (
                transactionDate.getFullYear() !==
                selectedAnnualYear
            ) {
                return;
            }


            const amount =
                Number(
                    transaction.amount
                ) || 0;


            // 收入
            if (
                transaction.type === "收入"
            ) {

                annualIncome +=
                    amount;

            }


            // 支出
            if (
                transaction.type === "支出"
            ) {

                annualExpense +=
                    amount;

            }


            // 尚未收回的代墊
            if (
                transaction.type === "代墊" &&
                transaction.advanceStatus !== "已收回"
            ) {

                annualAdvance +=
                    amount;

            }

        }
    );


    // 年度餘額
    const annualBalance =
        annualIncome -
        annualExpense -
        annualAdvance;


    // ===============================
    // 顯示結果
    // ===============================

    incomeElement.textContent =
        "NT$ " +
        annualIncome.toLocaleString();


    expenseElement.textContent =
        "NT$ " +
        annualExpense.toLocaleString();


    advanceElement.textContent =
        "NT$ " +
        annualAdvance.toLocaleString();


    balanceElement.textContent =
        "NT$ " +
        annualBalance.toLocaleString();

}

// =====================================
// V7.2 年度 1～12 月財務趨勢
// =====================================

function loadAnnualTrendChart() {

    const canvas =
        document.getElementById(
            "annualTrendChart"
        );

    if (!canvas) {
        return;
    }

    if (typeof Chart === "undefined") {

        console.error(
            "Chart.js 尚未成功載入"
        );

        return;
    }


    const transactions =
        typeof getTransactions === "function"
            ? getTransactions()
            : [];


    // 建立 1～12 月資料
    const monthlyData =
        Array.from(
            { length: 12 },
            function (_, index) {

                return {

                    month:
                        index,

                    label:
                        `${index + 1}月`,

                    income: 0,

                    expense: 0,

                    advance: 0,

                    balance: 0

                };

            }
        );


    // =====================================
    // 計算每月資料
    // =====================================

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


            // 只計算目前選擇年度
            if (
                transactionDate.getFullYear() !==
                selectedAnnualYear
            ) {
                return;
            }


            const month =
                transactionDate.getMonth();


            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                transaction.type === "收入"
            ) {

                monthlyData[month].income +=
                    amount;

            }


            if (
                transaction.type === "支出"
            ) {

                monthlyData[month].expense +=
                    amount;

            }


            if (
                transaction.type === "代墊" &&
                transaction.advanceStatus !== "已收回"
            ) {

                monthlyData[month].advance +=
                    amount;

            }

        }
    );


    // =====================================
    // 計算每月餘額
    // =====================================

    monthlyData.forEach(
        function (monthData) {

            monthData.balance =
                monthData.income -
                monthData.expense -
                monthData.advance;

        }
    );


    // =====================================
    // 如果舊圖表存在，先刪除
    // =====================================

    const existingChart =
        Chart.getChart(
            canvas
        );


    if (existingChart) {

        existingChart.destroy();

    }


    // =====================================
    // 建立年度趨勢圖
    // =====================================

    new Chart(
        canvas,
        {

            type: "line",

            data: {

                labels:
                    monthlyData.map(
                        data => data.label
                    ),

                datasets: [

                    {
                        label: "收入",

                        data:
                            monthlyData.map(
                                data => data.income
                            ),

                        tension: 0.3
                    },

                    {
                        label: "支出",

                        data:
                            monthlyData.map(
                                data => data.expense
                            ),

                        tension: 0.3
                    },

                    {
                        label: "餘額",

                        data:
                            monthlyData.map(
                                data => data.balance
                            ),

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

                    title: {

                        display: true,

                        text:
                            `${selectedAnnualYear} 年 1～12 月財務趨勢`

                    }

                },


                scales: {

                    y: {

                        beginAtZero: true

                    }

                }

            }

        }
    );

}

// =====================================
// V7.2 每月財務明細表
// =====================================

function loadAnnualMonthlyTable() {

    const tableArea =
        document.getElementById(
            "annualMonthlyTable"
        );

    if (!tableArea) {
        return;
    }


    const transactions =
        typeof getTransactions === "function"
            ? getTransactions()
            : [];


    const monthlyData =
        Array.from(
            { length: 12 },
            function (_, index) {

                return {
                    month: index + 1,
                    income: 0,
                    expense: 0,
                    advance: 0,
                    balance: 0
                };

            }
        );


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


            if (
                transactionDate.getFullYear() !==
                selectedAnnualYear
            ) {
                return;
            }


            const monthIndex =
                transactionDate.getMonth();

            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (transaction.type === "收入") {

                monthlyData[monthIndex].income +=
                    amount;

            }


            if (transaction.type === "支出") {

                monthlyData[monthIndex].expense +=
                    amount;

            }


            if (
                transaction.type === "代墊" &&
                transaction.advanceStatus !== "已收回"
            ) {

                monthlyData[monthIndex].advance +=
                    amount;

            }

        }
    );


    monthlyData.forEach(
        function (data) {

            data.balance =
                data.income -
                data.expense -
                data.advance;

        }
    );


    tableArea.innerHTML = `
        <div class="table-responsive">

            <table
                class="
                    table
                    table-bordered
                    table-hover
                    align-middle
                    mb-0
                "
            >

                <thead>
                    <tr>
                        <th>月份</th>
                        <th>收入</th>
                        <th>支出</th>
                        <th>代墊</th>
                        <th>餘額</th>
                    </tr>
                </thead>

                <tbody>

                    ${monthlyData
                        .map(
                            function (data) {

                                return `
                                    <tr>

                                        <td>
                                            ${data.month} 月
                                        </td>

                                        <td>
                                            NT$ ${data.income.toLocaleString()}
                                        </td>

                                        <td>
                                            NT$ ${data.expense.toLocaleString()}
                                        </td>

                                        <td>
                                            NT$ ${data.advance.toLocaleString()}
                                        </td>

                                        <td>
                                            NT$ ${data.balance.toLocaleString()}
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

// =====================================
// V7.2 年度財務建議
// =====================================

function loadAnnualFinancialAdvice() {

    const adviceArea =
        document.getElementById(
            "annualFinancialAdvice"
        );

    if (!adviceArea) {
        return;
    }


    const transactions =
        typeof getTransactions === "function"
            ? getTransactions()
            : [];


    let annualIncome = 0;
    let annualExpense = 0;

    const monthlyExpense =
        Array(12).fill(0);


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


            if (
                transactionDate.getFullYear() !==
                selectedAnnualYear
            ) {
                return;
            }


            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                transaction.type === "收入"
            ) {

                annualIncome +=
                    amount;

            }


            if (
                transaction.type === "支出"
            ) {

                annualExpense +=
                    amount;

                monthlyExpense[
                    transactionDate.getMonth()
                ] += amount;

            }

        }
    );


    // 沒有資料
    if (
        annualIncome === 0 &&
        annualExpense === 0
    ) {

        adviceArea.innerHTML = `
            <p class="text-muted mb-0">
                ${selectedAnnualYear} 年目前沒有足夠的財務資料可供分析。
            </p>
        `;

        return;

    }


    const annualSaving =
        annualIncome -
        annualExpense;


    const savingRate =
        annualIncome > 0
            ? (
                annualSaving /
                annualIncome
            ) * 100
            : 0;


    // 找最高支出月份
    const highestExpense =
        Math.max(
            ...monthlyExpense
        );


    const highestExpenseMonth =
        highestExpense > 0
            ? monthlyExpense.indexOf(
                highestExpense
            ) + 1
            : null;


    const advice = [];


    // =====================================
    // 收支狀況
    // =====================================

    if (
        annualExpense >
        annualIncome
    ) {

        advice.push(
            "⚠️ 年度支出已高於年度收入，建議優先檢查固定支出與較大的非必要支出。"
        );

    } else {

        advice.push(
            "✅ 目前年度收入仍高於支出，整體收支維持正向。"
        );

    }


    // =====================================
    // 儲蓄率分析
    // =====================================

    if (annualIncome > 0) {

        if (savingRate >= 30) {

            advice.push(
                `🏦 年度儲蓄率約 ${savingRate.toFixed(1)}%，目前儲蓄表現良好。`
            );

        } else if (savingRate >= 20) {

            advice.push(
                `👍 年度儲蓄率約 ${savingRate.toFixed(1)}%，目前維持在不錯的水準。`
            );

        } else if (savingRate > 0) {

            advice.push(
                `💡 年度儲蓄率約 ${savingRate.toFixed(1)}%，可以考慮逐步降低非必要支出，提高可留下的資金。`
            );

        } else {

            advice.push(
                "🚨 目前年度沒有形成正儲蓄，建議重新檢查支出結構。"
            );

        }

    }


    // =====================================
    // 最高支出月份
    // =====================================

    if (
        highestExpenseMonth !== null
    ) {

        advice.push(
            `📊 ${highestExpenseMonth} 月是目前支出最高的月份，支出為 NT$ ${highestExpense.toLocaleString()}，可以進一步查看該月份的支出分類。`
        );

    }


    // =====================================
    // 顯示建議
    // =====================================

    adviceArea.innerHTML =
        advice
            .map(
                function (text) {

                    return `
                        <p class="mb-2">
                            ${text}
                        </p>
                    `;

                }
            )
            .join("");

}


// =====================================
// 上一年
// =====================================

function goToPreviousYear() {

    selectedAnnualYear--;

    updateAnnualYearDisplay();
    loadAnnualSummary();
    loadAnnualTrendChart();
    loadAnnualMonthlyTable();
    loadAnnualAnalysis();
    loadAnnualFinancialAdvice();

}


// =====================================
// 下一年
// =====================================

function goToNextYear() {

    if (
        selectedAnnualYear >=
        currentYear
    ) {
        return;
    }


    selectedAnnualYear++;

    updateAnnualYearDisplay();
    loadAnnualSummary();
    loadAnnualTrendChart();
    loadAnnualMonthlyTable();
    loadAnnualAnalysis();
    loadAnnualFinancialAdvice();


}


// =====================================
// 頁面初始化
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const yearSelect =
            document.getElementById(
                "reportYear"
            );

        const previousYearBtn =
            document.getElementById(
                "previousYearBtn"
            );

        const nextYearBtn =
            document.getElementById(
                "nextYearBtn"
            );


        // 建立年份
        initializeYearSelector();

        updateAnnualYearDisplay();
        loadAnnualSummary();
        loadAnnualTrendChart();
        loadAnnualMonthlyTable();
        loadAnnualAnalysis();
        loadAnnualFinancialAdvice();


        // ===============================
        // 直接選擇年份
        // ===============================

        if (yearSelect) {

            yearSelect.addEventListener(
                "change",
                function () {

                    selectedAnnualYear =
                        Number(
                            this.value
                        );

                    updateAnnualYearDisplay();
                    loadAnnualSummary();
                    loadAnnualTrendChart();
                    loadAnnualMonthlyTable();
                    loadAnnualAnalysis();
                    loadAnnualFinancialAdvice();

                }
            );

        }

        // =====================================
// V7.2 年度財務分析
// =====================================

function loadAnnualAnalysis() {

    const highestExpenseMonthElement =
        document.getElementById(
            "highestExpenseMonth"
        );

    const highestExpenseMonthAmountElement =
        document.getElementById(
            "highestExpenseMonthAmount"
        );

    const highestIncomeMonthElement =
        document.getElementById(
            "highestIncomeMonth"
        );

    const highestIncomeMonthAmountElement =
        document.getElementById(
            "highestIncomeMonthAmount"
        );

    const averageMonthlyExpenseElement =
        document.getElementById(
            "averageMonthlyExpense"
        );

    const annualSavingRateElement =
        document.getElementById(
            "annualSavingRate"
        );

    const annualSavingDetailElement =
        document.getElementById(
            "annualSavingDetail"
        );


    if (
        !highestExpenseMonthElement ||
        !highestExpenseMonthAmountElement ||
        !highestIncomeMonthElement ||
        !highestIncomeMonthAmountElement ||
        !averageMonthlyExpenseElement ||
        !annualSavingRateElement ||
        !annualSavingDetailElement
    ) {
        return;
    }


    const transactions =
        typeof getTransactions === "function"
            ? getTransactions()
            : [];


    const monthlyData =
        Array.from(
            { length: 12 },
            function (_, index) {

                return {
                    month: index + 1,
                    income: 0,
                    expense: 0
                };

            }
        );


    let annualIncome = 0;
    let annualExpense = 0;


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


            if (
                transactionDate.getFullYear() !==
                selectedAnnualYear
            ) {
                return;
            }


            const monthIndex =
                transactionDate.getMonth();

            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                transaction.type === "收入"
            ) {

                monthlyData[monthIndex].income +=
                    amount;

                annualIncome +=
                    amount;

            }


            if (
                transaction.type === "支出"
            ) {

                monthlyData[monthIndex].expense +=
                    amount;

                annualExpense +=
                    amount;

            }

        }
    );


    // ===============================
    // 最高支出月份
    // ===============================

    const highestExpenseData =
        monthlyData.reduce(
            function (highest, current) {

                return (
                    current.expense >
                    highest.expense
                )
                    ? current
                    : highest;

            },
            monthlyData[0]
        );


    if (
        highestExpenseData &&
        highestExpenseData.expense > 0
    ) {

        highestExpenseMonthElement.textContent =
            `${highestExpenseData.month} 月`;

        highestExpenseMonthAmountElement.textContent =
            "NT$ " +
            highestExpenseData.expense
                .toLocaleString();

    } else {

        highestExpenseMonthElement.textContent =
            "尚無資料";

        highestExpenseMonthAmountElement.textContent =
            "NT$ 0";

    }


    // ===============================
    // 最高收入月份
    // ===============================

    const highestIncomeData =
        monthlyData.reduce(
            function (highest, current) {

                return (
                    current.income >
                    highest.income
                )
                    ? current
                    : highest;

            },
            monthlyData[0]
        );


    if (
        highestIncomeData &&
        highestIncomeData.income > 0
    ) {

        highestIncomeMonthElement.textContent =
            `${highestIncomeData.month} 月`;

        highestIncomeMonthAmountElement.textContent =
            "NT$ " +
            highestIncomeData.income
                .toLocaleString();

    } else {

        highestIncomeMonthElement.textContent =
            "尚無資料";

        highestIncomeMonthAmountElement.textContent =
            "NT$ 0";

    }


    // ===============================
    // 平均每月支出
    // ===============================

    let monthsForAverage;

    if (
        selectedAnnualYear ===
        currentYear
    ) {

        // 今年只平均到目前月份
        monthsForAverage =
            new Date().getMonth() + 1;

    } else {

        // 歷史年度使用完整 12 個月
        monthsForAverage = 12;

    }


    const averageMonthlyExpense =
        monthsForAverage > 0
            ? annualExpense /
              monthsForAverage
            : 0;


    averageMonthlyExpenseElement.textContent =
        "NT$ " +
        Math.round(
            averageMonthlyExpense
        ).toLocaleString();


    // ===============================
    // 年度儲蓄率
    // ===============================

    if (annualIncome <= 0) {

        annualSavingRateElement.textContent =
            "無法計算";

        annualSavingDetailElement.textContent =
            "年度收入為 NT$ 0";

        return;

    }


    const annualSaving =
        annualIncome -
        annualExpense;


    const savingRate =
        (
            annualSaving /
            annualIncome
        ) * 100;


    annualSavingRateElement.textContent =
        savingRate.toFixed(1) +
        "%";


    annualSavingDetailElement.textContent =
        `收入 NT$ ${annualIncome.toLocaleString()} / 支出 NT$ ${annualExpense.toLocaleString()}`;

}


        // ===============================
        // 上一年
        // ===============================

        if (previousYearBtn) {

            previousYearBtn.addEventListener(
                "click",
                goToPreviousYear
            );

        }


        // ===============================
        // 下一年
        // ===============================

        if (nextYearBtn) {

            nextYearBtn.addEventListener(
                "click",
                goToNextYear
            );

        }

    }
);