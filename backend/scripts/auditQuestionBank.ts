import { QUESTION_BANK } from '../prisma/questionBank';

interface AuditResult {
  passed: boolean;
  errors: string[];
  summary: Record<string, { total: number; themes: string[]; reverseCount: number }>;
}

export function auditQuestions(): AuditResult {
  const errors: string[] = [];
  const paths = ['SCHOLAR', 'WARRIOR', 'SAGE', 'CREATOR'] as const;
  const summary: Record<string, { total: number; themes: string[]; reverseCount: number }> = {};

  const normalizedMap = new Map<string, string>();

  // Check uniqueness across entire bank
  for (const q of QUESTION_BANK) {
    const normalized = q.text.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedMap.has(normalized)) {
      errors.push(`Duplicate question detected: "${q.text}" normalizes identical to "${normalizedMap.get(normalized)}"`);
    } else {
      normalizedMap.set(normalized, q.text);
    }
  }

  // Check path specific requirements
  for (const path of paths) {
    const pathQuestions = QUESTION_BANK.filter(q => q.path === path);
    const themes = Array.from(new Set(pathQuestions.map(q => q.theme)));
    const reverseCount = pathQuestions.filter(q => q.reverseScored).length;

    summary[path] = {
      total: pathQuestions.length,
      themes,
      reverseCount,
    };

    if (pathQuestions.length < 30) {
      errors.push(`Path ${path} has only ${pathQuestions.length} active questions (minimum 30 required).`);
    }

    if (themes.length < 5) {
      errors.push(`Path ${path} has only ${themes.length} distinct themes (minimum 5 required). Themes found: ${themes.join(', ')}`);
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    summary,
  };
}

if (require.main === module) {
  const result = auditQuestions();
  console.log('─── Question Bank Audit ───');
  for (const [path, info] of Object.entries(result.summary)) {
    console.log(
      `• ${path.padEnd(8)}: ${info.total} questions, ${info.reverseCount} reverse-scored, ${info.themes.length} themes (${info.themes.join(', ')})`
    );
  }

  if (!result.passed) {
    console.error('\nAudit FAILED with errors:');
    for (const err of result.errors) {
      console.error(' - ' + err);
    }
    process.exit(1);
  } else {
    console.log('\nAudit PASSED successfully: All paths meet or exceed requirements (30+ questions, >=5 themes, 0 duplicate texts).');
    process.exit(0);
  }
}
