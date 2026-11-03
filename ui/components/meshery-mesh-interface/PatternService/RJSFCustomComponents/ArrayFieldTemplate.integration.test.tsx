import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import Form from '@rjsf/core';
import validator from '../../../../utils/rjsfValidator';
import ArrayFieldTemplate from './ArrayFieldTemlate';

vi.mock('@sistent/sistent', () => ({
  Box: ({ children }: any) => <div>{children}</div>,
  Grid2: ({ children }: any) => <div>{children}</div>,
  Paper: ({ children }: any) => <div>{children}</div>,
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  IconButton: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  Typography: ({ children }: any) => <span>{children}</span>,
  Accordion: ({ children }: any) => <div data-testid="accordion">{children}</div>,
  AccordionSummary: ({ children }: any) => <div>{children}</div>,
  AccordionDetails: React.forwardRef<HTMLDivElement, any>(({ children }, ref) => (
    <div ref={ref}>{children}</div>
  )),
  ExpandMoreIcon: () => <svg />,
  DeleteIcon: () => <svg data-testid="delete-icon" />,
  useTheme: () => ({
    palette: { mode: 'light', error: { main: '#f00' } },
    typography: { pxToRem: (n: number) => `${n}px`, fontWeightRegular: 400 },
  }),
}));
vi.mock('../CustomTextTooltip', () => ({
  CustomTextTooltip: ({ children }: any) => <>{children}</>,
}));
vi.mock('../../../../css/icons.styles', () => ({ iconSmall: {} }));

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const schema = { title: 'Items', type: 'array' as const, items: { type: 'string' as const } };

function renderForm() {
  const onChange = vi.fn();
  const result = render(
    <Form
      schema={schema}
      validator={validator}
      formData={['first', 'second', 'third']}
      templates={{ ArrayFieldTemplate }}
      onChange={onChange}
    />,
  );
  return { ...result, onChange };
}

describe('ArrayFieldTemplate with RJSF', () => {
  it('removes the selected item through the accordion delete control', () => {
    const { onChange } = renderForm();
    const second = screen.getAllByTestId('accordion')[1];
    fireEvent.click(within(second).getByTestId('delete-icon').closest('button')!);
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ formData: ['first', 'third'] }),
      expect.anything(),
    );
    expect(
      screen.getAllByRole('textbox').map((input) => (input as HTMLInputElement).value),
    ).toEqual(['first', 'third']);
  });

  it('reorders items through the RJSF item controls', () => {
    const { container, onChange } = renderForm();
    const moveUp = container.querySelectorAll<HTMLButtonElement>('.rjsf-array-item-move-up');
    fireEvent.click(moveUp[1]);
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ formData: ['second', 'first', 'third'] }),
      expect.anything(),
    );
    expect(
      screen.getAllByRole('textbox').map((input) => (input as HTMLInputElement).value),
    ).toEqual(['second', 'first', 'third']);
  });

  it('does not offer accordion removal when RJSF disables it', () => {
    render(
      <Form
        schema={schema}
        validator={validator}
        formData={['first']}
        uiSchema={{ 'ui:options': { removable: false } }}
        templates={{ ArrayFieldTemplate }}
      />,
    );
    expect(screen.queryByTestId('delete-icon')).not.toBeInTheDocument();
  });

  it('does not offer accordion removal for fixed tuple entries', () => {
    render(
      <Form
        schema={{ type: 'array', items: [{ type: 'string' }, { type: 'string' }] }}
        validator={validator}
        formData={['first', 'second']}
        templates={{ ArrayFieldTemplate }}
      />,
    );
    expect(screen.queryByTestId('delete-icon')).not.toBeInTheDocument();
  });
});
