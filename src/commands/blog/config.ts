import { Command } from '../../types/command';

export const config: Command = {
  id: 'blog',
  name: 'blogs',
  description: 'open blog interface',
  category: 'content',
  acceptsArgs: true, // Support: `blog search term` or `blog tag:xxx`
  component: () => import('./index'),
};
