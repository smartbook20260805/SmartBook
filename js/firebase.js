// =====================================
// SmartBook Firebase Module
// V5.2 - Cloud + Realtime Sync
// =====================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


console.log("Firebase Module Loading");


// =====================================
// Firebase Config
// =====================================

const firebaseConfig = {

    apiKey:
        "AIzaSyD6ne3Onp48yVm9k8FZNcMW3uw-2rSTHQw",

    authDomain:
        "smartbook-7594c.firebaseapp.com",

    projectId:
        "smartbook-7594c",

    storageBucket:
        "smartbook-7594c.firebasestorage.app",

    messagingSenderId:
        "470454624023",

    appId:
        "1:470454624023:web:7afea9a87dccc99a03e152",

    measurementId:
        "G-1Y3LLQV4E9"

};


// =====================================
// Firebase 啟動
// =====================================

const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);

const auth =
    getAuth(app);

const provider =
    new GoogleAuthProvider();


// =====================================
// 狀態
// =====================================

let currentUser = null;

let cloudSyncReady = false;

let stopRealtimeSync = null;


// =====================================
// Google 登入
// =====================================

async function signInWithGoogle() {

    try {

        const result =
            await signInWithPopup(
                auth,
                provider
            );

        console.log(
            "Google Login Success",
            result.user.email
        );

        return result.user;

    } catch (error) {

        console.error(
            "Google Login Failed",
            error
        );

        throw error;

    }

}


// =====================================
// Google 登出
// =====================================

async function signOutGoogle() {

    try {

        await signOut(auth);

        console.log(
            "Google Logout Success"
        );

    } catch (error) {

        console.error(
            "Google Logout Failed",
            error
        );

        throw error;

    }

}


// =====================================
// 使用者 Firestore 文件
//
// users/{uid}/smartbook/data
// =====================================

function getUserDataDoc() {

    if (!currentUser) {
        return null;
    }

    return doc(
        db,
        "users",
        currentUser.uid,
        "smartbook",
        "data"
    );

}


// =====================================
// 取得本機 SmartBook 資料
// =====================================

function getLocalSmartBookData() {

    let transactions = [];
    let categories = [];

    try {

        transactions =
            JSON.parse(
                localStorage.getItem(
                    "transactions"
                ) || "[]"
            );

    } catch (error) {

        console.error(
            "讀取本機交易失敗：",
            error
        );

        transactions = [];

    }


    try {

        categories =
            JSON.parse(
                localStorage.getItem(
                    "smartbookCategories"
                ) || "[]"
            );

    } catch (error) {

        console.error(
            "讀取本機分類失敗：",
            error
        );

        categories = [];

    }


    const monthlyBudget =
        Number(
            localStorage.getItem(
                "monthlyBudget"
            )
        ) || 0;


    return {

        transactions:
            Array.isArray(transactions)
                ? transactions
                : [],

        categories:
            Array.isArray(categories)
                ? categories
                : [],

        monthlyBudget

    };

}


// =====================================
// 將雲端資料套用到 localStorage
// =====================================

function applyCloudData(data) {

    const transactions =
        Array.isArray(data?.transactions)
            ? data.transactions
            : [];

    const categories =
        Array.isArray(data?.categories)
            ? data.categories
            : [];

    const monthlyBudget =
        Number(data?.monthlyBudget) || 0;


    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

    localStorage.setItem(
        "smartbookCategories",
        JSON.stringify(categories)
    );

    localStorage.setItem(
        "monthlyBudget",
        String(monthlyBudget)
    );


    console.log(
        "雲端資料已寫入 localStorage"
    );

    console.log(
        "雲端交易筆數：",
        transactions.length
    );

    console.log(
        "雲端預算：",
        monthlyBudget
    );


    // 通知 SmartBook 各模組刷新
    window.dispatchEvent(

        new CustomEvent(
            "smartbook-cloud-updated",
            {
                detail: {
                    transactions,
                    categories,
                    monthlyBudget
                }
            }
        )

    );

}


// =====================================
// 上傳本機資料至 Firestore
// =====================================

async function uploadLocalDataToCloud() {

    if (!currentUser) {

        console.log(
            "Cloud Save：尚未登入"
        );

        return false;

    }


    // 登入初始化尚未完成時，
    // 禁止上傳，避免新裝置空資料覆蓋雲端。
    if (!cloudSyncReady) {

        console.log(
            "Cloud Save 暫停：雲端初始化尚未完成"
        );

        return false;

    }


    try {

        const localData =
            getLocalSmartBookData();

        const userDocRef =
            getUserDataDoc();


        await setDoc(

            userDocRef,

            {

                transactions:
                    localData.transactions,

                categories:
                    localData.categories,

                monthlyBudget:
                    localData.monthlyBudget,

                updatedAt:
                    serverTimestamp()

            },

            {
                merge: true
            }

        );


        console.log(
            "Cloud Save Success"
        );

        console.log(
            "上傳交易筆數：",
            localData.transactions.length
        );

        return true;

    } catch (error) {

        console.error(
            "Cloud Save Failed：",
            error
        );

        return false;

    }

}


// =====================================
// 從 Firestore 下載資料
// =====================================

async function downloadCloudData() {

    if (!currentUser) {

        console.log(
            "Cloud Download：目前沒有登入使用者"
        );

        return false;

    }


    try {

        console.log(
            "開始下載雲端資料：",
            currentUser.email
        );


        const userDocRef =
            getUserDataDoc();

        const snapshot =
            await getDoc(userDocRef);


        if (!snapshot.exists()) {

            console.log(
                "Firestore 尚無 SmartBook 雲端資料"
            );

            return false;

        }


        const data =
            snapshot.data();


        applyCloudData(data);


        console.log(
            "Cloud Download Success"
        );


        return true;

    } catch (error) {

        console.error(
            "Cloud Download Failed：",
            error
        );

        return false;

    }

}


// =====================================
// Firestore 即時監聽
// =====================================

function startRealtimeSync() {

    if (!currentUser) {

        console.log(
            "Realtime Sync：尚未登入"
        );

        return;

    }


    // 避免重複建立監聽器
    if (stopRealtimeSync) {

        stopRealtimeSync();

        stopRealtimeSync = null;

    }


    const userDocRef =
        getUserDataDoc();


    console.log(
        "Realtime Sync：開始監聽"
    );


    stopRealtimeSync =
        onSnapshot(

            userDocRef,

            function(snapshot) {

                if (!snapshot.exists()) {

                    console.log(
                        "Realtime Sync：目前沒有雲端文件"
                    );

                    return;

                }


                const data =
                    snapshot.data();


                console.log(
                    "Realtime Sync：收到雲端更新"
                );


                applyCloudData(data);

            },

            function(error) {

                console.error(
                    "Realtime Sync Failed：",
                    error
                );

            }

        );

}


// =====================================
// 停止即時同步
// =====================================

function stopRealtimeListener() {

    if (stopRealtimeSync) {

        stopRealtimeSync();

        stopRealtimeSync = null;

        console.log(
            "Realtime Sync：已停止"
        );

    }

}


// =====================================
// Authentication Listener
// =====================================

onAuthStateChanged(

    auth,

    async function(user) {

        currentUser = user;

        // 登入狀態改變時先禁止上傳
        cloudSyncReady = false;


        // 通知首頁更新登入資訊
        window.dispatchEvent(

            new CustomEvent(
                "smartbook-auth-changed",
                {
                    detail: {
                        user
                    }
                }
            )

        );


        // =====================================
        // 已登入
        // =====================================

        if (user) {

            console.log(
                "Firebase 使用者已登入：",
                user.email
            );


            try {

                // 先下載雲端
                const downloaded =
                    await downloadCloudData();


                // 如果此帳號雲端完全沒有資料，
                // 才使用目前本機資料建立第一份雲端資料。
                if (!downloaded) {

                    console.log(
                        "第一次使用此帳號，準備建立雲端資料"
                    );

                    cloudSyncReady = true;

                    await uploadLocalDataToCloud();

                } else {

                    cloudSyncReady = true;

                }


                console.log(
                    "SmartBook 雲端同步已就緒"
                );


                // 啟動即時同步
                startRealtimeSync();


            } catch (error) {

                cloudSyncReady = false;

                console.error(
                    "登入後同步初始化失敗：",
                    error
                );

            }


            return;

        }


        // =====================================
        // 未登入 / 登出
        // =====================================

        console.log(
            "Firebase 尚未登入"
        );

        cloudSyncReady = false;

        stopRealtimeListener();

    }

);


// =====================================
// 提供給 SmartBook 傳統 JS 使用
// =====================================

window.smartbookFirebase = {

    app,
    db,
    auth,

    signInWithGoogle,
    signOutGoogle,

    uploadLocalDataToCloud,
    downloadCloudData,

    startRealtimeSync,
    stopRealtimeListener,

    getCurrentUser() {

        return currentUser;

    },

    isCloudSyncReady() {

        return cloudSyncReady;

    }

};


console.log(
    "Firebase Module Loaded"
);