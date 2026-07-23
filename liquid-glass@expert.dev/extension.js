import Shell from 'gi://Shell';
import St from 'gi://St';
import Gio from 'gi://Gio';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

// Akses global objects dengan aman
const getMain = () => Shell.Main;

export default class LiquidGlassExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._themeMonitor = null;
        this._signalIds = [];
    }

    enable() {
        const Main = getMain();
        
        // 1. Tambahkan class global ke UI Group untuk trigger CSS
        if (Main.uiGroup) {
            Main.uiGroup.add_style_class_name('liquid-glass-enabled');
        }

        // 2. Monitor perubahan tema (Dark/Light) secara real-time
        this._monitorThemeChanges();

        // 3. Force update style jika diperlukan
        if (Main.layoutManager) {
            Main.layoutManager._updateBackgrounds();
        }
        
        console.log('[Liquid Glass] Enabled - Ultra Smooth Mode Active');
    }

    _monitorThemeChanges() {
        try {
            const interfaceSettings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });
            
            const updateTheme = () => {
                const Main = getMain();
                if (!Main.uiGroup) return;

                const colorScheme = interfaceSettings.get_string('color-scheme');
                const isDark = colorScheme.includes('dark') || colorScheme.includes('prefer-dark');
                
                if (isDark) {
                    Main.uiGroup.add_style_class_name('liquid-glass-dark');
                    Main.uiGroup.remove_style_class_name('liquid-glass-light');
                } else {
                    Main.uiGroup.add_style_class_name('liquid-glass-light');
                    Main.uiGroup.remove_style_class_name('liquid-glass-dark');
                }
            };

            // Initial check
            updateTheme();

            // Connect signal
            const signalId = interfaceSettings.connect('changed::color-scheme', updateTheme);
            this._signalIds.push({ source: interfaceSettings, id: signalId });
            
        } catch (e) {
            console.error('[Liquid Glass] Theme monitor error:', e);
        }
    }

    disable() {
        const Main = getMain();

        // Remove global classes
        if (Main.uiGroup && !Main.uiGroup.is_finalized()) {
            Main.uiGroup.remove_style_class_name('liquid-glass-enabled');
            Main.uiGroup.remove_style_class_name('liquid-glass-dark');
            Main.uiGroup.remove_style_class_name('liquid-glass-light');
        }

        // Disconnect signals
        for (const { source, id } of this._signalIds) {
            if (source && !source.is_finalized()) {
                try {
                    source.disconnect(id);
                } catch (e) {}
            }
        }
        this._signalIds = [];
        this._themeMonitor = null;

        console.log('[Liquid Glass] Disabled');
    }
}
