import { Command } from '../../types/command';

export const config: Command = {
  id: 'ai',
  name: 'ai',
  description: 'internal ai conversation handler',
  category: 'system',
  hidden: true,
  acceptsArgs: true,
  component: () => import('./index'),
};
