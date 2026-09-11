document.addEventListener("DOMContentLoaded", function () {

    const receiptBody = document.getElementById("receiptBody");
    const addItemButton = document.getElementById("addItem");
    const calculateButton = document.getElementById("calculate");
    const saveReceiptButton = document.getElementById("saveReceipt");
    const printReceiptButton = document.getElementById("printReceipt");

    const clearRecordsButton = document.getElementById("clearRecords");
    const recordsBody = document.getElementById("recordsBody");
    const noRecords = document.getElementById("noRecords");

    const subtotalDisplay = document.getElementById("subtotal");
    const discountInput = document.getElementById("discount");
    const discountAmountDisplay = document.getElementById("discountAmount");

    const vatInput = document.getElementById("vat");
    const vatAmountDisplay = document.getElementById("vatAmount");
    const totalDisplay = document.getElementById("total");


    // ==========================================
    // FORMAT MONEY
    // ==========================================

    function formatMoney(amount) {
        return "₱" + Number(amount || 0).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }


    // ==========================================
    // CALCULATE RECEIPT
    // ==========================================

    function calculateReceipt() {

        let subtotal = 0;

        const rows = receiptBody.querySelectorAll("tr");

        rows.forEach(function (row) {

            const qtyInput = row.querySelector(".qty");
            const priceInput = row.querySelector(".price");
            const amountDisplay = row.querySelector(".amount");

            if (!qtyInput || !priceInput || !amountDisplay) {
                return;
            }

            const qty = parseFloat(qtyInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;

            const amount = qty * price;

            amountDisplay.textContent = formatMoney(amount);

            subtotal += amount;
        });


        // Discount

        const discountRate = parseFloat(discountInput.value) || 0;

        const discountAmount =
            subtotal * (discountRate / 100);

        const afterDiscount =
            subtotal - discountAmount;


        // VAT

        const vatRate = parseFloat(vatInput.value) || 0;

        const vatAmount =
            afterDiscount * (vatRate / 100);

        const total =
            afterDiscount + vatAmount;


        // Display results

        subtotalDisplay.textContent =
            formatMoney(subtotal);

        discountAmountDisplay.textContent =
            formatMoney(discountAmount);

        vatAmountDisplay.textContent =
            formatMoney(vatAmount);

        totalDisplay.textContent =
            formatMoney(total);


        return {
            subtotal: subtotal,
            discountRate: discountRate,
            discountAmount: discountAmount,
            vatRate: vatRate,
            vatAmount: vatAmount,
            total: total
        };
    }


    // ==========================================
    // ADD ITEM
    // ==========================================

    addItemButton.addEventListener("click", function () {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <input
                    type="text"
                    class="description"
                    placeholder="Service description"
                >
            </td>

            <td>
                <input
                    type="number"
                    class="qty"
                    value="1"
                    min="0"
                >
            </td>

            <td>
                <input
                    type="number"
                    class="price"
                    value="0"
                    min="0"
                    step="0.01"
                >
            </td>

            <td class="amount">
                ₱0.00
            </td>

            <td>
                <button
                    type="button"
                    class="remove-btn"
                >
                    Remove
                </button>
            </td>
        `;

        receiptBody.appendChild(row);

        calculateReceipt();
    });


    // ==========================================
    // REMOVE ITEM
    // ==========================================

    receiptBody.addEventListener("click", function (event) {

        if (event.target.classList.contains("remove-btn")) {

            const row = event.target.closest("tr");

            if (row) {
                row.remove();
                calculateReceipt();
            }
        }
    });


    // ==========================================
    // AUTO CALCULATE
    // ==========================================

    receiptBody.addEventListener("input", function () {
        calculateReceipt();
    });

    discountInput.addEventListener("input", function () {
        calculateReceipt();
    });

    vatInput.addEventListener("input", function () {
        calculateReceipt();
    });


    // ==========================================
    // CALCULATE BUTTON
    // ==========================================

    calculateButton.addEventListener("click", function () {

        calculateReceipt();

        alert("Receipt calculated successfully!");
    });


    // ==========================================
    // SAVE RECEIPT
    // ==========================================

    saveReceiptButton.addEventListener("click", function () {

        // Calculate first
        const calculation = calculateReceipt();

        // Get receipt information
        const receiptNo =
            document.getElementById("receiptNo").value.trim();

        const receiptDate =
            document.getElementById("receiptDate").value;

        const clientName =
            document.getElementById("clientName").value.trim();

        const projectName =
            document.getElementById("projectName").value.trim();

        const location =
            document.getElementById("location").value.trim();

        const projectId =
            document.getElementById("projectId").value.trim();


        // Check required information

        if (receiptNo === "") {
            alert("Please enter a Receipt Number.");
            return;
        }

        if (receiptDate === "") {
            alert("Please enter the Receipt Date.");
            return;
        }

        if (clientName === "") {
            alert("Please enter the Client Name.");
            return;
        }


        // Get all items

        const items = [];

        const rows = receiptBody.querySelectorAll("tr");

        rows.forEach(function (row) {

            const descriptionInput =
                row.querySelector(".description");

            const qtyInput =
                row.querySelector(".qty");

            const priceInput =
                row.querySelector(".price");


            if (descriptionInput && qtyInput && priceInput) {

                items.push({
                    description: descriptionInput.value,
                    qty: parseFloat(qtyInput.value) || 0,
                    price: parseFloat(priceInput.value) || 0
                });

            }
        });


        // Create receipt record

        const receipt = {

            id: Date.now(),

            receiptNo: receiptNo,

            date: receiptDate,

            clientName: clientName,

            projectName: projectName,

            location: location,

            projectId: projectId,

            items: items,

            subtotal: calculation.subtotal,

            discountRate: calculation.discountRate,

            discountAmount: calculation.discountAmount,

            vatRate: calculation.vatRate,

            vatAmount: calculation.vatAmount,

            total: calculation.total
        };


        // Get existing records

        let receipts =
            JSON.parse(
                localStorage.getItem("architecturalReceipts")
            ) || [];


        // Check duplicate receipt number

        const duplicate = receipts.some(function (item) {

            return item.receiptNo === receiptNo;

        });


        if (duplicate) {

            alert(
                "Receipt Number " +
                receiptNo +
                " already exists."
            );

            return;
        }


        // Save record

        receipts.push(receipt);

        localStorage.setItem(
            "architecturalReceipts",
            JSON.stringify(receipts)
        );


        // Refresh records

        displayRecords();


        // Confirmation

        alert(
            "Receipt " +
            receiptNo +
            " has been saved successfully!"
        );
    });


    // ==========================================
    // DISPLAY RECORDS
    // ==========================================

    function displayRecords() {

        let receipts =
            JSON.parse(
                localStorage.getItem("architecturalReceipts")
            ) || [];


        recordsBody.innerHTML = "";


        if (receipts.length === 0) {

            noRecords.style.display = "block";

            return;

        }


        noRecords.style.display = "none";


        // Newest first

        receipts.reverse();


        receipts.forEach(function (receipt) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHTML(receipt.receiptNo)}
                </td>

                <td>
                    ${escapeHTML(receipt.date)}
                </td>

                <td>
                    ${escapeHTML(receipt.clientName)}
                </td>

                <td>
                    ${escapeHTML(receipt.projectName)}
                </td>

                <td>
                    ${formatMoney(receipt.subtotal)}
                </td>

                <td>
                    ${formatMoney(receipt.discountAmount)}
                </td>

                <td>
                    ${formatMoney(receipt.vatAmount)}
                </td>

                <td class="record-total">
                    ${formatMoney(receipt.total)}
                </td>

                <td>

                    <button
                        type="button"
                        class="record-view-btn"
                        data-id="${receipt.id}"
                    >
                        VIEW
                    </button>

                    <button
                        type="button"
                        class="record-delete-btn"
                        data-id="${receipt.id}"
                    >
                        DELETE
                    </button>

                </td>

            `;


            recordsBody.appendChild(row);

        });
    }


    // ==========================================
    // ESCAPE HTML
    // ==========================================

    function escapeHTML(text) {

        if (text === null || text === undefined) {
            return "";
        }

        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // ==========================================
    // VIEW / DELETE RECORD
    // ==========================================

    recordsBody.addEventListener("click", function (event) {

        const id =
            Number(event.target.dataset.id);


        // VIEW

        if (
            event.target.classList.contains(
                "record-view-btn"
            )
        ) {

            viewReceipt(id);

        }


        // DELETE

        if (
            event.target.classList.contains(
                "record-delete-btn"
            )
        ) {

            deleteReceipt(id);

        }

    });


    // ==========================================
    // VIEW RECEIPT
    // ==========================================

    function viewReceipt(id) {

        let receipts =
            JSON.parse(
                localStorage.getItem("architecturalReceipts")
            ) || [];


        const receipt =
            receipts.find(function (item) {

                return item.id === id;

            });


        if (!receipt) {

            alert("Receipt not found.");

            return;
        }


        document.getElementById("receiptNo").value =
            receipt.receiptNo;

        document.getElementById("receiptDate").value =
            receipt.date;

        document.getElementById("clientName").value =
            receipt.clientName;

        document.getElementById("projectName").value =
            receipt.projectName;

        document.getElementById("location").value =
            receipt.location;

        document.getElementById("projectId").value =
            receipt.projectId;


        discountInput.value =
            receipt.discountRate;

        vatInput.value =
            receipt.vatRate;


        // Clear current items

        receiptBody.innerHTML = "";


        // Load saved items

        receipt.items.forEach(function (item) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    <input
                        type="text"
                        class="description"
                        value="${escapeHTML(item.description)}"
                    >
                </td>

                <td>
                    <input
                        type="number"
                        class="qty"
                        value="${item.qty}"
                        min="0"
                    >
                </td>

                <td>
                    <input
                        type="number"
                        class="price"
                        value="${item.price}"
                        min="0"
                        step="0.01"
                    >
                </td>

                <td class="amount">
                    ₱0.00
                </td>

                <td>
                    <button
                        type="button"
                        class="remove-btn"
                    >
                        Remove
                    </button>
                </td>

            `;


            receiptBody.appendChild(row);

        });


        calculateReceipt();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    // ==========================================
    // DELETE RECEIPT
    // ==========================================

    function deleteReceipt(id) {

        if (
            !confirm(
                "Are you sure you want to delete this receipt?"
            )
        ) {
            return;
        }


        let receipts =
            JSON.parse(
                localStorage.getItem("architecturalReceipts")
            ) || [];


        receipts =
            receipts.filter(function (item) {

                return item.id !== id;

            });


        localStorage.setItem(
            "architecturalReceipts",
            JSON.stringify(receipts)
        );


        displayRecords();
    }


    // ==========================================
    // CLEAR ALL RECORDS
    // ==========================================

    clearRecordsButton.addEventListener(
        "click",
        function () {

            let receipts =
                JSON.parse(
                    localStorage.getItem(
                        "architecturalReceipts"
                    )
                ) || [];


            if (receipts.length === 0) {

                alert("There are no saved records.");

                return;
            }


            if (
                !confirm(
                    "Are you sure you want to delete ALL receipt records?"
                )
            ) {
                return;
            }


            localStorage.removeItem(
                "architecturalReceipts"
            );


            displayRecords();


            alert("All receipt records have been deleted.");

        }
    );


    // ==========================================
    // PRINT
    // ==========================================

    printReceiptButton.addEventListener(
        "click",
        function () {

            calculateReceipt();

            window.print();

        }
    );


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    calculateReceipt();

    displayRecords();

});