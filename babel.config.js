module.exports = (api) => {
  api.cache(true);

  const presets = [
    ['@vue/app', {
      'useBuiltIns': 'entry' // Recommended to set to false for libs, but causes error
    }]
  ];

  const plugins = ['jsx-v-model'];

  return {
    presets,
    plugins
  };
};
