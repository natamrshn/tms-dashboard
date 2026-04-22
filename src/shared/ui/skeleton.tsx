import { cn } from "@/shared/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  )
}

const COL_WIDTHS = ['w-24', 'w-20', 'w-36', 'w-28', 'w-20', 'w-20', 'w-16', 'w-8', 'w-6']

function TableRowSkeleton({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: cols }, (_, i) => (
        <td key={i} className="px-4 py-3.5">
          <Skeleton className={cn('h-3.5', COL_WIDTHS[i % COL_WIDTHS.length])} />
        </td>
      ))}
    </tr>
  )
}

export { Skeleton, TableRowSkeleton }
