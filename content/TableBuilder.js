/**
 * TableBuilder — Owns all DOM construction for the student table.
 *
 * Responsibilities:
 *   • Build the student card grid from API data
 *   • Build individual student cards with avatar + stats
 *   • Build pagination controls
 *
 * This class is purely presentational — it receives data and a
 * mount-point, and renders into the DOM. No network calls, no
 * script injection, no message passing.
 */
class TableBuilder {

    // Avatar background colors — mirrors the GFG palette.
    static AVATAR_COLORS = [
        "#b0daff", "#ffc8af", "#feeeb3", "#b3efcf",
        "#fdc1c5", "#b5eaea", "#fdedc1", "#febe8c",
        "#d4c4fb", "#c8e6c9"
    ];

    /** @type {HTMLElement} */
    #parentSection = null;

    /**
     * @param {HTMLElement} parentSection — the container to render into.
     */
    constructor(parentSection) {
        this.#parentSection = parentSection;
    }

    // ── Public API ─────────────────────────────────

    /**
     * Replace the original table with our custom card grid.
     * Theming is handled entirely by CSS — see content.css.
     * @param {Object} studentData — full API response ({ results, count, page_size, … }).
     */
    render(studentData) {

        const originalTable = this.#parentSection.lastChild;

        if (!studentData) {
            // Data hasn't arrived yet — hide the original for now.
            if (originalTable) originalTable.style.display = "none";
            return;
        }

        // Remove the original table div entirely.
        if (originalTable) originalTable.remove();

        // Build and append our clean replacement.
        const container = this.#buildContainer(studentData);
        this.#parentSection.appendChild(container);
    }

    /**
     * Swap the grid contents with cards built from a new student array.
     * Used by SearchBar to show search results or restore originals.
     * @param {Object[]} students
     */
    replaceGrid(students) {
        const grid = document.querySelector(".sg-student-grid");
        if (!grid) return;

        grid.innerHTML = "";
        students.forEach((student, i) => grid.appendChild(this.#buildCard(student, i)));
    }

    // ── Container ──────────────────────────────────

    /**
     * @param {Object} data
     * @returns {HTMLElement}
     */
    #buildContainer(data) {
        const container = document.createElement("div");
        container.id = "sg-student-container";

        container.appendChild(this.#buildGrid(data.results));
        container.appendChild(this.#buildPagination(data));

        return container;
    }

    // ── Student Grid ───────────────────────────────

    /**
     * @param {Object[]} students
     * @returns {HTMLElement}
     */
    #buildGrid(students) {
        const grid = document.createElement("div");
        grid.className = "sg-student-grid";

        students.forEach((student, index) => {
            grid.appendChild(this.#buildCard(student, index));
        });

        return grid;
    }

    // ── Single Student Card ────────────────────────

    /**
     * @param {Object}  student
     * @param {number}  index
     * @returns {HTMLElement}
     */
    #buildCard(student, index) {
        const profileUrl = `https://auth.geeksforgeeks.org/user/${student.handle}/`;
        const initial = (student.handle?.[0] || "?").toUpperCase();
        const bgColor = TableBuilder.AVATAR_COLORS[
            index % TableBuilder.AVATAR_COLORS.length
        ];

        // Card root — a clickable link.
        const link = document.createElement("a");
        link.className = "sg-student-card";
        link.href = profileUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        // Avatar + handle cluster (left side).
        const avatarGroup = document.createElement("div");
        avatarGroup.className = "sg-student-card__avatar-group";

        const avatar = document.createElement("div");
        avatar.className = "sg-student-card__avatar";
        avatar.style.backgroundColor = bgColor;
        avatar.textContent = initial;

        const handleStat = this.#buildStat(student.fullName, student.handle, true);

        avatarGroup.append(avatar, handleStat);

        // Stats cluster (right side).
        const info = document.createElement("div");
        info.className = "sg-student-card__info";
        info.append(
            this.#buildStat("Practice Problem", student.total_problems_solved),
            this.#buildStat("Coding Score", student.coding_score),
            this.#buildStat("POTD Streak", student.potd_longest_streak ?? 0)
        );

        link.append(avatarGroup, info);
        return link;
    }

    // ── Stat Cell ──────────────────────────────────

    /**
     * @param {string}  label
     * @param {*}       value
     * @param {boolean} [isHandle=false]
     * @returns {HTMLElement}
     */
    #buildStat(label, value, isHandle = false) {
        const stat = document.createElement("div");
        stat.className = "sg-student-card__stat";

        const labelEl = document.createElement("p");
        labelEl.className = "sg-student-card__label";
        labelEl.textContent = label;

        const valueEl = document.createElement("p");
        valueEl.className = isHandle
            ? "sg-student-card__handle"
            : "sg-student-card__value";
        valueEl.textContent = value;

        stat.append(labelEl, valueEl);
        return stat;
    }

    // ── Pagination ─────────────────────────────────

    /**
     * @param {Object} data — { count, page_size, … }
     * @returns {HTMLElement}
     */
    #buildPagination(data) {
        const { count, page_size } = data;
        const totalPages = Math.ceil(count / page_size);
        const currentPage = TableBuilder.#getCurrentPage();

        const nav = document.createElement("div");
        nav.className = "sg-pagination";

        // ◀ Previous
        const prevBtn = this.#buildPageButton("‹", currentPage - 1, totalPages);
        if (currentPage <= 1) prevBtn.classList.add("sg-pagination__btn--disabled");
        nav.appendChild(prevBtn);

        // Page numbers
        const pages = TableBuilder.#getVisiblePages(currentPage, totalPages);

        pages.forEach((page) => {
            if (page === "...") {
                const dots = document.createElement("span");
                dots.className = "sg-pagination__dots";
                dots.textContent = "...";
                nav.appendChild(dots);
            } else {
                const btn = this.#buildPageButton(page, page, totalPages);
                if (page === currentPage) btn.classList.add("sg-pagination__btn--active");
                nav.appendChild(btn);
            }
        });

        // ▶ Next
        const nextBtn = this.#buildPageButton("›", currentPage + 1, totalPages);
        if (currentPage >= totalPages) nextBtn.classList.add("sg-pagination__btn--disabled");
        nav.appendChild(nextBtn);

        return nav;
    }

    /**
     * @param {string|number} label
     * @param {number}        page
     * @param {number}        totalPages
     * @returns {HTMLElement}
     */
    #buildPageButton(label, page, totalPages) {
        const btn = document.createElement("a");
        btn.className = "sg-pagination__btn";
        btn.textContent = label;

        if (page >= 1 && page <= totalPages) {
            const url = new URL(window.location.href);
            url.searchParams.set("page", page);
            btn.href = url.toString();
        }

        return btn;
    }

    // ── Helpers (static / pure) ────────────────────

    /** @returns {number} */
    static #getCurrentPage() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get("page"), 10) || 1;
    }

    /**
     * Smart ellipsis logic — always shows first, last, current and neighbors.
     * @param   {number} current
     * @param   {number} total
     * @returns {(number|string)[]}
     */
    static #getVisiblePages(current, total) {
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        const pages = new Set([1, 2, current - 1, current, current + 1, total - 1, total]);
        const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);

        const result = [];
        for (let i = 0; i < sorted.length; i++) {
            if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
                result.push("...");
            }
            result.push(sorted[i]);
        }

        return result;
    }
}
