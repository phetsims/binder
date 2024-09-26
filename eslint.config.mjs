// Copyright 2024, University of Colorado Boulder

/**
 * ESlint configuration for binder.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import parent from '../chipper/eslint/node.eslint.config.mjs';
import globals from '../chipper/node_modules/globals/index.js';

export default [
  ...parent,
  {
    languageOptions: {
      globals: {
        ...globals.node
      },
      sourceType: 'module',
      ecmaVersion: 2015,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      react: {
        version: '~16.8.6'
      }
    }
  },
  {
    ignores: [
      'docs/**/*',
      'react-binder/**/*'
    ]
  }
];