# Smart Before After

[![WordPress](https://img.shields.io/badge/WordPress-6.0%2B-blue.svg)](https://wordpress.org/)
[![PHP](https://img.shields.io/badge/PHP-7.4%2B-purple.svg)](https://php.net/)
[![License](https://img.shields.io/badge/License-GPL--2.0--or--later-green.svg)](https://www.gnu.org/licenses/gpl-2.0.html)

A Gutenberg block for creating interactive before/after image comparisons with smart CTA triggers.

## Description

Smart Before After is a lightweight, native Gutenberg block that helps you create stunning image comparisons. It detects when users are engaged and automatically shows your CTA at the right moment — turning image comparisons into conversions.

**Perfect for:** Photography, Home Renovation, Beauty & Fitness, Web Design, Product Demos

## Features

### Slider Options
- **2 Orientations** — Horizontal and vertical slider
- **2 Interaction Modes** — Drag or hover to compare
- **3 Handle Styles** — Arrows, circle, and line designs
- **Adjustable Start Position** — Set initial slider position (0-100%)
- **Custom Border Radius** — Rounded corners support

### Labels & Caption
- **Smart Labels** — Customizable before/after text with smart clipping
- **Label Colors** — Custom background and text colors
- **Caption Support** — Add descriptions above or below slider
- **Caption Alignment** — Left, center, or right

### Fullscreen & Animation
- **Fullscreen Mode** — View comparisons in lightbox
- **Scroll Animation** — 5 animation types (fade-up, fade-in, zoom-in, slide-left, slide-right)
- **Animation Controls** — Custom duration and delay

### Smart CTA Trigger
- **Engagement Detection** — Show CTA after user interacts X times
- **Custom Button** — Text, link, and colors
- **Convert Visitors** — Turn engaged users into leads

### Performance & Accessibility
- **Lightweight** — No jQuery, pure vanilla JavaScript
- **Touch Support** — Works perfectly on mobile devices
- **Keyboard Accessible** — Full keyboard navigation (Arrow keys)
- **Fully Responsive** — Looks great on all devices
- **Wide/Full Alignment** — Block alignment support

## Requirements

- WordPress 6.0+
- PHP 7.4+

## Installation

1. Download the latest release from [Releases](https://github.com/cartfixwp/smart-before-after/releases)
2. Upload to `/wp-content/plugins/` and extract
3. Activate the plugin in WordPress admin
4. Add the "Smart Before After" block in the editor

## Usage

1. Add the **Smart Before After** block (found under Media category)
2. Upload your Before and After images
3. Configure settings in the sidebar:
   - Choose orientation (horizontal/vertical)
   - Select interaction mode (drag/hover)
   - Customize handle style and color
   - Add labels and caption
   - Enable animations and fullscreen
   - Set up Smart CTA trigger
4. Publish!

## Development

### Build from Source

```bash
# Clone the repository
git clone https://github.com/cartfixwp/smart-before-after.git
cd smart-before-after

# Install dependencies
npm install

# Development build with watch
npm run start

# Production build
npm run build
```

### File Structure

```
smart-before-after/
├── build/                  # Compiled assets
├── src/
│   ├── block.json         # Block metadata
│   ├── index.js           # Block registration
│   ├── edit.js            # Editor component
│   ├── save.js            # Frontend output
│   ├── view.js            # Frontend JavaScript
│   ├── style.scss         # Frontend styles
│   └── editor.scss        # Editor styles
├── smart-before-after.php # Main plugin file
└── readme.txt             # WordPress.org readme
```

## Changelog

### 1.0.0
- Initial release
- Horizontal and vertical orientation
- Drag and hover interaction modes
- 3 handle styles: arrows, circle, line
- Fullscreen/lightbox mode
- Custom labels with color options
- Caption support with position options
- 5 scroll animation types
- Smart CTA trigger system
- Touch and keyboard support
- Responsive design

## License

GPL-2.0-or-later — see [LICENSE](LICENSE) file for details.

## Author

**CartFix** — [https://github.com/cartfixwp](https://github.com/cartfixwp)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.