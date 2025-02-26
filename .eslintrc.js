module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/no-unescaped-entities': 'off',
    'react-hooks/exhaustive-deps': 'warn'
  }
} 