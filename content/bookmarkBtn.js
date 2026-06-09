class BookmarkBtn {
    #utilsContainer = null;
    #problemDataFn = null;
    #wrapper = null;
    #innerDiv = null;

    constructor(utilsContainer, problemDataFn) {
        this.#utilsContainer = utilsContainer;
        this.#problemDataFn = problemDataFn;
        this.#initUI();
        this.#startDataCheck();
    }

    #initUI() {
        this.#wrapper = document.createElement("div");
        this.#wrapper.className = "problems_problem_timer_content__24gPQ";
        this.#wrapper.style.marginLeft = "4px";

        const btnDiv = document.createElement("div");
        btnDiv.className = "problems_user_timer_div__AR0yn";

        const button = document.createElement("button");
        button.className = "ui small compact icon button problems_user_timer_button__1fQzl";

        this.#innerDiv = document.createElement("div");
        this.#innerDiv.className = "problems_user_timer_div__AR0yn";

        button.appendChild(this.#innerDiv);
        btnDiv.appendChild(button);
        this.#wrapper.appendChild(btnDiv);

        button.addEventListener("click", () => this.#handleBookmarkToggle());
    }

    #render() {
        const problemData = this.#problemDataFn();
        if (!problemData) return;
        const bookmarks = JSON.parse(localStorage.getItem("gfg_bookmarks") || "{}");
        const isBookmarked = !!bookmarks[problemData.id];

        this.#innerDiv.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <span class="problems_user_start_timer_text__Wfv0I">
                ${isBookmarked ? 'Unbookmark' : 'Bookmark'}
            </span>
        `;
    }

    #handleBookmarkToggle() {
        const problemData = this.#problemDataFn();
        if (!problemData) return;
        const bookmarks = JSON.parse(localStorage.getItem("gfg_bookmarks") || "{}");

        if (bookmarks[problemData.id]) {
            delete bookmarks[problemData.id];
        } else {
            bookmarks[problemData.id] = {
                id: problemData.id,
                name: problemData.name,
                link: problemData.link,
                bookmarkedOn: new Date().toISOString(),
                difficulty: problemData.difficulty
            };
        }

        localStorage.setItem("gfg_bookmarks", JSON.stringify(bookmarks));
        this.#render();
    }

    #startDataCheck() {
        const checkData = setInterval(() => {
            if (this.#problemDataFn()) {
                this.#render();
                this.#utilsContainer.appendChild(this.#wrapper);
                clearInterval(checkData);
            }
        }, 500);
    }
}
