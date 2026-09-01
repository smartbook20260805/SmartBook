// =====================================
// SmartBook 帳戶管理
// =====================================

const ACCOUNT_STORAGE_KEY = "accounts";

const ACCOUNT_INITIAL_BALANCE_KEY =
    "accountInitialBalances";

const ACCOUNT_TYPE_STORAGE_KEY =
    "accountTypes";    

// =====================================
// 取得帳戶
// =====================================
function getAccounts() {

    const savedAccounts =
        localStorage.getItem(
            ACCOUNT_STORAGE_KEY
        );

    if (savedAccounts) {

        try {

            const accounts =
                JSON.parse(savedAccounts);

            if (Array.isArray(accounts)) {
                return accounts;
            }

        } catch (error) {

            console.error(
                "讀取帳戶資料失敗",
                error
            );

        }

    }


    // 第一次使用時的預設帳戶
    const defaultAccounts = [
        "現金",
        "銀行",
        "信用卡"
    ];

    localStorage.setItem(
        ACCOUNT_STORAGE_KEY,
        JSON.stringify(defaultAccounts)
    );

    return defaultAccounts;
}


// =====================================
// 儲存帳戶
// =====================================
function saveAccounts(accounts) {

    localStorage.setItem(
        ACCOUNT_STORAGE_KEY,
        JSON.stringify(accounts)
    );

}


// =====================================
// 取得帳戶初始餘額
// =====================================
function getAccountInitialBalances() {

    const saved =
        localStorage.getItem(
            ACCOUNT_INITIAL_BALANCE_KEY
        );

    if (!saved) {
        return {};
    }

    try {

        const balances =
            JSON.parse(saved);

        if (
            balances &&
            typeof balances === "object"
        ) {
            return balances;
        }

    } catch (error) {

        console.error(
            "讀取帳戶初始餘額失敗",
            error
        );

    }

    return {};
}


// =====================================
// 儲存帳戶初始餘額
// =====================================
function saveAccountInitialBalances(
    balances
) {

    localStorage.setItem(
        ACCOUNT_INITIAL_BALANCE_KEY,
        JSON.stringify(balances)
    );

}

// =====================================
// 取得帳戶類型
// =====================================
function getAccountTypes() {

    const saved =
        localStorage.getItem(
            ACCOUNT_TYPE_STORAGE_KEY
        );

    if (saved) {

        try {

            const types =
                JSON.parse(saved);

            if (
                types &&
                typeof types === "object"
            ) {
                return types;
            }

        } catch (error) {

            console.error(
                "讀取帳戶類型失敗",
                error
            );

        }

    }


    // 舊帳戶第一次升級時的預設類型
    const defaultTypes = {
        "現金": "現金",
        "銀行": "銀行",
        "信用卡": "信用卡"
    };


    localStorage.setItem(
        ACCOUNT_TYPE_STORAGE_KEY,
        JSON.stringify(defaultTypes)
    );


    return defaultTypes;
}


// =====================================
// 儲存帳戶類型
// =====================================
function saveAccountTypes(types) {

    localStorage.setItem(
        ACCOUNT_TYPE_STORAGE_KEY,
        JSON.stringify(types)
    );

}


// =====================================
// 更新交易視窗的帳戶選單
// =====================================
function loadAccountSelects() {

    const accounts = getAccounts();

    const selectIds = [
        "quickAccount",
        "quickFromAccount",
        "quickToAccount"
    ];


    selectIds.forEach(function (id) {

        const select =
            document.getElementById(id);

        if (!select) {
            return;
        }


        // 記住目前選到的帳戶
        const currentValue =
            select.value;


        select.innerHTML =
            accounts
                .map(function (account) {

                    return `
                        <option value="${account}">
                            ${account}
                        </option>
                    `;

                })
                .join("");


        // 如果原本選擇的帳戶仍存在，就保持選擇
        if (
            accounts.includes(
                currentValue
            )
        ) {
            select.value =
                currentValue;
        }

    });

}


// =====================================
// 頁面載入
// =====================================
document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadAccountSelects();
        renderAccountList();


        const addAccountBtn =
            document.getElementById(
                "addAccountBtn"
            );


        if (addAccountBtn) {

            addAccountBtn.addEventListener(
                "click",
                addAccount
            );

        }

        const saveAccountEditBtn =
    document.getElementById(
        "saveAccountEditBtn"
    );


if (saveAccountEditBtn) {

    saveAccountEditBtn.addEventListener(
        "click",
        saveAccountEdit
    );

}

    }
);


// =====================================
// 顯示帳戶管理清單
// =====================================
function renderAccountList() {

    const accountList =
        document.getElementById("accountList");

    if (!accountList) {
        return;
    }


    const accounts =
        getAccounts();


    if (accounts.length === 0) {

        accountList.innerHTML = `
            <p class="text-muted mb-0">
                尚未建立帳戶
            </p>
        `;

        return;
    }


    const accountTypes =
        getAccountTypes();


    accountList.innerHTML =
        accounts
            .map(function (account) {

                const balance =
                    getAccountBalance(account);


                const accountType =
                    accountTypes[account] || "其他";


                const isCreditCard =
                    accountType === "信用卡";


                const displayBalance =
                    isCreditCard
                        ? Math.max(0, -balance)
                        : balance;


                const balanceLabel =
                    isCreditCard
                        ? "目前未繳"
                        : "目前餘額";


                return `
                    <div
                        class="
                            d-flex
                            justify-content-between
                            align-items-center
                            border
                            rounded
                            p-3
                            mb-2
                        "
                    >

                        <div>

                            <div class="fw-bold">
                                ${account}
                            </div>

                            <small class="text-muted d-block mb-1">
                                ${accountType}
                            </small>

                            <small class="text-muted">
                                ${balanceLabel}
                            </small>

                            <div
                                class="${
                                    displayBalance < 0
                                        ? "text-danger"
                                        : "text-success"
                                } fw-bold"
                            >
                                NT$ ${displayBalance.toLocaleString()}
                            </div>

                        </div>


                        <div class="d-flex gap-2 flex-wrap">

                            <button
                                type="button"
                                class="btn btn-outline-secondary btn-sm"
                                onclick="editAccount('${account}')"
                            >
                                編輯
                            </button>

                            <button
                                type="button"
                                class="btn btn-outline-primary btn-sm"
                                onclick="editAccountInitialBalance('${account}')"
                            >
                                設定初始餘額
                            </button>

                            <button
                                type="button"
                                class="btn btn-outline-danger btn-sm"
                                onclick="deleteAccount('${account}')"
                            >
                                刪除
                            </button>

                        </div>

                    </div>
                `;

            })
            .join("");
}

// =====================================
// 新增帳戶
// =====================================
function addAccount() {

    const input =
    document.getElementById(
        "newAccountName"
    );

const typeSelect =
    document.getElementById(
        "newAccountType"
    );

const message =
    document.getElementById(
        "accountMessage"
    );


    if (!input) {
        return;
    }


    const accountName =
        input.value.trim();

    const accountType =
    typeSelect
        ? typeSelect.value
        : "其他";    


    if (!accountName) {

        if (message) {

            message.textContent =
                "⚠️ 請輸入帳戶名稱";

            message.className =
                "text-danger mt-2 mb-3";

            message.style.display =
                "block";
        }

        return;
    }


    const accounts = getAccounts();


    if (accounts.includes(accountName)) {

        if (message) {

            message.textContent =
                "⚠️ 這個帳戶已經存在";

            message.className =
                "text-danger mt-2 mb-3";

            message.style.display =
                "block";
        }

        return;
    }


    accounts.push(accountName);

saveAccounts(accounts);


// 儲存帳戶類型
const accountTypes =
    getAccountTypes();

accountTypes[accountName] =
    accountType;

saveAccountTypes(
    accountTypes
);

    input.value = "";


    if (message) {

        message.textContent =
            "✅ 帳戶已新增";

        message.className =
            "text-success mt-2 mb-3";

        message.style.display =
            "block";
    }


    renderAccountList();
    loadAccountSelects();
}

// =====================================
// 刪除帳戶
// =====================================
function deleteAccount(accountName) {

    const transactions =
        JSON.parse(
            localStorage.getItem("transactions")
        ) || [];


    const isUsed = transactions.some(
        function (transaction) {

            return (
                transaction.account === accountName ||
                transaction.fromAccount === accountName ||
                transaction.toAccount === accountName
            );

        }
    );


    if (isUsed) {

        alert(
            `「${accountName}」目前有交易紀錄正在使用，不能刪除。`
        );

        return;
    }


    const confirmed = confirm(
        `確定要刪除帳戶「${accountName}」嗎？`
    );


    if (!confirmed) {
        return;
    }


    const accounts =
    getAccounts().filter(
        function (account) {

            return account !== accountName;

        }
    );

    saveAccounts(accounts);


// 刪除帳戶類型資料
const accountTypes =
    getAccountTypes();

delete accountTypes[accountName];

saveAccountTypes(
    accountTypes
);


// 刪除初始餘額資料
const initialBalances =
    getAccountInitialBalances();

delete initialBalances[accountName];

saveAccountInitialBalances(
    initialBalances
);


renderAccountList();
loadAccountSelects();

}

// =====================================
// 計算帳戶餘額
// =====================================
function getAccountBalance(accountName) {

    const transactions =
        JSON.parse(
            localStorage.getItem("transactions")
        ) || [];

    const initialBalances =
    getAccountInitialBalances();

let balance =
    Number(
        initialBalances[accountName]
    ) || 0;

    transactions.forEach(function (transaction) {

        const amount =
            Number(transaction.amount) || 0;


        // 收入
        if (
            transaction.type === "收入" &&
            transaction.account === accountName
        ) {
            balance += amount;
        }


        // 支出
        if (
            transaction.type === "支出" &&
            transaction.account === accountName
        ) {
            balance -= amount;
        }


        // 代墊
        if (
            transaction.type === "代墊" &&
            transaction.account === accountName
        ) {
            balance -= amount;
        }


        // 轉帳：轉出
        if (
            transaction.type === "轉帳" &&
            transaction.fromAccount === accountName
        ) {
            balance -= amount;
        }


        // 轉帳：轉入
        if (
            transaction.type === "轉帳" &&
            transaction.toAccount === accountName
        ) {
            balance += amount;
        }

    });


    return balance;
}

// =====================================
// 設定帳戶初始餘額
// =====================================
function editAccountInitialBalance(accountName) {

    const initialBalances =
        getAccountInitialBalances();

    const currentInitialBalance =
        Number(
            initialBalances[accountName]
        ) || 0;


    const input = prompt(
        `請輸入「${accountName}」的初始餘額`,
        currentInitialBalance
    );


    // 按取消
    if (input === null) {
        return;
    }


    const amount =
        Number(input);


    if (
        input.trim() === "" ||
        !Number.isFinite(amount)
    ) {

        alert(
            "請輸入正確的金額"
        );

        return;
    }


    initialBalances[accountName] =
        amount;


    saveAccountInitialBalances(
        initialBalances
    );


    renderAccountList();

}

// =====================================
// 開啟編輯帳戶視窗
// =====================================
function editAccount(accountName) {

    const modalElement =
        document.getElementById(
            "editAccountModal"
        );

    const originalNameInput =
        document.getElementById(
            "editAccountOriginalName"
        );

    const nameInput =
        document.getElementById(
            "editAccountName"
        );

    const typeSelect =
        document.getElementById(
            "editAccountType"
        );


    if (
        !modalElement ||
        !originalNameInput ||
        !nameInput ||
        !typeSelect
    ) {

        console.error(
            "找不到編輯帳戶視窗"
        );

        return;
    }


    const accountTypes =
        getAccountTypes();


    // 記住原本帳戶名稱
    originalNameInput.value =
        accountName;


    // 帶入目前名稱
    nameInput.value =
        accountName;


    // 帶入目前帳戶類型
    typeSelect.value =
        accountTypes[accountName] ||
        "其他";


    // 開啟 Bootstrap Modal
    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );


    modal.show();

}

// =====================================
// 儲存帳戶修改
// =====================================
function saveAccountEdit() {

    const originalNameInput =
        document.getElementById(
            "editAccountOriginalName"
        );

    const nameInput =
        document.getElementById(
            "editAccountName"
        );

    const typeSelect =
        document.getElementById(
            "editAccountType"
        );


    if (
        !originalNameInput ||
        !nameInput ||
        !typeSelect
    ) {
        return;
    }


    const originalName =
        originalNameInput.value;

    const newAccountName =
        nameInput.value.trim();

    const newAccountType =
        typeSelect.value;


    // 帳戶名稱不能空白
    if (!newAccountName) {

        alert(
            "帳戶名稱不能空白"
        );

        return;
    }


    const accounts =
        getAccounts();


    // 檢查名稱是否重複
    if (
        newAccountName !== originalName &&
        accounts.includes(newAccountName)
    ) {

        alert(
            `「${newAccountName}」已經存在`
        );

        return;
    }


    // =====================================
    // 更新帳戶名稱
    // =====================================
    const updatedAccounts =
        accounts.map(function (account) {

            if (account === originalName) {
                return newAccountName;
            }

            return account;

        });


    saveAccounts(
        updatedAccounts
    );


    // =====================================
    // 更新帳戶類型
    // =====================================
    const accountTypes =
        getAccountTypes();

    delete accountTypes[originalName];

    accountTypes[newAccountName] =
        newAccountType;

    saveAccountTypes(
        accountTypes
    );


    // =====================================
    // 搬移初始餘額
    // =====================================
    const initialBalances =
        getAccountInitialBalances();


    if (
        Object.prototype.hasOwnProperty.call(
            initialBalances,
            originalName
        )
    ) {

        initialBalances[newAccountName] =
            initialBalances[originalName];


        if (
            newAccountName !== originalName
        ) {

            delete initialBalances[
                originalName
            ];

        }

    }


    saveAccountInitialBalances(
        initialBalances
    );


    // =====================================
    // 同步更新舊交易
    // =====================================
    const transactions =
        JSON.parse(
            localStorage.getItem(
                "transactions"
            )
        ) || [];


    transactions.forEach(
        function (transaction) {

            if (
                transaction.account ===
                originalName
            ) {

                transaction.account =
                    newAccountName;

            }


            if (
                transaction.fromAccount ===
                originalName
            ) {

                transaction.fromAccount =
                    newAccountName;

            }


            if (
                transaction.toAccount ===
                originalName
            ) {

                transaction.toAccount =
                    newAccountName;

            }

        }
    );


    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );


    // =====================================
    // 更新畫面
    // =====================================
    renderAccountList();
    loadAccountSelects();


    // 關閉 Modal
    const modalElement =
        document.getElementById(
            "editAccountModal"
        );

    const modal =
        bootstrap.Modal.getInstance(
            modalElement
        );


    if (modal) {
        modal.hide();
    }


    alert(
        "✅ 帳戶已更新"
    );

}

// =====================================
// Firebase 雲端更新後刷新帳戶
// =====================================
window.addEventListener(
    "smartbook-cloud-updated",
    function () {

        loadAccountSelects();
        renderAccountList();

    }
);