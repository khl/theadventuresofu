module.exports = {
  entry: ['./app/index.js'],
  output: {
    path: __dirname + '/build',
    filename: "bundle.js",
    libraryTarget: "this"
  },
  module: {
    rules: [{
      loader: 'babel-loader',
      test: /\.js$/,
      exclude: /node_module/
    }]
  },
  devServer: {
    port: 3000,
    contentBase: './build',
    inline: true
  }
};
