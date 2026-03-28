export const metadata = {
  title: 'GameJamCrew',
  description: 'Find your perfect game jam team',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background-color: #ffffff;
            color: #0f172a;
          }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
