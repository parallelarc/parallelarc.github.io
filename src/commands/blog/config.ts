import { Command } from '../../types/command';

export const config: Command = {
  id: 'blog',
  name: 'blogs',
  description: 'open blog interface',
  category: 'content',
  component: () => import('./index'),
};
