import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify-es';

export default [{
  input: 'src/multiselect.js',
  output: {
    name: 'multiselect',
    file: process.env.NODE_ENV === 'production' ? 'dist/multiselect.iife.js' : 'test/dist/multiselect.iife.js',
    format: 'iife',
    sourcemap: process.env.NODE_ENV !== 'production'
  },
  plugins: [
    json(),
    resolve({
      jsnext: true,
      commonjs: true,
      browser: true
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/(?!callbag)**',
      babelrc: false,
      presets: [[
        'env',
        {
          modules: false
        }
      ]],
      plugins: 'external-helpers'
    }),
    (process.env.NODE_ENV === 'production' && uglify())
  ]
}, {
  input: 'src/multiselect.js',
  output: {
    name: 'multiselect',
    file: process.env.NODE_ENV === 'production' ? 'dist/multiselect.es.js' : 'test/dist/multiselect.es.js',
    format: 'es',
    sourcemap: process.env.NODE_ENV !== 'production'
  },
  plugins: [
    json(),
    resolve({
      jsnext: true,
      commonjs: true,
      browser: true
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/(?!callbag)**',
      babelrc: false,
      presets: [[
        'env',
        {
          modules: false
        }
      ]],
      plugins: 'external-helpers'
    }),
    (process.env.NODE_ENV === 'production' && uglify())
  ]
}, {
  input: 'src/multiselect.js',
  output: {
    name: 'multiselect',
    file: process.env.NODE_ENV === 'production' ? 'dist/multiselect.js' : 'test/dist/multiselect.js',
    format: 'cjs',
    sourcemap: process.env.NODE_ENV !== 'production'
  },
  plugins: [
    json(),
    resolve({
      jsnext: true,
      commonjs: true,
      browser: true
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/(?!callbag)**',
      babelrc: false,
      presets: [[
        'env',
        {
          modules: false
        }
      ]],
      plugins: 'external-helpers'
    }),
    (process.env.NODE_ENV === 'production' && uglify())
  ]
}];
