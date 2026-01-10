import { Command } from '../../types/command';

export const config: Command = {
  id: 'projects',
  name: 'projects',
  description: 'some work, in no particular order',
  category: 'info',
  component: () => import('./index'),
};
