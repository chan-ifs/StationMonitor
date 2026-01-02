import { ComponentProps } from 'react';
import { Gantt } from '@svar-ui/react-gantt';

// Type definition for skinSettings based on Gantt component props
export type SkinSettings = Partial<ComponentProps<typeof Gantt>>;

/**
 * Get skin settings configuration based on skin ID
 * Follows the pattern from skinSettings-portable.jsx
 */
export const getSkinSettings = (skinId: string = 'default'): SkinSettings => {
  const configs: Record<string, SkinSettings> = {
    'default': {
      cellWidth: 100,
      cellHeight: 38,
      readonly: false,
    },
    'willow': {
      cellWidth: 100,
      cellHeight: 38,
      readonly: false,
    },
    'willow-dark': {
      cellWidth: 100,
      cellHeight: 38,
      readonly: false,
      // Add dark theme specific props here if needed
    },
    'compact': {
      cellWidth: 80,
      cellHeight: 30,
      readonly: false,
    },
    'readonly': {
      cellWidth: 100,
      cellHeight: 38,
      readonly: true,
    },
  };

  return configs[skinId] || configs['default'];
};

