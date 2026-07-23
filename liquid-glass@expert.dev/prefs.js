import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class LiquidGlassPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window._settings = this.getSettings();

        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({
            title: 'Visual Effects',
            description: 'Customize the Liquid Glass bokeh and appearance.'
        });

        // Blur Strength
        const blurRow = new Adw.ActionRow({
            title: 'Blur Strength',
            subtitle: 'Intensity of the macOS-style bokeh effect.'
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
                lower: 0, upper: 30, step_increment: 1,
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

        group.add(blurRow);
        group.add(darkRow);
        group.add(satRow);
        group.add(roundRow);
        group.add(radiusRow);

        page.add(group);
        window.add(page);
    }
}
