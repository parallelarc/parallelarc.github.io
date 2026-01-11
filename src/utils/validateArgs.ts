import { Command } from '../types/command';

export interface ValidationError {
  arg: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  parsedArgs: Record<string, string | number | boolean>;
}

/**
 * Validate command arguments against the command's arg definitions
 * @param command - The command with arg definitions
 * @param inputArgs - The array of input arguments
 * @returns Validation result with errors and parsed arguments
 */
export function validateArgs(
  command: Command,
  inputArgs: string[]
): ValidationResult {
  // If no args defined, any input is valid (for backwards compatibility)
  if (!command.args || command.args.length === 0) {
    return { valid: true, errors: [], parsedArgs: {} };
  }

  const errors: ValidationError[] = [];
  const parsedArgs: Record<string, string | number | boolean> = {};

  // Validate each defined arg
  command.args.forEach((argDef, index) => {
    const inputValue = inputArgs[index];

    // Check required args
    if (argDef.required && !inputValue) {
      errors.push({
        arg: argDef.name,
        message: `Missing required argument: ${argDef.name}`,
      });
      return;
    }

    // If no value provided and not required, use default value
    if (!inputValue) {
      if (argDef.defaultValue !== undefined) {
        parsedArgs[argDef.name] = argDef.defaultValue;
      }
      return;
    }

    // Type validation
    switch (argDef.type) {
      case 'number':
        if (isNaN(Number(inputValue))) {
          errors.push({
            arg: argDef.name,
            message: `${argDef.name} must be a number, got "${inputValue}"`,
          });
        } else {
          parsedArgs[argDef.name] = Number(inputValue);
        }
        break;

      case 'boolean':
        if (inputValue.toLowerCase() === 'true') {
          parsedArgs[argDef.name] = true;
        } else if (inputValue.toLowerCase() === 'false') {
          parsedArgs[argDef.name] = false;
        } else {
          errors.push({
            arg: argDef.name,
            message: `${argDef.name} must be a boolean (true/false), got "${inputValue}"`,
          });
        }
        break;

      case 'string':
      default:
        parsedArgs[argDef.name] = inputValue;
        break;
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    parsedArgs,
  };
}

/**
 * Generate a usage string for a command based on its arg definitions
 * @param command - The command with arg definitions
 * @returns Usage string (e.g., "projects <action> <index>")
 */
export function getUsageString(command: Command): string {
  if (!command.args || command.args.length === 0) {
    return command.name;
  }

  const argsStr = command.args
    .map(arg => {
      const brackets = arg.required ? '<' : '[';
      const closeBrackets = arg.required ? '>' : ']';
      return `${brackets}${arg.name}${closeBrackets}`;
    })
    .join(' ');

  return `${command.name} ${argsStr}`;
}

/**
 * Get detailed help text for a command's arguments
 * @param command - The command with arg definitions
 * @returns Array of argument descriptions
 */
export function getArgHelp(command: Command): Array<{
  name: string;
  description: string;
  required: boolean;
  type?: string;
}> {
  if (!command.args || command.args.length === 0) {
    return [];
  }

  return command.args.map(arg => ({
    name: arg.name,
    description: arg.description,
    required: arg.required ?? false,
    type: arg.type ?? 'string',
  }));
}
