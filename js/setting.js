// ===============================
// SmartBook 系統設定
// ===============================

const SETTING_STORAGE_KEY = "transactions";

// 匯出 JSON 備份
function exportBackup() {
    const transactions =
        JSON.parse(localStorage.getItem(SETTING_STORAGE_KEY)) || [];

    const backupData = {
        app: "SmartBook",
        version: "V6.5",
        exportedAt: new Date().toISOString(),
        transactions
    };

    const jsonText = JSON.stringify(backupData, null, 2);

    const blob = new Blob(
        [jsonText],
        { type: "application/json;charset=utf-8" }
    );

    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const today = new Date();

    const fileDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    link.href = downloadUrl;
    link.download = `smartbook_backup_${fileDate}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(downloadUrl);
}
// ===============================
// 匯入 JSON 備份
// ===============================
function restoreBackup() {

    const fileInput =
        document.getElementById("restoreFile");

    if (!fileInput.files.length) {

        alert("請先選擇備份檔！");

        return;
    }

    const file = fileInput.files[0];

    const reader = new FileReader();

    reader.onload = function (e) {

        try {

            const backupData =
                JSON.parse(e.target.result);

            if (!backupData.transactions) {

                alert("備份檔格式錯誤！");

                return;

            }

            localStorage.setItem(
                "transactions",
                JSON.stringify(backupData.transactions)
            );

            alert("資料還原成功！");

            window.location.href = "index.html";

        } catch (error) {

            alert("讀取備份失敗！");

            console.error(error);

        }

    };

    reader.readAsText(file);

}

// 綁定按鈕
document.addEventListener("DOMContentLoaded", function () {
    const backupBtn = document.getElementById("backupBtn");
    const restoreBtn =
        document.getElementById("restoreBtn");
    
    if (backupBtn) {
        backupBtn.addEventListener("click", exportBackup);
    }
    if (restoreBtn) {

    restoreBtn.addEventListener(
        "click",
        restoreBackup
    );

}
});