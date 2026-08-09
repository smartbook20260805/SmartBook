// =====================================
// SmartBook Firebase Module
// =====================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

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
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

console.log("Firebase Module Loading");

// =====================================
// Firebase Config
// =====================================

const firebaseConfig = {

    apiKey: "AIzaSyD6ne3Onp48yVm9k8FZNcMW3uw-2rSTHQw",

    authDomain: "smartbook-7594c.firebaseapp.com",

    projectId: "smartbook-7594c",

    storageBucket: "smartbook-7594c.firebasestorage.app",

    messagingSenderId: "470454624023",

    appId: "1:470454624023:web:7afea9a87dccc99a03e152",

    measurementId: "G-1Y3LLQV4E9"

};

// =====================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

let currentUser = null;
let cloudSyncReady = false;

// =====================================
// Google Login
// =====================================

async function signInWithGoogle() {

    try {

        const result = await signInWithPopup(

            auth,

            provider

        );

        console.log(

            "Google Login Success",

            result.user.email

        );

        return result.user;

    }

    catch (error) {

        console.error(

            "Google Login Failed",

            error

        );

        throw error;

    }

}

// =====================================
// Google Logout
// =====================================

async function signOutGoogle() {

    await signOut(auth);

}

// =====================================
// Auth Listener
// =====================================

onAuthStateChanged(

    auth,

    async function(user) {

        currentUser = user;

        // 每次登入狀態改變，先暫停自動上傳
        cloudSyncReady = false;

        window.dispatchEvent(

            new CustomEvent(

                "smartbook-auth-changed",

                {
                    detail: {
                        user: user
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

                // 先下載雲端資料
                const downloaded =
                    await downloadCloudData();

                if (downloaded) {

                    console.log(
                        "登入後自動下載完成"
                    );

                } else {

                    console.log(
                        "雲端沒有資料，保留目前本機資料"
                    );

                }

                // 下載流程結束後，才允許自動上傳
                cloudSyncReady = true;

                console.log(
                    "SmartBook 雲端同步已就緒"
                );

            } catch (error) {

                console.error(
                    "登入後自動下載失敗：",
                    error
                );

                cloudSyncReady = false;

            }

        } else {

            console.log(
                "Firebase 尚未登入"
            );

            cloudSyncReady = false;

        }

    }

);

// =====================================
// Upload SmartBook Data
// =====================================

async function uploadLocalDataToCloud() {

    if (!currentUser) {

        console.log(
            "Cloud Save：尚未登入"
        );

        return false;

    }

    // 防止新裝置尚未下載完成就覆蓋雲端
    if (!cloudSyncReady) {

        console.log(
            "Cloud Save 暫停：雲端初始化尚未完成"
        );

        return false;

    }

    try {

        const transactions =
            JSON.parse(
                localStorage.getItem(
                    "transactions"
                ) || "[]"
            );

        const monthlyBudget =
            Number(
                localStorage.getItem(
                    "monthlyBudget"
                ) || 0
            );

        const categories =
            JSON.parse(
                localStorage.getItem(
                    "smartbookCategories"
                ) || "[]"
            );


        const data = {

            transactions,

            monthlyBudget,

            categories,

            updatedAt:
                serverTimestamp()

        };


        await setDoc(

            doc(
                db,
                "users",
                currentUser.uid,
                "smartbook",
                "data"
            ),

            data,

            {
                merge: true
            }

        );


        console.log(
            "Cloud Save Success"
        );

        console.log(
            "上傳交易筆數：",
            transactions.length
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
// Download SmartBook Data
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

        const userDocRef = doc(
            db,
            "users",
            currentUser.uid,
            "smartbook",
            "data"
        );

        const snap =
            await getDoc(userDocRef);

        if (!snap.exists()) {

            console.log(
                "Firestore 尚無 SmartBook 雲端資料"
            );

            return false;
        }

        const data = snap.data();


        // ===============================
        // 交易
        // ===============================

        const transactions =
            Array.isArray(data.transactions)
                ? data.transactions
                : [];

        localStorage.setItem(
            "transactions",
            JSON.stringify(transactions)
        );


        // ===============================
        // 分類
        // ===============================

        const categories =
            Array.isArray(data.categories)
                ? data.categories
                : [];

        localStorage.setItem(
            "smartbookCategories",
            JSON.stringify(categories)
        );


        // ===============================
        // 預算
        // ===============================

        const monthlyBudget =
            Number(data.monthlyBudget) || 0;

        localStorage.setItem(
            "monthlyBudget",
            String(monthlyBudget)
        );


        console.log(
            "Cloud Download Success"
        );

        console.log(
            "雲端交易筆數：",
            transactions.length
        );

        console.log(
            "雲端預算：",
            monthlyBudget
        );


        // 通知所有頁面重新讀 localStorage
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
// Export
// =====================================

window.smartbookFirebase = {

    app,
    db,
    auth,

    signInWithGoogle,
    signOutGoogle,

    uploadLocalDataToCloud,
    downloadCloudData,

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