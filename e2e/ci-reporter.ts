import { appendFileSync } from 'node:fs';
import { relative } from 'node:path';
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

type Decision = {
  dialogTitle: string;
  description: string;
  action: string;
  rendered: string | null;
  jev: string;
  score: number;
};

type Check = {
  title: string;
  file: string;
  line: number;
  status: TestResult['status'];
  message?: string;
  decisions: Decision[];
};

const markdown = (value: string) => value.replaceAll('|', '\\|').replaceAll('`', '\\`');
const command = (value: string) => value.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');

class CiReporter implements Reporter {
  private checks: Check[] = [];

  onTestEnd(test: TestCase, result: TestResult) {
    const decisions = result.attachments
      .filter((attachment) => attachment.name === 'design-check' && attachment.body)
      .map((attachment) => JSON.parse(attachment.body!.toString()) as Decision);
    const check: Check = {
      title: test.title,
      file: relative(process.cwd(), test.location.file).replaceAll('\\', '/'),
      line: test.location.line,
      status: result.status,
      message: result.error?.message?.replace(/\x1b\[[0-9;]*m/g, '').split('\n').find(Boolean),
      decisions,
    };
    this.checks.push(check);

    if (result.status !== 'failed' && result.status !== 'timedOut') return;
    const mismatch = decisions.find((decision) => decision.rendered !== decision.jev);
    const detail = mismatch
      ? `${mismatch.dialogTitle}, ${mismatch.action}: rendered ${mismatch.rendered ?? 'none'}; Jev suggests ${mismatch.jev} (${Math.round(mismatch.score * 100)} percent model score).`
      : test.title.includes('screenshot') || result.error?.message?.includes('toHaveScreenshot')
        ? `${test.title}: screenshot changed. See the visual-failure artifact for the image diff.`
        : `${test.title}: ${check.message ?? 'check failed'}`;
    console.log(`\n::error file=${command(check.file)},line=${check.line},title=${command('Design system check')}::${command(detail)}`);
  }

  onEnd() {
    const summaryFile = process.env.GITHUB_STEP_SUMMARY;
    if (!summaryFile) return;

    const kind = process.env.CI_CHECK_KIND;
    const failed = this.checks.filter((check) => check.status !== 'passed');
    const lines = [`### ${kind === 'jev' ? 'Jev' : 'Visual'} check`];

    if (kind === 'jev') {
      const decisions = this.checks.flatMap((check) => check.decisions);
      if (decisions.length) {
        lines.push('', '| What Jev read | Button | Rendered | Jev answer | Result |', '| --- | --- | --- | --- | --- |');
        for (const decision of decisions) {
          lines.push(`| **${markdown(decision.dialogTitle)}:** ${markdown(decision.description)} | ${markdown(decision.action)} | ${markdown(decision.rendered ?? 'none')} | ${markdown(decision.jev)} (${Math.round(decision.score * 100)}% model score) | ${decision.rendered === decision.jev ? 'match' : 'mismatch'} |`);
        }
        lines.push('', 'The model score is not a probability that the UI is wrong.');
      }
    }

    if (!failed.length) {
      lines.push('', `${this.checks.length} ${this.checks.length === 1 ? 'test' : 'tests'} passed.`);
    } else {
      const mismatches = this.checks.flatMap((check) => check.decisions).filter((decision) => decision.rendered !== decision.jev);
      if (kind === 'jev' && mismatches.length) {
        lines.push('', `${mismatches.length} ${mismatches.length === 1 ? 'mismatch' : 'mismatches'} found.`);
      } else {
        lines.push('', `${failed.length} ${failed.length === 1 ? 'test' : 'tests'} failed:`);
        for (const check of failed) {
          const screenshot = check.message?.includes('toHaveScreenshot') || check.title.includes('screenshot');
          lines.push(`- ${markdown(check.title)}: ${screenshot ? 'screenshot changed' : markdown(check.message ?? check.status)}.`);
        }
      }
      lines.push('', `Download the **${kind === 'jev' ? 'jev-failure' : 'visual-failure'}** artifact for screenshots and traces.`);
    }

    appendFileSync(summaryFile, `${lines.join('\n')}\n`);
  }
}

export default CiReporter;
