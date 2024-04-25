import nextConfig from 'next/core-web-vitals'
/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...nextConfig,

];