/* =========================================================
   ARCHITECTURAL PROJECT FILE VIEWER
   INDEXEDDB STORAGE VERSION
   ========================================================= */

const DB_NAME = "ArchitecturalProjectDB";
const DB_VERSION = 1;
const STORE_NAME = "files";

let db = null;
let files = [];
let currentFilter = "all";
let viewerIndex = 0;

/* =========================================================
   ELEMENTS
   ========================================================= */

const fileInput = document.getElementById("fileInput");
const fileGrid = document.getElementById("fileGrid");
const emptyState = document.getElementById("emptyState");
const fileCount = document.getElementById("fileCount");
const projectIdInput = document.getElementById("projectId");
const clearAll = document.getElementById("clearAll");

const viewer = document.getElementById("viewer");
const viewerStage = document.getElementById("viewerStage");
const viewerTitle = document.getElementById("viewerTitle");
const viewerCategory = document.getElementById("viewerCategory");
const viewerInfo = document.getElementById("viewerInfo");
const viewerPosition = document.getElementById("viewerPosition");
const closeViewer = document.getElementById("closeViewer");
const prevFile = document.getElementById("prevFile");
const nextFile = document.getElementById("nextFile");
const downloadFile = document.getElementById("downloadFile");


/* =========================================================
   PROJECT ID
   ========================================================= */

projectIdInput.value =
    localStorage.getItem("architecturalProjectId") || "";

projectIdInput.addEventListener("input", () => {

    localStorage.setItem(
        "architecturalProjectId",
        projectIdInput.value.trim()
    );

});


/* =========================================================
   INDEXEDDB
   ========================================================= */

function openDatabase() {

    return new Promise((resolve, reject) => {

        const request = indexedDB.open(
            DB_NAME,
            DB_VERSION
        );

        request.onupgradeneeded = function(event) {

            const database = event.target.result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {

                const store = database.createObjectStore(
                    STORE_NAME,
                    {
                        keyPath: "id",
                        autoIncrement: true
                    }
                );

                store.createIndex(
                    "projectId",
                    "projectId",
                    {
                        unique: false
                    }
                );

                store.createIndex(
                    "category",
                    "category",
                    {
                        unique: false
                    }
                );

            }

        };


        request.onsuccess = function(event) {

            db = event.target.result;

            console.log(
                "IndexedDB connected successfully."
            );

            resolve(db);

        };


        request.onerror = function(event) {

            console.error(
                "IndexedDB error:",
                event.target.error
            );

            reject(event.target.error);

        };

    });

}


/* =========================================================
   ADD FILE TO DATABASE
   ========================================================= */

function addFileToDatabase(fileData) {

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            [STORE_NAME],
            "readwrite"
        );

        const store =
            transaction.objectStore(STORE_NAME);

        const request =
            store.add(fileData);


        request.onsuccess = function(event) {

            resolve(event.target.result);

        };


        request.onerror = function(event) {

            reject(event.target.error);

        };

    });

}


/* =========================================================
   GET ALL FILES
   ========================================================= */

function getAllFilesFromDatabase() {

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            [STORE_NAME],
            "readonly"
        );

        const store =
            transaction.objectStore(STORE_NAME);

        const request =
            store.getAll();


        request.onsuccess = function() {

            resolve(request.result);

        };


        request.onerror = function(event) {

            reject(event.target.error);

        };

    });

}


/* =========================================================
   DELETE FILE
   ========================================================= */

function deleteFileFromDatabase(id) {

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            [STORE_NAME],
            "readwrite"
        );

        const store =
            transaction.objectStore(STORE_NAME);

        const request =
            store.delete(id);


        request.onsuccess = function() {

            resolve();

        };


        request.onerror = function(event) {

            reject(event.target.error);

        };

    });

}


/* =========================================================
   CLEAR DATABASE
   ========================================================= */

function clearDatabase() {

    return new Promise((resolve, reject) => {

        const transaction = db.transaction(
            [STORE_NAME],
            "readwrite"
        );

        const store =
            transaction.objectStore(STORE_NAME);

        const request =
            store.clear();


        request.onsuccess = function() {

            resolve();

        };


        request.onerror = function(event) {

            reject(event.target.error);

        };

    });

}


/* =========================================================
   FORMAT FILE SIZE
   ========================================================= */

function formatSize(bytes) {

    if (bytes < 1024) {

        return bytes + " B";

    }

    if (bytes < 1024 * 1024) {

        return (
            (bytes / 1024).toFixed(1) +
            " KB"
        );

    }

    if (bytes < 1024 * 1024 * 1024) {

        return (
            (bytes / (1024 * 1024)).toFixed(1) +
            " MB"
        );

    }

    return (
        (bytes / (1024 * 1024 * 1024)).toFixed(2) +
        " GB"
    );

}


/* =========================================================
   CATEGORY
   ========================================================= */

function getCategory(file) {

    const name =
        file.name.toLowerCase();


    if (
        /floor|plan|layout|blueprint/.test(name)
    ) {

        return "floor-plan";

    }


    if (
        /sketch|concept|drawing/.test(name)
    ) {

        return "sketch";

    }


    if (
        /render|perspective|visualization|3d/.test(name)
    ) {

        return "rendered";

    }


    if (
        /presentation|present|slide|ppt/.test(name)
    ) {

        return "presentation";

    }


    return "document";

}


/* =========================================================
   CATEGORY LABEL
   ========================================================= */

function categoryLabel(category) {

    const labels = {

        "floor-plan":
            "FLOOR PLAN",

        "sketch":
            "SKETCH",

        "rendered":
            "RENDERED PERSPECTIVE",

        "presentation":
            "PRESENTATION",

        "document":
            "DOCUMENT"

    };


    return labels[category] ||
        "DOCUMENT";

}


/* =========================================================
   FILE EXTENSION
   ========================================================= */

function extension(name) {

    return name
        .split(".")
        .pop()
        .toUpperCase();

}


/* =========================================================
   IMAGE
   ========================================================= */

function isImage(file) {

    return (
        file.type &&
        file.type.startsWith("image/")
    );

}


/* =========================================================
   PDF
   ========================================================= */

function isPDF(file) {

    return (
        file.type === "application/pdf" ||
        file.name
            .toLowerCase()
            .endsWith(".pdf")
    );

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    return String(value || "")

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


/* =========================================================
   RENDER FILES
   ========================================================= */

function renderFiles() {

    fileGrid.innerHTML = "";


    const filtered =
        currentFilter === "all"

            ? files

            : files.filter(
                file =>
                    file.category ===
                    currentFilter
            );


    emptyState.style.display =
        filtered.length
            ? "none"
            : "block";


    fileCount.textContent =
        `${files.length} file${
            files.length === 1
                ? ""
                : "s"
        }`;


    filtered.forEach(file => {

        const card =
            document.createElement("article");

        card.className =
            "file-card";


        let preview = `
            <div class="file-type">
                ${extension(file.name)}
            </div>
        `;


        if (isImage(file)) {

            const imageURL =
                URL.createObjectURL(
                    file.file
                );


            preview = `
                <img
                    src="${imageURL}"
                    alt="${escapeHTML(file.name)}"
                >
            `;

        }


        else if (isPDF(file)) {

            preview = `
                <div class="file-type">
                    PDF
                </div>
            `;

        }


        card.innerHTML = `

            <div
                class="preview"
                data-id="${file.id}"
            >
                ${preview}
            </div>


            <div class="file-card-body">

                <span class="file-category">
                    ${categoryLabel(file.category)}
                </span>


                <h3 class="file-name">
                    ${escapeHTML(file.name)}
                </h3>


                <div class="file-meta">

                    ${formatSize(file.size)}
                    ·
                    ${escapeHTML(
                        file.projectId ||
                        "No Project ID"
                    )}

                </div>


                <div class="card-actions">

                    <button
                        type="button"
                        data-view="${file.id}"
                    >
                        VIEW
                    </button>


                    <button
                        type="button"
                        data-delete="${file.id}"
                    >
                        DELETE
                    </button>

                </div>

            </div>

        `;


        fileGrid.appendChild(card);

    });

}


/* =========================================================
   LOAD FILES
   ========================================================= */

async function loadFiles() {

    try {

        files =
            await getAllFilesFromDatabase();

        renderFiles();

    }

    catch (error) {

        console.error(error);

        alert(
            "Could not load project files."
        );

    }

}


/* =========================================================
   ADD FILES
   ========================================================= */

fileInput.addEventListener(
    "change",
    async event => {

        const selected =
            [...event.target.files];


        if (!selected.length) {
            return;
        }


        const projectId =
            projectIdInput.value.trim();


        if (!projectId) {

            alert(
                "Please enter a Project ID first."
            );

            fileInput.value = "";

            return;

        }


        const allowed = [

            "image/jpeg",

            "image/png",

            "image/webp",

            "image/gif",

            "application/pdf",

            "application/vnd.ms-powerpoint",

            "application/vnd.openxmlformats-officedocument.presentationml.presentation",

            "application/msword",

            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

        ];


        const extensionAllowed =
            /\.(jpg|jpeg|png|webp|gif|pdf|ppt|pptx|doc|docx)$/i;


        let addedCount = 0;


        for (const file of selected) {

            if (
                !allowed.includes(file.type) &&
                !extensionAllowed.test(file.name)
            ) {

                alert(
                    `${file.name} is not a supported file.`
                );

                continue;

            }


            try {

                const fileData = {

                    name: file.name,

                    type: file.type,

                    size: file.size,

                    category:
                        getCategory(file),

                    projectId:
                        projectId,

                    date:
                        new Date().toISOString(),

                    file:
                        file

                };


                await addFileToDatabase(
                    fileData
                );


                addedCount++;

            }

            catch (error) {

                console.error(error);

                alert(
                    `Could not save ${file.name}.`
                );

            }

        }


        await loadFiles();


        if (addedCount > 0) {

            console.log(
                `${addedCount} file(s) saved to IndexedDB.`
            );

        }


        fileInput.value = "";

    }
);


/* =========================================================
   FILE CARD ACTIONS
   ========================================================= */

fileGrid.addEventListener(
    "click",
    event => {

        const viewId =
            event.target.dataset.view;

        const deleteId =
            event.target.dataset.delete;

        const previewId =
            event.target
                .closest(".preview")
                ?.dataset.id;


        if (viewId) {

            openViewer(
                Number(viewId)
            );

        }

        else if (previewId) {

            openViewer(
                Number(previewId)
            );

        }

        else if (deleteId) {

            deleteFile(
                Number(deleteId)
            );

        }

    }
);


/* =========================================================
   DELETE FILE
   ========================================================= */

async function deleteFile(id) {

    const file =
        files.find(
            item => item.id === id
        );


    if (!file) {
        return;
    }


    if (
        !confirm(
            `Delete "${file.name}"?`
        )
    ) {

        return;

    }


    try {

        await deleteFileFromDatabase(id);

        await loadFiles();

    }

    catch (error) {

        console.error(error);

        alert(
            "Could not delete the file."
        );

    }

}


/* =========================================================
   CLEAR PROJECT
   ========================================================= */

clearAll.addEventListener(
    "click",
    async () => {

        const projectId =
            projectIdInput.value.trim();


        if (!files.length) {

            alert(
                "There are no saved project files."
            );

            return;

        }


        if (
            !confirm(
                `Delete all saved project files${
                    projectId
                        ? ` for ${projectId}`
                        : ""
                }?`
            )
        ) {

            return;

        }


        try {

            await clearDatabase();

            await loadFiles();

        }

        catch (error) {

            console.error(error);

            alert(
                "Could not clear project files."
            );

        }

    }
);


/* =========================================================
   FILTERS
   ========================================================= */

document
    .querySelectorAll(".filter")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".filter")
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter;


                renderFiles();

            }
        );

    });


/* =========================================================
   OPEN VIEWER
   ========================================================= */

function openViewer(id) {

    const filtered =
        currentFilter === "all"

            ? files

            : files.filter(
                file =>
                    file.category ===
                    currentFilter
            );


    const index =
        filtered.findIndex(
            file =>
                file.id === id
        );


    if (index === -1) {
        return;
    }


    viewerIndex = index;


    viewer.classList.add(
        "show"
    );


    viewer.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "viewer-open"
    );


    showViewerFile(
        filtered[viewerIndex]
    );

}


/* =========================================================
   SHOW VIEWER FILE
   ========================================================= */

function showViewerFile(file) {

    viewerTitle.textContent =
        file.name;


    viewerCategory.textContent =
        categoryLabel(
            file.category
        );


    viewerInfo.textContent =
        `${formatSize(file.size)} · Project ${file.projectId}`;


    const filtered =
        currentFilter === "all"

            ? files

            : files.filter(
                item =>
                    item.category ===
                    currentFilter
            );


    viewerPosition.textContent =
        `${viewerIndex + 1} / ${filtered.length}`;


    viewerStage.innerHTML = "";


    if (isImage(file)) {

        const image =
            document.createElement("img");


        image.src =
            URL.createObjectURL(
                file.file
            );


        image.alt =
            file.name;


        viewerStage.appendChild(
            image
        );

    }


    else if (isPDF(file)) {

        const iframe =
            document.createElement("iframe");


        iframe.src =
            URL.createObjectURL(
                file.file
            );


        iframe.title =
            file.name;


        viewerStage.appendChild(
            iframe
        );

    }


    else {

        viewerStage.innerHTML = `

            <div class="unsupported">

                <h2>
                    ${extension(file.name)}
                    FILE
                </h2>

                <p>
                    This browser viewer does not
                    render this file type directly.
                </p>

                <p>
                    You can download the original
                    presentation/document using
                    the Download button.
                </p>

            </div>

        `;

    }

}


/* =========================================================
   PREVIOUS / NEXT
   ========================================================= */

function navigate(direction) {

    const filtered =
        currentFilter === "all"

            ? files

            : files.filter(
                file =>
                    file.category ===
                    currentFilter
            );


    if (!filtered.length) {
        return;
    }


    viewerIndex =
        (
            viewerIndex +
            direction +
            filtered.length
        ) %
        filtered.length;


    showViewerFile(
        filtered[viewerIndex]
    );

}


prevFile.addEventListener(
    "click",
    () => navigate(-1)
);


nextFile.addEventListener(
    "click",
    () => navigate(1)
);


/* =========================================================
   CLOSE VIEWER
   ========================================================= */

closeViewer.addEventListener(
    "click",
    () => {

        viewer.classList.remove(
            "show"
        );


        viewer.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "viewer-open"
        );

    }
);


/* =========================================================
   KEYBOARD CONTROLS
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            !viewer.classList.contains(
                "show"
            )
        ) {

            return;

        }


        if (event.key === "Escape") {

            closeViewer.click();

        }


        if (event.key === "ArrowLeft") {

            navigate(-1);

        }


        if (event.key === "ArrowRight") {

            navigate(1);

        }

    }
);


/* =========================================================
   DOWNLOAD
   ========================================================= */

downloadFile.addEventListener(
    "click",
    () => {

        const filtered =
            currentFilter === "all"

                ? files

                : files.filter(
                    file =>
                        file.category ===
                        currentFilter
                );


        const file =
            filtered[viewerIndex];


        if (!file) {
            return;
        }


        const url =
            URL.createObjectURL(
                file.file
            );


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            file.name;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        setTimeout(() => {

            URL.revokeObjectURL(url);

        }, 1000);

    }
);


/* =========================================================
   BACK TO PROJECT RECEIPT
   ========================================================= */

function goToProjectReceipt() {

    window.location.href =
        "index.html";

}


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initialize() {

    try {

        await openDatabase();

        await loadFiles();

    }

    catch (error) {

        console.error(error);

        alert(
            "Your browser could not open IndexedDB."
        );

    }

}


initialize();