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

    function(user){

        currentUser = user;

        window.dispatchEvent(

            new CustomEvent(

                "smartbook-auth-changed",

                {

                    detail:{

                        user:user

                    }

                }

            )

        );

    }

);

// =====================================
// Upload SmartBook Data
// =====================================

async function uploadLocalDataToCloud(){

    if(!currentUser){

        return;

    }

    try{

        const data = {

            transactions: JSON.parse(

                localStorage.getItem(

                    "transactions"

                ) || "[]"

            ),

            monthlyBudget:Number(

                localStorage.getItem(

                    "monthlyBudget"

                ) || 0

            ),

            categories:JSON.parse(

                localStorage.getItem(

                    "smartbookCategories"

                ) || "[]"

            ),

            updatedAt:serverTimestamp()

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

                merge:true

            }

        );

        console.log(

            "Cloud Save Success"

        );

    }

    catch(error){

        console.error(

            "Cloud Save Failed",

            error

        );

    }

}

// =====================================
// Download SmartBook Data
// =====================================

async function downloadCloudData(){

    if(!currentUser){

        return;

    }

    try{

        const snap = await getDoc(

            doc(

                db,

                "users",

                currentUser.uid,

                "smartbook",

                "data"

            )

        );

        if(!snap.exists()){

            return;

        }

        const data = snap.data();

        if(data.transactions){

            localStorage.setItem(

                "transactions",

                JSON.stringify(

                    data.transactions

                )

            );

        }

        if(data.categories){

            localStorage.setItem(

                "smartbookCategories",

                JSON.stringify(

                    data.categories

                )

            );

        }

        if(data.monthlyBudget!==undefined){

            localStorage.setItem(

                "monthlyBudget",

                String(

                    data.monthlyBudget

                )

            );

        }

        console.log(

            "Cloud Download Success"

        );

        window.dispatchEvent(

            new Event(

                "smartbook-cloud-updated"

            )

        );

    }

    catch(error){

        console.error(

            error

        );

    }

}

// =====================================
// Export
// =====================================

window.smartbookFirebase={

    app,

    db,

    auth,

    signInWithGoogle,

    signOutGoogle,

    uploadLocalDataToCloud,

    downloadCloudData,

    getCurrentUser(){

        return currentUser;

    }

};

console.log(

    "Firebase Module Loaded"

);