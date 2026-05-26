/** In-flow marker at page top — when it leaves the viewport, the nav hides. */
const LandingNavSentinel = () => (
    <div id="landing-nav-sentinel" className="h-px w-full shrink-0 pointer-events-none" aria-hidden />
)

export default LandingNavSentinel
