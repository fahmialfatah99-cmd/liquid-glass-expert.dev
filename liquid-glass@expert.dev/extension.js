import Shell from 'gi://Shell';
import St from 'gi://St';
import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';
import Main from 'ui/main';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class LiquidGlassExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._effects = [];
        this._styleClasses = [];
        this._originalOpacity = new Map();
    }
    
    enable() {
        try {
            // Apply blur to panel with optimized settings
            this._addBlur(Main.panel, 18, 1.0);
            
            // Apply blur to overview group if available
            if (Main.layoutManager?.overviewGroup) {
                this._addBlur(Main.layoutManager.overviewGroup, 28, 1.1);
            }
            
            // Apply blur to dash with proper null checking
            if (Main.overview?.dash) {
                this._addBlur(Main.overview.dash, 20, 1.0);
            }
            
            // Apply blur to search entry if available
            if (Main.overview?.searchEntry) {
                this._addBlur(Main.overview.searchEntry, 15, 1.0);
            }

            // Add liquid glass style classes
            this._addStyleClass(Main.panel, 'liquid-glass-panel');
            
            if (Main.overview?.dash) {
                this._addStyleClass(Main.overview.dash, 'liquid-glass-dash');
                // Also apply to dash background for better coverage
                const dashBackground = Main.overview.dash.getChildAtIndex(0);
                if (dashBackground) {
                    this._addStyleClass(dashBackground, 'liquid-glass-dash-bg');
                }
            }
            
            if (Main.overview?.searchEntry) {
                this._addStyleClass(Main.overview.searchEntry, 'liquid-glass-search');
            }
            
            // Apply to overview controls
            if (Main.layoutManager?.overviewGroup) {
                const overviewControls = Main.layoutManager.overviewGroup.get_child_at_index(0);
                if (overviewControls) {
                    this._addStyleClass(overviewControls, 'liquid-glass-overview-controls');
                }
            }
            
            // Smooth fade-in animation
            this._animateElements('in');
            
            globalThis.log?.('[Liquid Glass] Extension enabled successfully');
        } catch (error) {
            globalThis.logError?.(error, '[Liquid Glass] Error enabling extension');
        }
    }

    _addBlur(actor, sigma, brightness) {
        if (!actor || actor.is_finalized?.()) return;
        
        // Remove existing blur effect if any
        actor.remove_effect_by_name('liquid-glass-blur');
        
        const effect = new Shell.BlurEffect({
            sigma: sigma,
            brightness: brightness,
            mode: Shell.BlurMode.BACKGROUND
        });
        
        actor.add_effect_with_name('liquid-glass-blur', effect);
        this._effects.push({ actor, name: 'liquid-glass-blur' });
    }

    _addStyleClass(actor, className) {
        if (!actor || actor.is_finalized?.()) return;
        
        try {
            if (!actor.has_style_class_name?.(className)) {
                actor.add_style_class_name(className);
                this._styleClasses.push({ actor, className });
            }
        } catch (error) {
            // Silently fail for actors that don't support style classes
        }
    }
    
    _animateElements(direction) {
        const actors = this._effects.map(e => e.actor).filter(a => a && !a.is_finalized?.());
        
        if (direction === 'in') {
            actors.forEach(actor => {
                this._originalOpacity.set(actor, actor.opacity ?? 255);
                actor.opacity = 0;
                actor.ease({
                    opacity: 255,
                    duration: 400,
                    mode: Clutter.AnimationMode.EASE_OUT_CUBIC
                });
            });
        } else {
            actors.forEach(actor => {
                const originalOpacity = this._originalOpacity.get(actor) ?? 255;
                actor.ease({
                    opacity: originalOpacity,
                    duration: 200,
                    mode: Clutter.AnimationMode.EASE_OUT_QUAD
                });
            });
        }
    }

    disable() {
        try {
            // Animate elements out before removing effects
            this._animateElements('out');
            
            // Wait for animation to complete before cleaning up
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 250, () => {
                this._cleanup();
                return GLib.SOURCE_REMOVE;
            });
            
            globalThis.log?.('[Liquid Glass] Extension disabled');
        } catch (error) {
            globalThis.logError?.(error, '[Liquid Glass] Error disabling extension');
            this._cleanup();
        }
    }
    
    _cleanup() {
        // Clean up Blur Effects
        for (const { actor, name } of this._effects) {
            try {
                if (actor && !actor.is_finalized?.()) {
                    actor.remove_effect_by_name(name);
                }
            } catch (error) {
                // Ignore errors during cleanup
            }
        }
        this._effects = [];

        // Clean up CSS Classes
        for (const { actor, className } of this._styleClasses) {
            try {
                if (actor && !actor.is_finalized?.()) {
                    actor.remove_style_class_name(className);
                }
            } catch (error) {
                // Ignore errors during cleanup
            }
        }
        this._styleClasses = [];
        this._originalOpacity.clear();
    }
}
