import { lazy, Suspense } from 'react'
import type { DocumentFile } from '@/types/models'

// pdf.js มีขนาดใหญ่ — โหลดแยกเมื่อจำเป็นเท่านั้น
const Viewer = lazy(() => import('./PdfViewer').then((m) => ({ default: m.PdfViewer })))
const Thumb = lazy(() => import('./PdfViewer').then((m) => ({ default: m.PdfThumbnail })))

const Loading = ({ h }: { h: string }) => <div className={`${h} animate-pulse rounded-[4px] border border-line bg-white`} />

export function LazyPdfViewer(props: { files: DocumentFile[]; fileCount: number }) {
  return (
    <Suspense fallback={<Loading h="h-[calc(100vh-170px)] min-h-[560px]" />}>
      <Viewer {...props} />
    </Suspense>
  )
}

export function LazyPdfThumbnail(props: { file: DocumentFile | undefined }) {
  return (
    <Suspense fallback={<Loading h="h-[110px]" />}>
      <Thumb {...props} />
    </Suspense>
  )
}
