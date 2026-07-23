import Gtk from 'gi://Gtk';
import Shell from 'gi://Shell';
import St from 'gi://St';
import Gio from 'gi://Gio';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

const getMain = () => Shell.Main;

export default class LiquidGlassExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._settings = null;
        this._signalIds = [];
        this._cssProvider = null;
    }

    enable() {
        const Main = getMain();
        
        this._settings = this.getSettings();
        
        if (Main.uiGroup) {
            Main.uiGroup.add_style_class_name('liquid-glass-enabled');
        }

        this._updateCSSVariables();
        this._connectSettingsSignals();
        this._monitorSystemTheme();

        console.log('[Liquid Glass] Enabled with customizable settings');
    }

    _connectSettingsSignals() {
        const keys = ['blur-strength', 'darkness-level', 'saturation-level', 'enable-rounding', 'corner-radius'];
        
        keys.forEach(key => {
            const signalId = this._settings.connect(`changed::${key}`, () => {
                this._updateCSSVariables();
            });
            this._signalIds.push({ source: this._settings, id: signalId });
        });
    }

    _monitorSystemTheme() {
        try {
            const interfaceSettings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });
            
            const updateThemeClass = () => {
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

            updateThemeClass();
            const signalId = interfaceSettings.connect('changed::color-scheme', updateThemeClass);
            this._signalIds.push({ source: interfaceSettings, id: signalId });
        } catch (e) {
            console.error('[Liquid Glass] Theme monitor error:', e);
        }
    }

    _updateCSSVariables() {
        const Main = getMain();
        if (!Main.uiGroup) return;

        const blur = this._settings.get_int('blur-strength');
        const darkness = this._settings.get_double('darkness-level');
        const saturation = this._settings.get_double('saturation-level');
        const rounding = this._settings.get_boolean('enable-rounding');
        const radius = this._settings.get_int('corner-radius');

        const cssVariables = `
            #liquid-glass-root {
                --lg-blur: ${blur}px;
                --lg-darkness: ${darkness};
                --lg-saturation: ${saturation};
                --lg-radius: ${rounding ? radius : 0}px;
            }
        `;

        if (this._cssProvider) {
            try {
                St.StyleContext.remove_provider(this._cssProvider);
            } catch (e) {}
            this._cssProvider = null;
        }

        this._cssProvider = new Gtk.CssProvider();
        try {
            this._cssProvider.load_from_data(cssVariables);
            St.StyleContext.add_provider_for_display(
                Gdk.Display.get_default(),
                this._cssProvider,
                Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
            );
            
            Main.uiGroup.set_id('liquid-glass-root');
        } catch (e) {
            console.error('[Liquid Glass] CSS Update Error:', e);
        }
    }

    disable() {
        const Main = getMain();

        if (Main.uiGroup && !Main.uiGroup.is_finalized()) {
            Main.uiGroup.remove_style_class_name('liquid-glass-enabled');
            Main.uiGroup.remove_style_class_name('liquid-glass-dark');
            Main.uiGroup.remove_style_class_name('liquid-glass-light');
            Main.uiGroup.set_id(null);
        }

        if (this._cssProvider) {
            try {
                St.StyleContext.remove_provider(this._cssProvider);
            } catch (e) {}
            this._cssProvider = null;
        }

        for (const { source, id } of this._signalIds) {
            if (source && !source.is_finalized()) {
                try {
                    source.disconnect(id);
                } catch (e) {}
            }
        }
        this._signalIds = [];
        this._settings = null;

        console.log('[Liquid Glass] Disabled');
    }
}
