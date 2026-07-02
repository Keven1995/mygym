import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

describe('Testing Library setup', () => {
  it('renders a React Native component', async () => {
    await render(<Text>MyGym tests ready</Text>);

    expect(screen.getByText('MyGym tests ready')).toBeTruthy();
  });
});
