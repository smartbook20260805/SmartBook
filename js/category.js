// =====================================
// SmartBook Category Module
// =====================================

console.log("Category Module Loaded");

const CATEGORY_STORAGE_KEY = "smartbookCategories";
const CATEGORY_TRANSACTION_STORAGE_KEY = "transactions";

const DEFAULT_CATEGORIES = [
    "餐飲",
    "交通",
    "購物",
    "娛樂",
    "醫療",
    "薪資",
    "獎金",
    "其他"
];

// ===============================
// 讀取分類
// ===============================
function getCategories() {
    try {
        const savedData =
            localStorage.getItem(CATEGORY_STORAGE_KEY);

        if (!savedData) {
            saveCategories(DEFAULT_CATEGORIES);
            return [...DEFAULT_CATEGORIES];
        }

        const categories =
            JSON.parse(savedData);

        if (!Array.isArray(categories)) {
            throw new Error("分類資料格式錯誤");
        }

        return categories;

    } catch (error) {
        console.error("讀取分類失敗：", error);

        saveCategories(DEFAULT_CATEGORIES);

        return [...DEFAULT_CATEGORIES];
    }
}

// ===============================
// 儲存分類
// ===============================
function saveCategories(categories) {
    localStorage.setItem(
        CATEGORY_STORAGE_KEY,
        JSON.stringify(categories)
    );
}

// ===============================
// 顯示操作訊息
// ===============================
function showCategoryMessage(
    message,
    type = "success"
) {
    const messageArea =
        document.getElementById("categoryMessage");

    if (!messageArea) return;

    messageArea.className =
        type === "success"
            ? "alert alert-success"
            : "alert alert-danger";

    messageArea.textContent = message;

    window.clearTimeout(
        showCategoryMessage.timeoutId
    );

    showCategoryMessage.timeoutId =
        window.setTimeout(function () {
            messageArea.className = "";
            messageArea.textContent = "";
        }, 2500);
}

// ===============================
// 顯示分類管理清單
// ===============================
function renderCategoryList() {
    const listArea =
        document.getElementById("categoryList");

    if (!listArea) return;

    const categories = getCategories();

    if (categories.length === 0) {
        listArea.innerHTML = `
            <p class="text-muted mb-0">
                尚無分類資料
            </p>
        `;
        return;
    }

    listArea.innerHTML = categories
        .map(function (category, index) {
            return `
                <div
                    class="d-flex justify-content-between
                           align-items-center
                           border-bottom py-3"
                >
                    <span class="fw-bold">
                        ${category}
                    </span>

                    <div class="d-flex gap-2">

                        <button
                            type="button"
                            class="btn btn-sm btn-outline-primary"
                            data-action="edit"
                            data-index="${index}"
                        >
                            ✏️ 修改
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm btn-outline-danger"
                            data-action="delete"
                            data-index="${index}"
                        >
                            🗑️ 刪除
                        </button>

                    </div>
                </div>
            `;
        })
        .join("");
}

// ===============================
// 更新交易中的舊分類
// ===============================
function updateTransactionsCategory(
    oldCategory,
    newCategory
) {
    try {
        const savedData =
            localStorage.getItem(
                CATEGORY_TRANSACTION_STORAGE_KEY
            );

        const transactions =
            savedData
                ? JSON.parse(savedData)
                : [];

        if (!Array.isArray(transactions)) {
            return;
        }

        let changed = false;

        transactions.forEach(function (transaction) {
            if (transaction.category === oldCategory) {
                transaction.category = newCategory;
                changed = true;
            }
        });

        if (changed) {
            localStorage.setItem(
                CATEGORY_TRANSACTION_STORAGE_KEY,
                JSON.stringify(transactions)
            );
        }

    } catch (error) {
        console.error(
            "更新交易分類失敗：",
            error
        );
    }
}

// ===============================
// 更新交易頁分類下拉選單
// ===============================
function updateTransactionCategory() {
    const categorySelect =
        document.getElementById("category");

    if (!categorySelect) return;

    const previousValue =
        categorySelect.value;

    const categories =
        getCategories();

    categorySelect.innerHTML = "";

    categories.forEach(function (category) {
        const option =
            document.createElement("option");

        option.value = category;
        option.textContent = category;

        categorySelect.appendChild(option);
    });

    if (categories.includes(previousValue)) {
        categorySelect.value = previousValue;
    }
}

// ===============================
// 更新搜尋分類下拉選單
// ===============================
function updateFilterCategory() {
    const filterSelect =
        document.getElementById("filterCategory");

    if (!filterSelect) return;

    const previousValue =
        filterSelect.value;

    const categories =
        getCategories();

    filterSelect.innerHTML =
        `<option value="">全部</option>`;

    categories.forEach(function (category) {
        const option =
            document.createElement("option");

        option.value = category;
        option.textContent = category;

        filterSelect.appendChild(option);
    });

    if (
        previousValue === "" ||
        categories.includes(previousValue)
    ) {
        filterSelect.value = previousValue;
    }
}

// ===============================
// 更新首頁快速記帳分類
// ===============================
function updateQuickEntryCategoryFromManager() {
    const categorySelect =
        document.getElementById("quickCategory");

    if (!categorySelect) return;

    const previousValue =
        categorySelect.value;

    const categories =
        getCategories();

    categorySelect.innerHTML = "";

    categories.forEach(function (category) {
        const option =
            document.createElement("option");

        option.value = category;
        option.textContent = category;

        categorySelect.appendChild(option);
    });

    if (categories.includes(previousValue)) {
        categorySelect.value = previousValue;
    }
}

// ===============================
// 更新所有分類下拉選單
// ===============================
function refreshCategorySelects() {
    updateTransactionCategory();
    updateFilterCategory();
    updateQuickEntryCategoryFromManager();
}

// ===============================
// 新增分類
// ===============================
function addCategory() {
    const input =
        document.getElementById("newCategoryInput");

    if (!input) return;

    const categoryName =
        input.value.trim();

    if (!categoryName) {
        showCategoryMessage(
            "請輸入分類名稱！",
            "error"
        );

        input.focus();
        return;
    }

    const categories =
        getCategories();

    const isDuplicate =
        categories.some(function (category) {
            return category === categoryName;
        });

    if (isDuplicate) {
        showCategoryMessage(
            "這個分類已經存在！",
            "error"
        );

        input.focus();
        return;
    }

    categories.push(categoryName);

    saveCategories(categories);
    renderCategoryList();
    refreshCategorySelects();

    input.value = "";
    input.focus();

    showCategoryMessage(
        `已新增分類「${categoryName}」`
    );
}

// ===============================
// 修改分類
// ===============================
function editCategory(index) {
    const categories =
        getCategories();

    const oldName =
        categories[index];

    if (oldName === undefined) return;

    const newName =
        window.prompt(
            "請輸入新的分類名稱：",
            oldName
        );

    if (newName === null) return;

    const trimmedName =
        newName.trim();

    if (!trimmedName) {
        showCategoryMessage(
            "分類名稱不能空白！",
            "error"
        );
        return;
    }

    const isDuplicate =
        categories.some(function (
            category,
            categoryIndex
        ) {
            return (
                categoryIndex !== index &&
                category === trimmedName
            );
        });

    if (isDuplicate) {
        showCategoryMessage(
            "這個分類已經存在！",
            "error"
        );
        return;
    }

    categories[index] = trimmedName;

    saveCategories(categories);

    updateTransactionsCategory(
        oldName,
        trimmedName
    );

    renderCategoryList();
    refreshCategorySelects();

    showCategoryMessage(
        `已將「${oldName}」修改為「${trimmedName}」`
    );
}

// ===============================
// 刪除分類
// ===============================
function deleteCategory(index) {
    const categories =
        getCategories();

    const deletedCategory =
        categories[index];

    if (deletedCategory === undefined) return;

    if (deletedCategory === "其他") {
        showCategoryMessage(
            "「其他」是保留分類，不能刪除！",
            "error"
        );
        return;
    }

    const confirmed =
        window.confirm(
            `確定要刪除分類「${deletedCategory}」嗎？\n\n舊交易會自動改成「其他」。`
        );

    if (!confirmed) return;

    categories.splice(index, 1);

    if (!categories.includes("其他")) {
        categories.push("其他");
    }

    saveCategories(categories);

    updateTransactionsCategory(
        deletedCategory,
        "其他"
    );

    renderCategoryList();
    refreshCategorySelects();

    showCategoryMessage(
        `已刪除分類「${deletedCategory}」，舊交易已改為「其他」`
    );
}

// ===============================
// 頁面載入
// ===============================
document.addEventListener(
    "DOMContentLoaded",
    function () {
        renderCategoryList();
        refreshCategorySelects();

        const addButton =
            document.getElementById("addCategoryBtn");

        const input =
            document.getElementById("newCategoryInput");

        const listArea =
            document.getElementById("categoryList");

        if (addButton) {
            addButton.addEventListener(
                "click",
                addCategory
            );
        }

        if (input) {
            input.addEventListener(
                "keydown",
                function (event) {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        addCategory();
                    }
                }
            );
        }

        if (listArea) {
            listArea.addEventListener(
                "click",
                function (event) {
                    const button =
                        event.target.closest(
                            "button[data-action]"
                        );

                    if (!button) return;

                    const action =
                        button.dataset.action;

                    const index =
                        Number(button.dataset.index);

                    if (!Number.isInteger(index)) {
                        return;
                    }

                    if (action === "edit") {
                        editCategory(index);
                    }

                    if (action === "delete") {
                        deleteCategory(index);
                    }
                }
            );
        }
    }
);

// 返回頁面時更新分類下拉選單
window.addEventListener(
    "pageshow",
    refreshCategorySelects
);