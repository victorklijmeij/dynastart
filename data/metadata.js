// Assuming this is the content of your meta.json file
// {
//   pageTitle: "dynaStart",
//     tagLength: 10,
//       fixedTags: [
//         "fixedTags": [
//           { "tag": "TAG1", "description": "TAG 1 related links" },
//           { "tag": "TAG2", "description": "TAG 2 related links" },
//           { "tag": "TAG3", "description": "TAG 3 related links" },
//           { "tag": "TAG4", "description": "TAG 4 related links" },
//           { "tag": "TAG5", "description": "TAG 5 related links" }
//         ]
// }

// Embed the JSON data into the JavaScript file by assigning it to a variable
const metaData = {
  pageTitle: "dynaStart",
  tagLength: 10,
  topLevelFilters: [
    { "tag": "TAG1", "description": "filter on TAG 1" },
    { "tag": "TAG2", "description": "filter on TAG 2" },
    { "tag": "TAG3", "description": "filter on TAG 3" },
    { "tag": "TAG4", "description": "filter on TAG 4" },
    { "tag": "TAG5", "description": "filter on TAG 5" }
  ],
  // Default theme configuration
  defaultTheme: {
    // General
    backgroundColor: "#f0f0f0",

    // Fixed Tags Bar (Primary Tags)
    fixedTagsBackground: "#e9ecef",
    fixedTagsTextColor: "#212529",
    fixedTagsTextMuted: "#6c757d",

    // Navigation Separator
    navSeparatorColor: "#b8860b",  // Dark yellow separator between primary and secondary nav

    // Navbar (Secondary Tag Menu Bar)
    navbarBackground: "#dee2e6",
    navbarTextColor: "#212529",
    navbarTextMuted: "#6c757d",

    // Cards
    cardBackground: "#ffffff",
    cardTextColor: "#212529",
    cardBorder: "#dee2e6",
    cardShadow: "0 0.25rem 0.5rem rgba(0,0,0,0.08)",
    linkColor: "#0066cc",
    linkHoverColor: "#0052a3",

    // Fixed Tags (Primary Tags)
    hoverBackground: "#dee2e6",
    activeTagBackground: "#1e8eff",
    activeTagColor: "#ffffff",

    // Secondary Tags (Tag Menu)
    secondaryTagBackground: "#dee2e6",
    secondaryTagTextColor: "#212529",
    secondaryTagHoverBackground: "#ced4da",
    secondaryTagActiveBackground: "#80bfff",
    secondaryTagActiveColor: "#ffffff",

    // Action Buttons (Add & Settings)
    actionBtnBackground: "transparent",
    actionBtnTextColor: "#212529",
    actionBtnHoverBackground: "#e9ecef",
    actionBtnHoverColor: "#212529",

    // Modals
    modalBackground: "#ffffff",
    modalHeaderBackground: "#f8f9fa",
    modalTextColor: "#212529",

    // Buttons & UI
    primaryColor: "#429cff",
    secondaryColor: "#6c757d",
    borderColor: "#dee2e6",
    textMuted: "#6c757d"
  },
  // Predefined themes
  themes: {
    light: {
      name: "Light",
      // General
      backgroundColor: "#f0f0f0",
      // Fixed Tags Bar (Primary Tags)
      fixedTagsBackground: "#e9ecef",
      fixedTagsTextColor: "#212529",
      fixedTagsTextMuted: "#6c757d",
      // Navigation Separator
      navSeparatorColor: "#b8860b",  // Dark yellow separator
      // Navbar (Secondary Tag Menu Bar)
      navbarBackground: "#dee2e6",
      navbarTextColor: "#212529",
      navbarTextMuted: "#6c757d",
      // Cards
      cardBackground: "#ffffff",
      cardTextColor: "#212529",
      cardBorder: "#dee2e6",
      cardShadow: "0 0.25rem 0.5rem rgba(0,0,0,0.08)",
      linkColor: "#0066cc",
      linkHoverColor: "#0052a3",
      // Fixed Tags (Primary Tags)
      hoverBackground: "#e9ecef",
      activeTagBackground: "#007cf9",
      activeTagColor: "#ffffff",
      // Secondary Tags (Tag Menu) - Slightly darker than navbar
      secondaryTagBackground: "#dee2e6",
      secondaryTagTextColor: "#212529",
      secondaryTagHoverBackground: "#dee2e6",
      secondaryTagActiveBackground: "#2d96ff",
      secondaryTagActiveColor: "#ffffff",
      // Action Buttons (Add & Settings)
      actionBtnBackground: "transparent",
      actionBtnTextColor: "#212529",
      actionBtnHoverBackground: "#e9ecef",
      actionBtnHoverColor: "#212529",
      // Modals
      modalBackground: "#ffffff",
      modalHeaderBackground: "#f8f9fa",
      modalTextColor: "#212529",
      // Buttons & UI
      primaryColor: "#007bff",
      secondaryColor: "#6c757d",
      borderColor: "#dee2e6",
      textMuted: "#6c757d"
    },
    dark: {
      name: "Dark",
      // General
      backgroundColor: "#121212",
      // Fixed Tags Bar (Primary Tags)
      fixedTagsBackground: "#1e1e1e",
      fixedTagsTextColor: "#e0e0e0",
      fixedTagsTextMuted: "#a0a0a0",
      // Navigation Separator
      navSeparatorColor: "#b8860b",  // Dark yellow separator
      // Navbar (Secondary Tag Menu Bar)
      navbarBackground: "#2a2a2a",
      navbarTextColor: "#e0e0e0",
      navbarTextMuted: "#a0a0a0",
      // Cards
      cardBackground: "#2d2d2d",
      cardTextColor: "#e8e8e8",
      cardBorder: "#404040",
      cardShadow: "0 0.25rem 0.5rem rgba(0,0,0,0.5)",
      linkColor: "#4d9fff",
      linkHoverColor: "#66b0ff",
      // Fixed Tags (Primary Tags)
      hoverBackground: "#2a2a2a",
      activeTagBackground: "#4d9fff",
      activeTagColor: "#ffffff",
      // Secondary Tags (Tag Menu) - Slightly lighter than navbar
      secondaryTagBackground: "#2a2a2a",
      secondaryTagTextColor: "#e0e0e0",
      secondaryTagHoverBackground: "#3a3a3a",
      secondaryTagActiveBackground: "#4d9fff",
      secondaryTagActiveColor: "#ffffff",
      // Action Buttons (Add & Settings)
      actionBtnBackground: "transparent",
      actionBtnTextColor: "#e0e0e0",
      actionBtnHoverBackground: "#2a2a2a",
      actionBtnHoverColor: "#ffffff",
      // Modals
      modalBackground: "#2d2d2d",
      modalHeaderBackground: "#212121",
      modalTextColor: "#e0e0e0",
      // Buttons & UI
      primaryColor: "#4d9fff",
      secondaryColor: "#6c757d",
      borderColor: "#404040",
      textMuted: "#a0a0a0"
    },
    solarized: {
      name: "Solarized Dark",
      // General
      backgroundColor: "#002b36",
      // Fixed Tags Bar (Primary Tags)
      fixedTagsBackground: "#073642",
      fixedTagsTextColor: "#93a1a1",
      fixedTagsTextMuted: "#657b83",
      // Navigation Separator
      navSeparatorColor: "#b58900",  // Solarized yellow
      // Navbar (Secondary Tag Menu Bar)
      navbarBackground: "#094656",
      navbarTextColor: "#93a1a1",
      navbarTextMuted: "#657b83",
      // Cards
      cardBackground: "#073642",
      cardTextColor: "#93a1a1",
      cardBorder: "#094656",
      cardShadow: "0 0.25rem 0.5rem rgba(0,0,0,0.6)",
      linkColor: "#268bd2",
      linkHoverColor: "#2aa198",
      // Fixed Tags (Primary Tags)
      hoverBackground: "#094656",
      activeTagBackground: "#268bd2",
      activeTagColor: "#fdf6e3",
      // Secondary Tags (Tag Menu) - Slightly lighter than navbar
      secondaryTagBackground: "#094656",
      secondaryTagTextColor: "#93a1a1",
      secondaryTagHoverBackground: "#0f5866",
      secondaryTagActiveBackground: "#268bd2",
      secondaryTagActiveColor: "#fdf6e3",
      // Action Buttons (Add & Settings)
      actionBtnBackground: "transparent",
      actionBtnTextColor: "#93a1a1",
      actionBtnHoverBackground: "#094656",
      actionBtnHoverColor: "#fdf6e3",
      // Modals
      modalBackground: "#073642",
      modalHeaderBackground: "#002b36",
      modalTextColor: "#839496",
      // Buttons & UI
      primaryColor: "#268bd2",
      secondaryColor: "#586e75",
      borderColor: "#094656",
      textMuted: "#586e75"
    },
    nord: {
      name: "Nord",
      // General
      backgroundColor: "#2e3440",
      // Fixed Tags Bar (Primary Tags)
      fixedTagsBackground: "#3b4252",
      fixedTagsTextColor: "#eceff4",
      fixedTagsTextMuted: "#d8dee9",
      // Navigation Separator
      navSeparatorColor: "#ebcb8b",  // Nord yellow
      // Navbar (Secondary Tag Menu Bar)
      navbarBackground: "#434c5e",
      navbarTextColor: "#eceff4",
      navbarTextMuted: "#d8dee9",
      // Cards
      cardBackground: "#3b4252",
      cardTextColor: "#eceff4",
      cardBorder: "#4c566a",
      cardShadow: "0 0.25rem 0.5rem rgba(0,0,0,0.4)",
      linkColor: "#88c0d0",
      linkHoverColor: "#81a1c1",
      // Fixed Tags (Primary Tags)
      hoverBackground: "#434c5e",
      activeTagBackground: "#5e81ac",
      activeTagColor: "#eceff4",
      // Secondary Tags (Tag Menu) - Slightly lighter than navbar
      secondaryTagBackground: "#434c5e",
      secondaryTagTextColor: "#eceff4",
      secondaryTagHoverBackground: "#4c566a",
      secondaryTagActiveBackground: "#5e81ac",
      secondaryTagActiveColor: "#eceff4",
      // Action Buttons (Add & Settings)
      actionBtnBackground: "transparent",
      actionBtnTextColor: "#eceff4",
      actionBtnHoverBackground: "#434c5e",
      actionBtnHoverColor: "#eceff4",
      // Modals
      modalBackground: "#3b4252",
      modalHeaderBackground: "#2e3440",
      modalTextColor: "#eceff4",
      // Buttons & UI
      primaryColor: "#5e81ac",
      secondaryColor: "#4c566a",
      borderColor: "#434c5e",
      textMuted: "#d8dee9"
    },
    monokai: {
      name: "Monokai",
      // General
      backgroundColor: "#272822",
      // Fixed Tags Bar (Primary Tags)
      fixedTagsBackground: "#3e3d32",
      fixedTagsTextColor: "#f8f8f2",
      fixedTagsTextMuted: "#75715e",
      // Navigation Separator
      navSeparatorColor: "#e6db74",  // Monokai yellow
      // Navbar (Secondary Tag Menu Bar)
      navbarBackground: "#49483e",
      navbarTextColor: "#f8f8f2",
      navbarTextMuted: "#75715e",
      // Cards
      cardBackground: "#3e3d32",
      cardTextColor: "#f8f8f2",
      cardBorder: "#5a594e",
      cardShadow: "0 0.25rem 0.5rem rgba(0,0,0,0.5)",
      linkColor: "#66d9ef",
      linkHoverColor: "#a6e22e",
      // Fixed Tags (Primary Tags)
      hoverBackground: "#49483e",
      activeTagBackground: "#f92672",
      activeTagColor: "#f8f8f2",
      // Secondary Tags (Tag Menu) - Slightly lighter than navbar
      secondaryTagBackground: "#49483e",
      secondaryTagTextColor: "#f8f8f2",
      secondaryTagHoverBackground: "#5a594e",
      secondaryTagActiveBackground: "#f92672",
      secondaryTagActiveColor: "#f8f8f2",
      // Action Buttons (Add & Settings)
      actionBtnBackground: "transparent",
      actionBtnTextColor: "#f8f8f2",
      actionBtnHoverBackground: "#49483e",
      actionBtnHoverColor: "#f8f8f2",
      // Modals
      modalBackground: "#3e3d32",
      modalHeaderBackground: "#272822",
      modalTextColor: "#f8f8f2",
      // Buttons & UI
      primaryColor: "#f92672",
      secondaryColor: "#75715e",
      borderColor: "#49483e",
      textMuted: "#75715e"
    }
  }
};
