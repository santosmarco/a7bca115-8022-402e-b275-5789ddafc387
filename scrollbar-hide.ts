import plugin from "tailwindcss/plugin";

const scrollbarHide = plugin(({ addUtilities }) => {
  addUtilities({
    "*": {
      /* IE and Edge */
      "-ms-overflow-style": "none",

      /* Firefox */
      "scrollbar-width": "none",

      /* Safari and Chrome */
      "&::-webkit-scrollbar": {
        display: "none",
      },
    },

    ".scrollbar-default": {
      /* IE and Edge */
      "-ms-overflow-style": "auto",

      /* Firefox */
      "scrollbar-width": "auto",

      /* Safari and Chrome */
      "&::-webkit-scrollbar": {
        display: "block",
      },
    },
  });
});

export default scrollbarHide;
