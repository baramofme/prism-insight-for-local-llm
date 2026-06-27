import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='border-t border-border bg-background max-w-[1820px] mx-auto py-2 px-4 text-xs text-muted-foreground text-center'>
      <div className='flex flex-col items-center gap-1'>
        <p>This analysis is for reference purposes only and does not constitute investment advice.</p>
        <div className='flex items-center gap-2'>
          <Link href='#' className='hover:text-foreground transition-colors'>Terms</Link>
          <span>&middot;</span>
          <Link href='#' className='hover:text-foreground transition-colors'>Privacy</Link>
          <span>&middot;</span>
          <Link href='#' className='hover:text-foreground transition-colors'>Disclaimer</Link>
        </div>
        <p>&copy; 2026 PRISM Insight. All rights reserved.</p>
      </div>
    </footer>
  );
}
