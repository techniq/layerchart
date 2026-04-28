  Why is hidybar not ALWAYS showing after page nagivation?
I tried all 3 without success, leaving here to jump start your roubleshooting.
  
  Root Cause

  The bug is an interaction between three things working against each other:

  1. The hidybar's visibility mechanism

  /* Hidybar.svelte */
  @container scroll-state(scrolled: bottom) {
      translate: 0 calc(-100% - var(--header-height));  /* HIDE */
  }
  @container scroll-state(scrolled: top) {
      translate: none;  /* SHOW */
  }
  The bar is hidden when scrolled: bottom is true. Showing it is triggered by
  scrolled: top via a CSS translate transition (150ms, from the Tailwind
  transition-[translate] class on the header).

  2. The View Transitions API wrapping navigations

  In page-transitions.ts:
  document.startViewTransition(async () => {
      resolve();                 // ← SvelteKit navigates, resets scroll to 0
      await navigation.complete; // ← waits for nav to finish
      // browser takes NEW snapshot here ↑
  });

  3. The timing mismatch

  When the user was scrolled to the bottom of Page A (hidybar hidden), then
  navigates to Page B:

  1. Old snapshot taken → hidybar is fully hidden (translated off-screen)
  2. SvelteKit's resolve() runs → new page renders, window.scrollTo(0, 0) is
  called
  3. scroll-state(scrolled: top) becomes true → browser starts the CSS translate
  transition (hidden → none, 150ms)
  4. navigation.complete resolves → callback returns → new snapshot taken
  5. The new snapshot is captured at time ≈ 0ms of the 150ms CSS transition — the
  hidybar is still essentially fully translated off-screen
  6. View transition animation plays: old (fully hidden) → new (still fully
  hidden) — the bar is invisible during the entire animation (~250ms)
  7. View transition ends, pseudo-elements are removed, actual elements revealed →
   by this point 250ms have passed, the 150ms CSS transition has completed →
  hidybar snaps into view

  Why "sometimes": This only happens when the user was scrolled to the bottom of
  the previous page (the only condition that hides the bar). If the hidybar was
  already visible, both old and new snapshots show it visible — no issue.

  In short:

  The view transition captures a "new page" snapshot before the CSS translate
  transition triggered by the scroll-state change has had any time to animate. So
  both snapshots effectively show the hidden state, and the bar only appears after
   the view transition animation ends — it looks like it's missing during the
  navigation.

✻ Sautéed for 7m 43s

❯ asking how would that be fixed?                                                 

⏺ There are a few approaches, from simplest to most correct:

  ---
  Option 1: Disable the CSS transition during view transitions (simplest)

  In app.css, the code already does this pattern for scroll-behavior:
  html:active-view-transition {
      scroll-behavior: auto;
  }

  The same pattern would fix the hidybar — add:
  html:active-view-transition header.hidybar {
      transition-duration: 0ms;
  }

  During an active view transition, the translate snaps instantly when
  scroll-state(scrolled: top) fires. So when the new snapshot is taken, the
  hidybar is already at translate: none (fully visible). The view transition's own
   animation provides visual smoothness — no need for the CSS transition too.

  ---
  Option 2: Give the hidybar its own view-transition-name

  Add view-transition-name: hidybar to the <header>. The browser then captures it
  separately from the page root and you can control its animation independently
  via ::view-transition-old(hidybar) / ::view-transition-new(hidybar) — e.g.,
  slide it in from the top rather than cross-fade with the page. More control,
  more code.

  ---
  Option 3: Delay the new snapshot

  After await navigation.complete in page-transitions.ts, add await new Promise(r
  => setTimeout(r, 160)) — just long enough for the 150ms CSS transition to
  complete before the snapshot is taken. The new snapshot then captures the bar as
   fully visible. Works, but adds latency to every navigation.

  ---
  Option 1 is the right call — one line in app.css, uses the existing
  html:active-view-transition pattern already in the file, and doesn't change the
  Hidybar component at all.