import { pageTheme } from "./publicPageTheme.js";

export default function ProfileAreaLayout({
  title = "",
  subtitle = "",
  eyebrow = "",
  headerAction = null,
  children,
  maxWidth = 1200,
}) {
  return (
    <div
      style={{
        ...pageTheme.page,
        paddingTop: 84,
      }}
    >
      <main
        style={pageTheme.main}
      >
        <div
          style={{
            ...pageTheme.contentWrapper,
            maxWidth,
          }}
        >
          <div style={pageTheme.header}>
            <div style={pageTheme.titleGroup}>
              {eyebrow ? (
                <div
                  style={
                    pageTheme.eyebrow
                  }
                >
                  {eyebrow}
                </div>
              ) : null}

              {title ? (
                <h1
                  style={
                    pageTheme.title
                  }
                >
                  {title}
                </h1>
              ) : null}

              {subtitle ? (
                <p
                  style={
                    pageTheme.subtitle
                  }
                >
                  {subtitle}
                </p>
              ) : null}
            </div>

            {headerAction}
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
