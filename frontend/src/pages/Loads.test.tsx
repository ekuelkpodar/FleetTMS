import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { LoadsPage } from './Loads';
import * as apiModule from '../lib/api';

vi.mock('../lib/api');

const queryClient = new QueryClient();

describe('LoadsPage', () => {
  it('renders table headers', async () => {
    (apiModule.api.get as any).mockResolvedValue({ data: { data: [] } });
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LoadsPage />
        </BrowserRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText('Loads')).toBeInTheDocument();
  });
});
