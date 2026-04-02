import { describe, expect, it } from 'vitest';
import { sanitizeCSVCell } from '../features/export/csvSecurity';

describe('sanitizeCSVCell', () => {
  it('neutraliza celdas que empiezan con formula', () => {
    expect(sanitizeCSVCell('=2+2')).toBe("'=2+2");
    expect(sanitizeCSVCell('+SUM(A1:A2)')).toBe("'+SUM(A1:A2)");
    expect(sanitizeCSVCell('-10+1')).toBe("'-10+1");
    expect(sanitizeCSVCell('@cmd')).toBe("'@cmd");
  });

  it('neutraliza con espacios iniciales antes de formula', () => {
    expect(sanitizeCSVCell('   =HYPERLINK("http://x")')).toBe("'   =HYPERLINK(\"http://x\")");
  });

  it('no altera texto normal ni numeros', () => {
    expect(sanitizeCSVCell('Supermercado')).toBe('Supermercado');
    expect(sanitizeCSVCell(123.45)).toBe(123.45);
  });
});
