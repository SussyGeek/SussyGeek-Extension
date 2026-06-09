class NoteModal {
    #problemData = null;
    #container = null;
    #isEditMode = false;
    #noteData = null;
    #onClose = null;

    constructor(problemData, onClose) {
        this.#problemData = problemData;
        this.#onClose = onClose;
        this.#loadNote();
        this.#initUI();
    }

    #loadNote() {
        const notes = JSON.parse(localStorage.getItem("gfg_notes") || "{}");
        this.#noteData = notes[this.#problemData.id];
        this.#isEditMode = !this.#noteData;
    }

    #saveNote(htmlContent) {
        const notes = JSON.parse(localStorage.getItem("gfg_notes") || "{}");
        const now = new Date().toISOString();
        notes[this.#problemData.id] = {
            content: htmlContent,
            createdAt: this.#noteData ? this.#noteData.createdAt : now,
            updatedAt: now
        };
        localStorage.setItem("gfg_notes", JSON.stringify(notes));
        this.#noteData = notes[this.#problemData.id];
        this.#isEditMode = false;
        this.#render();
        if (this.#onClose) this.#onClose();
    }

    #initUI() {
        this.#container = document.createElement("div");
        this.#container.className = "sussy_note_modal_backdrop";
        
        // Close when clicking outside
        this.#container.addEventListener("click", (e) => {
            if (e.target === this.#container) {
                this.unmount();
            }
        });

        this.#render();
        document.body.appendChild(this.#container);
    }

    #render() {
        this.#container.innerHTML = "";
        
        const modal = document.createElement("div");
        modal.className = "sussy_note_modal";
        
        const header = document.createElement("div");
        header.className = "sussy_note_modal_header";
        
        const title = document.createElement("h3");
        title.innerText = `Notes: ${this.#problemData.name}`;
        
        const closeBtn = document.createElement("button");
        closeBtn.className = "sussy_note_close_btn";
        closeBtn.innerHTML = "&times;";
        closeBtn.onclick = () => this.unmount();
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        modal.appendChild(header);

        if (this.#isEditMode) {
            modal.appendChild(this.#buildEditView());
        } else {
            modal.appendChild(this.#buildReadView());
        }

        this.#container.appendChild(modal);
    }

    #buildReadView() {
        const viewContainer = document.createElement("div");
        viewContainer.className = "sussy_note_read_view";

        const metaInfo = document.createElement("div");
        metaInfo.className = "sussy_note_meta";
        const date = new Date(this.#noteData.createdAt).toLocaleString();
        metaInfo.innerText = `Created at: ${date}`;

        const content = document.createElement("div");
        content.className = "sussy_note_content";
        content.innerHTML = this.#noteData.content;

        const footer = document.createElement("div");
        footer.className = "sussy_note_modal_footer";

        const editBtn = document.createElement("button");
        editBtn.className = "sg-btn sg-btn-primary";
        editBtn.innerText = "Edit Note";
        editBtn.onclick = () => {
            this.#isEditMode = true;
            this.#render();
        };

        footer.appendChild(editBtn);

        viewContainer.appendChild(metaInfo);
        viewContainer.appendChild(content);
        viewContainer.appendChild(footer);

        return viewContainer;
    }

    #buildEditView() {
        const editContainer = document.createElement("div");
        editContainer.className = "sussy_note_edit_view";

        // Toolbar
        const toolbar = document.createElement("div");
        toolbar.className = "sussy_note_toolbar";

        const exec = (command, value = null) => {
            document.execCommand(command, false, value);
        };

        const createBtn = (iconHTML, command, promptText = null) => {
            const btn = document.createElement("button");
            btn.className = "sussy_note_toolbar_btn";
            btn.innerHTML = iconHTML;
            btn.onclick = (e) => {
                e.preventDefault();
                if (promptText) {
                    const url = prompt(promptText);
                    if (url) exec(command, url);
                } else {
                    exec(command);
                }
            };
            return btn;
        };

        toolbar.appendChild(createBtn("<b>B</b>", "bold"));
        toolbar.appendChild(createBtn("<i>I</i>", "italic"));
        toolbar.appendChild(createBtn("<u>U</u>", "underline"));

        const headingSelect = document.createElement("select");
        headingSelect.className = "sussy_note_toolbar_select";
        ["Paragraph", "H1", "H2", "H3", "H4", "H5", "H6"].forEach(h => {
            const opt = document.createElement("option");
            opt.value = h === "Paragraph" ? "P" : h;
            opt.innerText = h;
            headingSelect.appendChild(opt);
        });
        headingSelect.onchange = (e) => {
            exec("formatBlock", e.target.value);
            headingSelect.value = "Paragraph"; // Reset
        };
        toolbar.appendChild(headingSelect);

        const colorInput = document.createElement("input");
        colorInput.type = "color";
        colorInput.className = "sussy_note_toolbar_color";
        colorInput.onchange = (e) => exec("foreColor", e.target.value);
        toolbar.appendChild(colorInput);

        toolbar.appendChild(createBtn("🖼️", "insertImage", "Enter image URL:"));

        // Editor
        const editor = document.createElement("div");
        editor.className = "sussy_note_editor";
        editor.contentEditable = "true";
        if (this.#noteData) {
            editor.innerHTML = this.#noteData.content;
        }

        const footer = document.createElement("div");
        footer.className = "sussy_note_modal_footer";

        const saveBtn = document.createElement("button");
        saveBtn.className = "sg-btn sg-btn-primary";
        saveBtn.innerText = "Save Note";
        saveBtn.onclick = () => {
            this.#saveNote(editor.innerHTML);
        };

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "sg-btn";
        cancelBtn.innerText = "Cancel";
        cancelBtn.onclick = () => {
            if (this.#noteData) {
                this.#isEditMode = false;
                this.#render();
            } else {
                this.unmount();
            }
        };

        footer.appendChild(cancelBtn);
        footer.appendChild(saveBtn);

        editContainer.appendChild(toolbar);
        editContainer.appendChild(editor);
        editContainer.appendChild(footer);

        return editContainer;
    }

    unmount() {
        if (this.#container && this.#container.parentNode) {
            this.#container.parentNode.removeChild(this.#container);
        }
        if (this.#onClose) this.#onClose();
    }
}
