import { Command } from '../../types/command';

export const config: Command = {
  id: 'about',
  name: 'about',
  description: 'about me',
  category: 'info',
  component: () => import('./index'),
};
