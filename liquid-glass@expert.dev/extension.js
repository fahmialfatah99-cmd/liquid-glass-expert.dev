import Shell from 'gi://Shell';
import St from 'gi://St';
import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import Main from 'ui/main';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class LiquidGlassExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._effects = [];
        this._styleClasses = [];
        this._signalIds = [];
        this._settings = null;
    }

    enable() {
        // Enhanced blur effects - macOS style bokeh
        this._addBlur(Main.panel, 30, 1.0, 0.8);
        if (Main.layoutManager.overviewGroup) {
            this._addBlur(Main.layoutManager.overviewGroup, 40, 1.05, 0.9);
        }
        if (Main.overview.dash) {
            this._addBlur(Main.overview.dash, 35, 1.0, 0.85);
        }

        // Style classes
        this._addStyleClass(Main.panel, 'liquid-glass-panel');
        if (Main.overview.dash) {
            this._addStyleClass(Main.overview.dash, 'liquid-glass-dash');
        }

        // Connect signals untuk track popup/menu changes - instant response
        this._connectSignals();

        // Apply ke elemen yang sudah ada - INSTANT, no delay
        this._scanExistingElements();
        
        // Monitor theme changes
        this._monitorThemeChanges();
    }
    
    _monitorThemeChanges() {
        const interfaceSettings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });
        const colorSchemeSignal = interfaceSettings.connect('changed::color-scheme', () => {
            this._updateThemeMode();
        });
        this._signalIds.push({ actor: interfaceSettings, id: colorSchemeSignal });
        
        // Initial check
        this._updateThemeMode();
    }
    
    _updateThemeMode() {
        if (!Main.uiGroup) return;
        
        const interfaceSettings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });
        const colorScheme = interfaceSettings.get_string('color-scheme');
        const isDark = colorScheme.includes('dark') || colorScheme.includes('prefer-dark');
        
        if (isDark) {
            Main.uiGroup.add_style_class_name('dark-mode-global');
        } else {
            Main.uiGroup.remove_style_class_name('dark-mode-global');
        }
    }

    _connectSignals() {
        // Track ketika popup menu dibuka/ditutup
        const mainMenu = Main.panel.statusArea['quickSettings']?._menu;
        if (mainMenu) {
            this._trackPopupMenu(mainMenu);
        }

        // Track system menu
        const systemMenu = Main.panel.statusArea['systemMenu'];
        if (systemMenu && systemMenu.menu) {
            this._trackPopupMenu(systemMenu.menu);
        }

        // Track date menu
        const dateMenu = Main.panel.statusArea['dateMenu'];
        if (dateMenu && dateMenu.menu) {
            this._trackPopupMenu(dateMenu.menu);
        }

        // Watch untuk actor children changes
        if (Main.uiGroup) {
            const signalId = Main.uiGroup.connect('actor-added', (parent, child) => {
                this._applyToDynamicElement(child);
            });
            this._signalIds.push({ actor: Main.uiGroup, id: signalId });
        }
    }

    _trackPopupMenu(menu) {
        if (!menu) return;

        // Track when menu opens - INSTANT response
        const openSignal = menu.connect('open-state-changed', (menu, isOpen) => {
            if (isOpen) {
                // Apply immediately - no delay
                this._scanExistingElements();
            }
        });
        this._signalIds.push({ actor: menu, id: openSignal });

        // Track actor additions dalam menu - instant
        const addedSignal = menu.actor.connect('actor-added', (parent, child) => {
            this._applyToDynamicElement(child);
        });
        this._signalIds.push({ actor: menu.actor, id: addedSignal });
    }

    _scanExistingElements() {
        if (!Main.uiGroup) return;

        const targetClassNames = [
            'quick-toggle-menu',
            'popup-menu-content',
            'aggregate-menu',
            'nm-menu-item',
            'system-switcher',
            'popup-menu-boxpointer'
        ];

        this._recursiveScan(Main.uiGroup, targetClassNames);
    }

    _recursiveScan(actor, targetClassNames) {
        if (!actor || actor.is_finalized()) return;

        // Cek actor saat ini
        this._checkAndApplyClasses(actor, targetClassNames);

        // Scan children
        const children = actor.get_children ? actor.get_children() : [];
        for (const child of children) {
            this._recursiveScan(child, targetClassNames);
        }
    }

    _checkAndApplyClasses(actor, targetClassNames) {
        if (!actor || actor.is_finalized()) return;

        const currentClasses = actor.get_style_class_name ? actor.get_style_class_name() : '';
        if (!currentClasses) return;

        const classList = currentClasses.split(' ');
        let shouldApply = false;

        for (const targetClass of targetClassNames) {
            if (classList.includes(targetClass)) {
                shouldApply = true;
                break;
            }
        }

        if (shouldApply) {
            if (!classList.includes('liquid-glass-applied')) {
                actor.add_style_class_name('liquid-glass-applied');
            }
            if (!classList.includes('liquid-glass-submenu')) {
                actor.add_style_class_name('liquid-glass-submenu');
            }
        }
    }

    _applyToDynamicElement(actor) {
        if (!actor || actor.is_finalized()) return;

        const targetClassNames = [
            'quick-toggle-menu',
            'popup-menu-content',
            'aggregate-menu',
            'nm-menu-item',
            'system-switcher',
            'popup-menu-boxpointer'
        ];

        this._checkAndApplyClasses(actor, targetClassNames);

        // Jika actor punya children, scan juga - INSTANT
        if (actor.get_children) {
            this._recursiveScan(actor, targetClassNames);
        }
    }

    _addBlur(actor, sigma, brightness, blurAmount = 1.0) {
        if (!actor) return;
        
        // Remove existing blur effect if any
        actor.remove_effect_by_name('liquid-glass-blur');
        
        const effect = new Shell.BlurEffect({
            sigma: sigma,
            brightness: brightness,
            mode: Shell.BlurMode.BACKGROUND
        });
        
        // Set blur amount for stronger bokeh effect
        effect.blur_amount = blurAmount;
        
        actor.add_effect_with_name('liquid-glass-blur', effect);
        this._effects.push({ actor, name: 'liquid-glass-blur' });
    }

    _addStyleClass(actor, className) {
        if (!actor) return;
        if (!actor.has_style_class_name(className)) {
            actor.add_style_class_name(className);
            this._styleClasses.push({ actor, className });
        }
    }

    disable() {
        // Disconnect all signals
        for (const { actor, id } of this._signalIds) {
            if (actor && !actor.is_finalized()) {
                try {
                    actor.disconnect(id);
                } catch (e) {
                    // Signal might already be disconnected
                }
            }
        }
        this._signalIds = [];

        // Remove blur effects
        for (const { actor, name } of this._effects) {
            if (actor && !actor.is_finalized()) {
                actor.remove_effect_by_name(name);
            }
        }
        this._effects = [];

        // Remove style classes
        for (const { actor, className } of this._styleClasses) {
            if (actor && !actor.is_finalized()) {
                actor.remove_style_class_name(className);
            }
        }
        this._styleClasses = [];

        // Remove dark mode global class
        if (Main.uiGroup && !Main.uiGroup.is_finalized()) {
            Main.uiGroup.remove_style_class_name('dark-mode-global');
        }

        // Remove dynamic classes from all actors in uiGroup
        if (Main.uiGroup && !Main.uiGroup.is_finalized()) {
            this._removeDynamicClasses(Main.uiGroup);
        }
    }

    _removeDynamicClasses(actor) {
        if (!actor || actor.is_finalized()) return;

        // Remove classes from current actor
        if (actor.has_style_class_name) {
            if (actor.has_style_class_name('liquid-glass-applied')) {
                actor.remove_style_class_name('liquid-glass-applied');
            }
            if (actor.has_style_class_name('liquid-glass-submenu')) {
                actor.remove_style_class_name('liquid-glass-submenu');
            }
        }

        // Recursively process children
        const children = actor.get_children ? actor.get_children() : [];
        for (const child of children) {
            this._removeDynamicClasses(child);
        }
    }
}
