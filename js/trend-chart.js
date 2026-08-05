// =====================================
// SmartBook 7-Day Trend Chart Module
// =====================================

console.log("Trend Chart Module Loaded");

const TREND_STORAGE_KEY = "transactions";

let sevenDayTrendChartInstance = null;

// 讀取交易資料
function getTrendTransactions() {
    try {
        const savedData =
            localStorage.getItem(TREND_STORAGE_KEY);

        return savedData
            ? JSON.parse(savedData)
            : [];
    } catch (error) {
        console.error("讀取趨勢圖資料失敗：", error);
        return [];
    }
}

// 取得本機日期 YYYY-MM-DD
function formatTrendDate(date) {
    const year = date.getFullYear();
    const month =
        String(date.getMonth() + 1).padStart(2, "0");
    const day =
        String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// 取得圖表顯示日期 M/D
function formatTrendLabel(date) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

// 整理最近七天資料
function getSevenDayTrendData() {
    const transactions =
        getTrendTransactions();

    const labels = [];
    const dateKeys = [];
    const incomeData = [];
    const expenseData = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let offset = 6; offset >= 0; offset -= 1) {
        const date = new Date(today);

        date.setDate(today.getDate() - offset);

        labels.push(formatTrendLabel(date));
        dateKeys.push(formatTrendDate(date));
        incomeData.push(0);
        expenseData.push(0);
    }

    transactions.forEach(function (transaction) {
        if (!transaction.date) return;

        const dateIndex =
            dateKeys.indexOf(transaction.date);

        if (dateIndex === -1) return;

        const amount =
            Number(transaction.amount) || 0;

        if (transaction.type === "收入") {
            incomeData[dateIndex] += amount;
        }

        if (transaction.type === "支出") {
            expenseData[dateIndex] += amount;
        }
    });

    return {
        labels,
        incomeData,
        expenseData
    };
}

// 建立或更新趨勢圖
function loadSevenDayTrendChart() {
    const canvas =
        document.getElementById("sevenDayTrendChart");

    if (!canvas) return;

    if (typeof Chart === "undefined") {
        console.error("Chart.js 尚未載入");
        return;
    }

    const trendData =
        getSevenDayTrendData();

    // 避免 Canvas 重複使用
    const existingChart =
        Chart.getChart(canvas);

    if (existingChart) {
        existingChart.destroy();
    }

    if (sevenDayTrendChartInstance) {
        sevenDayTrendChartInstance.destroy();
        sevenDayTrendChartInstance = null;
    }

    sevenDayTrendChartInstance =
        new Chart(canvas, {
            type: "line",

            data: {
                labels: trendData.labels,

                datasets: [
                    {
                        label: "收入",
                        data: trendData.incomeData,
                        borderColor: "#16a34a",
                        backgroundColor:
                            "rgba(22, 163, 74, 0.12)",
                        pointBackgroundColor: "#16a34a",
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        borderWidth: 3,
                        tension: 0.35,
                        fill: false
                    },
                    {
                        label: "支出",
                        data: trendData.expenseData,
                        borderColor: "#dc2626",
                        backgroundColor:
                            "rgba(220, 38, 38, 0.12)",
                        pointBackgroundColor: "#dc2626",
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        borderWidth: 3,
                        tension: 0.35,
                        fill: false
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
                        position: "top"
                    },

                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const value =
                                    Number(context.raw) || 0;

                                return (
                                    `${context.dataset.label}：` +
                                    `NT$ ${value.toLocaleString()}`
                                );
                            }
                        }
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,

                        ticks: {
                            callback: function (value) {
                                return (
                                    "NT$ " +
                                    Number(value).toLocaleString()
                                );
                            }
                        },

                        grid: {
                            color: "rgba(148, 163, 184, 0.18)"
                        }
                    },

                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
}

// 頁面載入
document.addEventListener(
    "DOMContentLoaded",
    loadSevenDayTrendChart
);

// 返回首頁時更新
window.addEventListener(
    "pageshow",
    loadSevenDayTrendChart
);