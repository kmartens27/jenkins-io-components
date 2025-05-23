import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ionIconText} from './shared-styles';
import {msg, str, localized} from '@lit/localize';

import outdent from 'outdent';

@localized()
@customElement('jio-report-infra-issue')
export class ReportInfraIssue extends LitElement {
  static override styles = [
    ionIconText,
    css`
      ion-icon { color: #FFA91B; }
    `
  ];

  /**
   * Overrides the page title. Defaults to page title
   */
  @property()
  pageTitle = '';

  /**
   * Overrides the page title. Defaults to page url
   */
  @property()
  url = '';

  /**
   * Github source path relative to $githubRepo
   */
  @property()
  sourcePath = '';

  /**
   * Github repo
   */
  @property()
  githubRepo = '';

  /**
   * Github branch
   */
  @property()
  githubBranch = 'master';

  @property({type: String})
  template = '';

  get locationHref() {
    const _location = typeof location !== 'undefined' ? location : {href: 'http://unknown'};
    return _location.href;
  }

  get windowTitle() {
    const _document = typeof document !== 'undefined' ? document : {title: 'Unknown'};
    return _document.title;
  }

  get derivedTitle() {
    return this.pageTitle || this.windowTitle;
  }

  get derivedUrl() {
    return this.url || this.locationHref;
  }

  get reportUrl() {
    if (this.template && (this.template.endsWith('.yml') || this.template.endsWith('.yaml'))) {
      // custom fields version
      const queryParams = new URLSearchParams();
      queryParams.append('labels', 'infra');
      queryParams.append('template', this.template);
      let problem = `[${this.derivedTitle}](${this.derivedUrl}) page`;
      if (this.sourcePath) {
        problem += ` [source file](https://github.com/${this.githubRepo}/tree/${this.githubBranch}/${this.sourcePath})`;
      }
      queryParams.append('problem', problem);
      return `https://github.com/jenkins-infra/helpdesk/issues/new?${queryParams.toString()}`;
    } else {
      // legacy template (if available) 
      const queryParams = new URLSearchParams();
      queryParams.append('labels', 'infra');
      queryParams.append('template', 'infra-issue.yml');
      queryParams.append('title', `${this.derivedTitle} page - TODO: Put a summary here`);
      let problem = `Problem with the [${this.derivedTitle}](${this.derivedUrl}) page`;
      if (this.sourcePath) {
        problem += ` [source file](https://github.com/${this.githubRepo}/tree/${this.githubBranch}/${this.sourcePath})`;
      }
      problem += `
        TODO: Describe the expected and actual behavior here
        # Screenshots
        TODO: Add screenshots if possible
        # Possible Solution
        <!-- If you have suggestions on a fix for the bug, please describe it here. -->
        N/A`;
      queryParams.append('body', outdent`${problem.split('\n').map(line => line.trim()).join('\n')}`);
      return `https://github.com/jenkins-infra/helpdesk/issues/new?${queryParams.toString()}`;
    }
  }

  override render() {
    // Only render the link if githubRepo is provided
    if (!this.githubRepo) {
      return null;
    }

    return html`
      <a href=${this.reportUrl} title=${msg(str`Report an infrastructure issue related to ${this.sourcePath || this.derivedUrl}`)}>
        <ion-icon class="report" name="warning"></ion-icon>
        <span class="text">${msg('Report an Infra Issue')}</span>
      </a>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'jio-report-infra-issue': ReportInfraIssue;
  }
}
