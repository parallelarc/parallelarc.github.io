import { Command } from '../../types/command';

export const config: Command = {
  id: 'contact',
  name: 'contact',
  description: 'feel free to reach out',
  category: 'info',
  component: () => import('./index'),
};
