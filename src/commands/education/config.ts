import { Command } from '../../types/command';

export const config: Command = {
  id: 'education',
  name: 'education',
  description: 'my education background',
  category: 'info',
  component: () => import('./index'),
};
