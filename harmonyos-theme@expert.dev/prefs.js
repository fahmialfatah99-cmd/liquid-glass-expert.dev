import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class HarmonyOSThemePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window._settings = this.getSettings();

        const page = new Adw.PreferencesPage();
        
        // Visual Effects Group
        const visualGroup = new Adw.PreferencesGroup({
            title: 'Visual Effects',
            description: 'Customize the HarmonyOS glass morphism and appearance.'
        });

        // Blur Strength
        const blurRow = new Adw.ActionRow({
            title: 'Blur Strength',
            subtitle: 'Intensity of the glass blur effect.'
        });
        const blurScale = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({
                lower: 0, upper: 100, step_increment: 1,
                value: window._settings.get_int('blur-strength')
            }),
            digits: 0,
            value_pos: Gtk.PositionType.RIGHT,
            hexpand: true
        });
        window._settings.bind('blur-strength', blurScale.adjustment, 'value', Gio.SettingsBindFlags.DEFAULT);
        blurRow.add_suffix(blurScale);
        blurRow.activatable_widget = blurScale;

        // Darkness Level
        const darkRow = new Adw.ActionRow({
            title: 'Darkness Level',
            subtitle: 'Background opacity for better contrast.'
        });
        const darkScale = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({
                lower: 0.0, upper: 1.0, step_increment: 0.05,
                value: window._settings.get_double('darkness-level')
            }),
            digits: 2,
            value_pos: Gtk.PositionType.RIGHT,
            hexpand: true
        });
        window._settings.bind('darkness-level', darkScale.adjustment, 'value', Gio.SettingsBindFlags.DEFAULT);
        darkRow.add_suffix(darkScale);
        darkRow.activatable_widget = darkScale;

        // Color Saturation
        const satRow = new Adw.ActionRow({
            title: 'Color Saturation',
            subtitle: 'Vibrancy of colors behind the blur.'
        });
        const satScale = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({
                lower: 0.0, upper: 2.0, step_increment: 0.1,
                value: window._settings.get_double('saturation-level')
            }),
            digits: 1,
            value_pos: Gtk.PositionType.RIGHT,
            hexpand: true
        });
        window._settings.bind('saturation-level', satScale.adjustment, 'value', Gio.SettingsBindFlags.DEFAULT);
        satRow.add_suffix(satScale);
        satRow.activatable_widget = satScale;

        // Panel Transparency
        const panelRow = new Adw.ActionRow({
            title: 'Panel Transparency',
            subtitle: 'Transparency level of the top panel.'
        });
        const panelScale = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({
                lower: 0.0, upper: 1.0, step_increment: 0.05,
                value: window._settings.get_double('panel-transparency')
            }),
            digits: 2,
            value_pos: Gtk.PositionType.RIGHT,
            hexpand: true
        });
        window._settings.bind('panel-transparency', panelScale.adjustment, 'value', Gio.SettingsBindFlags.DEFAULT);
        panelRow.add_suffix(panelScale);
        panelRow.activatable_widget = panelScale;

        visualGroup.add(blurRow);
        visualGroup.add(darkRow);
        visualGroup.add(satRow);
        visualGroup.add(panelRow);
        page.add(visualGroup);

        // Appearance Group
        const appearanceGroup = new Adw.PreferencesGroup({
            title: 'Appearance',
            description: 'Customize colors and corner radius.'
        });

        // Rounded Corners Toggle
        const roundSwitch = new Gtk.Switch({
            valign: Gtk.Align.CENTER
        });
        const roundRow = new Adw.ActionRow({
            title: 'Rounded Corners',
            subtitle: 'Enable smooth corner radius on panels.'
        });
        roundRow.add_suffix(roundSwitch);
        roundRow.activatable_widget = roundSwitch;
        window._settings.bind('enable-rounding', roundSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

        // Corner Radius
        const radiusRow = new Adw.ActionRow({
            title: 'Corner Radius',
            subtitle: 'Size of the rounded corners (pixels).'
        });
        const radiusScale = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({
                lower: 0, upper: 36, step_increment: 1,
                value: window._settings.get_int('corner-radius')
            }),
            digits: 0,
            value_pos: Gtk.PositionType.RIGHT,
            hexpand: true,
            sensitive: window._settings.get_boolean('enable-rounding')
        });
        
        window._settings.connect('changed::enable-rounding', () => {
            radiusScale.sensitive = window._settings.get_boolean('enable-rounding');
        });

        window._settings.bind('corner-radius', radiusScale.adjustment, 'value', Gio.SettingsBindFlags.DEFAULT);
        radiusRow.add_suffix(radiusScale);
        radiusRow.activatable_widget = radiusScale;

        // Accent Color
        const accentRow = new Adw.ActionRow({
            title: 'Accent Color',
            subtitle: 'Primary color for highlights and active states.'
        });
        const accentEntry = new Gtk.Entry({
            text: window._settings.get_string('accent-color'),
            hexpand: true,
            width_chars: 10
        });
        accentEntry.connect('changed', () => {
            window._settings.set_string('accent-color', accentEntry.text);
        });
        accentRow.add_suffix(accentEntry);
        accentRow.activatable_widget = accentEntry;

        appearanceGroup.add(roundRow);
        appearanceGroup.add(radiusRow);
        appearanceGroup.add(accentRow);
        page.add(appearanceGroup);

        // Animation Group
        const animationGroup = new Adw.PreferencesGroup({
            title: 'Animation',
            description: 'Control animation speed and behavior.'
        });

        // Animation Speed
        const animRow = new Adw.ActionRow({
            title: 'Animation Speed',
            subtitle: 'Multiplier for all UI animations.'
        });
        const animScale = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({
                lower: 0.5, upper: 2.0, step_increment: 0.1,
                value: window._settings.get_double('animation-speed')
            }),
            digits: 1,
            value_pos: Gtk.PositionType.RIGHT,
            hexpand: true
        });
        window._settings.bind('animation-speed', animScale.adjustment, 'value', Gio.SettingsBindFlags.DEFAULT);
        animRow.add_suffix(animScale);
        animRow.activatable_widget = animScale;

        // Dynamic Colors Toggle
        const dynamicSwitch = new Gtk.Switch({
            valign: Gtk.Align.CENTER
        });
        const dynamicRow = new Adw.ActionRow({
            title: 'Dynamic Colors',
            subtitle: 'Adapt colors based on wallpaper or system theme.'
        });
        dynamicRow.add_suffix(dynamicSwitch);
        dynamicRow.activatable_widget = dynamicSwitch;
        window._settings.bind('enable-dynamic-colors', dynamicSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);

        animationGroup.add(animRow);
        animationGroup.add(dynamicRow);
        page.add(animationGroup);

        window.add(page);
    }
}
