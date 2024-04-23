import "./options-header.css"

export class OptionsHeader extends HTMLElement {
    constructor(private headerTitle: string, private headerSubTitle: string, private logoUrl?: string) {
        super()

        this.render()
    }

    private renderLogo(): string {
        return `
        <div class="options-header-logo">
          <img src="${this.logoUrl}" alt="${this.headerTitle}"/>
        </div>
      `
    }

    private render(): void {
        this.innerHTML = `
      <div class="options-header">
          <div class="options-header-text">
            <div class="options-header-title">${this.headerTitle}</div>
            <div class="options-header-subtitle">${this.headerSubTitle}</div>
          </div>
          
          ${this.logoUrl && this.renderLogo()}
      </div>
    `
    }
}

window.customElements.define("options-header", OptionsHeader)
