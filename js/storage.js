// 取得按鈕
const addBtn = document.getElementById("addBtn");

// 如果目前不是 transaction.html，就不執行
if (addBtn) {

    addBtn.addEventListener("click", function () {

        // 取得輸入資料
        const date = document.getElementById("date").value;
        const type = document.getElementById("type").value;
        const item = document.getElementById("item").value;
        const amount = document.getElementById("amount").value;
        const note = document.getElementById("note").value;

        // 找到表格
        const table = document.getElementById("transactionList");

        // 新增一列
        table.innerHTML += `
            <tr>
                <td>${date}</td>
                <td>${type}</td>
                <td>${item}</td>
                <td>${amount}</td>
                <td>${note}</td>
            </tr>
        `;

        // 清空輸入欄位
        document.getElementById("item").value = "";
        document.getElementById("amount").value = "";
        document.getElementById("note").value = "";

    });

}