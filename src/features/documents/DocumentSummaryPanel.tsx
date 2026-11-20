import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { getDocument, type DocumentView } from '@/lib/api/documents'
import { Badge } from '@/components/ui/badge'
import { InfoPanel, InfoRows } from '@/components/InfoTable'
import { LazyPdfThumbnail } from '@/components/PdfLazy'
import { dash, fmtDate, fmtMoney, notAvailable, statusInfo } from '@/lib/format'

/** แผงสรุปด้านขวาของหน้ารายการเอกสาร */
export function DocumentSummaryPanel({ doc, all }: { doc: DocumentView | undefined; all: DocumentView[] }) {
  const detailQ = useQuery({
    queryKey: ['document', doc?.purchaseOrderId],
    queryFn: () => getDocument(doc!.purchaseOrderId),
    enabled: !!doc,
  })

  if (!doc) {
    return (
      <aside className="w-[400px] shrink-0">
        <InfoPanel>
          <p className="px-4 py-10 text-center text-sm text-muted">เลือกเอกสารจากตารางเพื่อดูรายละเอียด</p>
        </InfoPanel>
      </aside>
    )
  }

  const status = statusInfo[doc.documentStatus]
  const isPo = doc.typeCode === 'PO'
  const invoices = isPo ? all.filter((d) => d.typeCode === 'INV' && d.reference === doc.documentNumber) : []
  const refPo = !isPo ? all.find((d) => d.typeCode === 'PO' && d.documentNumber === doc.reference) : undefined

  return (
    <aside className="w-[400px] shrink-0">
      <InfoPanel
        title={
          <div className="flex items-center gap-3">
            <span>
              {doc.typeCode} {doc.documentNumber}
            </span>
            <Badge tone={status.tone} className="ml-auto font-normal">{status.label}</Badge>
            <Link to={`/documents/${doc.purchaseOrderId}`} className="font-medium underline">เปิด</Link>
            <button type="button" className="cursor-pointer font-medium underline" onClick={() => notAvailable('mockup')}>แก้ไข</button>
          </div>
        }
      >
        <div className="border-b border-line-soft p-2.5">
          <LazyPdfThumbnail file={detailQ.data?.files[0]} />
        </div>
        <InfoRows
          labelWidth="w-[130px]"
          rows={[
            { label: 'บริษัท:', value: `${doc.companyCode} (${doc.companyTaxId})` },
            { label: 'หมวดหมู่:', value: doc.subTypeName },
            { label: 'ผู้ขาย:', value: doc.vendorName },
            { label: 'วันที่เอกสาร:', value: fmtDate(doc.documentDate) },
            { label: 'วันที่รับเอกสาร:', value: fmtDate(doc.receivedDate) },
            { label: 'อ้างอิง:', value: dash(doc.reference) },
            { label: 'รายละเอียด:', value: dash(doc.description) },
            { label: 'ยอดสุทธิ:', value: `${fmtMoney(doc.grandTotal)} ${doc.currencyCode}`, strong: true },
          ]}
        />
        {isPo ? (
          <>
            <h3 className="border-y border-line bg-panel-head px-3 py-2 text-sm font-semibold">Invoice ที่อ้างอิง PO นี้ ({invoices.length})</h3>
            {invoices.length === 0 ? (
              <p className="px-3 py-2.5 text-sm text-muted">ยังไม่มี Invoice ที่อ้างอิง</p>
            ) : (
              invoices.map((inv) => (
                <Link key={inv.purchaseOrderId} to={`/documents/${inv.purchaseOrderId}`} className="flex items-center gap-2.5 px-3 py-2.5 text-[15px] hover:bg-page">
                  <span className="font-semibold">{inv.documentNumber}</span>
                  <span className="text-sm text-muted">{fmtDate(inv.documentDate)}</span>
                  <span className="ml-auto tabular-nums">{fmtMoney(inv.grandTotal)}</span>
                </Link>
              ))
            )}
          </>
        ) : (
          <>
            <h3 className="border-y border-line bg-panel-head px-3 py-2 text-sm font-semibold">อ้างอิง (Reference)</h3>
            <div className="flex items-center gap-2.5 px-3 py-2.5 text-[15px]">
              <span className="font-semibold">{dash(doc.reference)}</span>
              <span className="text-sm text-muted">{refPo ? 'พบ PO ในระบบ' : 'ไม่พบ PO ในข้อมูลตัวอย่าง'}</span>
              {refPo && <span className="ml-auto tabular-nums">{fmtMoney(refPo.grandTotal)}</span>}
            </div>
          </>
        )}
      </InfoPanel>
    </aside>
  )
}
