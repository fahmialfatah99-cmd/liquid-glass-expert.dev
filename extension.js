import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk'; // FIX: Ditambahkan karena digunakan di CSS Provider
import Shell from 'gi://Shell';
import St from 'gi://St';
import Gio from 'gi://Gio';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class LiquidGlassExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._settings = null;
        this._signalIds = [];
        this._cssProvider = null;
        this._themeMonitor = null;
    }

    enable() {
        try {
            // FIX: Safe initialization untuk mencegah crash jika schema settings belum ada
            try {
                this._settings = this.getSettings();
            } catch (e) {
                console.warn('[Liquid Glass] Settings schema tidak ditemukan, menggunakan nilai default.');
                this._settings = null;
            }
            
            // Tambahkan class global ke UI Group
            if (Main.uiGroup) {
                Main.uiGroup.add_style_class_name('liquid-glass-enabled');
            }

            // Inisialisasi CSS Provider
            this._injectCSS();
            
            // Hubungkan sinyal pengaturan (jika ada)
            this._connectSettingsSignals();
            
            // Monitor tema sistem (Light/Dark)
            this._monitorSystemTheme();

            console.log('[Liquid Glass] Enabled successfully (GNOME 45+ Safe Mode)');
        } catch (e) {
            console.error('[Liquid Glass] Enable error:', e);
        }
    }

    _injectCSS() {
        // Hapus provider lama jika ada
        if (this._cssProvider) {
            try {
                Gtk.StyleContext.remove_provider_for_display(
                    Gdk.Display.get_default(),
                    this._cssProvider
                );
            } catch (e) {}
            this._cssProvider = null;
        }

        this._cssProvider = new Gtk.CssProvider();
        
        // FIX: Gunakan nilai default jika this._settings null
        const blur = this._settings ? this._settings.get_int('blur-strength') : 50;
        const darkness = this._settings ? this._settings.get_double('darkness-level') : 0.75;
        const saturation = this._settings ? this._settings.get_double('saturation-level') : 1.3;
        const rounding = this._settings ? this._settings.get_boolean('enable-rounding') : true;
        const radius = this._settings ? this._settings.get_int('corner-radius') : 14;

        // Definisikan variabel CSS (disesuaikan dengan kebutuhan tema terang/gelap kita)
        const cssData = `
            @define-color lg-bg-dark rgba(0, 0, 0, ${darkness});
            @define-color lg-bg-light rgba(255, 255, 255, ${darkness});
            @define-color lg-text-dark #ffffff;
            @define-color lg-text-light #1a1a1a;
            @define-color lg-border-dark rgba(255, 255, 255, 0.15);
            @define-color lg-border-light rgba(0, 0, 0, 0.12);
            @define-color lg-arrow-bg-dark rgba(30, 30, 30, 0.85);
            @define-color lg-arrow-bg-light rgba(255, 255, 255, 0.85);
            @define-color lg-accent rgba(220, 50, 50, 0.85);
            
            :root {
                --lg-blur: ${blur}px;
                --lg-saturation: ${saturation * 100}%;
                --lg-radius: ${rounding ? radius : 0}px;
            }
        `;

        try {
            // FIX: load_from_string lebih stabil daripada load_from_data di GNOME 45+
            this._cssProvider.load_from_string(cssData);
            Gtk.StyleContext.add_provider_for_display(
                Gdk.Display.get_default(),
                this._cssProvider,
                Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
            );
        } catch (e) {
            console.error('[Liquid Glass] CSS Load Error:', e);
        }
    }

    _connectSettingsSignals() {
        if (!this._settings) return;

        const keys = ['blur-strength', 'darkness-level', 'saturation-level', 'enable-rounding', 'corner-radius'];
        
        keys.forEach(key => {
            try {
                const signalId = this._settings.connect(`changed::${key}`, () => {
                    this._injectCSS(); // Reload CSS saat setting berubah
                });
                this._signalIds.push({ source: this._settings, id: signalId });
            } catch (e) {
                console.error(`[Liquid Glass] Signal connect error for ${key}:`, e);
            }
        });
    }

    _monitorSystemTheme() {
        try {
            const interfaceSettings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });
            
            const updateThemeClass = () => {
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
            updateThemeClass();

            // Connect signal untuk mendeteksi perubahan tema secara real-time
            const signalId = interfaceSettings.connect('changed::color-scheme', updateThemeClass);
            this._signalIds.push({ source: interfaceSettings, id: signalId });
            this._themeMonitor = interfaceSettings;
            
        } catch (e) {
            console.error('[Liquid Glass] Theme monitor error:', e);
        }
    }

    disable() {
        try {
            // Hapus class dari UI Group
            if (Main.uiGroup) {
                try {
                    Main.uiGroup.remove_style_class_name('liquid-glass-enabled');
                    Main.uiGroup.remove_style_class_name('liquid-glass-dark');
                    Main.uiGroup.remove_style_class_name('liquid-glass-light');
                } catch (e) {}
            }

            // Hapus CSS Provider
            if (this._cssProvider) {
                try {
                    Gtk.StyleContext.remove_provider_for_display(
                        Gdk.Display.get_default(),
                        this._cssProvider
                    );
                } catch (e) {}
                this._cssProvider = null;
            }

            // Putuskan semua sinyal untuk mencegah memory leak
            for (const { source, id } of this._signalIds) {
                if (source) {
                    try {
                        source.disconnect(id);
                    } catch (e) {}
                }
            }
            this._signalIds = [];
            this._settings = null;
            this._themeMonitor = null;

            console.log('[Liquid Glass] Disabled cleanly');
        } catch (e) {
            console.error('[Liquid Glass] Disable error:', e);
        }
    }
}
