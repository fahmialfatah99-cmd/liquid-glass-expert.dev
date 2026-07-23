import Shell from 'gi://Shell';
import St from 'gi://St';
import Main from 'ui/main';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class LiquidGlassExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._effects = [];
        this._styleClasses = [];
    }

    enable() {
        // Injeksi Blur Effect (Mode BACKGROUND untuk performa optimal)
        this._addBlur(Main.panel, 12, 1.0);
        
        if (Main.layoutManager.overviewGroup) {
            this._addBlur(Main.layoutManager.overviewGroup, 24, 1.1);
        }
        
        if (Main.overview.dash) {
            this._addBlur(Main.overview.dash, 16, 1.0);
        }

        // Tambahkan class CSS untuk styling liquid glass
        this._addStyleClass(Main.panel, 'liquid-glass-panel');
        if (Main.overview.dash) {
            this._addStyleClass(Main.overview.dash, 'liquid-glass-dash');
        }
    }

    _addBlur(actor, sigma, brightness) {
        if (!actor) return;
        
        const effect = new Shell.BlurEffect({
            sigma: sigma,
            brightness: brightness,
            mode: Shell.BlurMode.BACKGROUND // Blur konten di belakang actor
        });
        
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
        // Bersihkan Blur Effects
        for (const { actor, name } of this._effects) {
            if (actor && !actor.is_finalized()) {
                actor.remove_effect_by_name(name);
            }
        }
        this._effects = [];

        // Bersihkan CSS Classes
        for (const { actor, className } of this._styleClasses) {
            if (actor && !actor.is_finalized()) {
                actor.remove_style_class_name(className);
            }
        }
        this._styleClasses = [];
    }
}