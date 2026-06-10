/**
 * ContentCoordinator — Thin orchestrator for the extension.
 *
 * Responsibilities:
 *   • Inject the page-level intercept script (inject.js)
 *   • Listen for intercepted student data via postMessage
 *   • Locate the mount-point and delegate rendering to TableBuilder
 */
class ContentCoordinator {

    /** @type {Object|null} */
    #studentData = null;

    /** @type {Object|null} */
    #problemData = null;

    /** @type {string|null} */
    #instituteId = null;

    /** @type {HTMLElement|null} */
    #parentSection = null;

    /** @type {TableBuilder|null} */
    #tableBuilder = null;

    /** @type {SearchBar} */
    #searchBar = new SearchBar();

    /** @type {Boolean} */
    instituteAvailable = true;

    /** @type {Boolean} */
    #isProblemPage = false;

    constructor() {
        const locationPath = window.location.pathname;
        const isStudenetList = locationPath.startsWith("/colleges/") && locationPath.includes("/students");
        this.#isProblemPage = locationPath.includes("/problems/");

        if (isStudenetList || this.#isProblemPage) {
            this.#injectInterceptor();
            this.#interceptData();

            // Allocated time for site to load.
            setTimeout(() => {
                if (isStudenetList && this.instituteAvailable)
                    this.#bootstrapStudentList();
                else if (isStudenetList && !this.instituteAvailable)
                    this.#bootstrapContributionBanner();
                else if (this.#isProblemPage)
                    this.#bootstrapProblemUtils();
            }, 3000);
        }

    }

    // ── Script Injection ───────────────────────────

    #injectInterceptor() {
        const serviceScript = document.createElement("script");
        serviceScript.src = browser.runtime.getURL("services/backend.service.js");
        serviceScript.async = false; // Execute in order of insertion

        const injectScript = document.createElement("script");
        injectScript.src = browser.runtime.getURL("inject.js");
        injectScript.async = false;

        const target = document.head || document.documentElement;
        target.appendChild(serviceScript);
        target.appendChild(injectScript);

        serviceScript.onload = () => serviceScript.remove();
        injectScript.onload = () => injectScript.remove();
    }

    #resetSpacing() {
        const timerNode = document.querySelector('[class^="problems_add_notes_action_container"]').childNodes[0];
        timerNode.style.gridGap = "0px";
    }

    // ── Message Listener ───────────────────────────

    #interceptData() {
        window.addEventListener("message", (event) => {
            if (event.source !== window) return;
            if (!["GFG_STUDENTS", "GFG_PROBLEM", "GFG_INSTITUTE_UNAVAILABLE"].includes(event.data?.type)) return;

            switch (event.data?.type) {
                case "GFG_STUDENTS":
                    this.#studentData = event.data.payload;
                    this.#instituteId = event.data.instituteId;

                    if (this.#tableBuilder) {
                        this.#tableBuilder.render(this.#studentData);
                        this.#searchBar.setContext(
                            this.#studentData.results,
                            event.data.instituteId,
                            this.#tableBuilder
                        );
                        this.#searchBar.mount();
                    }
                    break;
                case "GFG_PROBLEM":
                    this.#problemData = event.data.payload;
                    break;
                case "GFG_INSTITUTE_UNAVAILABLE":
                    this.instituteAvailable = false;
                    break;
                default:
                    console.log("No cases matched"); // TODO: Remove this.
            }
        });
    }

    // ── Bootstrap methods ──────────────────────────────────

    /**
     * Locate the target section and kick off the first render.
     * Called once after the initial SPA paint delay.
     */
    async #bootstrapStudentList() {
        const sections = document.querySelectorAll(
            '[class^="params_head_rightside--otherSections"]'
        );

        if (sections.length === 0) return;

        this.#parentSection = sections[0];
        this.#tableBuilder = new TableBuilder(this.#parentSection);

        this.#tableBuilder.render(this.#studentData);
        
        const { sussygeek_settings = {} } = await chrome.storage.local.get("sussygeek_settings");
        const fullNameSearchEnabled = sussygeek_settings.fullNameSearch ?? true;

        if (fullNameSearchEnabled && this.#studentData) {
            this.#searchBar.setContext(
                this.#studentData.results,
                this.#instituteId,
                this.#tableBuilder
            );
            this.#searchBar.mount();
        }
    }

    #bootstrapContributionBanner() {
        const headerContainers = document.querySelectorAll(
            '[class^="CollegeStudentsTab_head_header"]'
        );

        if (headerContainers.length === 0) return;

        const container = headerContainers[0];
        const banner = new ContributionBanner(container);
        banner.mount();
    }

    async #bootstrapProblemUtils() {
        const utilsContainer = document.querySelectorAll(
            '[class^="problems_add_notes_action_container"]'
        )[0];

        if (!utilsContainer) return;

        const { sussygeek_settings = {} } = await chrome.storage.local.get("sussygeek_settings");
        const bookmarksEnabled = sussygeek_settings.bookmarks ?? true;
        const notesEnabled = sussygeek_settings.notes ?? true;

        if (bookmarksEnabled) {
            new BookmarkBtn(utilsContainer, () => this.#problemData);
        }
        if (notesEnabled) {
            new NoteBtn(utilsContainer, () => this.#problemData);
        }
        this.#resetSpacing();
    }
}

new ContentCoordinator();