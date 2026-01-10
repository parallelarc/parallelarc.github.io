import { Command } from '../../types/command';

export const config: Command = {
  id: 'themes',
  name: 'themes',
  description: 'check available themes',
  category: 'system',
  component: () => import('./index'),
};
