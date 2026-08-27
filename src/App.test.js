import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the quiz landing page', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /code smarter with ai/i });
  expect(heading).toBeInTheDocument();
});
