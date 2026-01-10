import { Command } from '../../types/command';

export const config: Command = {
  id: 'welcome',
  name: 'welcome',
  description: 'display hero section',
  category: 'info',
  component: () => import('./index'),
};
