class NoteBtn {
    #utilsContainer = null;
    #problemDataFn = null;
    #wrapper = null;
    #innerDiv = null;
    #modal = null;

    constructor(utilsContainer, problemDataFn) {
        this.#utilsContainer = utilsContainer;
        this.#problemDataFn = problemDataFn;
        this.#initUI();
        this.#startDataCheck();
    }

    #initUI() {
        this.#wrapper = document.createElement("div");
        this.#wrapper.className = "problems_problem_timer_content__24gPQ";
        this.#wrapper.style.gap = "0px";

        const btnDiv = document.createElement("div");
        btnDiv.className = "problems_user_timer_div__AR0yn";

        const button = document.createElement("button");
        button.className = "ui small compact icon button problems_user_timer_button__1fQzl";

        this.#innerDiv = document.createElement("div");
        this.#innerDiv.className = "problems_user_timer_div__AR0yn";

        button.appendChild(this.#innerDiv);
        btnDiv.appendChild(button);
        this.#wrapper.appendChild(btnDiv);

        button.addEventListener("click", () => this.#handleNoteClick());
    }

    async #render() {
        const problemData = this.#problemDataFn();
        if (!problemData) return;
        const data = await chrome.storage.local.get(["gfg_notes"]);
        const notes = data.gfg_notes || {};
        const hasNote = !!notes[problemData.id];

        this.#innerDiv.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="${hasNote ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span class="problems_user_start_timer_text__Wfv0I">
                ${hasNote ? 'View note' : 'New note'}
            </span>
        `;
    }

    #handleNoteClick() {
        const problemData = this.#problemDataFn();
        if (!problemData) return;

        if (this.#modal) return; // Prevent multiple modals

        this.#modal = new NoteModal(problemData, async () => {
            this.#modal = null;
            await this.#render(); // Re-render to update the button text if a note was created
        });
    }

    #mount() {
        if (!this.#utilsContainer.contains(this.#wrapper)) {
            this.#utilsContainer.appendChild(this.#wrapper);
        }
    }

    #startDataCheck() {
        const checkData = setInterval(() => {
            if (this.#problemDataFn()) {
                this.#render();
                this.#mount();
                clearInterval(checkData);
            }
        }, 500);
    }
}
