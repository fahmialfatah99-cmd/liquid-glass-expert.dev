import Shell from 'gi://Shell';
import St from 'gi://St';
import Main from 'ui/main';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class LiquidGlassExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._effects = [];
        this._styleClasses = [];
        this._observer = null;
    }

    enable() {
        // Blur effects
        this._addBlur(Main.panel, 12, 1.0);
        if (Main.layoutManager.overviewGroup) {
            this._addBlur(Main.layoutManager.overviewGroup, 24, 1.1);
        }
        if (Main.overview.dash) {
            this._addBlur(Main.overview.dash, 16, 1.0);
        }

        // Style classes
        this._addStyleClass(Main.panel, 'liquid-glass-panel');
        if (Main.overview.dash) {
            this._addStyleClass(Main.overview.dash, 'liquid-glass-dash');
        }

        // === FIX: Observer untuk elemen dinamis (submenu, popup) ===
        this._observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this._applyToDynamicElement(node);
                    }
                }
            }
        });

        this._observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        // Apply ke elemen yang sudah ada
        this._scanExistingElements();
    }

    _scanExistingElements() {
        const selectors = [
            '.quick-toggle-menu',
            '.popup-menu-content',
            '.aggregate-menu',
            '.nm-menu-item',
            '.system-switcher'
        ];

        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (!el.classList.contains('liquid-glass-applied')) {
                    el.classList.add('liquid-glass-applied');
                    el.classList.add('liquid-glass-submenu');
                }
            });
        }
    }

    _applyToDynamicElement(node) {
        if (!node.classList) return;

        const targetClasses = [
            'quick-toggle-menu',
            'popup-menu-content',
            'aggregate-menu',
            'nm-menu-item',
            'system-switcher',
            'popup-menu-boxpointer'
        ];

        for (const cls of targetClasses) {
            if (node.classList.contains(cls)) {
                node.classList.add('liquid-glass-applied');
                node.classList.add('liquid-glass-submenu');
                break;
            }
        }

        // Cek children
        if (node.querySelectorAll) {
            targetClasses.forEach(cls => {
                node.querySelectorAll(`.${cls}`).forEach(el => {
                    if (!el.classList.contains('liquid-glass-applied')) {
                        el.classList.add('liquid-glass-applied');
                        el.classList.add('liquid-glass-submenu');
                    }
                });
            });
        }
    }

    _addBlur(actor, sigma, brightness) {
        if (!actor) return;
        const effect = new Shell.BlurEffect({
            sigma: sigma,
            brightness: brightness,
            mode: Shell.BlurMode.BACKGROUND
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
        for (const { actor, name } of this._effects) {
            if (actor && !actor.is_finalized()) {
                actor.remove_effect_by_name(name);
            }
        }
        this._effects = [];

        for (const { actor, className } of this._styleClasses) {
            if (actor && !actor.is_finalized()) {
                actor.remove_style_class_name(className);
            }
        }
        this._styleClasses = [];

        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }

        // Hapus class dari semua elemen
        const applied = document.querySelectorAll('.liquid-glass-applied');
        applied.forEach(el => {
            el.classList.remove('liquid-glass-applied');
            el.classList.remove('liquid-glass-submenu');
        });
    }
}
