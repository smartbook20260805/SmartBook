// =====================================
// SmartBook V7.3
// 分類預算管理
// =====================================

console.log(
    "SmartBook Category Budget Loaded"
);


// =====================================
// Storage Key
// =====================================

const CATEGORY_BUDGET_KEY =
    "smartbookCategoryBudgets";


// =====================================
// 讀取分類預算
// =====================================

function getCategoryBudgets() {

    try {

        const data =
            localStorage.getItem(
                CATEGORY_BUDGET_KEY
            );

        return data
            ? JSON.parse(data)
            : {};

    } catch (error) {

        console.error(
            "讀取分類預算失敗：",
            error
        );

        return {};

    }

}


// =====================================
// 儲存分類預算
// =====================================

function saveCategoryBudgets(data) {

    try {

        localStorage.setItem(
            CATEGORY_BUDGET_KEY,
            JSON.stringify(data)
        );

        console.log(
            "分類預算已儲存"
        );


        // 如果 storage.js 有雲端同步功能
        // 就一起排程同步
        if (
            typeof scheduleCloudSave ===
            "function"
        ) {

            scheduleCloudSave();

        }

    } catch (error) {

        console.error(
            "儲存分類預算失敗：",
            error
        );

    }

}


// =====================================
// 取得 SmartBook 分類
// =====================================

function getAvailableCategories() {

    if (
        typeof getCategoryStorage ===
        "function"
    ) {

        const categories =
            getCategoryStorage();

        if (
            Array.isArray(categories) &&
            categories.length > 0
        ) {

            return categories;

        }

    }


    // 沒有自訂分類時的預設分類
    return [
        "薪資",
        "獎金",
        "投資",
        "餐飲",
        "交通",
        "購物",
        "娛樂",
        "醫療",
        "其他"
    ];

}


// =====================================
// 載入分類下拉選單
// =====================================

function loadCategoryBudgetSelect() {

    const select =
        document.getElementById(
            "categoryBudgetCategory"
        );

    if (!select) {
        return;
    }


    const categories =
        getAvailableCategories();


    select.innerHTML = `
        <option value="">
            請選擇分類
        </option>
    `;


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

            select.appendChild(
                option
            );

        }
    );

}


// =====================================
// 顯示分類預算清單
// =====================================

function renderCategoryBudgetList() {

    const listArea =
        document.getElementById(
            "categoryBudgetList"
        );

    if (!listArea) {
        return;
    }


    const budgets =
        getCategoryBudgets();

    const entries =
        Object.entries(budgets);


    if (entries.length === 0) {

        listArea.innerHTML = `
            <p class="text-muted mb-0">
                尚未設定分類預算
            </p>
        `;

        return;

    }


    entries.sort(
        function (a, b) {

            return a[0].localeCompare(
                b[0],
                "zh-TW"
            );

        }
    );


    listArea.innerHTML = `
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
                        <th>分類</th>
                        <th>每月預算</th>
                        <th>操作</th>
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

                                        <td>
                                            NT$ ${Number(amount).toLocaleString()}
                                        </td>

                                        <td>

                                            <button
                                                type="button"
                                                class="btn btn-outline-danger btn-sm"
                                                onclick="deleteCategoryBudget('${category.replace(/'/g, "\\'")}')"
                                            >
                                                刪除
                                            </button>

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
// 儲存單一分類預算
// =====================================

function saveCategoryBudget() {

    const categorySelect =
        document.getElementById(
            "categoryBudgetCategory"
        );

    const amountInput =
        document.getElementById(
            "categoryBudgetAmount"
        );

    const messageArea =
        document.getElementById(
            "categoryBudgetMessage"
        );


    if (
        !categorySelect ||
        !amountInput
    ) {
        return;
    }


    const category =
        categorySelect.value;

    const amount =
        Number(
            amountInput.value
        );


    if (!category) {

        if (messageArea) {

            messageArea.innerHTML = `
                <div class="text-danger">
                    請先選擇分類。
                </div>
            `;

        }

        return;

    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        if (messageArea) {

            messageArea.innerHTML = `
                <div class="text-danger">
                    預算金額必須大於 0。
                </div>
            `;

        }

        return;

    }


    const budgets =
        getCategoryBudgets();


    budgets[category] =
        amount;


    saveCategoryBudgets(
        budgets
    );


    if (messageArea) {

        messageArea.innerHTML = `
            <div class="text-success">
                ✅ ${category} 預算已儲存
            </div>
        `;

    }


    categorySelect.value =
        "";

    amountInput.value =
        "";


    renderCategoryBudgetList();

}


// =====================================
// 刪除分類預算
// =====================================

function deleteCategoryBudget(category) {

    const confirmed =
        window.confirm(
            `確定要刪除「${category}」的分類預算嗎？`
        );

    if (!confirmed) {
        return;
    }


    const budgets =
        getCategoryBudgets();


    delete budgets[category];


    saveCategoryBudgets(
        budgets
    );


    renderCategoryBudgetList();

}


// =====================================
// 從網址自動帶入分類
// =====================================

function applyBudgetCategoryFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const budgetCategory =
        params.get(
            "budgetCategory"
        );

    if (!budgetCategory) {
        return;
    }

    const select =
        document.getElementById(
            "categoryBudgetCategory"
        );

    if (!select) {
        return;
    }

    const optionExists =
        Array.from(
            select.options
        ).some(
            function (option) {

                return (
                    option.value ===
                    budgetCategory
                );

            }
        );

    if (!optionExists) {
        return;
    }

    select.value =
        budgetCategory;

}


// =====================================
// 頁面初始化
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const saveButton =
            document.getElementById(
                "saveCategoryBudgetBtn"
            );

        loadCategoryBudgetSelect();

        applyBudgetCategoryFromURL();

        renderCategoryBudgetList();


        if (saveButton) {

            saveButton.addEventListener(
                "click",
                saveCategoryBudget
            );

        }

    }
);


// =====================================
// Firebase 雲端資料更新後刷新分類預算
// =====================================

window.addEventListener(
    "smartbook-cloud-updated",
    function () {

        loadCategoryBudgetSelect();

        applyBudgetCategoryFromURL();

        renderCategoryBudgetList();

    }
);