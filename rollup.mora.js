import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';

export default [{
  input: 'src/mora.js',
  output: {
    name: 'mora',
    file: process.env.NODE_ENV === 'production' ? 'dist/mora.iife.js' : 'test/dist/mora.iife.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    json(),
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: [[
        'env',
        {
          modules: false
        }
      ]],
      plugins: 'external-helpers'
    }),
    resolve(),
    commonjs()
  ]
},{
  input: 'src/mora.js',
  output: {
    name: 'mora',
    file: process.env.NODE_ENV === 'production' ? 'dist/mora.es.js' : 'test/dist/mora.es.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    json(),
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: [[
        'env',
        {
          modules: false
        }
      ]],
      plugins: 'external-helpers'
    }),
    resolve(),
    commonjs()
  ]
}]
