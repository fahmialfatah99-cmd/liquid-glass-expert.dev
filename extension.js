/* 
 * LIQUID GLASS UI - EXTENSION CONTROLLER
 * Ultra-fast, zero-delay implementation
 */

import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class LiquidGlassExtension extends Extension {
    enable() {
        this._settings = new Gio.Settings({ schema: 'org.gnome.desktop.interface' });
        
        // Force dark mode preference globally for consistent styling
        this._settings.set_boolean('color-scheme', 0); // Prefer Dark
        
        // Inject CSS immediately
        this._injectCSS();
        
        // Monitor theme changes to re-apply if needed (instant)
        this._themeMonitor = this._settings.connect('changed::color-scheme', () => {
            this._forceDarkMode();
        });

        // Remove any default animations that cause lag
        this._removeAnimations();
        
        console.log('[Liquid Glass] Extension Enabled - Ultra Fast Mode');
    }

    disable() {
        // Clean up CSS
        if (this._cssProvider) {
            St.StyleContext.remove_provider_for_display(
                global.display.get_screen(),
                this._cssProvider
            );
            this._cssProvider = null;
        }

        // Disconnect signals
        if (this._themeMonitor) {
            this._settings.disconnect(this._themeMonitor);
            this._themeMonitor = null;
        }

        // Restore animations
        this._restoreAnimations();
        
        console.log('[Liquid Glass] Extension Disabled');
    }

    _injectCSS() {
        this._cssProvider = new Gtk.CssProvider();
        const cssFile = Gio.File.new_for_path(this.path + '/stylesheet.css');
        
        try {
            this._cssProvider.load_from_file(cssFile);
            St.StyleContext.add_provider_for_display(
                global.display.get_screen(),
                this._cssProvider,
                Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
            );
        } catch (e) {
            logError(e, '[Liquid Glass] Failed to load CSS');
        }
    }

    _forceDarkMode() {
        // Ensure system stays in dark mode for our styles to work
        this._settings.set_boolean('color-scheme', 0);
    }

    _removeAnimations() {
        // Disable GNOME shell animations for instant response
        const wm = global.window_manager;
        
        // Store original methods to restore later
        this._originalMethods = {
            mapWindow: wm._mapWindow,
            unmapWindow: wm._unmapWindow,
            minimizeWindow: wm._minimizeWindow,
            maximizeWindow: wm._maximizeWindow,
            unmaximizeWindow: wm._unmaximizeWindow,
            tileWindow: wm._tileWindow,
        };

        // Replace with instant operations
        wm._mapWindow = (actor, callback) => {
            actor.show();
            if (callback) callback();
        };
        
        wm._unmapWindow = (actor, callback) => {
            actor.hide();
            if (callback) callback();
        };

        wm._minimizeWindow = (actor, callback) => {
            actor.hide();
            if (callback) callback();
        };
        
        // Keep maximize/tile but remove animation time
        wm._maximizeWindow = (actor, targetRect, callback) => {
            actor.set_position(targetRect.x, targetRect.y);
            actor.set_size(targetRect.width, targetRect.height);
            if (callback) callback();
        };
        
        wm._unmaximizeWindow = (actor, targetRect, callback) => {
            if (targetRect) {
                actor.set_position(targetRect.x, targetRect.y);
                actor.set_size(targetRect.width, targetRect.height);
            }
            if (callback) callback();
        };

        wm._tileWindow = (actor, targetRect, callback) => {
            actor.set_position(targetRect.x, targetRect.y);
            actor.set_size(targetRect.width, targetRect.height);
            if (callback) callback();
        };
    }

    _restoreAnimations() {
        if (!this._originalMethods) return;
        
        const wm = global.window_manager;
        wm._mapWindow = this._originalMethods.mapWindow;
        wm._unmapWindow = this._originalMethods.unmapWindow;
        wm._minimizeWindow = this._originalMethods.minimizeWindow;
        wm._maximizeWindow = this._originalMethods.maximizeWindow;
        wm._unmaximizeWindow = this._originalMethods.unmaximizeWindow;
        wm._tileWindow = this._originalMethods.tileWindow;
        
        this._originalMethods = null;
    }
}
