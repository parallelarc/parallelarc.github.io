/**
 * Example Plugin
 * Demonstrates how to create a custom command using the plugin system
 */

import { Plugin } from '../types/plugin';

// Example command component
function ExampleCommand() {
  return (
    <div style={{ padding: '1rem', fontFamily: 'monospace' }}>
      <h3>Example Command</h3>
      <p>This is a dynamically loaded command from a plugin!</p>
      <p>Plugin system allows you to extend the terminal with custom commands.</p>
    </div>
  );
}

// Example plugin definition
export const examplePlugin: Plugin = {
  name: 'example-plugin',
  version: '1.0.0',
  description: 'An example plugin demonstrating the plugin system',
  author: 'Terminal Portfolio',

  commands: [
    {
      id: 'example',
      name: 'example',
      description: 'An example command from a plugin',
      category: 'plugins',
      component: () =>
        Promise.resolve({
          default: ExampleCommand,
        }),
    },
  ],

  init: (context) => {
    console.log('Example plugin initialized!');
    console.log('Available commands:', context.getTerminalState());
  },

  destroy: () => {
    console.log('Example plugin destroyed!');
  },
};

export default examplePlugin;
