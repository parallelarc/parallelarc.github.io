/**
 * Plugin Configuration
 */

import { Plugin } from '../types/plugin';

/**
 * List of plugins to auto-load on startup
 * Add your custom plugins here
 */
export const autoLoadPlugins: Plugin[] = [
  // Example: { name: 'my-plugin', version: '1.0.0', commands: [...] }
];

/**
 * Plugin settings
 */
export const pluginConfig = {
  /** Enable plugin system */
  enabled: true,

  /** Allow loading plugins from external URLs (security risk) */
  allowExternalPlugins: false,

  /** Maximum number of plugins allowed */
  maxPlugins: 50,

  /** Plugin load timeout in milliseconds */
  loadTimeout: 5000,
} as const;

export type PluginConfig = typeof pluginConfig;
