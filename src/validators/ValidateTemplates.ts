import { LitElement, property } from 'lit-element';
import { get } from 'lit-translate';
import {
  LogDetail,
  LogDetailBase,
  newIssueEvent,
  newLogEvent,
} from '../foundation.js';
import { validateChildren } from './templates/foundation.js';

type ValidationResult = LogDetailBase | LogDetail;

export default class ValidateTemplates extends LitElement {
  @property({ attribute: false })
  doc!: XMLDocument;
  @property()
  docName!: string;

  @property()
  pluginId!: string;

  async validate(): Promise<void> {
    const promises: Promise<void>[] = [];

    const [version, revision, release] = [
      this.doc.documentElement.getAttribute('version') ?? '',
      this.doc.documentElement.getAttribute('revision') ?? '',
      this.doc.documentElement.getAttribute('release') ?? '',
    ];

    if (!(version === '2007' && revision === 'B' && Number(release) > 3)) {
      document.querySelector('open-scd')?.dispatchEvent(
        newIssueEvent({
          validatorId: this.pluginId,
          title: get('diag.missingnsd'),
          message: '',
        })
      );
      return;
    }

    const data = this.doc.querySelector('DataTypeTemplates');
    if (!data) return;

    const templateIssues = await validateChildren(data);
    if (templateIssues.length === 0)
      templateIssues.push({
        title: get('diag.zeroissues'),
      });

    templateIssues.forEach(error =>
      this.dispatchEvent(
        newIssueEvent({
          ...error,
          validatorId: this.pluginId,
        })
      )
    );
  }
}
