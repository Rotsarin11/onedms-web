import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { getDocument, listDocuments } from '@/lib/api/documents'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InfoPanel, InfoRows, type InfoRow } from '@/components/InfoTable'
import { LazyPdfViewer } from '@/components/PdfLazy'
import { dash, fmtDate, fmtDateTime, fmtMoney, notAvailable, statusInfo } from '@/lib/format'

/** หน้ารายละเอียด PO / Invoice (หน้าเดียวกัน แยกการแสดงผลตาม TypeCode) */
export function DocumentDetailPage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const detailQ = useQuery({ queryKey: ['document', id], queryFn: () => getDocument(id), enabled: Number.isFinite(id) })
  const listQ = useQuery({ queryKey: ['documents'], queryFn: listDocuments })

  if (detailQ.isLoading) return <p className="py-16 text-center text-muted">กำลังโหลด…</p>
  if (!detailQ.data) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-muted">ไม่พบเอกสาร</p>
        <Button variant="outline" asChild>
          <Link to="/documents">← รายการเอกสาร</Link>
        </Button>
      </div>
    )
  }

  const { document: doc, files, invoices, referencedPo } = detailQ.data
  const isPo = doc.typeCode === 'PO'
  const status = statusInfo[doc.documentStatus]

  // ก่อนหน้า / ถัดไป ตามลำดับในหน้ารายการ
  const order = listQ.data ?? []
  const idx = order.findIndex((d) => d.purchaseOrderId === doc.purchaseOrderId)
  const prev = idx > 0 ? order[idx - 1] : undefined
  const next = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : undefined

  const infoRows: InfoRow[] = [
    { label: 'ประเภท / หมวดหมู่:', value: `${doc.typeCode} · ${doc.subTypeName}` },
    { label: 'บริษัท:', value: `${doc.companyCode} (${doc.companyTaxId})` },
    { label: 'ผู้ขาย:', value: `${doc.vendorName} (${doc.vendorCode})` },
    { label: 'เลขที่เอกสาร:', value: doc.documentNumber },
    // หน้า Invoice ใน mockup แสดงเลขอ้างอิงในกล่อง "อ้างอิง (Reference)" แยกต่างหาก
    ...(isPo ? [{ label: 'อ้างอิง:', value: dash(doc.reference) }] : []),
    { label: 'วันที่เอกสาร:', value: fmtDate(doc.documentDate) },
    { label: 'วันที่รับเอกสาร:', value: fmtDate(doc.receivedDate) },
    { label: 'รายละเอียด:', value: dash(doc.description) },
    { label: 'หมายเหตุ:', value: dash(doc.remark) },
  ]

  return (
    <div>
      <div className="mb-4 flex items-start gap-3">
        <Button variant="outline" asChild>
          <Link to="/documents">← รายการเอกสาร</Link>
        </Button>
        <div className="mr-auto">
          <h1 className="text-[22px] font-semibold leading-tight">
            {isPo ? 'PO' : 'Invoice'} {doc.documentNumber}
          </h1>
          <div className="mt-0.5 flex items-center gap-2 text-sm text-ink-soft">
            <Badge tone={status.tone}>{status.label}</Badge>
            <span>
              {doc.vendorName} · {doc.subTypeName} · {fmtDate(doc.documentDate)}
            </span>
          </div>
        </div>
        <Button variant="outline" disabled={!prev} onClick={() => prev && navigate(`/documents/${prev.purchaseOrderId}`)}>
          ‹ ก่อนหน้า
        </Button>
        <Button variant="outline" disabled={!next} onClick={() => next && navigate(`/documents/${next.purchaseOrderId}`)}>
          ถัดไป ›
        </Button>
        <Button variant="outline" onClick={() => notAvailable('mockup')}>แก้ไข</Button>
        <Button variant="outline" onClick={() => notAvailable('api')}>ดาวน์โหลดไฟล์</Button>
      </div>

      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <LazyPdfViewer key={doc.purchaseOrderId} files={files} fileCount={doc.fileCount} />
        </div>

        <aside className="flex w-[430px] shrink-0 flex-col gap-3">
          <InfoPanel title={isPo ? 'ข้อมูลใบสั่งซื้อ' : 'ข้อมูลใบแจ้งหนี้'}>
            <InfoRows rows={infoRows} labelWidth="w-[150px]" />
          </InfoPanel>

          <InfoPanel title={`ยอดเงิน (${doc.currencyCode})`}>
            <InfoRows
              labelWidth="w-[150px]"
              rows={[
                { label: 'ยอดก่อนส่วนลด:', value: fmtMoney(doc.subTotal), align: 'right' },
                { label: 'ส่วนลด:', value: fmtMoney(doc.discountAmount), align: 'right' },
                { label: 'VAT:', value: fmtMoney(doc.vatAmount), align: 'right' },
                { label: 'ยอดสุทธิ:', value: fmtMoney(doc.grandTotal), align: 'right', strong: true },
              ]}
            />
          </InfoPanel>

          {isPo ? (
            <InfoPanel title={`Invoice ที่อ้างอิง PO นี้ (${invoices.length})`}>
              {invoices.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted">ยังไม่มี Invoice ที่อ้างอิง</p>
              ) : (
                invoices.map((inv) => (
                  <Link key={inv.purchaseOrderId} to={`/documents/${inv.purchaseOrderId}`} className="flex items-center gap-2.5 px-3 py-3 text-[15px] hover:bg-page">
                    <span className="font-semibold">{inv.documentNumber}</span>
                    <span className="text-sm text-muted">{fmtDate(inv.documentDate)}</span>
                    <span className="ml-auto tabular-nums">{fmtMoney(inv.grandTotal)}</span>
                  </Link>
                ))
              )}
            </InfoPanel>
          ) : (
            <InfoPanel title="อ้างอิง (Reference)">
              {referencedPo ? (
                <Link to={`/documents/${referencedPo.purchaseOrderId}`} className="flex items-center gap-2.5 px-3 py-3 text-[15px] hover:bg-page">
                  <span className="font-semibold">{referencedPo.documentNumber}</span>
                  <span className="text-sm text-muted">พบ PO ในระบบ</span>
                  <span className="ml-auto tabular-nums">{fmtMoney(referencedPo.grandTotal)}</span>
                </Link>
              ) : (
                <div className="flex items-center gap-2.5 px-3 py-3 text-[15px]">
                  <span className="font-semibold">{dash(doc.reference)}</span>
                  <span className="text-sm text-muted">ไม่พบ PO ในข้อมูลตัวอย่าง</span>
                </div>
              )}
            </InfoPanel>
          )}

          <section className="grid grid-cols-2 overflow-hidden rounded-[4px] border border-line bg-white text-center">
            <div className="border-r border-line px-3 pt-3 pb-2">
              <div className="text-[15px]">{dash(doc.createdByName)}</div>
              <div className="text-sm text-muted">{fmtDateTime(doc.createdDate)}</div>
            </div>
            <div className="px-3 pt-3 pb-2">
              <div className="text-[15px]">{dash(doc.modifiedByName)}</div>
              <div className="text-sm text-muted">{fmtDateTime(doc.modifiedDate)}</div>
            </div>
            <div className="border-t border-r border-line bg-panel-head py-2 text-sm font-semibold">ผู้บันทึก</div>
            <div className="border-t border-line bg-panel-head py-2 text-sm font-semibold">แก้ไขล่าสุด</div>
          </section>
        </aside>
      </div>
    </div>
  )
}
