import "./options-footer.css"

export class OptionsFooter extends HTMLElement {
    constructor(
        private version?: string,
        private authorName?: string,
        private authorUrl?: string,
        private githubUrl?: string,
        private fundingUrl?: string
    ) {
        super()

        this.render()
    }

    private renderVersion(): string {
        return `
      <div>
        Version ${this.version}
      </div>
    `
    }

    private renderAuthor(): string {
        const year = new Date().getFullYear()

        if (this.authorUrl) {
            return `
    <div>
      &copy; <a target="_blank" href="${this.authorUrl}">${this.authorName}</a> ${year}
    </div>
    `
        }

        return `
    <div>
      &copy; ${this.authorName} ${year}
    </div>
    `
    }

    private renderGithub(): string {
        return `
      <div>
        <a target="_blank" href="${this.githubUrl}"><img  class="options-footer-icon" width="32" height="32" src="github-mark.svg" alt="Github"/></a>
      </div>
    `
    }

    private renderFunding(): string {
        return `
    <div>
      <a target="_blank" href="${this.fundingUrl}"><img class="options-footer-icon" width="32" height="32" src="sponsor.svg" alt="Sponsor"/></a>
    </div>
    `
    }

    private render(): void {
        this.innerHTML = `
      <div class="options-footer">
        ${this.version && this.renderVersion()}
        ${this.authorName && this.renderAuthor()}
        ${this.githubUrl && this.renderGithub()}
        ${this.fundingUrl && this.renderFunding()}
      </div>
    `
    }
}

window.customElements.define("options-footer", OptionsFooter)
