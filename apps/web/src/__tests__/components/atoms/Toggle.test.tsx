import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toggle from '../../../components/atoms/Toggle';

describe('Toggle', () => {
  it('switch 역할을 가진다', () => {
    render(<Toggle checked={false} onChange={() => {}} />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('checked 상태를 aria-checked로 반영한다', () => {
    render(<Toggle checked={true} onChange={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('unchecked 상태를 aria-checked로 반영한다', () => {
    render(<Toggle checked={false} onChange={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('클릭 시 onChange를 호출한다', async () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('checked=true일 때 클릭하면 false로 호출한다', async () => {
    const onChange = vi.fn();
    render(<Toggle checked={true} onChange={onChange} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('disabled 상태에서 클릭되지 않는다', async () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} disabled />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
