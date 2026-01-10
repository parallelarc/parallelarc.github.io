import { Command } from '../../types/command';

export const config: Command = {
  id: 'clear',
  name: 'clear',
  description: 'clear the terminal',
  category: 'system',
  component: () => import('./index'),
};
