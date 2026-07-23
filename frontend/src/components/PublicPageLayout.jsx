import TopNavbar from "./TopNavbar.jsx";
import {
  pageTheme,
} from "./publicPageTheme.js";

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
  showNavbar = false,
}) {
  return (
    <div
      style={{
        ...pageTheme.page,
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        overflowX: "hidden",
      }}
    >
      {showNavbar ? (
        <TopNavbar />
      ) : null}

      <main
        style={{
          ...pageTheme.main,
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          ...mainStyle,
        }}
      >
        <div
          style={{
            ...pageTheme.contentWrapper,
            width: "100%",
            maxWidth,
            minWidth: 0,
            ...contentStyle,
          }}
        >
          {showHeader &&
          (title ||
            subtitle ||
            eyebrow ||
            headerAction) ? (
            <div
              style={{
                ...pageTheme.header,
                width: "100%",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  ...pageTheme.titleGroup,
                  minWidth: 0,
                }}
              >
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
          ) : null}

          <div
            style={{
              width: "100%",
              minWidth: 0,
              maxWidth: "100%",
            }}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}