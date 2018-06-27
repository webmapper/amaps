import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';

export default [{
  input: 'src/tvm.js',
  output: {
    name: 'tvm',
    file: process.env.NODE_ENV === 'production' ? 'dist/tvm.iife.js' : 'test/dist/tvm.iife.js',
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
  input: 'src/tvm.js',
  output: {
    name: 'tvm',
    file: process.env.NODE_ENV === 'production' ? 'dist/tvm.es.js' : 'test/dist/tvm.es.js',
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
