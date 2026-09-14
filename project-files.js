/* =========================================================
   ARCHGEN PROJECT FILE PORTAL
   PROJECT ID BASED INDEXEDDB SYSTEM
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* =================================================
           DATABASE
           ================================================= */

        const DB_NAME =
            "ArchitecturalProjectDB";

        const DB_VERSION = 1;

        const STORE_NAME =
            "files";


        let db = null;

        let files = [];

        let currentFilter = "all";

        let viewerIndex = 0;

        let viewerFiles = [];


        /* =================================================
           DOM
           ================================================= */

        const fileInput =
            document.getElementById(
                "fileInput"
            );

        const fileGrid =
            document.getElementById(
                "fileGrid"
            );

        const emptyState =
            document.getElementById(
                "emptyState"
            );

        const fileCount =
            document.getElementById(
                "fileCount"
            );

        const projectIdInput =
            document.getElementById(
                "projectId"
            );

        const clearAllButton =
            document.getElementById(
                "clearAll"
            );


        const viewer =
            document.getElementById(
                "viewer"
            );

        const viewerStage =
            document.getElementById(
                "viewerStage"
            );

        const viewerTitle =
            document.getElementById(
                "viewerTitle"
            );

        const viewerCategory =
            document.getElementById(
                "viewerCategory"
            );

        const viewerInfo =
            document.getElementById(
                "viewerInfo"
            );

        const viewerPosition =
            document.getElementById(
                "viewerPosition"
            );

        const closeViewer =
            document.getElementById(
                "closeViewer"
            );

        const prevFile =
            document.getElementById(
                "prevFile"
            );

        const nextFile =
            document.getElementById(
                "nextFile"
            );

        const downloadFile =
            document.getElementById(
                "downloadFile"
            );


        /* =================================================
           PROJECT ID
           ================================================= */

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

            projectIdInput.value =
                projectId;

            localStorage.setItem(
                "architecturalProjectId",
                projectId
            );

        }


        projectIdInput.addEventListener(
            "change",
            function () {

                const value =
                    projectIdInput.value.trim();


                if (!value) {

                    alert(
                        "Please enter a valid Project ID."
                    );

                    return;
                }


                projectId = value;


                localStorage.setItem(
                    "architecturalProjectId",
                    projectId
                );


                loadFiles();

            }
        );


        /* =================================================
           DATABASE OPEN
           ================================================= */

        function openDatabase() {

            return new Promise(
                function (resolve, reject) {

                    const request =
                        indexedDB.open(
                            DB_NAME,
                            DB_VERSION
                        );


                    request.onupgradeneeded =
                        function (event) {

                            const database =
                                event.target.result;


                            if (
                                !database.objectStoreNames
                                    .contains(
                                        STORE_NAME
                                    )
                            ) {

                                const store =
                                    database.createObjectStore(
                                        STORE_NAME,
                                        {
                                            keyPath:
                                                "id",
                                            autoIncrement:
                                                true
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


                    request.onsuccess =
                        function () {

                            db =
                                request.result;

                            resolve(db);

                        };


                    request.onerror =
                        function () {

                            reject(
                                request.error
                            );

                        };

                }
            );

        }


        /* =================================================
           ADD FILE
           ================================================= */

        function addFileToDatabase(
            fileData
        ) {

            return new Promise(
                function (resolve, reject) {

                    const transaction =
                        db.transaction(
                            STORE_NAME,
                            "readwrite"
                        );


                    const store =
                        transaction.objectStore(
                            STORE_NAME
                        );


                    const request =
                        store.add(
                            fileData
                        );


                    request.onsuccess =
                        function () {

                            resolve(
                                request.result
                            );

                        };


                    request.onerror =
                        function () {

                            reject(
                                request.error
                            );

                        };

                }
            );

        }


        /* =================================================
           GET ALL FILES
           ================================================= */

        function getAllFilesFromDatabase() {

            return new Promise(
                function (resolve, reject) {

                    const transaction =
                        db.transaction(
                            STORE_NAME,
                            "readonly"
                        );


                    const store =
                        transaction.objectStore(
                            STORE_NAME
                        );


                    const request =
                        store.getAll();


                    request.onsuccess =
                        function () {

                            resolve(
                                request.result || []
                            );

                        };


                    request.onerror =
                        function () {

                            reject(
                                request.error
                            );

                        };

                }
            );

        }


        /* =================================================
           DELETE
           ================================================= */

        function deleteFileFromDatabase(
            id
        ) {

            return new Promise(
                function (resolve, reject) {

                    const transaction =
                        db.transaction(
                            STORE_NAME,
                            "readwrite"
                        );


                    const store =
                        transaction.objectStore(
                            STORE_NAME
                        );


                    const request =
                        store.delete(
                            Number(id)
                        );


                    request.onsuccess =
                        function () {
                            resolve();
                        };


                    request.onerror =
                        function () {

                            reject(
                                request.error
                            );

                        };

                }
            );

        }


        /* =================================================
           CLEAR CURRENT PROJECT ONLY
           ================================================= */

        async function clearCurrentProject() {

            const allFiles =
                await getAllFilesFromDatabase();


            const projectFiles =
                allFiles.filter(
                    function (file) {

                        return sameProject(
                            file.projectId,
                            projectId
                        );

                    }
                );


            for (
                const file
                of projectFiles
            ) {

                await deleteFileFromDatabase(
                    file.id
                );

            }

        }


        /* =================================================
           PROJECT COMPARISON
           ================================================= */

        function sameProject(
            first,
            second
        ) {

            return (
                String(first || "")
                    .trim()
                    .toLowerCase()
                ===
                String(second || "")
                    .trim()
                    .toLowerCase()
            );

        }


        /* =================================================
           FORMAT SIZE
           ================================================= */

        function formatSize(
            bytes
        ) {

            if (!bytes) {
                return "0 B";
            }


            const units =
                [
                    "B",
                    "KB",
                    "MB",
                    "GB"
                ];


            let size =
                bytes;

            let index = 0;


            while (
                size >= 1024 &&
                index <
                    units.length - 1
            ) {

                size /= 1024;
                index++;

            }


            return (
                size.toFixed(
                    index === 0 ? 0 : 2
                ) +
                " " +
                units[index]
            );

        }


        /* =================================================
           CATEGORY
           ================================================= */

        function getCategory(
            file
        ) {

            const name =
                file.name.toLowerCase();


            if (
                /floor|plan|layout|blueprint/
                    .test(name)
            ) {
                return "floor-plan";
            }


            if (
                /sketch|concept|drawing/
                    .test(name)
            ) {
                return "sketch";
            }


            if (
                /render|perspective|visualization|3d/
                    .test(name)
            ) {
                return "rendered";
            }


            if (
                /presentation|present|slide|ppt/
                    .test(name)
            ) {
                return "presentation";
            }


            return "document";

        }


        function categoryLabel(
            category
        ) {

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


            return (
                labels[category] ||
                "DOCUMENT"
            );

        }


        /* =================================================
           EXTENSION
           ================================================= */

        function extension(
            name
        ) {

            const parts =
                String(name)
                    .split(".");


            if (
                parts.length < 2
            ) {
                return "FILE";
            }


            return parts
                .pop()
                .toUpperCase();

        }


        /* =================================================
           IMAGE / PDF
           ================================================= */

        function isImage(
            file
        ) {

            return (
                String(file.type || "")
                    .startsWith("image/")
                ||
                /\.(jpg|jpeg|png|webp|gif)$/i
                    .test(file.name)
            );

        }


        function isPDF(
            file
        ) {

            return (
                file.type ===
                    "application/pdf"
                ||
                /\.pdf$/i
                    .test(file.name)
            );

        }


        /* =================================================
           ESCAPE
           ================================================= */

        function escapeHTML(
            value
        ) {

            if (
                value === null ||
                value === undefined
            ) {
                return "";
            }


            return String(value)
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );

        }


        /* =================================================
           RENDER
           ================================================= */

        function renderFiles() {

            fileGrid.innerHTML =
                "";


            const filtered =
                files.filter(
                    function (file) {

                        return (
                            currentFilter ===
                                "all"
                            ||
                            file.category ===
                                currentFilter
                        );

                    }
                );


            fileCount.textContent =
                files.length +
                (
                    files.length === 1
                        ? " file"
                        : " files"
                );


            if (
                filtered.length === 0
            ) {

                emptyState.style.display =
                    "block";

            }
            else {

                emptyState.style.display =
                    "none";

            }


            filtered.forEach(
                function (file) {

                    const card =
                        document.createElement(
                            "article"
                        );


                    card.className =
                        "file-card";


                    const preview =
                        document.createElement(
                            "div"
                        );


                    preview.className =
                        "preview";


                    if (
                        isImage(file)
                    ) {

                        const image =
                            document.createElement(
                                "img"
                            );


                        image.src =
                            URL.createObjectURL(
                                file.file
                            );


                        image.alt =
                            file.name;


                        preview.appendChild(
                            image
                        );

                    }
                    else {

                        const type =
                            document.createElement(
                                "div"
                            );


                        type.className =
                            "file-type";


                        type.textContent =
                            extension(
                                file.name
                            );


                        preview.appendChild(
                            type
                        );

                    }


                    preview.dataset.id =
                        file.id;


                    const body =
                        document.createElement(
                            "div"
                        );


                    body.className =
                        "file-card-body";


                    body.innerHTML = `

                        <span class="file-category">
                            ${categoryLabel(
                                file.category
                            )}
                        </span>

                        <h3 class="file-name">
                            ${escapeHTML(
                                file.name
                            )}
                        </h3>

                        <div class="file-meta">
                            ${formatSize(
                                file.size
                            )}
                            ·
                            ${escapeHTML(
                                file.projectId
                            )}
                        </div>

                        <div class="card-actions">

                            <button
                                type="button"
                                data-action="view"
                                data-id="${file.id}"
                            >
                                VIEW
                            </button>

                            <button
                                type="button"
                                data-action="download"
                                data-id="${file.id}"
                            >
                                DOWNLOAD
                            </button>

                            <button
                                type="button"
                                data-action="delete"
                                data-id="${file.id}"
                            >
                                DELETE
                            </button>

                        </div>

                    `;


                    card.appendChild(
                        preview
                    );

                    card.appendChild(
                        body
                    );


                    fileGrid.appendChild(
                        card
                    );

                }
            );

        }


        /* =================================================
           LOAD FILES FOR CURRENT PROJECT
           ================================================= */

        async function loadFiles() {

            if (!projectId) {

                files = [];

                renderFiles();

                return;

            }


            try {

                const allFiles =
                    await getAllFilesFromDatabase();


                files =
                    allFiles.filter(
                        function (file) {

                            return sameProject(
                                file.projectId,
                                projectId
                            );

                        }
                    );


                files.sort(
                    function (a,b) {

                        return (
                            Number(b.id) -
                            Number(a.id)
                        );

                    }
                );


                renderFiles();

            }
            catch (error) {

                console.error(
                    "Could not load files:",
                    error
                );

                alert(
                    "Unable to load project files."
                );

            }

        }


        /* =================================================
           FILE UPLOAD
           ================================================= */

        fileInput.addEventListener(
            "change",
            async function () {

                if (!projectId) {

                    alert(
                        "Please enter a Project ID first."
                    );

                    fileInput.value =
                        "";

                    return;

                }


                const selectedFiles =
                    Array.from(
                        fileInput.files
                    );


                if (
                    selectedFiles.length === 0
                ) {
                    return;
                }


                const allowedExtensions =
                    /\.(jpg|jpeg|png|webp|gif|pdf|ppt|pptx|doc|docx)$/i;


                let added = 0;


                for (
                    const file
                    of selectedFiles
                ) {

                    if (
                        !allowedExtensions
                            .test(file.name)
                    ) {

                        alert(
                            "Unsupported file:\n" +
                            file.name
                        );

                        continue;

                    }


                    try {

                        await addFileToDatabase({

                            name:
                                file.name,

                            type:
                                file.type,

                            size:
                                file.size,

                            category:
                                getCategory(file),

                            projectId:
                                projectId,

                            date:
                                new Date()
                                    .toISOString(),

                            file:
                                file

                        });


                        added++;

                    }
                    catch (error) {

                        console.error(
                            error
                        );

                        alert(
                            "Could not save:\n" +
                            file.name
                        );

                    }

                }


                fileInput.value =
                    "";


                await loadFiles();


                if (added > 0) {

                    alert(
                        added +
                        (
                            added === 1
                                ? " file"
                                : " files"
                        ) +
                        " added to Project " +
                        projectId +
                        "."
                    );

                }

            }
        );


        /* =================================================
           CARD ACTIONS
           ================================================= */

        fileGrid.addEventListener(
            "click",
            async function (event) {

                const actionButton =
                    event.target.closest(
                        "[data-action]"
                    );


                const preview =
                    event.target.closest(
                        ".preview"
                    );


                if (actionButton) {

                    const id =
                        Number(
                            actionButton.dataset.id
                        );


                    const action =
                        actionButton.dataset.action;


                    if (
                        action === "view"
                    ) {

                        openViewer(id);

                    }


                    if (
                        action === "download"
                    ) {

                        downloadStoredFile(
                            id
                        );

                    }


                    if (
                        action === "delete"
                    ) {

                        await deleteFile(
                            id
                        );

                    }


                    return;

                }


                if (preview) {

                    openViewer(
                        Number(
                            preview.dataset.id
                        )
                    );

                }

            }
        );


        /* =================================================
           DELETE
           ================================================= */

        async function deleteFile(
            id
        ) {

            const file =
                files.find(
                    function (item) {

                        return (
                            Number(item.id) ===
                            Number(id)
                        );

                    }
                );


            if (!file) {
                return;
            }


            const confirmed =
                confirm(
                    "Delete " +
                    file.name +
                    "?"
                );


            if (!confirmed) {
                return;
            }


            try {

                await deleteFileFromDatabase(
                    id
                );


                await loadFiles();

            }
            catch (error) {

                console.error(
                    error
                );

                alert(
                    "Unable to delete the file."
                );

            }

        }


        /* =================================================
           CLEAR PROJECT
           ================================================= */

        clearAllButton.addEventListener(
            "click",
            async function () {

                if (!projectId) {

                    alert(
                        "No Project ID selected."
                    );

                    return;

                }


                if (
                    files.length === 0
                ) {

                    alert(
                        "This project has no files."
                    );

                    return;

                }


                const confirmed =
                    confirm(
                        "Delete ALL files belonging to Project " +
                        projectId +
                        "?"
                    );


                if (!confirmed) {
                    return;
                }


                try {

                    await clearCurrentProject();

                    await loadFiles();


                    alert(
                        "All files for Project " +
                        projectId +
                        " have been deleted."
                    );

                }
                catch (error) {

                    console.error(
                        error
                    );

                    alert(
                        "Unable to clear this project's files."
                    );

                }

            }
        );


        /* =================================================
           FILTERS
           ================================================= */

        document
            .querySelectorAll(
                ".filter"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            document
                                .querySelectorAll(
                                    ".filter"
                                )
                                .forEach(
                                    function (item) {

                                        item.classList
                                            .remove(
                                                "active"
                                            );

                                    }
                                );


                            button.classList.add(
                                "active"
                            );


                            currentFilter =
                                button.dataset.filter;


                            renderFiles();

                        }
                    );

                }
            );


        /* =================================================
           VIEWER
           ================================================= */

        function openViewer(
            id
        ) {

            viewerFiles =
                files.filter(
                    function (file) {

                        return (
                            currentFilter ===
                                "all"
                            ||
                            file.category ===
                                currentFilter
                        );

                    }
                );


            viewerIndex =
                viewerFiles.findIndex(
                    function (file) {

                        return (
                            Number(file.id) ===
                            Number(id)
                        );

                    }
                );


            if (
                viewerIndex < 0
            ) {
                return;
            }


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


            showViewerFile();

        }


        function showViewerFile() {

            const file =
                viewerFiles[
                    viewerIndex
                ];


            if (!file) {
                return;
            }


            viewerTitle.textContent =
                file.name;


            viewerCategory.textContent =
                categoryLabel(
                    file.category
                );


            viewerInfo.textContent =
                formatSize(file.size) +
                " · Project " +
                file.projectId;


            viewerPosition.textContent =
                (
                    viewerIndex + 1
                ) +
                " / " +
                viewerFiles.length;


            viewerStage.innerHTML =
                "";


            if (
                isImage(file)
            ) {

                const image =
                    document.createElement(
                        "img"
                    );


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
            else if (
                isPDF(file)
            ) {

                const iframe =
                    document.createElement(
                        "iframe"
                    );


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

                const unsupported =
                    document.createElement(
                        "div"
                    );


                unsupported.className =
                    "unsupported";


                unsupported.innerHTML = `

                    <i class="fa-solid fa-file"></i>

                    <h2>
                        ${escapeHTML(
                            extension(
                                file.name
                            )
                        )} FILE
                    </h2>

                    <p>
                        This file type cannot be
                        previewed directly in the browser.
                    </p>

                    <button
                        type="button"
                        id="viewerDownloadFallback"
                        style="
                            margin-top:20px;
                            padding:12px 18px;
                            color:white;
                            background:black;
                            border:2px solid white;
                            cursor:pointer;
                        "
                    >
                        Download File
                    </button>

                `;


                viewerStage.appendChild(
                    unsupported
                );


                document
                    .getElementById(
                        "viewerDownloadFallback"
                    )
                    .addEventListener(
                        "click",
                        function () {

                            downloadStoredFile(
                                file.id
                            );

                        }
                    );

            }

        }


        /* =================================================
           NAVIGATION
           ================================================= */

        function navigate(
            direction
        ) {

            if (
                viewerFiles.length === 0
            ) {
                return;
            }


            viewerIndex +=
                direction;


            if (
                viewerIndex < 0
            ) {

                viewerIndex =
                    viewerFiles.length - 1;

            }


            if (
                viewerIndex >=
                viewerFiles.length
            ) {

                viewerIndex = 0;

            }


            showViewerFile();

        }


        prevFile.addEventListener(
            "click",
            function () {
                navigate(-1);
            }
        );


        nextFile.addEventListener(
            "click",
            function () {
                navigate(1);
            }
        );


        /* =================================================
           CLOSE VIEWER
           ================================================= */

        function closeViewerFunction() {

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


            viewerStage.innerHTML =
                "";

        }


        closeViewer.addEventListener(
            "click",
            closeViewerFunction
        );


        viewer.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    viewer
                ) {

                    closeViewerFunction();

                }

            }
        );


        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    !viewer.classList.contains(
                        "show"
                    )
                ) {
                    return;
                }


                if (
                    event.key ===
                    "Escape"
                ) {

                    closeViewerFunction();

                }


                if (
                    event.key ===
                    "ArrowLeft"
                ) {

                    navigate(-1);

                }


                if (
                    event.key ===
                    "ArrowRight"
                ) {

                    navigate(1);

                }

            }
        );


        /* =================================================
           DOWNLOAD
           ================================================= */

        async function downloadStoredFile(
            id
        ) {

            let file =
                files.find(
                    function (item) {

                        return (
                            Number(item.id) ===
                            Number(id)
                        );

                    }
                );


            if (!file) {

                const allFiles =
                    await getAllFilesFromDatabase();


                file =
                    allFiles.find(
                        function (item) {

                            return (
                                Number(item.id) ===
                                Number(id)
                            );

                        }
                    );

            }


            if (!file) {

                alert(
                    "File not found."
                );

                return;

            }


            try {

                const blob =
                    file.file instanceof Blob
                        ? file.file
                        : new Blob(
                            [file.file],
                            {
                                type:
                                    file.type ||
                                    "application/octet-stream"
                            }
                        );


                const url =
                    URL.createObjectURL(
                        blob
                    );


                const anchor =
                    document.createElement(
                        "a"
                    );


                anchor.href =
                    url;

                anchor.download =
                    file.name;


                document.body.appendChild(
                    anchor
                );


                anchor.click();


                anchor.remove();


                setTimeout(
                    function () {

                        URL.revokeObjectURL(
                            url
                        );

                    },
                    1000
                );

            }
            catch (error) {

                console.error(
                    error
                );

                alert(
                    "Unable to download this file."
                );

            }

        }


        downloadFile.addEventListener(
            "click",
            function () {

                const file =
                    viewerFiles[
                        viewerIndex
                    ];


                if (file) {

                    downloadStoredFile(
                        file.id
                    );

                }

            }
        );


        /* =================================================
           BACK TO PORTAL
           ================================================= */

        window.goToProjectPortal =
            function () {

                localStorage.setItem(
                    "architecturalProjectId",
                    projectId
                );


                window.location.href =
                    "project-portal.html?projectId=" +
                    encodeURIComponent(
                        projectId
                    );

            };


        /* =================================================
           INITIALIZE
           ================================================= */

        async function initialize() {

            try {

                await openDatabase();

                await loadFiles();

            }
            catch (error) {

                console.error(
                    "Database error:",
                    error
                );

                alert(
                    "Unable to initialize the Project File Library."
                );

            }

        }


        initialize();

    }
);
