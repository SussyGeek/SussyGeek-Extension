const CONTRIBUTION_URL = "https://tobeupdated.com/join";

/**
 * ContributionBanner — Displays a banner when institute data is unavailable.
 */
class ContributionBanner {
    #container = null;
    #banner = null;

    constructor(container) {
        this.#container = container;
        this.#initUI();
    }

    #initUI() {
        this.#banner = document.createElement("div");
        this.#banner.className = "sg-banner";

        this.#banner.innerHTML = `
            <div class="sg-banner__content">
                <div class="sg-banner__logo">SG</div>
                <div class="sg-banner__text">
                    <strong>SussyGeek does not have data.</strong><br/>
                    Help us enable full name search on this institute.
                </div>
            </div>
            <button class="sg-btn sg-btn-primary sg-banner__btn">Join Contribution Network</button>
        `;

        this.#banner.querySelector(".sg-banner__btn").addEventListener("click", () => {
            window.open(CONTRIBUTION_URL, "_blank");
        });
    }

    mount() {
        if (this.#container && !this.#container.contains(this.#banner)) {
            // Append it to the container
            this.#container.appendChild(this.#banner);
        }
    }
}
