// =====================================
// SmartBook Category Module
// V5.2 - Storage + Firebase Sync
// =====================================

console.log("Category Module Loaded");


// =====================================
// 預設分類
// =====================================

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


// =====================================
// 讀取分類
// 統一走 storage.js
// =====================================

function getCategories() {

    try {

        let categories = [];


        if (
            typeof getCategoryStorage ===
            "function"
        ) {

            categories =
                getCategoryStorage();

        } else {

            console.error(
                "找不到 getCategoryStorage()"
            );

            return [
                ...DEFAULT_CATEGORIES
            ];

        }


        // 第一次使用時建立預設分類
        if (
            !Array.isArray(categories) ||
            categories.length === 0
        ) {

            categories = [
                ...DEFAULT_CATEGORIES
            ];

            saveCategories(
                categories
            );

        }


        return categories;


    } catch (error) {

        console.error(
            "讀取分類失敗：",
            error
        );


        return [
            ...DEFAULT_CATEGORIES
        ];

    }

}


// =====================================
// 儲存分類
// 統一走 storage.js
// =====================================

function saveCategories(categories) {

    if (
        !Array.isArray(categories)
    ) {

        console.error(
            "分類資料格式錯誤"
        );

        return false;

    }


    if (
        typeof saveCategoryStorage ===
        "function"
    ) {

        saveCategoryStorage(
            categories
        );


        console.log(
            "Category：分類已儲存"
        );


        return true;

    }


    console.error(
        "找不到 saveCategoryStorage()，分類無法儲存"
    );


    return false;

}


// =====================================
// 顯示操作訊息
// =====================================

function showCategoryMessage(
    message,
    type = "success"
) {

    const messageArea =
        document.getElementById(
            "categoryMessage"
        );


    if (!messageArea) return;


    messageArea.className =
        type === "success"
            ? "alert alert-success"
            : "alert alert-danger";


    messageArea.textContent =
        message;


    window.clearTimeout(
        showCategoryMessage.timeoutId
    );


    showCategoryMessage.timeoutId =
        window.setTimeout(
            function () {

                messageArea.className =
                    "";

                messageArea.textContent =
                    "";

            },
            2500
        );

}


// =====================================
// 顯示分類管理清單
// =====================================

function renderCategoryList() {

    const listArea =
        document.getElementById(
            "categoryList"
        );


    if (!listArea) return;


    const categories =
        getCategories();


    if (
        !Array.isArray(categories) ||
        categories.length === 0
    ) {

        listArea.innerHTML = `
            <p class="text-muted mb-0">
                尚無分類資料
            </p>
        `;

        return;

    }


    listArea.innerHTML =
        categories
            .map(
                function (
                    category,
                    index
                ) {

                    return `

                        <div
                            class="
                                d-flex
                                justify-content-between
                                align-items-center
                                border-bottom
                                py-3
                            "
                        >

                            <span class="fw-bold">
                                ${category}
                            </span>


                            <div class="d-flex gap-2">

                                <button
                                    type="button"
                                    class="
                                        btn
                                        btn-sm
                                        btn-outline-primary
                                    "
                                    data-action="edit"
                                    data-index="${index}"
                                >
                                    ✏️ 修改
                                </button>


                                <button
                                    type="button"
                                    class="
                                        btn
                                        btn-sm
                                        btn-outline-danger
                                    "
                                    data-action="delete"
                                    data-index="${index}"
                                >
                                    🗑️ 刪除
                                </button>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


// =====================================
// 更新舊交易中的分類
// 統一走 storage.js
// =====================================

function updateTransactionsCategory(
    oldCategory,
    newCategory
) {

    try {

        if (
            typeof getTransactions !==
            "function"
        ) {

            console.error(
                "找不到 getTransactions()"
            );

            return false;

        }


        if (
            typeof saveTransactions !==
            "function"
        ) {

            console.error(
                "找不到 saveTransactions()"
            );

            return false;

        }


        const transactions =
            getTransactions();


        if (
            !Array.isArray(
                transactions
            )
        ) {

            return false;

        }


        let changed = false;


        transactions.forEach(
            function (transaction) {

                if (
                    transaction.category ===
                    oldCategory
                ) {

                    transaction.category =
                        newCategory;

                    changed = true;

                }

            }
        );


        if (changed) {

            saveTransactions(
                transactions
            );


            console.log(
                "Category：交易分類已同步更新"
            );

        }


        return changed;


    } catch (error) {

        console.error(
            "更新交易分類失敗：",
            error
        );


        return false;

    }

}


// =====================================
// 更新交易頁分類下拉選單
// =====================================

function updateTransactionCategory() {

    const categorySelect =
        document.getElementById(
            "category"
        );


    if (!categorySelect) return;


    const previousValue =
        categorySelect.value;


    const categories =
        getCategories();


    categorySelect.innerHTML =
        "";


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


            categorySelect.appendChild(
                option
            );

        }
    );


    if (
        categories.includes(
            previousValue
        )
    ) {

        categorySelect.value =
            previousValue;

    }

}


// =====================================
// 更新搜尋分類下拉選單
// =====================================

function updateFilterCategory() {

    const filterSelect =
        document.getElementById(
            "filterCategory"
        );


    if (!filterSelect) return;


    const previousValue =
        filterSelect.value;


    const categories =
        getCategories();


    filterSelect.innerHTML =
        `<option value="">全部</option>`;


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


            filterSelect.appendChild(
                option
            );

        }
    );


    if (
        previousValue === "" ||
        categories.includes(
            previousValue
        )
    ) {

        filterSelect.value =
            previousValue;

    }

}


// =====================================
// 更新首頁快速記帳分類
// =====================================

function updateQuickEntryCategoryFromManager() {

    const categorySelect =
        document.getElementById(
            "quickCategory"
        );


    if (!categorySelect) return;


    const previousValue =
        categorySelect.value;


    const categories =
        getCategories();


    categorySelect.innerHTML =
        "";


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


            categorySelect.appendChild(
                option
            );

        }
    );


    if (
        categories.includes(
            previousValue
        )
    ) {

        categorySelect.value =
            previousValue;

    }

}


// =====================================
// 更新所有分類下拉選單
// =====================================

function refreshCategorySelects() {

    updateTransactionCategory();

    updateFilterCategory();

    updateQuickEntryCategoryFromManager();

}


// =====================================
// 新增分類
// =====================================

function addCategory() {

    const input =
        document.getElementById(
            "newCategoryInput"
        );


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
        categories.some(
            function (category) {

                return (
                    category ===
                    categoryName
                );

            }
        );


    if (isDuplicate) {

        showCategoryMessage(
            "這個分類已經存在！",
            "error"
        );


        input.focus();

        return;

    }


    categories.push(
        categoryName
    );


    const saved =
        saveCategories(
            categories
        );


    if (!saved) {

        showCategoryMessage(
            "分類儲存失敗！",
            "error"
        );

        return;

    }


    renderCategoryList();

    refreshCategorySelects();


    input.value = "";

    input.focus();


    showCategoryMessage(
        `已新增分類「${categoryName}」`
    );


    console.log(
        "Category：新增分類",
        categoryName
    );

}


// =====================================
// 修改分類
// =====================================

function editCategory(index) {

    const categories =
        getCategories();


    const oldName =
        categories[index];


    if (
        oldName === undefined
    ) {

        return;

    }


    const newName =
        window.prompt(
            "請輸入新的分類名稱：",
            oldName
        );


    if (
        newName === null
    ) {

        return;

    }


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
        categories.some(
            function (
                category,
                categoryIndex
            ) {

                return (
                    categoryIndex !== index &&
                    category ===
                        trimmedName
                );

            }
        );


    if (isDuplicate) {

        showCategoryMessage(
            "這個分類已經存在！",
            "error"
        );

        return;

    }


    // 名稱沒變
    if (
        oldName ===
        trimmedName
    ) {

        return;

    }


    categories[index] =
        trimmedName;


    const saved =
        saveCategories(
            categories
        );


    if (!saved) {

        showCategoryMessage(
            "分類儲存失敗！",
            "error"
        );

        return;

    }


    // 同步修改舊交易
    updateTransactionsCategory(
        oldName,
        trimmedName
    );


    renderCategoryList();

    refreshCategorySelects();


    showCategoryMessage(
        `已將「${oldName}」修改為「${trimmedName}」`
    );


    console.log(
        "Category：分類已修改",
        oldName,
        "→",
        trimmedName
    );

}


// =====================================
// 刪除分類
// =====================================

function deleteCategory(index) {

    const categories =
        getCategories();


    const deletedCategory =
        categories[index];


    if (
        deletedCategory ===
        undefined
    ) {

        return;

    }


    // 其他為保留分類
    if (
        deletedCategory ===
        "其他"
    ) {

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


    categories.splice(
        index,
        1
    );


    // 確保「其他」一定存在
    if (
        !categories.includes(
            "其他"
        )
    ) {

        categories.push(
            "其他"
        );

    }


    const saved =
        saveCategories(
            categories
        );


    if (!saved) {

        showCategoryMessage(
            "分類刪除失敗！",
            "error"
        );

        return;

    }


    // 舊交易分類改為其他
    updateTransactionsCategory(
        deletedCategory,
        "其他"
    );


    renderCategoryList();

    refreshCategorySelects();


    showCategoryMessage(
        `已刪除分類「${deletedCategory}」，舊交易已改為「其他」`
    );


    console.log(
        "Category：分類已刪除",
        deletedCategory
    );

}


// =====================================
// Firebase 雲端資料更新後
// 重新整理分類畫面
// =====================================

function refreshCategoryAfterCloudSync() {

    renderCategoryList();

    refreshCategorySelects();

}


// =====================================
// 頁面載入
// =====================================

document.addEventListener(

    "DOMContentLoaded",

    function () {

        renderCategoryList();

        refreshCategorySelects();


        const addButton =
            document.getElementById(
                "addCategoryBtn"
            );


        const input =
            document.getElementById(
                "newCategoryInput"
            );


        const listArea =
            document.getElementById(
                "categoryList"
            );


        // 新增按鈕
        if (addButton) {

            addButton.addEventListener(

                "click",

                addCategory

            );

        }


        // Enter 新增
        if (input) {

            input.addEventListener(

                "keydown",

                function (event) {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        addCategory();

                    }

                }

            );

        }


        // 修改 / 刪除
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
                        Number(
                            button.dataset.index
                        );


                    if (
                        !Number.isInteger(
                            index
                        )
                    ) {

                        return;

                    }


                    if (
                        action ===
                        "edit"
                    ) {

                        editCategory(
                            index
                        );

                    }


                    if (
                        action ===
                        "delete"
                    ) {

                        deleteCategory(
                            index
                        );

                    }

                }

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

        renderCategoryList();

        refreshCategorySelects();

    }

);


// =====================================
// Firebase 即時同步後刷新分類
// =====================================

window.addEventListener(

    "smartbook-cloud-updated",

    function () {

        refreshCategoryAfterCloudSync();

    }

);