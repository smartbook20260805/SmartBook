// =====================================
// SmartBook Calendar Module
// =====================================

console.log("Calendar Module Loaded");

const CALENDAR_STORAGE_KEY = "transactions";

let calendarCurrentDate = new Date();

// 讀取交易資料
function getCalendarTransactions() {
    try {
        const savedData =
            localStorage.getItem(CALENDAR_STORAGE_KEY);

        return savedData
            ? JSON.parse(savedData)
            : [];
    } catch (error) {
        console.error("讀取月曆交易資料失敗：", error);
        return [];
    }
}

// 轉成 YYYY-MM-DD
function formatCalendarDateKey(
    year,
    month,
    day
) {
    const monthText =
        String(month + 1).padStart(2, "0");

    const dayText =
        String(day).padStart(2, "0");

    return `${year}-${monthText}-${dayText}`;
}

// 計算每天收入與支出
function getCalendarDailyTotals() {
    const transactions =
        getCalendarTransactions();

    const dailyTotals = {};

    transactions.forEach(function (transaction) {
        if (!transaction.date) return;

        if (!dailyTotals[transaction.date]) {
            dailyTotals[transaction.date] = {
                income: 0,
                expense: 0,
                advance: 0
            };
        }

        const amount =
            Number(transaction.amount) || 0;

        if (transaction.type === "收入") {
            dailyTotals[transaction.date].income += amount;
        }

        if (transaction.type === "支出") {
            dailyTotals[transaction.date].expense += amount;
        }

        if (
            transaction.type === "代墊" &&
            transaction.advanceStatus !== "已收回"
        ) {
            dailyTotals[transaction.date].advance += amount;
        }
    });

    return dailyTotals;
}

// 顯示月曆
function renderCalendar() {
    const title =
        document.getElementById("calendarTitle");

    const grid =
        document.getElementById("calendarGrid");

    if (!title || !grid) return;

    const year =
        calendarCurrentDate.getFullYear();

    const month =
        calendarCurrentDate.getMonth();

    title.textContent =
        `${year} 年 ${month + 1} 月`;

    grid.innerHTML = "";

    const firstDay =
        new Date(year, month, 1).getDay();

    const daysInMonth =
        new Date(year, month + 1, 0).getDate();

    const today = new Date();

    const dailyTotals =
        getCalendarDailyTotals();

    // 月初空白格
    for (let i = 0; i < firstDay; i += 1) {
        const emptyCell =
            document.createElement("div");

        emptyCell.className =
            "calendar-day empty";

        grid.appendChild(emptyCell);
    }

    // 日期格
    for (
        let day = 1;
        day <= daysInMonth;
        day += 1
    ) {
        const cell =
            document.createElement("div");

        cell.className = "calendar-day";

        const dateKey =
            formatCalendarDateKey(
                year,
                month,
                day
            );

        cell.dataset.date = dateKey;

        const isToday =
            year === today.getFullYear() &&
            month === today.getMonth() &&
            day === today.getDate();

        if (isToday) {
            cell.classList.add("today");
        }

        const totals =
            dailyTotals[dateKey] || {
                income: 0,
                expense: 0,
                advance: 0
            };

        let summaryHtml = "";

        if (totals.income > 0) {
            summaryHtml += `
                <div class="calendar-income">
                    ＋NT$ ${totals.income.toLocaleString()}
                </div>
            `;
        }

        if (totals.expense > 0) {
            summaryHtml += `
                <div class="calendar-expense">
                    －NT$ ${totals.expense.toLocaleString()}
                </div>
            `;
        }

        if (totals.advance > 0) {
            summaryHtml += `
                <div class="calendar-advance">
                    代墊 NT$ ${totals.advance.toLocaleString()}
                </div>
            `;
        }

        cell.innerHTML = `
            <div class="calendar-date-number">
                ${day}
            </div>

            <div class="calendar-day-summary">
                ${summaryHtml}
            </div>
        `;

        grid.appendChild(cell);
    }
}

// 更新月曆
function refreshCalendar() {
    renderCalendar();
}

// 頁面載入
document.addEventListener(
    "DOMContentLoaded",
    function () {
        const prevButton =
            document.getElementById("prevMonthBtn");

        const nextButton =
            document.getElementById("nextMonthBtn");

        if (prevButton) {
            prevButton.addEventListener(
                "click",
                function () {
                    calendarCurrentDate =
                        new Date(
                            calendarCurrentDate.getFullYear(),
                            calendarCurrentDate.getMonth() - 1,
                            1
                        );

                    renderCalendar();
                }
            );
        }

        if (nextButton) {
            nextButton.addEventListener(
                "click",
                function () {
                    calendarCurrentDate =
                        new Date(
                            calendarCurrentDate.getFullYear(),
                            calendarCurrentDate.getMonth() + 1,
                            1
                        );

                    renderCalendar();
                }
            );
        }

        renderCalendar();
    }
);

// 返回首頁時更新
window.addEventListener(
    "pageshow",
    refreshCalendar
);