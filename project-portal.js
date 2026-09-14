/* =========================================================
   ARCHGEN PROJECT PORTAL
   PROJECT ID BASED DASHBOARD
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       PROJECT ID
       ===================================================== */

    const params =
        new URLSearchParams(
            window.location.search
        );


    let projectId =
        params.get("projectId");


    if (!projectId) {

        projectId =
            localStorage.getItem(
                "architecturalProjectId"
            );

    }


    if (projectId) {

        projectId =
            projectId.trim();

        localStorage.setItem(
            "architecturalProjectId",
            projectId
        );

    }


    if (!projectId) {

        alert(
            "No Project ID was selected."
        );

        window.location.href =
            "index.html";

        return;

    }


    /* =====================================================
       DOM
       ===================================================== */

    const portalProjectId =
        document.getElementById(
            "portalProjectId"
        );

    const portalProjectName =
        document.getElementById(
            "portalProjectName"
        );

    const portalClient =
        document.getElementById(
            "portalClient"
        );

    const portalLocation =
        document.getElementById(
            "portalLocation"
        );


    const infoProjectId =
        document.getElementById(
            "infoProjectId"
        );

    const infoProjectName =
        document.getElementById(
            "infoProjectName"
        );

    const infoClient =
        document.getElementById(
            "infoClient"
        );

    const infoLocation =
        document.getElementById(
            "infoLocation"
        );

    const infoStartDate =
        document.getElementById(
            "infoStartDate"
        );

    const infoCompletion =
        document.getElementById(
            "infoCompletion"
        );


    const projectProgress =
        document.getElementById(
            "projectProgress"
        );

    const projectBilling =
        document.getElementById(
            "projectBilling"
        );

    const receiptCount =
        document.getElementById(
            "receiptCount"
        );


    const statusSelect =
        document.getElementById(
            "statusSelect"
        );

    const progressRange =
        document.getElementById(
            "progressRange"
        );

    const progressBar =
        document.getElementById(
            "progressBar"
        );

    const progressText =
        document.getElementById(
            "progressText"
        );


    const portalReceiptsBody =
        document.getElementById(
            "portalReceiptsBody"
        );

    const noProjectReceipts =
        document.getElementById(
            "noProjectReceipts"
        );


    /* =====================================================
       MONEY
       ===================================================== */

    function formatMoney(value) {

        return "₱" +
            Number(value || 0)
                .toLocaleString(
                    "en-PH",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                );

    }


    /* =====================================================
       RECEIPTS
       ===================================================== */

    function getReceipts() {

        try {

            return JSON.parse(
                localStorage.getItem(
                    "architecturalReceipts"
                )
            ) || [];

        }
        catch (error) {

            console.error(error);

            return [];

        }

    }


    function getProjectReceipts() {

        const receipts =
            getReceipts();


        return receipts.filter(
            function (receipt) {

                return (
                    String(
                        receipt.projectId || ""
                    )
                    .trim()
                    .toLowerCase()
                    ===
                    String(projectId)
                        .trim()
                        .toLowerCase()
                );

            }
        );

    }


    /* =====================================================
       PROJECT INFORMATION
       ===================================================== */

    function loadProjectInformation() {

        const receipts =
            getProjectReceipts();


        portalProjectId.textContent =
            projectId;

        infoProjectId.textContent =
            projectId;


        if (receipts.length === 0) {

            portalProjectName.textContent =
                "No project record yet";

            portalClient.textContent =
                "No client record yet";

            portalLocation.textContent =
                "No location record yet";

            infoProjectName.textContent =
                "No project record yet";

            infoClient.textContent =
                "No client record yet";

            infoLocation.textContent =
                "No location record yet";

            infoStartDate.textContent =
                "—";

            infoCompletion.textContent =
                "—";

            return;

        }


        const latest =
            receipts[receipts.length - 1];


        portalProjectName.textContent =
            latest.projectName ||
            "Unnamed Project";


        portalClient.textContent =
            latest.clientName ||
            "No Client";


        portalLocation.textContent =
            latest.location ||
            "No Location";


        infoProjectName.textContent =
            latest.projectName ||
            "Unnamed Project";


        infoClient.textContent =
            latest.clientName ||
            "No Client";


        infoLocation.textContent =
            latest.location ||
            "No Location";


        infoStartDate.textContent =
            latest.date ||
            "—";

    }


    /* =====================================================
       BILLING
       ===================================================== */

    function loadBilling() {

        const receipts =
            getProjectReceipts();


        let total = 0;


        receipts.forEach(
            function (receipt) {

                total +=
                    Number(
                        receipt.total
                    ) || 0;

            }
        );


        projectBilling.textContent =
            formatMoney(total);


        document.getElementById(
            "billingSummary"
        ).textContent =
            formatMoney(total);


        receiptCount.textContent =
            receipts.length;


        renderReceiptTable(
            receipts
        );

    }


    /* =====================================================
       RECEIPT TABLE
       ===================================================== */

    function renderReceiptTable(
        receipts
    ) {

        portalReceiptsBody.innerHTML =
            "";


        if (receipts.length === 0) {

            noProjectReceipts.style.display =
                "block";

            return;

        }


        noProjectReceipts.style.display =
            "none";


        receipts
            .slice()
            .reverse()
            .forEach(
                function (receipt) {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>
                            ${escapeHTML(
                                receipt.receiptNo
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                receipt.date
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                receipt.clientName
                            )}
                        </td>

                        <td>
                            <strong>
                                ${formatMoney(
                                    receipt.total
                                )}
                            </strong>
                        </td>

                        <td>

                            <button
                                type="button"
                                class="portal-receipt-btn"
                                data-id="${receipt.id}"
                            >
                                OPEN
                            </button>

                        </td>

                    `;


                    portalReceiptsBody.appendChild(
                        row
                    );

                }
            );

    }


    /* =====================================================
       RECEIPT OPEN
       ===================================================== */

    portalReceiptsBody.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".portal-receipt-btn"
                );


            if (!button) {
                return;
            }


            const receiptId =
                Number(button.dataset.id);


            localStorage.setItem(
                "architecturalProjectId",
                projectId
            );


            window.location.href =
                "index.html?projectId=" +
                encodeURIComponent(
                    projectId
                ) +
                "#receipt-" +
                receiptId;

        }
    );


    /* =====================================================
       PROJECT STATUS STORAGE
       ===================================================== */

    function getProjectStatuses() {

        try {

            return JSON.parse(
                localStorage.getItem(
                    "architecturalProjectStatuses"
                )
            ) || {};

        }
        catch (error) {

            return {};

        }

    }


    function saveProjectStatuses(
        statuses
    ) {

        localStorage.setItem(
            "architecturalProjectStatuses",
            JSON.stringify(statuses)
        );

    }


    function loadProjectStatus() {

        const statuses =
            getProjectStatuses();


        const saved =
            statuses[projectId];


        if (!saved) {

            updateProgressUI(0);

            return;

        }


        statusSelect.value =
            saved.status ||
            "Planning";


        progressRange.value =
            Number(
                saved.progress
            ) || 0;


        updateProgressUI(
            progressRange.value
        );

    }


    /* =====================================================
       PROGRESS
       ===================================================== */

    function updateProgressUI(
        value
    ) {

        const progress =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(value) || 0
                )
            );


        progressRange.value =
            progress;


        progressText.textContent =
            progress + "%";


        projectProgress.textContent =
            progress + "%";


        progressBar.style.width =
            progress + "%";

    }


    progressRange.addEventListener(
        "input",
        function () {

            updateProgressUI(
                progressRange.value
            );

        }
    );


    document
        .getElementById(
            "saveProjectStatus"
        )
        .addEventListener(
            "click",
            function () {

                const statuses =
                    getProjectStatuses();


                statuses[projectId] = {

                    status:
                        statusSelect.value,

                    progress:
                        Number(
                            progressRange.value
                        ),

                    updatedAt:
                        new Date()
                            .toISOString()

                };


                saveProjectStatuses(
                    statuses
                );


                updateProgressUI(
                    progressRange.value
                );


                alert(
                    "Project status saved successfully."
                );

            }
        );


    /* =====================================================
       PROJECT FILE COUNT
       ===================================================== */

    function updateFileCount() {

        if (
            !window.indexedDB
        ) {

            document.getElementById(
                "fileCount"
            ).textContent = "0";

            return;

        }


        const request =
            indexedDB.open(
                "ArchitecturalProjectDB",
                1
            );


        request.onsuccess =
            function () {

                const db =
                    request.result;


                if (
                    !db.objectStoreNames.contains(
                        "files"
                    )
                ) {

                    document.getElementById(
                        "fileCount"
                    ).textContent = "0";

                    db.close();

                    return;

                }


                const transaction =
                    db.transaction(
                        "files",
                        "readonly"
                    );


                const store =
                    transaction.objectStore(
                        "files"
                    );


                const getAll =
                    store.getAll();


                getAll.onsuccess =
                    function () {

                        const files =
                            getAll.result || [];


                        const count =
                            files.filter(
                                function (file) {

                                    return (
                                        String(
                                            file.projectId || ""
                                        )
                                        .trim()
                                        .toLowerCase()
                                        ===
                                        String(projectId)
                                            .trim()
                                            .toLowerCase()
                                    );

                                }
                            ).length;


                        document.getElementById(
                            "fileCount"
                        ).textContent =
                            count;


                        db.close();

                    };


                getAll.onerror =
                    function () {

                        document.getElementById(
                            "fileCount"
                        ).textContent =
                            "0";

                        db.close();

                    };

            };


        request.onerror =
            function () {

                document.getElementById(
                    "fileCount"
                ).textContent =
                    "0";

            };

    }


    /* =====================================================
       NAVIGATION
       ===================================================== */

    document
        .getElementById("backReceipt")
        .addEventListener(
            "click",
            function () {

                window.location.href =
                    "index.html?projectId=" +
                    encodeURIComponent(
                        projectId
                    );

            }
        );


    function openFiles() {

        localStorage.setItem(
            "architecturalProjectId",
            projectId
        );


        window.location.href =
            "project-files.html?projectId=" +
            encodeURIComponent(
                projectId
            );

    }


    document
        .getElementById("projectFiles")
        .addEventListener(
            "click",
            openFiles
        );


    document
        .getElementById("openFilesCard")
        .addEventListener(
            "click",
            openFiles
        );


    document
        .getElementById("newReceiptCard")
        .addEventListener(
            "click",
            function () {

                window.location.href =
                    "index.html?projectId=" +
                    encodeURIComponent(
                        projectId
                    );

            }
        );


    document
        .getElementById("viewReceiptsCard")
        .addEventListener(
            "click",
            function () {

                document
                    .getElementById(
                        "portalReceiptsBody"
                    )
                    .scrollIntoView({
                        behavior: "smooth"
                    });

            }
        );


    document
        .getElementById("printSummaryCard")
        .addEventListener(
            "click",
            function () {

                window.print();

            }
        );


    /* =====================================================
       ESCAPE
       ===================================================== */

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }


        return String(value)
            .replace(/&/g,"&amp;")
            .replace(/</g,"&lt;")
            .replace(/>/g,"&gt;")
            .replace(/"/g,"&quot;")
            .replace(/'/g,"&#039;");

    }


    /* =====================================================
       INITIALIZE
       ===================================================== */

    loadProjectInformation();

    loadBilling();

    loadProjectStatus();

    updateFileCount();

});