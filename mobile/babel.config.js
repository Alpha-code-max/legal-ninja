module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@lib":        "./lib",
            "@components": "./components",
            "@hooks":      "./hooks",
            "@context":    "./context",
            "@":           "./",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};

