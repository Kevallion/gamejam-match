export default function TeamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No auth redirect: /teams/[id] can show public announcement for shared links
  return <>{children}</>
}
