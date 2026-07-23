# 🌊 Liquid Glass UI

A modern GNOME Shell extension that brings a stunning **Liquid Glass** aesthetic to your desktop environment. Transform your GNOME interface with smooth glassmorphism effects, elegant blur transitions, and premium visual enhancements.

![Version](https://img.shields.io/badge/version-2.0-blue)
![GNOME](https://img.shields.io/badge/GNOME-40%2B-purple)
![License](https://img.shields.io/badge/license-GPL--3.0-green)

## ✨ Features

- **🎨 Premium Glassmorphism**: Realistic liquid glass effect with backdrop blur filters
- **✨ Smooth Animations**: Elegant fade-in/fade-out transitions powered by Clutter
- **🔍 Enhanced Search**: Beautiful styling for search entries and results
- **📱 Responsive Design**: Adapts seamlessly to different UI elements
- **🛡️ Memory Safe**: Optimized cleanup prevents memory leaks
- **⚡ High Performance**: Efficient rendering with minimal resource usage

### What's Styled?

- Panel and system tray
- Application overview
- Search entries and results
- Popup menus and dialogs
- Buttons with hover effects
- Workspace switcher
- And more!

## 📸 Screenshots

*Add your screenshots here*

## 🚀 Installation

### Method 1: GNOME Extensions Website (Recommended)

1. Visit [extensions.gnome.org](https://extensions.gnome.org/)
2. Search for "Liquid Glass UI"
3. Toggle the switch to install

### Method 2: Manual Installation

```bash
# Clone or download this repository
cd /workspace

# Create the extensions directory if it doesn't exist
mkdir -p ~/.local/share/gnome-shell/extensions

# Copy the extension
cp -r liquid-glass@expert.dev ~/.local/share/gnome-shell/extensions/

# Restart GNOME Shell
# Press Alt+F2, type 'r', and press Enter (for X11)
# Or log out and log back in (for Wayland)
```

### Method 3: From Source

```bash
git clone https://github.com/YOUR_USERNAME/liquid-glass-ui.git
cd liquid-glass-ui
cp -r liquid-glass@expert.dev ~/.local/share/gnome-shell/extensions/
```

## ⚙️ Configuration

After installation, enable the extension using:

- **GNOME Tweaks**: Open Tweaks → Extensions → Enable "Liquid Glass UI"
- **Command Line**: 
  ```bash
  gnome-extensions enable liquid-glass@expert.dev
  ```

To disable:
```bash
gnome-extensions disable liquid-glass@expert.dev
```

To view logs:
```bash
journalctl -f -o cat | grep -i "liquid-glass"
```

## 🎨 Customization

You can customize the appearance by editing `stylesheet.css`:

```css
/* Adjust blur intensity */
.liquid-glass-blur {
    backdrop-filter: blur(20px); /* Change this value */
}

/* Modify transparency */
.liquid-glass-panel {
    background-color: rgba(30, 30, 40, 0.6); /* Adjust alpha */
}

/* Change shadow intensity */
.liquid-glass-shadow {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); /* Modify values */
}
```

After making changes, restart GNOME Shell to apply them.

## 🐛 Troubleshooting

### Extension not showing up?
- Ensure GNOME Shell version is 40 or higher
- Check if the extension is properly copied to the extensions directory
- Restart GNOME Shell

### Visual glitches?
- Disable other conflicting extensions
- Check system logs: `journalctl -f -o cat | grep -i "liquid-glass"`
- Try adjusting blur intensity in stylesheet.css

### Performance issues?
- Reduce blur radius in CSS
- Disable animations if needed
- Check for GPU driver updates

## 🛠️ Development

### Project Structure

```
liquid-glass@expert.dev/
├── extension.js      # Main extension logic
├── stylesheet.css    # Styling and visual effects
├── metadata.json     # Extension metadata
└── README.md         # This file
```

### Building from Source

```bash
# Install development dependencies
sudo apt install gnome-shell-extensions

# Test the extension
gnome-extensions enable liquid-glass@expert.dev

# View logs in real-time
journalctl -f -o cat | grep -i "liquid-glass"
```

### Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Requirements

- GNOME Shell 40 or higher
- Linux distribution with GNOME Desktop Environment
- Modern GPU with proper drivers for blur effects

### Tested On

- Ubuntu 22.04+ with GNOME
- Fedora 36+ with GNOME
- Debian 11+ with GNOME
- Arch Linux with GNOME

## 📄 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- GNOME Shell team for the amazing desktop environment
- The glassmorphism design community for inspiration
- All contributors who help improve this extension

## 📬 Contact

- **Issues**: Report bugs and request features on the [Issues page](https://github.com/YOUR_USERNAME/liquid-glass-ui/issues)
- **Discussions**: Join discussions on the [Discussions page](https://github.com/YOUR_USERNAME/liquid-glass-ui/discussions)

---

**Made with ❤️ for the GNOME Community**

*Enjoy your beautiful Liquid Glass desktop!*
