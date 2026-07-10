import TopNavbar from "./TopNavbar.jsx";
import { pageTheme } from "./publicPageTheme.js";

export default function PublicPageLayout({
  title = "",
  subtitle = "",
  eyebrow = "",
  headerAction = null,
  children,
  maxWidth = 1180,
  mainStyle,
  contentStyle,
  showHeader = true,
}) {
  return (
    <div style={pageTheme.page}>
      <TopNavbar />

      <main
        style={{
          ...pageTheme.main,
          ...mainStyle,
        }}
      >
        <div
          style={{
            ...pageTheme.contentWrapper,
            maxWidth,
            ...contentStyle,
          }}
        >
          {showHeader &&
          (title || subtitle || eyebrow || headerAction) ? (
            <div style={pageTheme.header}>
              <div style={pageTheme.titleGroup}>
                {eyebrow ? (
                  <div style={pageTheme.eyebrow}>
                    {eyebrow}
                  </div>
                ) : null}

                {title ? (
                  <h1 style={pageTheme.title}>
                    {title}
                  </h1>
                ) : null}

                {subtitle ? (
                  <p style={pageTheme.subtitle}>
                    {subtitle}
                  </p>
                ) : null}
              </div>

              {headerAction}
            </div>
          ) : null}

          {children}
        </div>
      </main>
    </div>
  );
}
