/**
 * SearchBar — Search students via backend API and swap the card grid.
 *
 * Responsibilities:
 *   • Build and mount a search input above the student grid
 *   • On query: fetch matching students from backend, rebuild cards
 *   • On clear: restore the original intercepted student cards
 *
 * DOM target:  Inserted as the first child of #sg-student-container,
 *              sitting above .sg-student-grid.
 */
const BACKEND_URL = "http://localhost:5000/api/v1"

class SearchBar {

    /** @type {HTMLElement|null} */
    #container = null;

    /** @type {HTMLInputElement|null} */
    #input = null;

    /** @type {number} */
    #debounceTimer = 0;

    /** @type {number} */
    static DEBOUNCE_MS = 600;

    /** @type {string|null} — set via setContext from ContentCoordinator */
    #instituteId = null;

    /** @type {Object[]|null} — the intercepted page students (to restore on clear) */
    #originalStudents = null;

    /** @type {TableBuilder|null} */
    #tableBuilder = null;

    // ── Public API ─────────────────────────────────

    /**
     * Provide the original students and tableBuilder reference.
     * Called by ContentCoordinator whenever new intercepted data arrives.
     * @param {Object[]} students — the intercepted results array
     * @param {string} instituteId
     * @param {TableBuilder} tableBuilder
     */
    setContext(students, instituteId, tableBuilder) {
        this.#originalStudents = students;
        this.#instituteId = instituteId;
        this.#tableBuilder = tableBuilder;
    }

    /**
     * Mount the search bar into the student container.
     * Safe to call multiple times — it will re-mount if the container
     * was rebuilt by TableBuilder.render().
     */
    mount() {
        this.#container = document.getElementById("sg-student-container");
        if (!this.#container) return;

        // Avoid duplicates if mount() is called again on the same container.
        if (this.#container.querySelector(".sg-search")) return;

        const wrapper = this.#buildSearchBar();
        this.#container.insertBefore(wrapper, this.#container.firstChild);
    }

    // ── DOM Construction ───────────────────────────

    /** @returns {HTMLElement} */
    #buildSearchBar() {
        const wrapper = document.createElement("div");
        wrapper.className = "sg-search";

        const icon = document.createElement("span");
        icon.className = "sg-search__icon";
        icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>`;

        this.#input = document.createElement("input");
        this.#input.type = "text";
        this.#input.className = "sg-search__input";
        this.#input.placeholder = "Search students by name or handle…";
        this.#input.spellcheck = false;
        this.#input.autocomplete = "off";

        const clearBtn = document.createElement("button");
        clearBtn.className = "sg-search__clear";
        clearBtn.type = "button";
        clearBtn.setAttribute("aria-label", "Clear search");
        clearBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>`;

        this.#input.addEventListener("input", () => this.#onInput(clearBtn));
        clearBtn.addEventListener("click", () => this.#onClear(clearBtn));

        wrapper.append(icon, this.#input, clearBtn);
        return wrapper;
    }

    // ── Event Handlers ─────────────────────────────

    /** @param {HTMLElement} clearBtn */
    #onInput(clearBtn) {
        const hasValue = this.#input.value.length > 0;
        clearBtn.classList.toggle("sg-search__clear--visible", hasValue);

        clearTimeout(this.#debounceTimer);
        this.#debounceTimer = setTimeout(() => this.#applyFilter(), SearchBar.DEBOUNCE_MS);
    }

    /** @param {HTMLElement} clearBtn */
    #onClear(clearBtn) {
        this.#input.value = "";
        clearBtn.classList.remove("sg-search__clear--visible");
        this.#input.focus();
        this.#restoreOriginals();
    }

    // ── Search & Grid Swap ─────────────────────────

    /**
     * Fetch matching students from backend and swap the grid,
     * or restore originals if the query is empty.
     */
    async #applyFilter() {
        if (!this.#tableBuilder) return;

        const query = this.#input.value.trim();

        if (!query) {
            this.#restoreOriginals();
            return;
        }

        const students = await this.#searchBackend(query);
        this.#tableBuilder.replaceGrid(students);
        this.#toggleEmptyState(students.length === 0);
    }

    /** Restore the original intercepted students to the grid. */
    #restoreOriginals() {
        if (!this.#tableBuilder || !this.#originalStudents) return;
        this.#tableBuilder.replaceGrid(this.#originalStudents);
        this.#toggleEmptyState(false);
    }

    /**
     * @param {string} nameQuery
     * @returns {Promise<Object[]>}
     */
    async #searchBackend(nameQuery) {
        try {
            const res = await fetch(
                `${BACKEND_URL}/student/search?name=${encodeURIComponent(nameQuery)}&instituteId=${this.#instituteId}`
            );
            const { data } = await res.json();
            // Normalize backend shape → intercepted shape for #buildCard.
            return (data ?? []).map(s => ({
                handle: s.username,
                fullName: s.name,
                coding_score: s.score,
                total_problems_solved: s.solved,
                potd_longest_streak: s.streak
            }));
        } catch (err) {
            console.error("[SussyGeek] Search failed:", err);
            return [];
        }
    }

    // ── Empty State ────────────────────────────────

    /** @param {boolean} show */
    #toggleEmptyState(show) {
        const grid = document.querySelector(".sg-student-grid");
        if (!grid) return;

        let emptyMsg = grid.querySelector(".sg-search__empty");

        if (show && !emptyMsg) {
            emptyMsg = document.createElement("div");
            emptyMsg.className = "sg-search__empty";
            emptyMsg.textContent = "No students match your search.";
            grid.appendChild(emptyMsg);
        } else if (!show && emptyMsg) {
            emptyMsg.remove();
        }
    }
}
