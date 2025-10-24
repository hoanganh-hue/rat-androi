# Configuration Files Documentation

This document explains the configuration files added to suppress browser compatibility warnings for Electron-specific features.

## Files Overview

### 1. `.browserslistrc`
Specifies target browsers/platforms for the project.

**Purpose:** Tells tools like Autoprefixer, Babel, and linters that this project targets Electron/Chromium only.

**Content:**
```
Electron >= 9.0
Chrome >= 83
```

### 2. `.hintrc`
Configuration for webhint (web linting tool).

**Purpose:** Configures webhint to ignore `-webkit-app-region` compatibility warnings since it's an Electron-specific feature.

**Key settings:**
- Extends: `web-recommended`
- Ignores: `-webkit-app-region` in compat-api/css
- Target: Electron >= 9.0, Chrome >= 83

### 3. `.stylelintrc.json`
Configuration for Stylelint (CSS linter).

**Purpose:** Tells Stylelint to allow vendor prefixes and specifically ignore `-webkit-app-region`.

**Key rules:**
- `property-no-vendor-prefix`: null (allow vendor prefixes)
- `property-no-unknown`: ignore `-webkit-app-region`

### 4. `.vscode/settings.json`
VS Code workspace settings.

**Purpose:** Configures VS Code's CSS validation to accept `-webkit-app-region`.

**Key settings:**
- `css.lint.validProperties`: includes `-webkit-app-region`
- `css.lint.vendorPrefix`: "ignore"
- `html.validate.styles`: false

## Why These Configs Are Needed

### The Issue
`-webkit-app-region` is a Chromium/Electron-only CSS property that enables:
- Draggable window regions in frameless Electron windows
- Custom window chrome implementation

### Browser Support
- ✅ **Supported:** Electron, Chrome, Chromium-based browsers
- ❌ **Not Supported:** Firefox, Safari, Edge (legacy)

### Why It's Safe
1. **This is an Electron app** - only runs on Chromium runtime
2. **Standard practice** - used by VS Code, Discord, Slack, GitHub Desktop
3. **No alternatives** - this is the only way to implement draggable regions in Electron

## CSS Implementation

The actual CSS uses `@supports` rule for progressive enhancement:

```css
@supports (-webkit-app-region: drag) {
  .draggable {
    -webkit-app-region: drag;
  }
  
  .notDraggable {
    -webkit-app-region: no-drag;
  }
}
```

This ensures the property only applies in browsers that support it (i.e., Electron/Chromium).

## Related Files

- `app/assets/css/mystyle.css` - Contains the `-webkit-app-region` declarations
- `app/lab.html` - Uses `.draggable` and `.notDraggable` classes
- `app/remoteControl.html` - Remote control interface

## Maintenance

When updating Electron version:
1. Update `.browserslistrc` with new Electron version
2. Update `.hintrc` browserslist if needed
3. No changes needed for `.stylelintrc.json` or `.vscode/settings.json`

## References

- [Electron Frameless Window Documentation](https://www.electronjs.org/docs/latest/tutorial/window-customization#create-frameless-windows)
- [Chromium CSS -webkit-app-region](https://developer.chrome.com/docs/extensions/reference/app_window/)
- [Browserslist GitHub](https://github.com/browserslist/browserslist)
- [Stylelint Documentation](https://stylelint.io/)

