const { NODE_ENV, BABEL_ENV } = process.env
const cjs = BABEL_ENV === 'commonjs'

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          ie: 11,
        },
        loose: true,
        modules: cjs ? 'cjs' : 'auto'
      }
    ]
  ],
  plugins: ['@babel/transform-runtime', ...(cjs && ['@babel/transform-modules-commonjs'] || [])]
}
