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

    /** @type {string|null} */
    #instituteId = null;

    /** @type {HTMLElement|null} */
    #parentSection = null;

    /** @type {TableBuilder|null} */
    #tableBuilder = null;

    /** @type {SearchBar} */
    #searchBar = new SearchBar();

    constructor() {

        const locationPath = window.location.pathname;
        const isStudenetList = locationPath.startsWith("/colleges/") && locationPath.includes("/students");

        if (isStudenetList) {
            this.#injectInterceptor();
            this.#interceptStudentData();

            // Allocated time for site to load.
            setTimeout(() => this.#bootstrap(), 3000);
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

    #interceptStudentData() {
        window.addEventListener("message", (event) => {
            if (event.source !== window) return;
            if (event.data?.type !== "GFG_STUDENTS") return;

            this.#studentData = event.data.payload;
            this.#instituteId = event.data.instituteId;

            // If the mount-point is already known, render immediately.
            if (this.#tableBuilder) {
                this.#tableBuilder.render(this.#studentData);
                this.#searchBar.setContext(
                    this.#studentData.results,
                    event.data.instituteId,
                    this.#tableBuilder
                );
                this.#searchBar.mount();
            }
        });
    }

    // ── Bootstrap ──────────────────────────────────

    /**
     * Locate the target section and kick off the first render.
     * Called once after the initial SPA paint delay.
     */
    #bootstrap() {
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
}

new ContentCoordinator();