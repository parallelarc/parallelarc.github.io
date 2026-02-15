/**
 * Command Registry
 * Central place to register all terminal commands
 */

import { commandRegistry } from '../core/CommandRegistry';
import { config as aiConfig } from './ai/config';
import { config as aboutConfig } from './about/config';
import { config as blogConfig } from './blog/config';
import { config as clearConfig } from './clear/config';
import { config as contactConfig } from './contact/config';
import { config as educationConfig } from './education/config';
import { config as projectsConfig } from './projects/config';
import { config as welcomeConfig } from './welcome/config';

/**
 * Register all built-in commands
 */
export function registerCommands() {
  commandRegistry.register(aiConfig);

  // Info commands
  commandRegistry.register(aboutConfig);
  commandRegistry.register(contactConfig);
  commandRegistry.register(educationConfig);
  commandRegistry.register(projectsConfig);
  commandRegistry.register(welcomeConfig);

  // Content commands
  commandRegistry.register(blogConfig);

  // System commands
  commandRegistry.register(clearConfig);

  return commandRegistry;
}

/**
 * Export command configs for external use
 */
export const commandConfigs = {
  ai: aiConfig,
  about: aboutConfig,
  blog: blogConfig,
  clear: clearConfig,
  contact: contactConfig,
  education: educationConfig,
  projects: projectsConfig,
  welcome: welcomeConfig,
};

// Auto-register on import
registerCommands();

// Export registry instance
export { commandRegistry };
