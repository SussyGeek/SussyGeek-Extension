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
                if (isStudenetList)
                    this.#bootstrapStudentList();
                else if (this.#isProblemPage)
                    this.#bootstrapProblemUtils();
            }, 3000);
        }

    }

    // ── Script Injection ───────────────────────────

    #injectInterceptor() {
        const script = document.createElement("script");
        script.src = browser.runtime.getURL("inject.js");

        (document.head || document.documentElement).appendChild(script);
        script.onload = () => script.remove();
    }

    // ── Message Listener ───────────────────────────

    #interceptData() {
        window.addEventListener("message", (event) => {
            if (event.source !== window) return;
            if (!["GFG_STUDENTS", "GFG_PROBLEM"].includes(event.data?.type)) return;

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
    #bootstrapStudentList() {
        const sections = document.querySelectorAll(
            '[class^="params_head_rightside--otherSections"]'
        );

        if (sections.length === 0) return;

        this.#parentSection = sections[0];
        this.#tableBuilder = new TableBuilder(this.#parentSection);

        this.#tableBuilder.render(this.#studentData);
        if (this.#studentData) {
            this.#searchBar.setContext(
                this.#studentData.results,
                this.#instituteId,
                this.#tableBuilder
            );
        }
        this.#searchBar.mount();
    }

    #bootstrapProblemUtils() {
        const utilsContainer = document.querySelectorAll(
            '[class^="problems_add_notes_action_container"]'
        )[0];

        if (!utilsContainer) return;

        new BookmarkBtn(utilsContainer, () => this.#problemData);
        new NoteBtn(utilsContainer, () => this.#problemData);
    }
}

new ContentCoordinator();