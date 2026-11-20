import { Component, useEffect, useState, type ReactNode } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { FileText } from 'lucide-react'
import type { DocumentFile } from '@/types/models'
import { cn } from '@/lib/utils'

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

const fileUrl = (f: DocumentFile) => `${import.meta.env.BASE_URL}${f.filePath}`

type Availability = 'checking' | 'ok' | 'missing'

/** ตรวจก่อนว่ามีไฟล์ PDF จริงหรือไม่ (dev server จะคืน index.html แทนไฟล์ที่ไม่มี) */
function useFileAvailable(url: string | undefined): Availability {
  const [state, setState] = useState<{ url?: string; value: Availability }>({ value: 'checking' })
  useEffect(() => {
    if (!url) return
    let alive = true
    fetch(url, { method: 'HEAD' })
      .then((r) => alive && setState({ url, value: r.ok && (r.headers.get('content-type') ?? '').includes('pdf') ? 'ok' : 'missing' }))
      .catch(() => alive && setState({ url, value: 'missing' }))
    return () => {
      alive = false
    }
  }, [url])
  if (!url) return 'missing'
  return state.url === url ? state.value : 'checking'
}

/** กันไม่ให้ไฟล์เสียทำให้ทั้งหน้าพัง */
class PdfErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function Empty({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 text-center text-sm text-muted', className)}>
      <FileText className="size-8 text-[#b0b3b9]" aria-hidden />
      <span>{text}</span>
    </div>
  )
}

const missingText = (f: DocumentFile) => `ไม่พบไฟล์ ${f.fileName} — วางไฟล์ตัวอย่างไว้ที่ public/${f.filePath} หรือรอ API`

const ZOOM_MIN = 0.5
const ZOOM_MAX = 2
const ZOOM_STEP = 0.1

/** ตัวแสดง PDF หลายไฟล์แบบแท็บ + ซูม (หน้ารายละเอียด PO / Invoice) */
export function PdfViewer({ files, fileCount }: { files: DocumentFile[]; fileCount: number }) {
  const [active, setActive] = useState(0)
  const [scale, setScale] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const file = files[active]
  const availability = useFileAvailable(file ? fileUrl(file) : undefined)

  const zoom = (delta: number) => setScale((s) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round((s + delta) * 10) / 10)))

  return (
    <section className="flex h-[calc(100vh-170px)] min-h-[560px] flex-col overflow-hidden rounded-[4px] border border-line bg-white">
      <div className="flex h-[52px] items-stretch border-b border-line bg-panel-head">
        <div role="tablist" className="flex">
          {files.map((f, i) => (
            <button
              key={f.fileId}
              role="tab"
              aria-selected={i === active}
              onClick={() => {
                setActive(i)
                setNumPages(0)
              }}
              className={cn(
                'cursor-pointer border-r border-line px-4 text-[15px]',
                i === active ? 'bg-white font-medium text-ink' : 'text-muted hover:text-ink',
              )}
            >
              {f.fileName}
            </button>
          ))}
        </div>
        {file && (
          <div className="ml-auto flex items-center gap-2 pr-4 text-[15px] text-muted">
            <button type="button" aria-label="ซูมออก" className="cursor-pointer px-1" onClick={() => zoom(-ZOOM_STEP)}>
              −
            </button>
            <span className="w-11 text-center tabular-nums">{Math.round(scale * 100)}%</span>
            <button type="button" aria-label="ซูมเข้า" className="cursor-pointer px-1" onClick={() => zoom(ZOOM_STEP)}>
              +
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto bg-[#e9eaed] p-4">
        {!file ? (
          <Empty
            className="h-full"
            text={fileCount > 0 ? `เอกสารนี้มี ${fileCount} ไฟล์ แต่ mockup ไม่ได้แสดงชื่อไฟล์ — รอข้อมูลจาก API` : 'ยังไม่มีไฟล์แนบ'}
          />
        ) : availability === 'checking' ? (
          <Empty className="h-full" text="กำลังโหลดไฟล์…" />
        ) : availability === 'missing' ? (
          <Empty className="h-full" text={missingText(file)} />
        ) : (
          <PdfErrorBoundary key={file.fileId} fallback={<Empty className="h-full" text={missingText(file)} />}>
            <Document
              file={fileUrl(file)}
              onLoadSuccess={({ numPages: n }) => setNumPages(n)}
              loading={<Empty className="h-full" text="กำลังโหลดไฟล์…" />}
              error={<Empty className="h-full" text={missingText(file)} />}
              className="flex flex-col items-center gap-4"
            >
              {Array.from({ length: numPages }, (_, i) => (
                <Page key={i} pageNumber={i + 1} scale={scale} width={640} renderTextLayer={false} renderAnnotationLayer={false} className="shadow-md" />
              ))}
            </Document>
          </PdfErrorBoundary>
        )}
      </div>
    </section>
  )
}

/** ภาพย่อหน้าแรกของไฟล์แรก (แผงสรุปในหน้ารายการ) */
export function PdfThumbnail({ file }: { file: DocumentFile | undefined }) {
  const availability = useFileAvailable(file ? fileUrl(file) : undefined)
  const empty = <Empty className="h-full" text={file ? 'ไม่พบไฟล์ตัวอย่าง' : 'ไม่มีภาพตัวอย่าง'} />
  return (
    <div className="h-[110px] overflow-hidden rounded-[3px] border border-line-soft bg-white">
      {!file || availability === 'missing' ? (
        empty
      ) : availability === 'checking' ? (
        <Empty className="h-full" text="กำลังโหลด…" />
      ) : (
        <PdfErrorBoundary key={file.fileId} fallback={empty}>
          <Document file={fileUrl(file)} loading={<Empty className="h-full" text="กำลังโหลด…" />} error={empty}>
            <Page pageNumber={1} width={386} renderTextLayer={false} renderAnnotationLayer={false} />
          </Document>
        </PdfErrorBoundary>
      )}
    </div>
  )
}
