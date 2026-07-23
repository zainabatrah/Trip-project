import {
  pageTheme,
} from "./publicPageTheme.js";

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
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        paddingTop: 84,
        overflowX: "hidden",
      }}
    >
      <main
        style={{
          ...pageTheme.main,
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
        }}
      >
        <div
          style={{
            ...pageTheme.contentWrapper,
            width: "100%",
            maxWidth,
            minWidth: 0,
          }}
        >
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

          <div
            style={{
              width: "100%",
              maxWidth: "100%",
              minWidth: 0,
            }}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}