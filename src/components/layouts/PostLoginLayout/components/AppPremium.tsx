import ShaderArt from '@/components/ui/shader-art'
import { useAppSelector } from '@/store'

/** The landing page's look for the signed-in app: the living aurora behind the frame, a translucent main
 * panel so it shows through, and liquid-glass cards and fields (a diagonal sheen, a bright top rim, and the
 * backdrop blurred and saturated behind them). Scoped to `.app-premium`, so dialogs, dropdowns and
 * drawers (rendered outside it) keep their solid surfaces. */
const APP_CSS = `
.app-premium { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

/* Main panel: no backdrop blur (it is taller than the screen and the aurora is already soft) */
.app-premium .app-panel {
    position: relative;
    /* Barely tinted, so the aurora reads through the panel */
    background-color: rgba(255,255,255,0.1);
    border: 1px solid rgba(15,23,42,0.07);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 20px 60px rgba(15,23,42,0.05);
}
.dark .app-premium .app-panel {
    /* Barely tinted, so the aurora reads through the panel instead of a black slab */
    background-color: rgba(255,255,255,0.018);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 80px rgba(0,0,0,0.3);
}
.app-premium .app-panel::before {
    content: '';
    position: absolute; top: -1px; left: 32px; right: 32px; height: 1px; z-index: 31;
    background: linear-gradient(90deg, transparent, rgba(12,175,96,0.7) 30%, rgba(52,199,121,1) 50%, rgba(12,175,96,0.7) 70%, transparent);
    opacity: 0.55; pointer-events: none;
}

/* Sticky header: frosted, so content blurs as it scrolls under it. The frost lives on a pseudo-element:
   a backdrop-filter on the header itself would stop menus that open from it from blurring the page. */
.app-premium .app-panel > .header { background-color: transparent; }
.app-premium .app-panel > .header::before {
    content: '';
    position: absolute; inset: 0; z-index: -1; border-radius: inherit;
    background-color: rgba(255,255,255,0.3);
    -webkit-backdrop-filter: blur(14px) saturate(150%);
    backdrop-filter: blur(14px) saturate(150%);
}
.dark .app-premium .app-panel > .header::before { background-color: rgba(6,9,8,0.35); }

/* Secondary buttons (Cancel, Reset, Filter...): glass instead of solid grey. Applies everywhere in dark mode,
   including drawers and dialogs. */
.dark .button[class*="dark:bg-gray-700"],
.dark .button[class*="dark:bg-gray-800"],
.dark .button[class*="dark:bg-gray-500"] {
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.025) 100%);
    border-color: rgba(255,255,255,0.14);
    -webkit-backdrop-filter: blur(10px) saturate(160%);
    backdrop-filter: blur(10px) saturate(160%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.16);
    transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
}
.dark .button[class*="dark:bg-gray-700"]:hover:not(:disabled),
.dark .button[class*="dark:bg-gray-800"]:hover:not(:disabled),
.dark .button[class*="dark:bg-gray-500"]:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.045) 100%);
    border-color: rgba(52,199,121,0.5);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 0 0 1px rgba(12,175,96,0.14), 0 0 22px rgba(12,175,96,0.14);
}
@layer theme {
    .dark .dropdown-menu { background-color: transparent !important; border-color: rgba(255,255,255,0.12) !important; }
    .dark .button[class*="dark:bg-gray-700"],
.dark .button[class*="dark:bg-gray-800"],
    .dark .button[class*="dark:bg-gray-500"] { background-color: transparent !important; }
}

/* Liquid glass surface: shared by cards and the sidebar cards (the sidebar is dark in both modes) */
.dark .app-premium .card:not(.app-card-plain),
.dark .app-liquid-dark,
.dark .app-liquid {
    /* Clear glass: almost no white tint; the look comes from the blurred, saturated backdrop and the rim */
    background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.006) 45%, rgba(255,255,255,0.016) 100%);
    border: 1px solid rgba(255,255,255,0.09);
    -webkit-backdrop-filter: blur(14px) saturate(180%);
    backdrop-filter: blur(14px) saturate(180%);
    box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.12),
        inset 0 -1px 0 rgba(255,255,255,0.02),
        0 10px 30px rgba(0,0,0,0.18);
}
.dark .app-liquid:hover {
    border-color: rgba(12,175,96,0.38);
    box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.18),
        inset 0 0 26px rgba(12,175,96,0.05),
        0 0 30px rgba(12,175,96,0.12);
}
.dark .app-liquid-btn,
.dark .app-liquid-btn:hover {
    background: linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02));
    border: 1px solid rgba(255,255,255,0.12);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.16);
}
.dark .app-liquid-btn:hover { border-color: rgba(255,255,255,0.24); }

/* Sidebar items: liquid glass on hover, green-tinted for the current page (no solid greys) */
.dark .app-premium .side-nav .menu-item.menu-item-hoverable:hover,
.dark .app-premium .side-nav .menu-collapse-item:hover {
    background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015));
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.09), inset 0 1px 0 rgba(255,255,255,0.12);
}
.app-premium .side-nav .menu-item.menu-item-active,
.app-premium .side-nav .menu-item.menu-item-active:hover,
.app-premium .side-nav .menu-collapse-item.menu-collapse-item-active {
    background: linear-gradient(135deg, rgba(12,175,96,0.2), rgba(12,175,96,0.05));
    box-shadow: inset 0 0 0 1px rgba(12,175,96,0.24), inset 0 1px 0 rgba(120,255,190,0.18);
}
.dark .app-premium .card-header-border,
.dark .app-premium .card-footer-border { border-color: rgba(255,255,255,0.08); }

/* Many pages force their own solid greys with Tailwind's important flag (e.g. dark:!bg-gray-900/60).
   Among important rules the EARLIEST cascade layer wins, so these overrides go in Tailwind's first layer. */
@layer theme {
    .dark .app-premium .card:not(.app-card-plain),
    .dark .app-liquid-dark { background-color: transparent !important; border-color: rgba(255,255,255,0.09) !important; }
    .dark .app-liquid-dark:hover { border-color: rgba(12,175,96,0.38) !important; }
    /* Grey hairlines become the glass hairline */
    .dark :is(.app-premium .app-glass-scope, .app-premium.app-glass-scope) [class*="dark:border-gray-"] { border-color: rgba(255,255,255,0.08) !important; }
    .dark .app-premium .input:not(.input-invalid),
    .dark .app-premium .select__control,
    .dark .app-premium .select-control {
        background-color: transparent !important;
        border-color: rgba(255,255,255,0.1) !important;
    }
    /* Solid grey blocks inside the panel become clear glass tints (buttons and links keep their own fills) */
    .dark :is(.app-premium .app-glass-scope, .app-premium.app-glass-scope) :not(button):not(a):not(.input-wrapper):not(.input):not(.select-control):not(.card):not(.app-liquid-dark)[class*="dark:bg-gray-900"],
    .dark :is(.app-premium .app-glass-scope, .app-premium.app-glass-scope) :not(button):not(a):not(.input-wrapper):not(.input):not(.select-control):not(.card):not(.app-liquid-dark)[class*="dark:!bg-gray-900"],
    .dark :is(.app-premium .app-glass-scope, .app-premium.app-glass-scope) :not(button):not(a):not(.input-wrapper):not(.input):not(.select-control):not(.card):not(.app-liquid-dark)[class*="dark:bg-gray-950"] { background-color: rgba(255,255,255,0.015) !important; }
    .dark :is(.app-premium .app-glass-scope, .app-premium.app-glass-scope) :not(button):not(a):not(.input-wrapper):not(.input):not(.select-control):not(.card):not(.app-liquid-dark)[class*="dark:bg-gray-800"],
    .dark :is(.app-premium .app-glass-scope, .app-premium.app-glass-scope) :not(button):not(a):not(.input-wrapper):not(.input):not(.select-control):not(.card):not(.app-liquid-dark)[class*="dark:!bg-gray-800"] { background-color: rgba(255,255,255,0.035) !important; }
    .dark :is(.app-premium .app-glass-scope, .app-premium.app-glass-scope) :not(button):not(a):not(.input-wrapper):not(.input):not(.select-control):not(.card):not(.app-liquid-dark)[class*="dark:bg-gray-700"],
    .dark :is(.app-premium .app-glass-scope, .app-premium.app-glass-scope) :not(button):not(a):not(.input-wrapper):not(.input):not(.select-control):not(.card):not(.app-liquid-dark)[class*="dark:!bg-gray-700"] { background-color: rgba(255,255,255,0.06) !important; }
    .dark :is(.app-premium .app-glass-scope, .app-premium.app-glass-scope) [class*="dark:from-gray-8"],
    .dark :is(.app-premium .app-glass-scope, .app-premium.app-glass-scope) [class*="dark:from-gray-9"] {
        background-image: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.008)) !important;
    }
}

/* Dropdown menus (profile menu, row actions): frosted glass over whatever is behind them, with a light dark
   wash so the text stays readable. */
.dark .dropdown-menu {
    background: linear-gradient(150deg, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.04) 100%), rgba(8,12,10,0.42);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.12);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 24px 60px rgba(0,0,0,0.5), 0 0 40px rgba(12,175,96,0.07);
}
.dark .dropdown-menu .menu-item-divider { border-color: rgba(255,255,255,0.08); }
.dark .dropdown-menu .menu-item.menu-item-hoverable:hover {
    background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1);
}

/* Drawers and dialogs render outside .app-premium (in a portal), so they get their own glass rules: a frosted dark
   sheet that blurs the page behind it, with the same clear fields and cards as the pages. */
.dark .drawer-overlay { background-color: rgba(0,0,0,0.5); }
.dark .drawer-content {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: linear-gradient(160deg, rgba(22,30,26,0.72) 0%, rgba(8,12,10,0.84) 100%);
    -webkit-backdrop-filter: blur(26px) saturate(170%);
    backdrop-filter: blur(26px) saturate(170%);
    border-left: 1px solid rgba(255,255,255,0.1);
    box-shadow: inset 1px 0 0 rgba(255,255,255,0.05), -30px 0 80px rgba(0,0,0,0.5);
}
.dark .drawer-content::before {
    content: '';
    position: absolute; top: 0; left: 24px; right: 24px; height: 1px; z-index: 1;
    background: linear-gradient(90deg, transparent, rgba(12,175,96,0.7) 30%, rgba(52,199,121,1) 50%, rgba(12,175,96,0.7) 70%, transparent);
    opacity: 0.55; pointer-events: none;
}
.dark .drawer-header, .dark .drawer-footer { border-color: rgba(255,255,255,0.08); }
/* Drawer content still scrolls, without a visible scrollbar */
.drawer-body { scrollbar-width: none; }
.drawer-body::-webkit-scrollbar { display: none; }

/* Dialogs: the overlay already blurs the page, so the dialog itself is a clear glass sheet with a rim */
.dark .dialog-overlay { background-color: rgba(0,0,0,0.55); }
.dark .dialog-content:not([class*="bg-black"]) {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: linear-gradient(150deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.012) 45%, rgba(255,255,255,0.03) 100%);
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.14), 0 30px 80px rgba(0,0,0,0.55), 0 0 60px rgba(12,175,96,0.07);
}
.dark .dialog-content:not([class*="bg-black"])::before {
    content: '';
    position: absolute; top: 0; left: 28px; right: 28px; height: 1px; z-index: 1;
    background: linear-gradient(90deg, transparent, rgba(12,175,96,0.7) 30%, rgba(52,199,121,1) 50%, rgba(12,175,96,0.7) 70%, transparent);
    opacity: 0.55; pointer-events: none;
}
.dark :is(.drawer-content, .dialog-content) .card:not(.app-card-plain) {
    background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.006) 45%, rgba(255,255,255,0.016) 100%);
    border: 1px solid rgba(255,255,255,0.09);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
}
.dark :is(.drawer-content, .dialog-content) .input:not(.input-invalid),
.dark :is(.drawer-content, .dialog-content) .select__control,
.dark :is(.drawer-content, .dialog-content) .select-control {
    /* Darker than the sheet, so fields read as clear recessed glass rather than a pale fill */
    background: linear-gradient(135deg, rgba(255,255,255,0.006), rgba(0,0,0,0.26));
    border-color: rgba(255,255,255,0.1);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
}
:is(.drawer-content, .dialog-content) .input:not(.input-invalid):focus,
:is(.drawer-content, .dialog-content) .input:not(.input-invalid):focus-within {
    border-color: #0CAF60;
    box-shadow: 0 0 0 3px rgba(12,175,96,0.16);
}
@layer theme {
    .dark .drawer-content { background-color: transparent !important; }
    .dark .dialog-content:not([class*="bg-black"]) { background-color: transparent !important; border-color: rgba(255,255,255,0.1) !important; }
    .dark :is(.drawer-content, .dialog-content) .card:not(.app-card-plain) { background-color: transparent !important; border-color: rgba(255,255,255,0.09) !important; }
    .dark :is(.drawer-content, .dialog-content) .input:not(.input-invalid),
    .dark :is(.drawer-content, .dialog-content) .select__control,
    .dark :is(.drawer-content, .dialog-content) .select-control { background-color: transparent !important; border-color: rgba(255,255,255,0.1) !important; }
    .dark :is(.drawer-content, .dialog-content) :not(button):not(a):not(.input-wrapper):not(.input):not(.select-control):not(.card):not(.app-liquid-dark)[class*="dark:bg-gray-900"],
    .dark :is(.drawer-content, .dialog-content) :not(button):not(a):not(.input-wrapper):not(.input):not(.select-control):not(.card):not(.app-liquid-dark)[class*="dark:!bg-gray-900"] { background-color: rgba(255,255,255,0.015) !important; }
    .dark :is(.drawer-content, .dialog-content) :not(button):not(a):not(.input-wrapper):not(.input):not(.select-control):not(.card):not(.app-liquid-dark)[class*="dark:bg-gray-800"],
    .dark :is(.drawer-content, .dialog-content) :not(button):not(a):not(.input-wrapper):not(.input):not(.select-control):not(.card):not(.app-liquid-dark)[class*="dark:!bg-gray-800"] { background-color: rgba(255,255,255,0.035) !important; }
    .dark :is(.drawer-content, .dialog-content) :not(button):not(a):not(.input-wrapper):not(.input):not(.select-control):not(.card):not(.app-liquid-dark)[class*="dark:bg-gray-700"],
    .dark :is(.drawer-content, .dialog-content) :not(button):not(a):not(.input-wrapper):not(.input):not(.select-control):not(.card):not(.app-liquid-dark)[class*="dark:!bg-gray-700"] { background-color: rgba(255,255,255,0.06) !important; }
}

/* Glass fields with the landing accent on focus */
.dark .app-premium .input:not(.input-invalid),
.dark .app-premium .select__control,
.dark .app-premium .select-control {
    /* Clear, not milky: the field is defined by its rim and the darkened, blurred backdrop */
    /* No backdrop filter of their own: fields sit on glass cards, and a second blur there turns milky */
    background: linear-gradient(135deg, rgba(255,255,255,0.012), rgba(0,0,0,0.14));
    border-color: rgba(255,255,255,0.1);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.09);
}
.app-premium .input:not(.input-invalid):focus,
.app-premium .input:not(.input-invalid):focus-within {
    border-color: #0CAF60;
    box-shadow: 0 0 0 3px rgba(12,175,96,0.16);
}

/* ------------------------------------------------------------------------------------------------------
   Light mode: the same glass over the landing page's light backdrop. White glass with a dark hairline
   and a soft shadow (the landing's light-card recipe).
   ---------------------------------------------------------------------------------------------------- */
html:not(.dark) .app-premium .card:not(.app-card-plain),
html:not(.dark) .app-liquid-dark,
html:not(.dark) .app-liquid {
    /* Clear glass: a light white tint, with the look coming from the blurred, saturated backdrop and the rim */
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.1) 100%);
    border: 1px solid rgba(255,255,255,0.75);
    -webkit-backdrop-filter: blur(16px) saturate(190%);
    backdrop-filter: blur(16px) saturate(190%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), inset 0 0 0 1px rgba(15,23,42,0.03), 0 8px 24px rgba(15,23,42,0.07);
}
html:not(.dark) .app-liquid:hover { border-color: rgba(12,175,96,0.4); box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), 0 0 30px rgba(12,175,96,0.14); }
html:not(.dark) .app-liquid-btn {
    background: linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,255,255,0.4));
    border: 1px solid rgba(15,23,42,0.1);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.9);
}
html:not(.dark) .app-premium .side-nav .menu-item.menu-item-hoverable:hover,
html:not(.dark) .app-premium .side-nav .menu-collapse-item:hover {
    background: linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.35));
    box-shadow: inset 0 0 0 1px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,0.9);
}
html:not(.dark) .app-premium .input:not(.input-invalid),
html:not(.dark) .app-premium .select__control,
html:not(.dark) .app-premium .select-control,
html:not(.dark) :is(.drawer-content, .dialog-content) .input:not(.input-invalid),
html:not(.dark) :is(.drawer-content, .dialog-content) .select-control {
    background: linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.22));
    border-color: rgba(15,23,42,0.1);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.9);
}
/* Secondary buttons */
html:not(.dark) .button[class*="dark:bg-gray-700"],
html:not(.dark) .button[class*="dark:bg-gray-500"],
html:not(.dark) .button[class*="dark:bg-gray-800"] {
    background: linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.25));
    border-color: rgba(15,23,42,0.12);
    -webkit-backdrop-filter: blur(10px) saturate(160%);
    backdrop-filter: blur(10px) saturate(160%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 1px 2px rgba(15,23,42,0.05);
}
html:not(.dark) .button[class*="dark:bg-gray-700"]:hover:not(:disabled),
html:not(.dark) .button[class*="dark:bg-gray-500"]:hover:not(:disabled),
html:not(.dark) .button[class*="dark:bg-gray-800"]:hover:not(:disabled) {
    border-color: rgba(12,175,96,0.5);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 0 20px rgba(12,175,96,0.14);
}
/* Menus, drawers and dialogs: frosted white glass */
html:not(.dark) .dropdown-menu,
html:not(.dark) .dialog-content:not([class*="bg-black"]) {
    background: linear-gradient(150deg, rgba(255,255,255,0.82), rgba(255,255,255,0.62));
    -webkit-backdrop-filter: blur(24px) saturate(170%);
    backdrop-filter: blur(24px) saturate(170%);
    border: 1px solid rgba(15,23,42,0.08);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.95), 0 24px 60px rgba(15,23,42,0.14);
}
html:not(.dark) .drawer-content {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: linear-gradient(160deg, rgba(255,255,255,0.84), rgba(255,255,255,0.7));
    -webkit-backdrop-filter: blur(26px) saturate(170%);
    backdrop-filter: blur(26px) saturate(170%);
    border-left: 1px solid rgba(15,23,42,0.08);
    box-shadow: -30px 0 80px rgba(15,23,42,0.12);
}
html:not(.dark) .drawer-overlay { background-color: rgba(15,23,42,0.28); }
/* Dialogs: a light frosted overlay (a dark one turns the white glass grey) and a brighter sheet */
html:not(.dark) .dialog-overlay { background-color: rgba(236,242,239,0.55); }
html:not(.dark) .dialog-content:not([class*="bg-black"]) {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: linear-gradient(150deg, rgba(255,255,255,0.92), rgba(255,255,255,0.74));
    border: 1px solid rgba(255,255,255,0.9);
    box-shadow: inset 0 1px 0 #fff, 0 0 0 1px rgba(15,23,42,0.05), 0 30px 80px rgba(15,23,42,0.16), 0 0 60px rgba(12,175,96,0.08);
}
@layer theme {
    html:not(.dark) .app-premium .card:not(.app-card-plain),
    html:not(.dark) .app-liquid-dark,
    html:not(.dark) :is(.drawer-content, .dialog-content) .card:not(.app-card-plain) { background-color: transparent !important; border-color: rgba(255,255,255,0.75) !important; }
    html:not(.dark) .app-liquid-dark:hover { border-color: rgba(12,175,96,0.4) !important; }
    html:not(.dark) .app-premium .input:not(.input-invalid),
    html:not(.dark) .app-premium .select__control,
    html:not(.dark) .app-premium .select-control,
    html:not(.dark) :is(.drawer-content, .dialog-content) .input:not(.input-invalid),
    html:not(.dark) :is(.drawer-content, .dialog-content) .select-control { background-color: transparent !important; border-color: rgba(15,23,42,0.1) !important; }
    html:not(.dark) .button[class*="dark:bg-gray-700"],
    html:not(.dark) .button[class*="dark:bg-gray-500"],
    html:not(.dark) .button[class*="dark:bg-gray-800"],
    html:not(.dark) .dropdown-menu,
    html:not(.dark) .drawer-content,
    html:not(.dark) .dialog-content:not([class*="bg-black"]) { background-color: transparent !important; }
    html:not(.dark) .dialog-overlay { background-color: rgba(236,242,239,0.55) !important; }
    /* Pale banner gradients inside cards (division, team and persona cards) become clear glass */
    html:not(.dark) :is(.app-premium .app-glass-scope, .app-premium.app-glass-scope) [class*="from-slate-100"] {
        background-image: linear-gradient(135deg, rgba(255,255,255,0.26), rgba(255,255,255,0.03)) !important;
    }
    /* Solid white and grey blocks become white glass tints (buttons and fields keep their own fills) */
    html:not(.dark) :is(.app-premium .app-glass-scope, .app-premium.app-glass-scope, .drawer-content, .dialog-content) :not(button):not(a):not(.input-wrapper):not(.input):not(.select-control):not(.card):not(.app-liquid-dark):is([class~="bg-white"], [class~="!bg-white"], [class*=" bg-white/"], [class^="bg-white/"]) { background-color: rgba(255,255,255,0.22) !important; }
    html:not(.dark) :is(.app-premium .app-glass-scope, .app-premium.app-glass-scope, .drawer-content, .dialog-content) :not(button):not(a):not(.input-wrapper):not(.input):not(.select-control):is([class~="bg-gray-50"], [class~="!bg-gray-50"], [class~="bg-gray-100"], [class~="bg-slate-100"]) { background-color: rgba(15,23,42,0.035) !important; }
}
`

/** Backdrop + scoped styles. Render once inside the `.app-premium` root. */
const AppPremium = () => {
    const isLight = useAppSelector((state) => state.theme.mode) !== 'dark'
    return (
        <>
            <style>{APP_CSS}</style>
            {/* Same living backdrop as the landing page, in the current theme's palette */}
            <ShaderArt
                className="pointer-events-none fixed inset-0 -z-10"
                colors={
                    isLight
                        ? { base: '#FFFFFF', accent: '#0CAF60', ink: '#111827' }
                        : { base: '#050505', accent: '#0CAF60', ink: '#F5F5F5' }
                }
                intensity={isLight ? 0.85 : 0.37}
                speed={0.6}
                scale={1.4}
                interactive={false}
            />
        </>
    )
}

export default AppPremium
