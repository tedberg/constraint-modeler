module.exports = (api) => {
  api.cache(true);

  const presets = [
    '@vue/app'
  ];

  const plugins = ['jsx-v-model'];

  return {
    presets,
    plugins
  };
};
